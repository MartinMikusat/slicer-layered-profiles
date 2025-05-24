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
import { Card } from './Card'
import type { Card as CardType, SettingChange } from '../../types'

interface SortableCardListProps {
    cards: CardType[]
    cardOrder: string[]
    cardsWithPreviews: Array<CardType & { preview?: SettingChange[] }>
    onReorder: (oldIndex: number, newIndex: number) => void
    onToggle: (cardId: string) => void
    onRemove: (cardId: string) => void
    onEdit?: (card: CardType) => void
    hasConflict: (path: string) => boolean
}

export const SortableCardList: React.FC<SortableCardListProps> = ({
    cardOrder,
    cardsWithPreviews,
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
            const oldIndex = cardOrder.indexOf(active.id as string)
            const newIndex = cardOrder.indexOf(over.id as string)

            onReorder(oldIndex, newIndex)
        }
    }

    // Create a map for quick lookup of card data
    const cardsMap = new Map(cardsWithPreviews.map(card => [card.id, card]))

    // Order cards according to cardOrder
    const orderedCards = cardOrder
        .map(cardId => cardsMap.get(cardId))
        .filter((card): card is NonNullable<typeof card> => card !== undefined)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
                <div className="card-list">
                    {orderedCards.map((card, index) => {
                        const cardHasConflicts = card.preview?.some(change => hasConflict(change.path)) || false

                        return (
                            <Card
                                key={card.id}
                                card={card}
                                index={index}
                                preview={card.preview}
                                hasConflicts={cardHasConflicts}
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