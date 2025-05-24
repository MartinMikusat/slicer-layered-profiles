import React from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Layer } from './Layer'
import type { Layer as LayerType, SettingChange } from '../../types'

interface SortableLayerListProps {
    layers: LayerType[]
    layerOrder: string[]
    layersWithPreviews: Array<LayerType & { preview?: SettingChange[] }>
    onReorder: (oldIndex: number, newIndex: number) => void
    onToggle: (layerId: string) => void
    onRemove: (layerId: string) => void
    onEdit?: (layer: LayerType) => void
    hasConflict: (path: string) => boolean
}

export const SortableLayerList: React.FC<SortableLayerListProps> = ({
    layerOrder,
    layersWithPreviews,
    onReorder,
    onToggle,
    onRemove,
    onEdit,
    hasConflict,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = layerOrder.indexOf(active.id as string)
            const newIndex = layerOrder.indexOf(over.id as string)

            onReorder(oldIndex, newIndex)
        }
    }

    // Create a map for quick lookup of layer data
    const layersMap = new Map(layersWithPreviews.map(layer => [layer.id, layer]))

    // Order layers according to layerOrder
    const orderedLayers = layerOrder
        .map(layerId => layersMap.get(layerId))
        .filter((layer): layer is NonNullable<typeof layer> => layer !== undefined)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={layerOrder} strategy={horizontalListSortingStrategy}>
                <div className="card-list">
                    {orderedLayers.map((layer, index) => {
                        const layerHasConflicts = layer.preview?.some(change => hasConflict(change.path)) || false

                        return (
                            <Layer
                                key={layer.id}
                                layer={layer}
                                index={index}
                                preview={layer.preview}
                                hasConflicts={layerHasConflicts}
                                onToggle={onToggle}
                                onRemove={onRemove}
                                onEdit={onEdit}
                                hasConflict={hasConflict}
                            />
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
} 