import { useState, useEffect, useCallback } from 'react'
import { Download, FileText, Settings, Plus, Undo, Redo, Share, BookOpen } from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import { baseProfiles } from './data/baseProfiles'
import { demoCards } from './data/demoCards'
import { useProfileCompiler } from './hooks/useProfileCompiler'
import { useProjectPersistence } from './hooks/useProjectPersistence'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { exportProfileAsINI, downloadINIFile } from './utils/iniExporter'
import { encodeProjectToURL, decodeProjectFromURL, clearProjectFromURL, copyToClipboard } from './utils/urlSharing'
import { exportChangeSummaryAsFile } from './utils/changeSummary'
import { DEFAULT_EXPORT_SETTINGS } from './constants'
import { SortableCardList } from './components/SortableCardList'
import { ProjectManager } from './components/ProjectManager'
import { OnboardingTour } from './components/OnboardingTour'
import { LoadingButton, ErrorMessage } from './components/LoadingStates'
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
  }

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Slicer Layer Composer</h1>
          <p>Build PrusaSlicer profiles from simple layers</p>
        </div>
        <div className="header-actions">
          {/* Undo/Redo */}
          <div className="undo-redo-group">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="undo-btn"
              title={`Undo (${getShortcutText().undo})`}
            >
              <Undo size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="redo-btn"
              title={`Redo (${getShortcutText().redo})`}
            >
              <Redo size={16} />
            </button>
          </div>

          <button
            onClick={showDemo ? clearCards : loadDemo}
            className="demo-btn"
            title={`Load Demo (${getShortcutText().demo})`}
          >
            <Plus size={16} />
            {showDemo ? 'Clear Demo' : 'Load Demo'}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={cards.length === 0}
            className="share-btn"
          >
            <Share size={16} />
            Share
          </button>

          {/* Tour */}
          <button
            onClick={() => setShowTour(true)}
            className="tour-btn"
          >
            <BookOpen size={16} />
            Tour
          </button>

          {/* Export group */}
          <div className="export-group">
            <LoadingButton
              onClick={handleExportSummary}
              disabled={cards.length === 0 || !compiledProfile}
              isLoading={false}
              className="summary-btn"
            >
              <FileText size={16} />
              Summary
            </LoadingButton>

            <LoadingButton
              onClick={handleExport}
              disabled={cards.length === 0 || !compiledProfile}
              isLoading={isCompiling}
              loadingText="Compiling..."
              className="export-btn primary"
            >
              <Download size={16} />
              Export INI
            </LoadingButton>
          </div>
        </div>
      </header>

      <main className="app-main">
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

        <div className="main-content">
          <aside className="sidebar">
            <section className="profile-section">
              <h2>Base Profile</h2>
              <div className="profile-selector">
                {baseProfiles.map((profile) => (
                  <label key={profile.id} className="profile-option">
                    <input
                      type="radio"
                      name="baseProfile"
                      value={profile.id}
                      checked={selectedProfile.id === profile.id}
                      onChange={() => setSelectedProfile(profile)}
                    />
                    <div className="profile-card">
                      <h3>{profile.name}</h3>
                      <p>{profile.description}</p>
                      <div className="profile-meta">
                        {profile.metadata.printer} • {profile.metadata.quality}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="info-section">
              <h3>Profile Summary</h3>
              <div className="profile-info">
                <div className="info-item">
                  <span>Layer Height:</span>
                  <span>
                    {compiledProfile ?
                      `${compiledProfile.finalData.print_settings?.layer_height || selectedProfile.data.print_settings.layer_height}mm` :
                      `${selectedProfile.data.print_settings.layer_height}mm`
                    }
                  </span>
                </div>
                <div className="info-item">
                  <span>Temperature:</span>
                  <span>
                    {compiledProfile ?
                      `${compiledProfile.finalData.filament_settings?.temperature || selectedProfile.data.filament_settings.temperature}°C` :
                      `${selectedProfile.data.filament_settings.temperature}°C`
                    }
                  </span>
                </div>
                <div className="info-item">
                  <span>Speed:</span>
                  <span>
                    {compiledProfile ?
                      `${compiledProfile.finalData.print_settings?.perimeter_speed || selectedProfile.data.print_settings.perimeter_speed}mm/s` :
                      `${selectedProfile.data.print_settings.perimeter_speed}mm/s`
                    }
                  </span>
                </div>
                <div className="info-item">
                  <span>Infill:</span>
                  <span>
                    {compiledProfile ?
                      `${compiledProfile.finalData.print_settings?.fill_density || selectedProfile.data.print_settings.fill_density}%` :
                      `${selectedProfile.data.print_settings.fill_density}%`
                    }
                  </span>
                </div>
                {compiledProfile && compiledProfile.appliedCards.length > 0 && (
                  <div className="compilation-status">
                    <div className="info-item">
                      <span>Applied Cards:</span>
                      <span>{compiledProfile.appliedCards.length}</span>
                    </div>
                    {Object.keys(compiledProfile.conflicts).length > 0 && (
                      <div className="info-item">
                        <span>Conflicts:</span>
                        <span className="conflict-count">{Object.keys(compiledProfile.conflicts).length}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </aside>

          <section className="card-workspace">
            <div className="workspace-header">
              <h2>Layer Cards</h2>
              <p>Drag cards to reorder horizontally • Cards to the right override those to the left</p>
            </div>

            {cards.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No cards yet</h3>
                <p>Load the demo or create your first card to get started</p>
                <button onClick={loadDemo} className="primary-btn">
                  Load Demo Cards
                </button>
              </div>
            ) : (
              <SortableCardList
                cards={cards}
                cardOrder={cardOrder}
                cardsWithPreviews={cardsWithPreviews}
                onReorder={handleCardReorder}
                onToggle={handleCardToggle}
                onRemove={handleCardRemove}
                hasConflict={hasConflict}
              />
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Slicer Layer Composer • Weekend MVP • Built with React + TypeScript
          </p>
          <div className="footer-actions">
            <button className="settings-btn">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Share Project</h3>
            <p>Copy this URL to share your project with others:</p>
            <div className="share-url-container">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <LoadingButton
                onClick={handleCopyShareUrl}
                isLoading={false}
                className="copy-btn"
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
            <div className="modal-actions">
              <button onClick={() => setShowShareModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />
    </div>
  )
}

export default App
