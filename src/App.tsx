import { useState } from 'react'
import { Download, FileText, Settings, Plus, AlertTriangle } from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import { baseProfiles } from './data/baseProfiles'
import { demoCards } from './data/demoCards'
import { useProfileCompiler } from './hooks/useProfileCompiler'
import { exportProfileAsINI, downloadINIFile } from './utils/iniExporter'
import { DEFAULT_EXPORT_SETTINGS } from './constants'
import { SortableCardList } from './components/SortableCardList'
import type { BaseProfile, Card } from './types'
import './App.css'

function App() {
  const [selectedProfile, setSelectedProfile] = useState<BaseProfile>(baseProfiles[0])
  const [cards, setCards] = useState<Card[]>([])
  const [cardOrder, setCardOrder] = useState<string[]>([])
  const [showDemo, setShowDemo] = useState(false)

  // Use the profile compiler hook
  const {
    compiledProfile,
    cardsWithPreviews,
    isCompiling,
    hasConflict
  } = useProfileCompiler(selectedProfile, cards, cardOrder)

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

  const handleExport = () => {
    if (!compiledProfile) return

    try {
      const iniContent = exportProfileAsINI(compiledProfile, DEFAULT_EXPORT_SETTINGS)
      downloadINIFile(iniContent, DEFAULT_EXPORT_SETTINGS.filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export profile. Please try again.')
    }
  }

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Slicer Layer Composer</h1>
          <p>Build PrusaSlicer profiles from simple layers</p>
        </div>
        <div className="header-actions">
          <button
            onClick={showDemo ? clearCards : loadDemo}
            className="demo-btn"
          >
            <Plus size={16} />
            {showDemo ? 'Clear Demo' : 'Load Demo'}
          </button>
          <button
            className="export-btn"
            disabled={cards.length === 0 || !compiledProfile || isCompiling}
            onClick={handleExport}
          >
            <Download size={16} />
            {isCompiling ? 'Compiling...' : 'Export INI'}
          </button>
        </div>
      </header>

      <main className="app-main">
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
            <p>Drag cards to reorder • Later cards override earlier ones</p>
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
    </div>
  )
}

export default App
