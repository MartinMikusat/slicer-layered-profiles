import { useState } from 'react'
import { Download, FileText, Settings, Plus } from 'lucide-react'
import { baseProfiles } from './data/baseProfiles'
import { demoCards } from './data/demoCards'
import type { BaseProfile, Card } from './types'
import './App.css'

function App() {
  const [selectedProfile, setSelectedProfile] = useState<BaseProfile>(baseProfiles[0])
  const [cards, setCards] = useState<Card[]>([])
  const [showDemo, setShowDemo] = useState(false)

  const loadDemo = () => {
    const demoCardsWithIds: Card[] = demoCards.map((demoCard, index) => ({
      ...demoCard,
      id: `demo-${index}`,
    }))
    setCards(demoCardsWithIds)
    setShowDemo(true)
  }

  const clearCards = () => {
    setCards([])
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
          <button
            onClick={showDemo ? clearCards : loadDemo}
            className="demo-btn"
          >
            <Plus size={16} />
            {showDemo ? 'Clear Demo' : 'Load Demo'}
          </button>
          <button className="export-btn" disabled={cards.length === 0}>
            <Download size={16} />
            Export INI
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
                <span>{selectedProfile.data.print_settings.layer_height}mm</span>
              </div>
              <div className="info-item">
                <span>Temperature:</span>
                <span>{selectedProfile.data.filament_settings.temperature}°C</span>
              </div>
              <div className="info-item">
                <span>Speed:</span>
                <span>{selectedProfile.data.print_settings.perimeter_speed}mm/s</span>
              </div>
              <div className="info-item">
                <span>Infill:</span>
                <span>{selectedProfile.data.print_settings.fill_density}%</span>
              </div>
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
            <div className="card-list">
              {cards.map((card, index) => (
                <div key={card.id} className={`card ${!card.enabled ? 'disabled' : ''}`}>
                  <div className="card-header">
                    <h3>{card.name}</h3>
                    <div className="card-actions">
                      <button
                        onClick={() => {
                          const updatedCards = cards.map(c =>
                            c.id === card.id ? { ...c, enabled: !c.enabled } : c
                          )
                          setCards(updatedCards)
                        }}
                        className="toggle-btn"
                      >
                        {card.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => setCards(cards.filter(c => c.id !== card.id))}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="card-description">{card.description}</p>
                  {card.preview && (
                    <div className="card-preview">
                      {card.preview.map((change, i) => (
                        <div key={i} className="setting-change">
                          <span className="setting-name">{change.key}</span>
                          <span className="setting-value">
                            {change.oldValue !== undefined && `${change.oldValue} → `}
                            {change.newValue}{change.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="card-meta">
                    <span className="card-order">#{index + 1}</span>
                    <span className="card-category">{card.metadata.category}</span>
                  </div>
                </div>
              ))}
            </div>
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
