import { useState, useEffect, useCallback } from 'react'
import { Download, FileText, Settings, Plus, Undo, Redo, Share, BookOpen } from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import { baseProfiles, useProfileCompiler } from './features/profiles'
import { demoLayers, defaultLayers, SortableLayerList } from './features/layers'
import { LayerBuilder, LayerLibrary, addCustomLayer, removeCustomLayer, updateCustomLayer, isCustomLayer } from './features/layers'
import { useProjectPersistence, ProjectManager } from './features/projects'
import { exportProfileAsINI, downloadINIFile } from './features/export'
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
  ProfileSummary,
  useUndoRedo,
  useKeyboardShortcuts
} from './features/ui'
import { DEFAULT_EXPORT_SETTINGS } from './constants'
import type { BaseProfile, Layer, ProjectData } from './types'
import './App.css'

function App() {
  const [selectedProfile, setSelectedProfile] = useState<BaseProfile>(baseProfiles[0])
  const [layers, setLayers] = useState<Layer[]>([])
  const [layerOrder, setLayerOrder] = useState<string[]>([])
  const [showDemo, setShowDemo] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareError, setShareError] = useState<string | null>(null)
  const [editingLayer, setEditingLayer] = useState<Layer | null>(null)

  // Use the profile compiler hook
  const {
    compiledProfile,
    layersWithPreviews,
    isCompiling,
    hasConflict
  } = useProfileCompiler(selectedProfile, layers, layerOrder)

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
  } = useProjectPersistence(selectedProfile, layers, layerOrder, DEFAULT_EXPORT_SETTINGS)

  // Use undo/redo functionality
  const {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    selectedProfile,
    layers,
    layerOrder
  })

  // Clear all state and start fresh
  const clearAllState = useCallback(() => {
    setLayers([])
    setLayerOrder([])
    setShowDemo(false)
    setSelectedProfile(baseProfiles[0])
    setProjectName('Untitled Project')
    setProjectDescription('')

    // Clear localStorage
    localStorage.removeItem('layered-profile-builder-project')
    localStorage.removeItem('layered-profile-builder-custom-layers')
    localStorage.removeItem('hasSeenTour')
  }, [setProjectName, setProjectDescription])

  const handleProjectLoaded = useCallback((projectData: ProjectData) => {
    // Find the base profile
    const baseProfile = baseProfiles.find(p => p.id === projectData.baseProfile) || baseProfiles[0]
    setSelectedProfile(baseProfile)

    // Set layers and order
    setLayers(projectData.layers)
    setLayerOrder(projectData.layerOrder)

    // Clear demo state if loading a project
    setShowDemo(false)
  }, [])

  // Check for shared project on load
  useEffect(() => {
    const sharedProject = decodeProjectFromURL()
    if (sharedProject) {
      handleProjectLoaded(sharedProject)
      clearProjectFromURL() // Clean up URL
    } else {
      // Always start with a clean slate unless loading a shared project
      // Check if user should see the tour
      const hasSeenTour = localStorage.getItem('hasSeenTour')
      if (!hasSeenTour) {
        setShowTour(true)
      }
    }
  }, [handleProjectLoaded])

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    const prevState = undo()
    if (prevState && prevState.selectedProfile) {
      setSelectedProfile(prevState.selectedProfile)
      setLayers(prevState.layers)
      setLayerOrder(prevState.layerOrder)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState && nextState.selectedProfile) {
      setSelectedProfile(nextState.selectedProfile)
      setLayers(nextState.layers)
      setLayerOrder(nextState.layerOrder)
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
    // Find the fuzzy skin layer from default layers
    const fuzzySkinLayer = defaultLayers.find(layer => layer.id === 'default-fuzzy-skin')

    // Create demo layers with IDs
    const demoLayersWithIds: Layer[] = demoLayers.map((demoLayer, index) => ({
      ...demoLayer,
      id: `demo-${index}`,
    }))

    // Combine fuzzy skin layer (at the beginning) with demo layers
    const allDemoLayers = fuzzySkinLayer ?
      [{ ...fuzzySkinLayer, id: 'demo-fuzzy-skin', enabled: true }, ...demoLayersWithIds] :
      demoLayersWithIds

    setLayers(allDemoLayers)
    setLayerOrder(allDemoLayers.map(layer => layer.id))
    setShowDemo(true)
  }

  const clearLayers = () => {
    setLayers([])
    setLayerOrder([])
    setShowDemo(false)
  }

  // Handle reset all with confirmation
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all app state? This will clear all layers, projects, and settings. This action cannot be undone.')) {
      clearAllState();
      // Force a page reload to ensure clean state
      window.location.reload();
    }
  }

  // Debug function for development - expose to window for console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as any).clearAllAppState = clearAllState;
      (window as unknown as any).debugAppState = () => {
        console.log('Current App State:', {
          selectedProfile: selectedProfile.name,
          layers: layers.map(l => ({ id: l.id, name: l.name, enabled: l.enabled })),
          layerOrder,
          showDemo,
          localStorage: {
            project: localStorage.getItem('layered-profile-builder-project'),
            customLayers: localStorage.getItem('layered-profile-builder-custom-layers'),
            hasSeenTour: localStorage.getItem('hasSeenTour')
          }
        });
      };
    }
  }, [selectedProfile, layers, layerOrder, showDemo, projectName, projectDescription, clearAllState]);

  // Push state for undo/redo when changes happen
  useEffect(() => {
    pushState({ selectedProfile, layers, layerOrder })
  }, [selectedProfile, layers, layerOrder, pushState])

  // Set up keyboard shortcuts  
  const { getShortcutText } = useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: saveProject,
    onExport: handleExport,
    onLoadDemo: () => showDemo ? clearLayers() : loadDemo(),
  })

  const handleLayerReorder = (oldIndex: number, newIndex: number) => {
    const newLayerOrder = arrayMove(layerOrder, oldIndex, newIndex)
    setLayerOrder(newLayerOrder)
  }

  const handleLayerToggle = (layerId: string) => {
    const updatedLayers = layers.map(l =>
      l.id === layerId ? { ...l, enabled: !l.enabled } : l
    )
    setLayers(updatedLayers)
  }

  const handleLayerRemove = (layerId: string) => {
    const updatedLayers = layers.filter(l => l.id !== layerId)
    setLayers(updatedLayers)
    setLayerOrder(layerOrder.filter(id => id !== layerId))

    // If it's a custom layer, also remove from localStorage
    const layerToRemove = layers.find(l => l.id === layerId)
    if (layerToRemove && isCustomLayer(layerToRemove)) {
      removeCustomLayer(layerId)
    }
  }

  // Add new handler for custom layer creation
  const handleLayerCreated = useCallback((newLayer: Layer) => {
    // Save to localStorage
    const saved = addCustomLayer(newLayer)
    if (saved) {
      setLayers(prev => [...prev, newLayer])
      setLayerOrder(prev => [...prev, newLayer.id])
    } else {
      console.error('Failed to save custom layer')
      // Still add to state even if localStorage fails
      setLayers(prev => [...prev, newLayer])
      setLayerOrder(prev => [...prev, newLayer.id])
    }
  }, [])

  // Add new handler for layer editing
  const handleLayerEdit = useCallback((layer: Layer) => {
    setEditingLayer(layer)
  }, [])

  // Add new handler for layer updates
  const handleLayerUpdated = useCallback((updatedLayer: Layer) => {
    // Update localStorage
    const saved = updateCustomLayer(updatedLayer.id, updatedLayer)
    if (saved) {
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l))
    } else {
      console.error('Failed to update custom layer')
      // Still update state even if localStorage fails
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l))
    }
    setEditingLayer(null)
  }, [])

  // Handler to clear editing state
  const handleClearEditing = useCallback(() => {
    setEditingLayer(null)
  }, [])

  // Sharing handlers
  const handleShare = async () => {
    try {
      const currentProject: ProjectData = {
        version: '1.0.0',
        name: projectName || 'Shared Project',
        baseProfile: selectedProfile.id,
        layers,
        layerOrder,
        exportSettings: DEFAULT_EXPORT_SETTINGS,
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        }
      }

      const url = encodeProjectToURL(currentProject)
      setShareUrl(url)
      setShowShareModal(true)
    } catch {
      setShareError('Failed to create shareable URL')
    }
  }

  const handleCopyShareUrl = async () => {
    try {
      await copyToClipboard(shareUrl)
      setShowShareModal(false)
    } catch {
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

  // Add handler for selecting layers from library
  const handleLayerSelected = useCallback((selectedLayer: Layer) => {
    // Check if layer is already in the workspace
    const existingLayer = layers.find(l => l.id === selectedLayer.id)
    if (existingLayer) {
      alert('This layer is already in your workspace')
      return
    }

    // Add the layer to the workspace
    setLayers(prev => [...prev, selectedLayer])
    setLayerOrder(prev => [...prev, selectedLayer.id])
  }, [layers])

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
            <div className="flex gap-1 tour-undo-redo">
              <Button
                variant="outline"
                size="default"
                onClick={handleUndo}
                disabled={!canUndo}
                title={`Undo (${getShortcutText().undo})`}
                className="gap-2"
              >
                <Undo size={16} />
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleRedo}
                disabled={!canRedo}
                title={`Redo (${getShortcutText().redo})`}
                className="gap-2"
              >
                <Redo size={16} />
              </Button>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={showDemo ? clearLayers : loadDemo}
              title={`Load Demo (${getShortcutText().demo})`}
              className="demo-btn gap-2"
            >
              <Plus size={16} />
              {showDemo ? 'Clear Demo' : 'Load Demo'}
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              size="default"
              onClick={handleShare}
              disabled={layers.length === 0}
              className="gap-2 tour-share"
            >
              <Share size={16} />
              Share
            </Button>

            {/* Tour */}
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowTour(true)}
              className="gap-2"
            >
              <BookOpen size={16} />
              Tour
            </Button>

            {/* Layer Library for browsing/managing */}
            <LayerLibrary
              mode="browse"
              onLayerEdit={handleLayerEdit}
              trigger={
                <Button variant="outline" size="default" className="gap-2 tour-my-layers">
                  <BookOpen size={16} />
                  My Layers
                </Button>
              }
            />

            {/* Export group */}
            <div className="flex gap-2 export-actions tour-export-actions">
              <LoadingButton
                onClick={handleExport}
                disabled={layers.length === 0}
                isLoading={isCompiling}
                loadingText="Compiling..."
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none h-10 px-4 py-2 gap-2 tour-export-ini"
              >
                <Download size={16} />
                Export INI
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-6 overflow-hidden">
        {/* Desktop-only flexbox layout */}
        <div className="flex gap-6 h-full">
          {/* Left column: Project Management + Base Profile */}
          <div className="flex flex-col gap-6 w-[300px] flex-shrink-0">
            {/* Project Management */}
            <section className="bg-card rounded-xl border p-6 shadow-sm flex flex-col tour-project-management">
              <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Project Management</h2>
              <div className="overflow-y-auto flex-1">
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
                  onResetAll={handleResetAll}
                />
              </div>
            </section>

            {/* Base Profile */}
            <section className="bg-card rounded-xl border p-6 shadow-sm profile-section flex flex-col">
              <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Base Profile</h2>
              <div className="space-y-3 overflow-y-auto flex-1">
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

          {/* Center: Layers workspace */}
          <section className="flex-1 space-y-4 card-workspace min-w-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Layers</h2>
                <p className="text-sm text-muted-foreground">Drag layers to reorder horizontally • Layers to the right override those to the left</p>
              </div>
              <div className="flex gap-2">
                <LayerLibrary
                  mode="select"
                  onLayerSelect={handleLayerSelected}
                  onLayerEdit={handleLayerEdit}
                  selectedLayerIds={layers.map(l => l.id)}
                />
                <LayerBuilder
                  selectedProfile={selectedProfile}
                  onLayerCreated={handleLayerCreated}
                />
                <Button onClick={loadDemo} variant="outline" className="gap-2">
                  <Plus size={16} />
                  {showDemo ? 'Clear Demo' : 'Load Demo'}
                </Button>
              </div>
            </div>

            {layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-card rounded-xl border border-dashed flex-1">
                <FileText size={48} className="text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No layers yet</h3>
                  <p className="text-muted-foreground">Load the demo or create your first custom layer to get started</p>
                </div>
                <div className="flex gap-2">
                  <LayerLibrary
                    mode="select"
                    onLayerSelect={handleLayerSelected}
                    onLayerEdit={handleLayerEdit}
                    selectedLayerIds={layers.map(l => l.id)}
                  />
                  <LayerBuilder
                    selectedProfile={selectedProfile}
                    onLayerCreated={handleLayerCreated}
                  />
                  <Button onClick={loadDemo} variant="outline" className="gap-2">
                    Load Demo Layers
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border p-4 flex-1 overflow-hidden">
                <SortableLayerList
                  layers={layers}
                  layerOrder={layerOrder}
                  layersWithPreviews={layersWithPreviews}
                  onReorder={handleLayerReorder}
                  onToggle={handleLayerToggle}
                  onRemove={handleLayerRemove}
                  onEdit={handleLayerEdit}
                  hasConflict={hasConflict}
                />
              </div>
            )}
          </section>

          {/* Right: Profile Summary */}
          <section className="bg-card rounded-xl border p-6 shadow-sm w-[320px] flex-shrink-0 flex flex-col tour-profile-summary">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Profile Summary</h3>
            <div className="overflow-y-auto flex-1">
              <ProfileSummary
                selectedProfile={selectedProfile}
                compiledProfile={compiledProfile}
                isCompiling={isCompiling}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-4">
        <div className="w-full px-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Layered Profile Builder • Weekend MVP • Built with React + TypeScript
          </p>
          <Button variant="ghost" size="sm" className="gap-2">
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

      {/* Layer Editing Modal */}
      {editingLayer && (
        <LayerBuilder
          selectedProfile={selectedProfile}
          onLayerCreated={handleLayerCreated}
          onLayerUpdated={handleLayerUpdated}
          editingLayer={editingLayer}
          onEditingClear={handleClearEditing}
          trigger={null}
        />
      )}
    </div>
  )
}

export default App