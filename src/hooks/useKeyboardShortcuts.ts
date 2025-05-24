import { useEffect } from 'react'

interface KeyboardShortcuts {
    onUndo?: () => void
    onRedo?: () => void
    onSave?: () => void
    onExport?: () => void
    onLoadDemo?: () => void
    onEscape?: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for modifier keys
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
            const modifier = isMac ? event.metaKey : event.ctrlKey

            // Prevent default behavior for our shortcuts
            if (modifier) {
                switch (event.key.toLowerCase()) {
                    case 'z':
                        if (event.shiftKey && shortcuts.onRedo) {
                            event.preventDefault()
                            shortcuts.onRedo()
                        } else if (shortcuts.onUndo) {
                            event.preventDefault()
                            shortcuts.onUndo()
                        }
                        break
                    case 'y':
                        if (shortcuts.onRedo) {
                            event.preventDefault()
                            shortcuts.onRedo()
                        }
                        break
                    case 's':
                        if (shortcuts.onSave) {
                            event.preventDefault()
                            shortcuts.onSave()
                        }
                        break
                    case 'e':
                        if (shortcuts.onExport) {
                            event.preventDefault()
                            shortcuts.onExport()
                        }
                        break
                    case 'd':
                        if (shortcuts.onLoadDemo) {
                            event.preventDefault()
                            shortcuts.onLoadDemo()
                        }
                        break
                }
            }

            // Handle escape key
            if (event.key === 'Escape' && shortcuts.onEscape) {
                shortcuts.onEscape()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts])

    // Return helper text for shortcuts
    const getShortcutText = () => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const modifier = isMac ? '⌘' : 'Ctrl'

        return {
            undo: `${modifier}+Z`,
            redo: isMac ? `${modifier}+Shift+Z` : `${modifier}+Y`,
            save: `${modifier}+S`,
            export: `${modifier}+E`,
            demo: `${modifier}+D`,
            escape: 'Esc'
        }
    }

    return { getShortcutText }
} 