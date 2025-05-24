import type { BaseProfile, Layer, ConflictMap } from '../../types'

interface ChangeSummaryOptions {
    includeConflicts?: boolean
    includeMetadata?: boolean
    format?: 'markdown' | 'text'
    sections?: Array<'overview' | 'layers' | 'conflicts' | 'technical'>
}

export function generateChangeSummary(
    baseProfile: BaseProfile,
    appliedLayers: Layer[],
    conflicts: ConflictMap,
    options: ChangeSummaryOptions = {}
): string {
    const {
        includeConflicts = true,
        includeMetadata = true,
        format = 'markdown',
        sections = ['overview', 'layers', 'conflicts', 'technical']
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

        summary += `${bold('Applied Layers')}: ${appliedLayers.filter(l => l.enabled).length}\n`

        if (includeConflicts) {
            const conflictCount = Object.keys(conflicts).length
            summary += `${bold('Conflicts')}: ${conflictCount} ${conflictCount === 1 ? 'setting' : 'settings'}\n`
        }

        summary += '\n'
    }

    // Layers Section
    if (sections.includes('layers') && appliedLayers.length > 0) {
        summary += `${h2}Applied Modifications\n\n`

        appliedLayers.filter(layer => layer.enabled).forEach((layer, index) => {
            summary += `${h3}${index + 1}. ${layer.name}\n`
            summary += `${layer.description}\n\n`

            if (layer.preview && layer.preview.length > 0) {
                summary += `${bold('Changes')}:\n`
                layer.preview.forEach(change => {
                    const oldText = change.oldValue !== undefined ? ` (was: ${change.oldValue}${change.unit || ''})` : ''
                    summary += `${bullet}${change.key}: ${code(String(change.newValue))}${change.unit || ''}${oldText}\n`
                })
                summary += '\n'
            }

            if (includeMetadata && layer.metadata) {
                const meta: string[] = []
                if (layer.metadata.author) meta.push(`Author: ${layer.metadata.author}`)
                if (layer.metadata.version) meta.push(`Version: ${layer.metadata.version}`)
                if (layer.metadata.category) meta.push(`Category: ${layer.metadata.category}`)
                if (layer.metadata.tags?.length) meta.push(`Tags: ${layer.metadata.tags.join(', ')}`)

                if (meta.length > 0) {
                    summary += `${isMarkdown ? '*' : ''}${meta.join(' • ')}${isMarkdown ? '*' : ''}\n\n`
                }
            }
        })
    }

    // Conflicts Section
    if (sections.includes('conflicts') && includeConflicts && Object.keys(conflicts).length > 0) {
        summary += `${h2}Setting Conflicts\n\n`
        summary += `The following settings are modified by multiple layers. The ${bold('rightmost layer wins')}:\n\n`

        Object.entries(conflicts).forEach(([, conflict]) => {
            summary += `${h3}${conflict.path.split('/').pop()}\n`
            summary += `${bullet}${bold('Final Value')}: ${code(String(conflict.finalValue))}\n`
            summary += `${bullet}${bold('Overridden by')}:\n`

            conflict.overriddenValues.forEach(override => {
                summary += `  ${bullet}${override.layerName}: ${code(String(override.value))}\n`
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
            summary += `${h3}Layer Order (Left to Right)\n`
            summary += '```\n'
            appliedLayers.filter(layer => layer.enabled).forEach((layer, index) => {
                summary += `${index + 1}. ${layer.name}\n`
            })
            summary += '```\n\n'
        } else {
            summary += `${bold('Layer Order (Left to Right')}:\n`
            appliedLayers.filter(layer => layer.enabled).forEach((layer, index) => {
                summary += `${index + 1}. ${layer.name}\n`
            })
            summary += '\n'
        }
    }

    return summary.trim()
}

export function exportChangeSummaryAsFile(
    baseProfile: BaseProfile,
    appliedLayers: Layer[],
    conflicts: ConflictMap,
    options: ChangeSummaryOptions = {}
): void {
    const summary = generateChangeSummary(baseProfile, appliedLayers, conflicts, options)
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
    appliedLayers: Layer[],
    conflicts: ConflictMap
): string {
    const enabledLayers = appliedLayers.filter(layer => layer.enabled)
    const conflictCount = Object.keys(conflicts).length

    let summary = `Modified ${baseProfile.name} with ${enabledLayers.length} layers`

    if (conflictCount > 0) {
        summary += ` (${conflictCount} conflicts resolved)`
    }

    if (enabledLayers.length > 0) {
        const layerNames = enabledLayers.map(layer => layer.name).join(', ')
        summary += `\nLayers: ${layerNames}`
    }

    return summary
} 