import { useState, useEffect, useCallback } from 'react'
import { Download, FileText, Settings, Plus, Undo, Redo, Share, BookOpen } from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import { baseProfiles, useProfileCompiler } from './features/profiles'
import { demoCards, SortableCardList } from './features/layers'
import { CardBuilder, CardLibrary, loadCustomCards, addCustomCard, removeCustomCard, updateCustomCard, isCustomCard } from './features/cards'
import { useProjectPersistence, ProjectManager } from './features/projects'
import { exportProfileAsINI, downloadINIFile, exportChangeSummaryAsFile } from './features/export'
import { encodeProjectToURL, decodeProjectFromURL, clearProjectFromURL, copyToClipboard } from './features/projects'
import { OnboardingTour } from './features/onboarding'
import {
  LoadingButton,
  ErrorMessage,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useUndoRedo,
  useKeyboardShortcuts
} from './features/ui'
import { DEFAULT_EXPORT_SETTINGS } from './constants'
import type { BaseProfile, Card, ProjectData } from './types'
import './App.css'

function App() {
  const [selectedProfile, setSelectedProfile] = useState<BaseProfile>(baseProfiles[0])
  const [cards, setCards] = useState<Card[]>([])
  const [cardOrder, setCardOrder] = useState<string[]>([])
  const [showDemo, setShowDemo] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareError, setShareError] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  // Use the profile compiler hook
  const {
    compiledProfile,
    cardsWithPreviews,
    isCompiling,
    hasConflict
  } = useProfileCompiler(selectedProfile, cards, cardOrder)

  // Use the project persistence hook
  const {
    projectName,
    projectDescription,
    hasUnsavedChanges,
    lastSaved,
    isLoading: isSaving,
    error,
    hasStoredProject,
    setProjectName,
    setProjectDescription,
    saveProject,
    loadProject,
    exportProject,
    importProject,
    clearError,
  } = useProjectPersistence(selectedProfile, cards, cardOrder, DEFAULT_EXPORT_SETTINGS)

  // Use undo/redo functionality
  const {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    selectedProfile,
    cards,
    cardOrder
  })

  // Check for shared project on load
  useEffect(() => {
    const sharedProject = decodeProjectFromURL()
    if (sharedProject) {
      handleProjectLoaded(sharedProject)
      clearProjectFromURL() // Clean up URL
    } else {
      // Check if user should see the tour
      const hasSeenTour = localStorage.getItem('hasSeenTour')
      if (!hasSeenTour) {
        setShowTour(true)
      }
    }
  }, [])

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    const prevState = undo()
    if (prevState) {
      setSelectedProfile(prevState.selectedProfile)
      setCards(prevState.cards)
      setCardOrder(prevState.cardOrder)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState) {
      setSelectedProfile(nextState.selectedProfile)
      setCards(nextState.cards)
      setCardOrder(nextState.cardOrder)
    }
  }, [redo])

  const handleExport = useCallback(() => {
    if (!compiledProfile) return

    try {
      const iniContent = exportProfileAsINI(compiledProfile, DEFAULT_EXPORT_SETTINGS)
      downloadINIFile(iniContent, DEFAULT_EXPORT_SETTINGS.filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export profile. Please try again.')
    }
  }, [compiledProfile])

  const loadDemo = () => {
    const demoCardsWithIds: Card[] = demoCards.map((demoCard, index) => ({
      ...demoCard,
      id: `demo-${index}`,
    }))
    setCards(demoCardsWithIds)
    setCardOrder(demoCardsWithIds.map(card => card.id))
    setShowDemo(true)
  }

  const clearCards = () => {
    setCards([])
    setCardOrder([])
    setShowDemo(false)
  }

  // Push state for undo/redo when changes happen
  useEffect(() => {
    pushState({ selectedProfile, cards, cardOrder })
  }, [selectedProfile, cards, cardOrder]) // Remove pushState from dependencies to prevent infinite loop

  // Set up keyboard shortcuts  
  const { getShortcutText } = useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: saveProject,
    onExport: handleExport,
    onLoadDemo: () => showDemo ? clearCards() : loadDemo(),
  })

  const handleCardReorder = (oldIndex: number, newIndex: number) => {
    const newCardOrder = arrayMove(cardOrder, oldIndex, newIndex)
    setCardOrder(newCardOrder)
  }

  const handleCardToggle = (cardId: string) => {
    const updatedCards = cards.map(c =>
      c.id === cardId ? { ...c, enabled: !c.enabled } : c
    )
    setCards(updatedCards)
  }

  const handleCardRemove = (cardId: string) => {
    const updatedCards = cards.filter(c => c.id !== cardId)
    setCards(updatedCards)
    setCardOrder(cardOrder.filter(id => id !== cardId))

    // If it's a custom card, also remove from localStorage
    const cardToRemove = cards.find(c => c.id === cardId)
    if (cardToRemove && isCustomCard(cardToRemove)) {
      removeCustomCard(cardId)
    }
  }

  // Load custom cards on app startup
  useEffect(() => {
    const customCards = loadCustomCards()
    if (customCards.length > 0) {
      setCards(prev => [...prev, ...customCards])
      setCardOrder(prev => [...prev, ...customCards.map(card => card.id)])
    }
  }, [])

  // Add new handler for custom card creation
  const handleCardCreated = useCallback((newCard: Card) => {
    // Save to localStorage
    const saved = addCustomCard(newCard)
    if (saved) {
      setCards(prev => [...prev, newCard])
      setCardOrder(prev => [...prev, newCard.id])
    } else {
      console.error('Failed to save custom card')
      // Still add to state even if localStorage fails
      setCards(prev => [...prev, newCard])
      setCardOrder(prev => [...prev, newCard.id])
    }
  }, [])

  // Add new handler for card editing
  const handleCardEdit = useCallback((card: Card) => {
    setEditingCard(card)
  }, [])

  // Add new handler for card updates
  const handleCardUpdated = useCallback((updatedCard: Card) => {
    // Update localStorage
    const saved = updateCustomCard(updatedCard.id, updatedCard)
    if (saved) {
      setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c))
    } else {
      console.error('Failed to update custom card')
      // Still update state even if localStorage fails
      setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c))
    }
    setEditingCard(null)
  }, [])

  // Handler to clear editing state
  const handleClearEditing = useCallback(() => {
    setEditingCard(null)
  }, [])

  // Sharing handlers
  const handleShare = async () => {
    try {
      const currentProject: ProjectData = {
        version: '1.0.0',
        name: projectName || 'Shared Project',
        baseProfile: selectedProfile.id,
        cards,
        cardOrder,
        exportSettings: DEFAULT_EXPORT_SETTINGS,
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        }
      }

      const url = encodeProjectToURL(currentProject)
      setShareUrl(url)
      setShowShareModal(true)
    } catch (error) {
      setShareError('Failed to create shareable URL')
    }
  }

  const handleCopyShareUrl = async () => {
    try {
      await copyToClipboard(shareUrl)
      setShowShareModal(false)
    } catch (error) {
      setShareError('Failed to copy URL to clipboard')
    }
  }

  // Tour handlers
  const handleTourComplete = () => {
    setShowTour(false)
    localStorage.setItem('hasSeenTour', 'true')
  }

  const handleTourSkip = () => {
    setShowTour(false)
    localStorage.setItem('hasSeenTour', 'true')
  }

  // Change summary handler
  const handleExportSummary = () => {
    if (!compiledProfile) return

    exportChangeSummaryAsFile(
      selectedProfile,
      compiledProfile.appliedCards,
      compiledProfile.conflicts,
      { format: 'markdown', includeMetadata: true }
    )
  }

  const handleProjectLoaded = (projectData: ProjectData) => {
    // Find the base profile
    const baseProfile = baseProfiles.find(p => p.id === projectData.baseProfile) || baseProfiles[0]
    setSelectedProfile(baseProfile)

    // Set cards and order
    setCards(projectData.cards)
    setCardOrder(projectData.cardOrder)

    // Clear demo state if loading a project
    setShowDemo(false)
  }

  // Add handler for selecting cards from library
  const handleCardSelected = useCallback((selectedCard: Card) => {
    // Check if card is already in the workspace
    const existingCard = cards.find(c => c.id === selectedCard.id)
    if (existingCard) {
      alert('This card is already in your workspace')
      return
    }

    // Add the card to the workspace
    setCards(prev => [...prev, selectedCard])
    setCardOrder(prev => [...prev, selectedCard.id])
  }, [cards])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background p-6">
        <div className="w-full flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Layered Profile Builder</h1>
            <p className="text-muted-foreground text-sm">Build PrusaSlicer profiles from simple layers</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="default"
                onClick={handleUndo}
                disabled={!canUndo}
                title={`Undo (${getShortcutText().undo})`}
              >
                <Undo size={16} />
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleRedo}
                disabled={!canRedo}
                title={`Redo (${getShortcutText().redo})`}
              >
                <Redo size={16} />
              </Button>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={showDemo ? clearCards : loadDemo}
              title={`Load Demo (${getShortcutText().demo})`}
              className="demo-btn"
            >
              <Plus size={16} />
              {showDemo ? 'Clear Demo' : 'Load Demo'}
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              size="default"
              onClick={handleShare}
              disabled={cards.length === 0}
            >
              <Share size={16} />
              Share
            </Button>

            {/* Tour */}
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowTour(true)}
            >
              <BookOpen size={16} />
              Tour
            </Button>

            {/* Card Library for browsing/managing */}
            <CardLibrary
              mode="browse"
              onCardEdit={handleCardEdit}
              trigger={
                <Button variant="outline" size="default">
                  <BookOpen size={16} />
                  My Cards
                </Button>
              }
            />

            {/* Export group */}
            <div className="flex gap-2 export-actions">
              <Button
                variant="outline"
                size="default"
                onClick={handleExportSummary}
                disabled={cards.length === 0}
              >
                <FileText size={16} />
                Summary
              </Button>

              <LoadingButton
                onClick={handleExport}
                disabled={cards.length === 0}
                isLoading={isCompiling}
                loadingText="Compiling..."
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none h-10 px-4 py-2"
              >
                <Download size={16} />
                Export INI
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-6 overflow-hidden">
        {/* Full-width grid layout with proper constraints - accounting for footer */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr] gap-6 h-auto lg:h-[calc(100vh-320px)] w-full max-w-full">
          {/* Top-left: Project Management */}
          <section className="bg-card rounded-xl border p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Project Management</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] min-h-0 flex-1">
              <ProjectManager
                projectName={projectName}
                projectDescription={projectDescription}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSaved={lastSaved}
                isLoading={isSaving}
                error={error}
                hasStoredProject={hasStoredProject}
                onProjectNameChange={setProjectName}
                onProjectDescriptionChange={setProjectDescription}
                onSave={saveProject}
                onLoad={async () => loadProject()}
                onExport={exportProject}
                onImport={async (jsonString) => importProject(jsonString)}
                onClearError={clearError}
                onProjectLoaded={handleProjectLoaded}
              />
            </div>
          </section>

          {/* Top-center: Layer Cards header and workspace */}
          <section className="space-y-4 card-workspace lg:row-span-2 min-w-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Layers</h2>
                <p className="text-sm text-muted-foreground">Drag cards to reorder horizontally • Cards to the right override those to the left</p>
              </div>
              <div className="flex gap-2">
                <CardLibrary
                  mode="select"
                  onCardSelect={handleCardSelected}
                  onCardEdit={handleCardEdit}
                  selectedCardIds={cards.map(c => c.id)}
                />
                <CardBuilder
                  selectedProfile={selectedProfile}
                  onCardCreated={handleCardCreated}
                />
                <Button onClick={loadDemo} variant="outline">
                  <Plus size={16} className="mr-1" />
                  {showDemo ? 'Clear Demo' : 'Load Demo'}
                </Button>
              </div>
            </div>

            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-card rounded-xl border border-dashed h-auto lg:h-[calc(100%-80px)]">
                <FileText size={48} className="text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No cards yet</h3>
                  <p className="text-muted-foreground">Load the demo or create your first custom card to get started</p>
                </div>
                <div className="flex gap-2">
                  <CardLibrary
                    mode="select"
                    onCardSelect={handleCardSelected}
                    onCardEdit={handleCardEdit}
                    selectedCardIds={cards.map(c => c.id)}
                  />
                  <CardBuilder
                    selectedProfile={selectedProfile}
                    onCardCreated={handleCardCreated}
                  />
                  <Button onClick={loadDemo} variant="outline">
                    Load Demo Cards
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border p-4 h-auto lg:h-[calc(100%-80px)] overflow-hidden w-full">
                <SortableCardList
                  cards={cards}
                  cardOrder={cardOrder}
                  cardsWithPreviews={cardsWithPreviews}
                  onReorder={handleCardReorder}
                  onToggle={handleCardToggle}
                  onRemove={handleCardRemove}
                  onEdit={handleCardEdit}
                  hasConflict={hasConflict}
                />
              </div>
            )}
          </section>

          {/* Top-right: Profile Summary */}
          <section className="bg-card rounded-xl border p-6 shadow-sm lg:row-span-2 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Profile Summary</h3>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-500px)] min-h-0 flex-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Layer Height:</span>
                <span className="font-semibold">
                  {compiledProfile ?
                    `${compiledProfile.finalData.print_settings?.layer_height || selectedProfile.data.print_settings.layer_height}mm` :
                    `${selectedProfile.data.print_settings.layer_height}mm`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Temperature:</span>
                <span className="font-semibold">
                  {compiledProfile ?
                    `${compiledProfile.finalData.filament_settings?.temperature || selectedProfile.data.filament_settings.temperature}°C` :
                    `${selectedProfile.data.filament_settings.temperature}°C`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Speed:</span>
                <span className="font-semibold">
                  {compiledProfile ?
                    `${compiledProfile.finalData.print_settings?.perimeter_speed || selectedProfile.data.print_settings.perimeter_speed}mm/s` :
                    `${selectedProfile.data.print_settings.perimeter_speed}mm/s`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Infill:</span>
                <span className="font-semibold">
                  {compiledProfile ?
                    `${compiledProfile.finalData.print_settings?.fill_density || selectedProfile.data.print_settings.fill_density}%` :
                    `${selectedProfile.data.print_settings.fill_density}%`
                  }
                </span>
              </div>
              {compiledProfile && compiledProfile.appliedCards.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Applied Cards:</span>
                    <span className="font-semibold">{compiledProfile.appliedCards.length}</span>
                  </div>
                  {Object.keys(compiledProfile.conflicts).length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Conflicts:</span>
                      <span className="font-semibold text-destructive">{Object.keys(compiledProfile.conflicts).length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Bottom-left: Base Profile */}
          <section className="bg-card rounded-xl border p-6 shadow-sm profile-section flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Base Profile</h2>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-500px)] min-h-0 flex-1">
              {baseProfiles.map((profile) => (
                <label key={profile.id} className="cursor-pointer block">
                  <input
                    type="radio"
                    name="baseProfile"
                    value={profile.id}
                    checked={selectedProfile.id === profile.id}
                    onChange={() => setSelectedProfile(profile)}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-all ${selectedProfile.id === profile.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80 hover:bg-accent/50'
                    }`}>
                    <h3 className="font-semibold text-sm">{profile.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{profile.description}</p>
                    <div className="text-xs text-muted-foreground mt-2 font-medium">
                      {profile.metadata.printer} • {profile.metadata.quality}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-4">
        <div className="w-full px-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Layered Profile Builder • Weekend MVP • Built with React + TypeScript
          </p>
          <Button variant="ghost" size="sm">
            <Settings size={16} />
            Settings
          </Button>
        </div>
      </footer>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Copy this URL to share your project with others:
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <LoadingButton
              onClick={handleCopyShareUrl}
              isLoading={false}
            >
              Copy
            </LoadingButton>
          </div>
          {shareError && (
            <ErrorMessage
              error={shareError}
              onDismiss={() => setShareError(null)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Card Editing Modal */}
      {editingCard && (
        <CardBuilder
          selectedProfile={selectedProfile}
          onCardCreated={handleCardCreated}
          onCardUpdated={handleCardUpdated}
          editingCard={editingCard}
          onEditingClear={handleClearEditing}
          trigger={null}
        />
      )}
    </div>
  )
}

export default App