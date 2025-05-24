import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface TourStep {
    id: string
    title: string
    content: string
    target?: string // CSS selector for highlighting
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const tourSteps: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Layered Profile Builder!',
        content: 'This tool helps you build custom PrusaSlicer profiles by combining a base profile with modular "layers" that modify specific settings.',
        position: 'center'
    },
    {
        id: 'base-profile',
        title: 'Choose Your Base Profile',
        content: 'Start by selecting a base profile that matches your printer and general print quality preferences. This provides the foundation for your custom profile.',
        target: '.profile-section',
        position: 'right'
    },
    {
        id: 'project-management',
        title: 'Project Management',
        content: 'Save your work! You can save projects to your browser storage, load previous projects, and even export/import them as JSON files to share with others.',
        target: '.tour-project-management',
        position: 'right'
    },
    {
        id: 'undo-redo',
        title: 'Undo & Redo',
        content: 'Made a mistake? Use Undo and Redo buttons to step back and forward through your changes. Keyboard shortcuts work too: Ctrl+Z and Ctrl+Y.',
        target: '.tour-undo-redo',
        position: 'bottom'
    },
    {
        id: 'demo-layers',
        title: 'Load Demo Layers',
        content: 'Click this button to load some example layers that demonstrate common modifications like temperature adjustments, speed settings, and quality tweaks.',
        target: '.demo-btn',
        position: 'bottom'
    },
    {
        id: 'layer-library',
        title: 'My Layers Library',
        content: 'Access your saved custom layers! Browse, search, edit, and manage all your custom layers in one place. You can also add layers directly to your workspace from here.',
        target: '.tour-my-layers',
        position: 'bottom'
    },
    {
        id: 'custom-layer-creation',
        title: 'Create Custom Layers',
        content: 'Build your own setting modifications! Click "Create Custom Layer" in the workspace to modify any profile setting like temperatures, speeds, or quality parameters.',
        target: '.tour-create-layer',
        position: 'bottom'
    },
    {
        id: 'layer-ordering',
        title: 'Drag to Reorder',
        content: 'Layers are applied left to right. If layers conflict, the rightmost layer wins. Drag layers to reorder them and control which settings take priority.',
        target: '.layer-workspace',
        position: 'top'
    },
    {
        id: 'profile-summary',
        title: 'Profile Summary',
        content: 'See exactly what changes your layers make! This panel shows your base profile settings and highlights all modifications in real-time.',
        target: '.tour-profile-summary',
        position: 'left'
    },
    {
        id: 'share',
        title: 'Share Your Project',
        content: 'Share your project configuration with others! Click Share to generate a URL that contains your entire project setup - layers, profile, and all settings.',
        target: '.tour-share',
        position: 'bottom'
    },
    {
        id: 'export',
        title: 'Export Your Profile',
        content: 'When you\'re happy with your configuration, click Export INI to download a PrusaSlicer-compatible profile file that you can import directly into PrusaSlicer.',
        target: '.tour-export-ini',
        position: 'bottom'
    }
]

interface OnboardingTourProps {
    isVisible: boolean
    onComplete: () => void
    onSkip: () => void
}

export function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null)
    const elementRectRef = useRef<DOMRect | null>(null)

    // Helper function to calculate tooltip position - optimized version
    const getTooltipStyle = useCallback((position: string, element: HTMLElement | null) => {
        if (!element || position === 'center') {
            return {}
        }

        // Use cached rect if available to avoid recalculation
        const rect = elementRectRef.current || element.getBoundingClientRect()
        const style: React.CSSProperties = { position: 'fixed' }

        // Check if the element takes up a majority of the screen (>50% of either dimension)
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const elementWidth = rect.width
        const elementHeight = rect.height

        // Calculate tooltip dimensions (approximate)
        const tooltipWidth = 400 // matches CSS max-width
        const tooltipHeight = 200 // approximate height

        // Center only if element takes up significant space in BOTH dimensions
        // This ensures wide panels (like layer workspace) and tall panels (like profile summary) 
        // only get centered if they're truly large in both width and height
        const shouldCenter = (elementWidth / viewportWidth > 0.6) && (elementHeight / viewportHeight > 0.6)

        // If it should be centered, center the dialog within the highlighted area
        if (shouldCenter) {
            style.left = rect.left + rect.width / 2
            style.top = rect.top + rect.height / 2
            style.transform = 'translate(-50%, -50%)'
            return style
        }

        // Otherwise, use the original positioning logic with boundary checking
        switch (position) {
            case 'top':
                style.bottom = window.innerHeight - rect.top + 16
                style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 16))
                style.transform = 'none'
                break
            case 'bottom':
                style.top = rect.bottom + 16
                style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 16))
                style.transform = 'none'
                break
            case 'left':
                style.right = window.innerWidth - rect.left + 16
                style.top = Math.max(16, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - 16))
                style.transform = 'none'
                // Ensure tooltip doesn't go off the left edge
                if (rect.left - tooltipWidth - 16 < 0) {
                    // Switch to right positioning if there's no room on the left
                    style.right = 'auto'
                    style.left = rect.right + 16
                }
                break
            case 'right':
                style.left = rect.right + 16
                style.top = Math.max(16, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - 16))
                style.transform = 'none'
                // Ensure tooltip doesn't go off the right edge
                if (rect.right + tooltipWidth + 16 > viewportWidth) {
                    // Switch to left positioning if there's no room on the right
                    style.left = 'auto'
                    style.right = window.innerWidth - rect.left + 16
                }
                break
        }

        return style
    }, [])

    // Helper function to determine if we should use center positioning - optimized
    const shouldUseCenterPosition = useCallback((position: string, element: HTMLElement | null) => {
        if (!element || position === 'center') {
            return true
        }

        // Use cached rect if available
        const rect = elementRectRef.current || element.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const elementWidth = rect.width
        const elementHeight = rect.height

        // Center only if element takes up significant space in BOTH dimensions
        // This ensures wide panels (like layer workspace) and tall panels (like profile summary) 
        // only get centered if they're truly large in both width and height
        return (elementWidth / viewportWidth > 0.6) && (elementHeight / viewportHeight > 0.6)
    }, [])

    // Memoize expensive calculations
    const updateHighlightElement = useCallback((step: TourStep) => {
        if (step.target) {
            const element = document.querySelector(step.target!) as HTMLElement
            if (element) {
                // Cache the rect to avoid multiple getBoundingClientRect calls
                elementRectRef.current = element.getBoundingClientRect()
                setHighlightElement(element)
            } else {
                elementRectRef.current = null
                setHighlightElement(null)
            }
        } else {
            elementRectRef.current = null
            setHighlightElement(null)
        }
    }, [])

    useEffect(() => {
        if (!isVisible) return

        const step = tourSteps[currentStep]
        // Update highlight element immediately for smooth transitions
        updateHighlightElement(step)
    }, [currentStep, isVisible, updateHighlightElement])

    useEffect(() => {
        if (!isVisible) return

        // Add tour overlay class to body
        document.body.classList.add('tour-active')

        return () => {
            document.body.classList.remove('tour-active')
        }
    }, [isVisible])

    if (!isVisible) return null

    const currentTourStep = tourSteps[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === tourSteps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onComplete()
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        onSkip()
    }

    const effectivePosition = shouldUseCenterPosition(currentTourStep.position, highlightElement)
        ? 'center'
        : currentTourStep.position

    return (
        <>
            {/* Invisible overlay for click handling */}
            <div
                className="tour-overlay"
                onClick={handleSkip}
                style={{ pointerEvents: 'auto' }}
            />

            {/* Highlight box - always visible when element exists */}
            {highlightElement && (
                <div
                    className="tour-highlight"
                    style={{
                        position: 'fixed',
                        top: (elementRectRef.current?.top || highlightElement.getBoundingClientRect().top) - 8,
                        left: (elementRectRef.current?.left || highlightElement.getBoundingClientRect().left) - 8,
                        width: (elementRectRef.current?.width || highlightElement.getBoundingClientRect().width) + 16,
                        height: (elementRectRef.current?.height || highlightElement.getBoundingClientRect().height) + 16,
                        zIndex: 1001,
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Tour tooltip - always visible when tour is active */}
            <div
                className={`tour-tooltip ${effectivePosition}`}
                data-centered={effectivePosition === 'center'}
                style={{
                    ...getTooltipStyle(effectivePosition, highlightElement),
                    pointerEvents: 'auto'
                }}
            >
                <div className="tour-header">
                    <h3>{currentTourStep.title}</h3>
                    <button className="tour-close" onClick={handleSkip}>
                        <X size={16} />
                    </button>
                </div>

                <div className="tour-content">
                    <p>{currentTourStep.content}</p>
                </div>

                <div className="tour-footer">
                    <div className="tour-progress">
                        {tourSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`tour-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="tour-actions">
                        <button
                            className="tour-skip"
                            onClick={handleSkip}
                        >
                            Skip
                        </button>

                        <div className="tour-nav">
                            <button
                                className="tour-prev"
                                onClick={handlePrev}
                                disabled={isFirstStep}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <button
                                className="tour-next primary"
                                onClick={handleNext}
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
} 