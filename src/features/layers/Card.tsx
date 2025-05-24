import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/components/button'
import type { Card as CardType, SettingChange } from '../../types'

interface CardProps {
    card: CardType
    index: number
    preview?: SettingChange[]
    hasConflicts: boolean
    onToggle: (cardId: string) => void
    onRemove: (cardId: string) => void
    hasConflict: (path: string) => boolean
}

export const Card: React.FC<CardProps> = ({
    card,
    index,
    preview,
    hasConflicts,
    onToggle,
    onRemove,
    hasConflict,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card ${!card.enabled ? 'disabled' : ''} ${hasConflicts ? 'has-conflicts' : ''} ${isDragging ? 'dragging' : ''}`}
        >
            {/* Drag Handle */}
            <div className="card-drag-handle" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>

            <div className="card-content">
                <div className="card-header">
                    <div className="card-title">
                        <h3>{card.name}</h3>
                        {hasConflicts && (
                            <div className="conflict-icon" title="This card has conflicts with other cards">
                                <AlertTriangle size={16} />
                            </div>
                        )}
                    </div>
                    <div className="card-actions">
                        <Button
                            onClick={() => onToggle(card.id)}
                            variant={card.enabled ? "default" : "outline"}
                            size="sm"
                            title={card.enabled ? 'Disable card' : 'Enable card'}
                        >
                            {card.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                            {card.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                        <Button
                            onClick={() => onRemove(card.id)}
                            variant="destructive"
                            size="sm"
                            title="Remove card"
                        >
                            ×
                        </Button>
                    </div>
                </div>

                <p className="card-description">{card.description}</p>

                {/* Setting Changes Preview */}
                {preview && preview.length > 0 && (
                    <div className="card-preview">
                        <div className="preview-header">
                            <span className="preview-label">Changes:</span>
                        </div>
                        {preview.map((change, i) => {
                            const isConflicted = hasConflict(change.path)
                            return (
                                <div key={i} className={`setting-change ${isConflicted ? 'conflicted' : ''}`}>
                                    <span className="setting-name">{change.key}</span>
                                    <span className="setting-value">
                                        {change.oldValue !== undefined && (
                                            <span className="old-value">{change.oldValue}</span>
                                        )}
                                        {change.oldValue !== undefined && <span className="arrow">→</span>}
                                        <span className="new-value">{change.newValue}</span>
                                        {change.unit && <span className="unit">{change.unit}</span>}
                                        {isConflicted && (
                                            <span className="conflict-indicator" title="This setting is overridden by a later card">
                                                ⚠️
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Card Metadata */}
                <div className="card-meta">
                    <span className="card-order">#{index + 1}</span>
                    <span className="card-category">{card.metadata?.category || 'General'}</span>
                    {card.metadata?.author && (
                        <span className="card-author">by {card.metadata.author}</span>
                    )}
                </div>
            </div>
        </div>
    )
} 