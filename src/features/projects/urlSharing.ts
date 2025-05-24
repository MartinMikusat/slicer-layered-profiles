import type { ProjectData } from '../../types'

interface ShareableData {
    baseProfile: string
    cards: any[]
    cardOrder: string[]
    name?: string
    description?: string
}

export function encodeProjectToURL(projectData: ProjectData): string {
    try {
        const shareableData: ShareableData = {
            baseProfile: projectData.baseProfile,
            cards: projectData.cards,
            cardOrder: projectData.cardOrder,
            name: (projectData as any).name,
            description: projectData.metadata?.description
        }

        const jsonString = JSON.stringify(shareableData)
        const base64 = btoa(encodeURIComponent(jsonString))

        // Create shareable URL
        const currentURL = new URL(window.location.href)
        currentURL.searchParams.set('project', base64)

        return currentURL.toString()
    } catch (error) {
        console.error('Failed to encode project to URL:', error)
        throw new Error('Failed to create shareable URL')
    }
}

export function decodeProjectFromURL(): ProjectData | null {
    try {
        const params = new URLSearchParams(window.location.search)
        const projectParam = params.get('project')

        if (!projectParam) {
            return null
        }

        const jsonString = decodeURIComponent(atob(projectParam))
        const shareableData: ShareableData = JSON.parse(jsonString)

        // Convert to ProjectData format
        const projectData: ProjectData = {
            version: '1.0.0',
            name: shareableData.name || 'Shared Project',
            baseProfile: shareableData.baseProfile,
            cards: shareableData.cards,
            cardOrder: shareableData.cardOrder,
            exportSettings: {
                filename: 'shared_profile.ini',
                includeComments: true,
                includeMetadata: true,
                format: 'ini' as const
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                description: shareableData.description || 'Project shared via URL'
            }
        }

        return projectData
    } catch (error) {
        console.error('Failed to decode project from URL:', error)
        return null
    }
}

export function clearProjectFromURL(): void {
    const currentURL = new URL(window.location.href)
    currentURL.searchParams.delete('project')
    window.history.replaceState({}, '', currentURL.toString())
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
    } else {
        // Fallback for browsers without clipboard API
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()

            try {
                document.execCommand('copy')
                document.body.removeChild(textArea)
                resolve()
            } catch (error) {
                document.body.removeChild(textArea)
                reject(error)
            }
        })
    }
} 