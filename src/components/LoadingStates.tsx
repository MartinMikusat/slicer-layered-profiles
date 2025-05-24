import { Loader2, AlertCircle } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: number
    className?: string
}

export function LoadingSpinner({ size = 20, className = '' }: LoadingSpinnerProps) {
    return (
        <Loader2
            size={size}
            className={`loading-spinner ${className}`}
            style={{ animation: 'spin 1s linear infinite' }}
        />
    )
}

interface LoadingOverlayProps {
    message?: string
    isVisible: boolean
}

export function LoadingOverlay({ message = 'Loading...', isVisible }: LoadingOverlayProps) {
    if (!isVisible) return null

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <LoadingSpinner size={32} />
                <p>{message}</p>
            </div>
        </div>
    )
}

interface ErrorMessageProps {
    error: string | null
    onDismiss?: () => void
    className?: string
}

export function ErrorMessage({ error, onDismiss, className = '' }: ErrorMessageProps) {
    if (!error) return null

    return (
        <div className={`error-message ${className}`}>
            <AlertCircle size={16} />
            <span>{error}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="error-dismiss"
                    aria-label="Dismiss error"
                >
                    ×
                </button>
            )}
        </div>
    )
}

interface LoadingButtonProps {
    isLoading: boolean
    children: React.ReactNode
    disabled?: boolean
    onClick?: () => void
    className?: string
    loadingText?: string
}

export function LoadingButton({
    isLoading,
    children,
    disabled = false,
    onClick,
    className = '',
    loadingText
}: LoadingButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center gap-2 ${className} ${isLoading ? 'loading' : ''}`}
        >
            {isLoading && <LoadingSpinner size={16} />}
            <span className="flex items-center gap-2">{isLoading && loadingText ? loadingText : children}</span>
        </button>
    )
} 