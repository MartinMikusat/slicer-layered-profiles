import { useState, useCallback, useRef } from 'react'

interface HistoryState {
    selectedProfile: any
    cards: any[]
    cardOrder: string[]
}

interface UseUndoRedoOptions {
    maxHistorySize?: number
}

export function useUndoRedo(
    initialState: HistoryState,
    options: UseUndoRedoOptions = {}
) {
    const { maxHistorySize = 50 } = options

    const [history, setHistory] = useState<HistoryState[]>([initialState])
    const [currentIndex, setCurrentIndex] = useState(0)
    const skipNextPush = useRef(false)

    const canUndo = currentIndex > 0
    const canRedo = currentIndex < history.length - 1

    const pushState = useCallback((state: HistoryState) => {
        if (skipNextPush.current) {
            skipNextPush.current = false
            return
        }

        setHistory(prev => {
            // Don't add if the state is the same as the current one
            const current = prev[currentIndex]
            if (current &&
                current.selectedProfile?.id === state.selectedProfile?.id &&
                JSON.stringify(current.cards) === JSON.stringify(state.cards) &&
                JSON.stringify(current.cardOrder) === JSON.stringify(state.cardOrder)) {
                return prev
            }

            // Remove any future history if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1)

            // Add new state
            newHistory.push(state)

            // Limit history size and update index accordingly
            if (newHistory.length > maxHistorySize) {
                newHistory.shift()
                // Don't change the index since we removed from the beginning
                return newHistory
            } else {
                // Increment index since we added a new state
                setCurrentIndex(currentIndex + 1)
                return newHistory
            }
        })
    }, [currentIndex, maxHistorySize])

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1)
            skipNextPush.current = true
            return history[currentIndex - 1]
        }
        return null
    }, [canUndo, currentIndex, history])

    const redo = useCallback(() => {
        if (canRedo) {
            setCurrentIndex(prev => prev + 1)
            skipNextPush.current = true
            return history[currentIndex + 1]
        }
        return null
    }, [canRedo, currentIndex, history])

    const reset = useCallback((state: HistoryState) => {
        setHistory([state])
        setCurrentIndex(0)
        skipNextPush.current = false
    }, [])

    return {
        pushState,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
        currentIndex,
        historyLength: history.length
    }
} 