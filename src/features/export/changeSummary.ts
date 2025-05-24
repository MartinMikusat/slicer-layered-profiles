import type { BaseProfile, Card, ConflictMap } from '../../types'

interface ChangeSummaryOptions {
    includeConflicts?: boolean
    includeMetadata?: boolean
    format?: 'markdown' | 'text'
    sections?: Array<'overview' | 'cards' | 'conflicts' | 'technical'>
}

export function generateChangeSummary(
    baseProfile: BaseProfile,
    appliedCards: Card[],
    conflicts: ConflictMap,
    options: ChangeSummaryOptions = {}
): string {
    const {
        includeConflicts = true,
        includeMetadata = true,
        format = 'markdown',
        sections = ['overview', 'cards', 'conflicts', 'technical']
    } = options

    const isMarkdown = format === 'markdown'
    const h1 = isMarkdown ? '# ' : ''
    const h2 = isMarkdown ? '## ' : ''
    const h3 = isMarkdown ? '### ' : ''
    const bold = (text: string) => isMarkdown ? `**${text}**` : text.toUpperCase()
    const code = (text: string) => isMarkdown ? `\`${text}\`` : `"${text}"`
    const bullet = isMarkdown ? '- ' : '• '

    let summary = ''

    // Overview Section
    if (sections.includes('overview')) {
        summary += `${h1}Profile Modification Summary\n\n`
        summary += `${bold('Base Profile')}: ${baseProfile.name}\n`
        summary += `${bold('Description')}: ${baseProfile.description}\n`

        if (includeMetadata && baseProfile.metadata) {
            summary += `${bold('Printer')}: ${baseProfile.metadata.printer || 'Unknown'}\n`
            summary += `${bold('Quality')}: ${baseProfile.metadata.quality || 'Unknown'}\n`
        }

        summary += `${bold('Applied Cards')}: ${appliedCards.filter(c => c.enabled).length}\n`

        if (includeConflicts) {
            const conflictCount = Object.keys(conflicts).length
            summary += `${bold('Conflicts')}: ${conflictCount} ${conflictCount === 1 ? 'setting' : 'settings'}\n`
        }

        summary += '\n'
    }

    // Cards Section
    if (sections.includes('cards') && appliedCards.length > 0) {
        summary += `${h2}Applied Modifications\n\n`

        appliedCards.filter(card => card.enabled).forEach((card, index) => {
            summary += `${h3}${index + 1}. ${card.name}\n`
            summary += `${card.description}\n\n`

            if (card.preview && card.preview.length > 0) {
                summary += `${bold('Changes')}:\n`
                card.preview.forEach(change => {
                    const oldText = change.oldValue !== undefined ? ` (was: ${change.oldValue}${change.unit || ''})` : ''
                    summary += `${bullet}${change.key}: ${code(String(change.newValue))}${change.unit || ''}${oldText}\n`
                })
                summary += '\n'
            }

            if (includeMetadata && card.metadata) {
                const meta = []
                if (card.metadata.author) meta.push(`Author: ${card.metadata.author}`)
                if (card.metadata.version) meta.push(`Version: ${card.metadata.version}`)
                if (card.metadata.category) meta.push(`Category: ${card.metadata.category}`)
                if (card.metadata.tags?.length) meta.push(`Tags: ${card.metadata.tags.join(', ')}`)

                if (meta.length > 0) {
                    summary += `${isMarkdown ? '*' : ''}${meta.join(' • ')}${isMarkdown ? '*' : ''}\n\n`
                }
            }
        })
    }

    // Conflicts Section
    if (sections.includes('conflicts') && includeConflicts && Object.keys(conflicts).length > 0) {
        summary += `${h2}Setting Conflicts\n\n`
        summary += `The following settings are modified by multiple cards. The ${bold('rightmost card wins')}:\n\n`

        Object.entries(conflicts).forEach(([, conflict]) => {
            summary += `${h3}${conflict.path.split('/').pop()}\n`
            summary += `${bullet}${bold('Final Value')}: ${code(String(conflict.finalValue))}\n`
            summary += `${bullet}${bold('Overridden by')}:\n`

            conflict.overriddenValues.forEach(override => {
                summary += `  ${bullet}${override.cardName}: ${code(String(override.value))}\n`
            })
            summary += '\n'
        })
    }

    // Technical Section
    if (sections.includes('technical')) {
        summary += `${h2}Technical Details\n\n`
        summary += `${bullet}${bold('Generation Time')}: ${new Date().toISOString()}\n`
        summary += `${bullet}${bold('Base Profile Version')}: ${baseProfile.version}\n`
        summary += `${bullet}${bold('Tool')}: Layered Profile Builder\n\n`

        if (isMarkdown) {
            summary += `${h3}Card Order (Left to Right)\n`
            summary += '```\n'
            appliedCards.filter(card => card.enabled).forEach((card, index) => {
                summary += `${index + 1}. ${card.name}\n`
            })
            summary += '```\n\n'
        } else {
            summary += `${bold('Card Order (Left to Right')}:\n`
            appliedCards.filter(card => card.enabled).forEach((card, index) => {
                summary += `${index + 1}. ${card.name}\n`
            })
            summary += '\n'
        }
    }

    return summary.trim()
}

export function exportChangeSummaryAsFile(
    baseProfile: BaseProfile,
    appliedCards: Card[],
    conflicts: ConflictMap,
    options: ChangeSummaryOptions = {}
): void {
    const summary = generateChangeSummary(baseProfile, appliedCards, conflicts, options)
    const format = options.format || 'markdown'
    const extension = format === 'markdown' ? '.md' : '.txt'
    const filename = `profile-changes-${Date.now()}${extension}`

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
}

export function generateQuickSummary(
    baseProfile: BaseProfile,
    appliedCards: Card[],
    conflicts: ConflictMap
): string {
    const enabledCards = appliedCards.filter(card => card.enabled)
    const conflictCount = Object.keys(conflicts).length

    let summary = `Modified ${baseProfile.name} with ${enabledCards.length} cards`

    if (conflictCount > 0) {
        summary += ` (${conflictCount} conflicts resolved)`
    }

    if (enabledCards.length > 0) {
        const cardNames = enabledCards.map(card => card.name).join(', ')
        summary += `\nCards: ${cardNames}`
    }

    return summary
} 