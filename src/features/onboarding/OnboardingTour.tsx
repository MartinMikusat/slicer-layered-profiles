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
        title: 'Welcome to Slicer Layer Composer!',
        content: 'This tool helps you build custom PrusaSlicer profiles by combining a base profile with modular "cards" that modify specific settings.',
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
        id: 'demo-cards',
        title: 'Load Demo Cards',
        content: 'Click this button to load some example cards that demonstrate common modifications like temperature adjustments, speed settings, and quality tweaks.',
        target: '.demo-btn',
        position: 'bottom'
    },
    {
        id: 'card-ordering',
        title: 'Drag to Reorder',
        content: 'Cards are applied left to right. If cards conflict, the rightmost card wins. Drag cards to reorder them and control which settings take priority.',
        target: '.card-workspace',
        position: 'top'
    },
    {
        id: 'export',
        title: 'Export Your Profile',
        content: 'When you\'re happy with your configuration, click Export INI to download a PrusaSlicer-compatible profile file.',
        target: '.export-actions',
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

        const isLargeElement = (elementWidth / viewportWidth > 0.5) || (elementHeight / viewportHeight > 0.5)

        // If it's a large element, center the dialog within the highlighted area
        if (isLargeElement) {
            style.left = rect.left + rect.width / 2
            style.top = rect.top + rect.height / 2
            style.transform = 'translate(-50%, -50%)'
            return style
        }

        // Otherwise, use the original positioning logic
        switch (position) {
            case 'top':
                style.bottom = window.innerHeight - rect.top + 16
                style.left = rect.left + rect.width / 2
                style.transform = 'translateX(-50%)'
                break
            case 'bottom':
                style.top = rect.bottom + 16
                style.left = rect.left + rect.width / 2
                style.transform = 'translateX(-50%)'
                break
            case 'left':
                style.right = window.innerWidth - rect.left + 16
                style.top = rect.top + rect.height / 2
                style.transform = 'translateY(-50%)'
                break
            case 'right':
                style.left = rect.right + 16
                style.top = rect.top + rect.height / 2
                style.transform = 'translateY(-50%)'
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

        return (elementWidth / viewportWidth > 0.5) || (elementHeight / viewportHeight > 0.5)
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