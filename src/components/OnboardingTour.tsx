import { useState, useEffect } from 'react'
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
        target: '.export-group',
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

    useEffect(() => {
        if (!isVisible) return

        const step = tourSteps[currentStep]
        if (step.target) {
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                const element = document.querySelector(step.target!) as HTMLElement
                setHighlightElement(element)
            }, 100)
        } else {
            setHighlightElement(null)
        }
    }, [currentStep, isVisible])

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

    // Helper function to calculate tooltip position
    const getTooltipStyle = (position: string, element: HTMLElement | null) => {
        if (!element || position === 'center') {
            return {}
        }

        const rect = element.getBoundingClientRect()
        const style: React.CSSProperties = { position: 'fixed' }

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
    }

    return (
        <>
            {/* Overlay */}
            <div className="tour-overlay" onClick={handleSkip} />

            {/* Highlight box */}
            {highlightElement && (
                <div
                    className="tour-highlight"
                    style={{
                        position: 'fixed',
                        top: highlightElement.getBoundingClientRect().top - 8,
                        left: highlightElement.getBoundingClientRect().left - 8,
                        width: highlightElement.getBoundingClientRect().width + 16,
                        height: highlightElement.getBoundingClientRect().height + 16,
                        zIndex: 1001,
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Tour tooltip */}
            <div
                className={`tour-tooltip ${currentTourStep.position}`}
                style={getTooltipStyle(currentTourStep.position, highlightElement)}
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
                            Skip Tour
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