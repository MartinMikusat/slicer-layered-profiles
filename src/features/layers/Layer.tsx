import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical, Eye, EyeOff, Edit } from 'lucide-react'
import { Button } from '../ui/components/button'
import { isCustomLayer } from './customLayerService'
import type { Layer as LayerType, SettingChange } from '../../types'

interface LayerProps {
    layer: LayerType
    index: number
    preview?: SettingChange[]
    hasConflicts: boolean
    onToggle: (layerId: string) => void
    onRemove: (layerId: string) => void
    onEdit?: (layer: LayerType) => void
    hasConflict: (path: string) => boolean
}

export const Layer: React.FC<LayerProps> = ({
    layer,
    index,
    preview,
    hasConflicts,
    onToggle,
    onRemove,
    onEdit,
    hasConflict,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: layer.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const canEdit = isCustomLayer(layer) && onEdit;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card ${!layer.enabled ? 'disabled' : ''} ${hasConflicts ? 'has-conflicts' : ''} ${isDragging ? 'dragging' : ''}`}
        >
            <div className="card-content">
                <div className="card-header">
                    <div className="card-title">
                        {/* Drag Handle */}
                        <div className="card-drag-handle" {...attributes} {...listeners}>
                            <GripVertical size={16} />
                        </div>
                        <h3>{layer.name}</h3>
                        {hasConflicts && (
                            <div className="conflict-icon" title="This layer has conflicts with other layers">
                                <AlertTriangle size={16} />
                            </div>
                        )}
                    </div>
                    <div className="card-actions">
                        <Button
                            onClick={() => onToggle(layer.id)}
                            variant={layer.enabled ? "outline" : "outline"}
                            size="sm"
                            title={layer.enabled ? 'Disable layer' : 'Enable layer'}
                            className={`gap-2 ${layer.enabled ? 'bg-white border-gray-300 text-black hover:bg-gray-50' : ''}`}
                        >
                            {layer.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                            {layer.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                        {canEdit && (
                            <Button
                                onClick={() => onEdit(layer)}
                                variant="outline"
                                size="sm"
                                title="Edit layer"
                            >
                                <Edit size={16} />
                            </Button>
                        )}
                        <Button
                            onClick={() => onRemove(layer.id)}
                            variant="destructive"
                            size="sm"
                            title="Remove layer"
                        >
                            ×
                        </Button>
                    </div>
                </div>

                <p className="card-description">{layer.description}</p>

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
                                            <span className="conflict-indicator" title="This setting is overridden by a later layer">
                                                ⚠️
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Layer Metadata */}
                <div className="card-meta">
                    <span className="card-order">#{index + 1}</span>
                    <span className="card-category">{layer.metadata?.category || 'General'}</span>
                    {layer.metadata?.author && (
                        <span className="card-author">by {layer.metadata.author}</span>
                    )}
                </div>
            </div>
        </div>
    )
} 