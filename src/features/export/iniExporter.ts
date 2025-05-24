import type { CompiledProfile, ExportSettings } from '../../types';
import { APP_VERSION } from '../../constants';

/**
 * Exports a compiled profile as a PrusaSlicer INI file
 */
export function exportProfileAsINI(
    compiledProfile: CompiledProfile,
    settings: ExportSettings
): string {
    const lines: string[] = [];

    // Add header comments if enabled
    if (settings.includeComments) {
        lines.push('# PrusaSlicer profile exported from Layered Profile Builder');
        lines.push(`# Generated: ${new Date().toISOString()}`);
        lines.push(`# Base profile: ${compiledProfile.baseProfile.name}`);
        lines.push(`# Applied layers: ${compiledProfile.appliedLayers.length}`);

        if (compiledProfile.appliedLayers.length > 0) {
            lines.push('#');
            lines.push('# Applied changes:');
            compiledProfile.appliedLayers.forEach((layer, index) => {
                lines.push(`#   ${index + 1}. ${layer.name} - ${layer.description}`);
            });
        }

        if (Object.keys(compiledProfile.conflicts).length > 0) {
            lines.push('#');
            lines.push('# Conflicts resolved (last-write-wins):');
            Object.values(compiledProfile.conflicts).forEach(conflict => {
                const overridden = conflict.overriddenValues.map(v => v.layerName).join(', ');
                const winner = conflict.layers[conflict.layers.length - 1];
                const winnerLayer = compiledProfile.appliedLayers.find(c => c.id === winner);
                lines.push(`#   ${conflict.path}: "${overridden}" overridden by "${winnerLayer?.name}"`);
            });
        }

        lines.push('#');
        lines.push('');
    }

    // Convert each section of the profile data to INI format
    const sections = ['print_settings', 'filament_settings', 'printer_settings'];

    sections.forEach(sectionName => {
        const sectionData = compiledProfile.finalData[sectionName];
        if (sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
            lines.push(`[${sectionName}]`);

            // Sort keys for consistent output
            const sortedKeys = Object.keys(sectionData).sort();
            sortedKeys.forEach(key => {
                const value = (sectionData as Record<string, unknown>)[key];
                lines.push(`${key} = ${formatINIValue(value)}`);
            });

            lines.push(''); // Empty line between sections
        }
    });

    // Add metadata section if enabled
    if (settings.includeMetadata) {
        lines.push('[metadata]');
        lines.push(`generator = Layered Profile Builder v${APP_VERSION}`);
        lines.push(`base_profile = ${compiledProfile.baseProfile.id}`);
        lines.push(`layer_count = ${compiledProfile.appliedLayers.length}`);
        lines.push(`compiled = ${compiledProfile.metadata.compiled}`);

        if (compiledProfile.appliedLayers.length > 0) {
            const layerNames = compiledProfile.appliedLayers.map(c => c.name).join(', ');
            lines.push(`applied_layers = ${layerNames}`);
        }

        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Formats a value for INI file output
 */
function formatINIValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }

    if (typeof value === 'number') {
        // Preserve precision for decimal numbers
        return value.toString();
    }

    if (typeof value === 'string') {
        // Escape special characters if needed
        return value;
    }

    if (Array.isArray(value)) {
        // Join arrays with semicolons (PrusaSlicer convention)
        return value.join(';');
    }

    // Convert objects to string representation
    return JSON.stringify(value);
}

/**
 * Triggers a file download with the INI content
 */
export function downloadINIFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.ini') ? filename : `${filename}.ini`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Generates RFC-style markdown summary of profile changes
 */
export function generateChangesSummary(compiledProfile: CompiledProfile): string {
    const lines: string[] = [];

    lines.push('# Profile Changes Summary');
    lines.push('');
    lines.push(`**Base Profile:** ${compiledProfile.baseProfile.name}`);
    lines.push(`**Layers Applied:** ${compiledProfile.appliedLayers.length}`);
    lines.push(`**Conflicts:** ${Object.keys(compiledProfile.conflicts).length}`);
    lines.push('');

    if (compiledProfile.appliedLayers.length > 0) {
        lines.push('## Applied Modifications');
        lines.push('');

        compiledProfile.appliedLayers.forEach((layer, index) => {
            lines.push(`### ${index + 1}. ${layer.name}`);
            lines.push(`**Category:** ${layer.metadata.category || 'Other'}`);
            lines.push(`**Description:** ${layer.description}`);

            if (layer.preview && layer.preview.length > 0) {
                lines.push('**Changes:**');
                layer.preview.forEach(change => {
                    const oldVal = change.oldValue !== undefined ? `${change.oldValue}` : 'unset';
                    const newVal = `${change.newValue}`;
                    const unit = change.unit || '';
                    lines.push(`- ${change.key}: \`${oldVal}\` → \`${newVal}${unit}\``);
                });
            }

            lines.push('');
        });
    }

    if (Object.keys(compiledProfile.conflicts).length > 0) {
        lines.push('## Conflicts Resolved');
        lines.push('');
        lines.push('The following settings were modified by multiple layers. The last layer wins:');
        lines.push('');

        Object.values(compiledProfile.conflicts).forEach(conflict => {
            const winnerLayer = compiledProfile.appliedLayers.find(c =>
                c.id === conflict.layers[conflict.layers.length - 1]
            );

            lines.push(`**${conflict.path}**`);
            lines.push(`- Winner: "${winnerLayer?.name}" (value: \`${conflict.finalValue}\`)`);

            if (conflict.overriddenValues.length > 0) {
                lines.push('- Overridden:');
                conflict.overriddenValues.forEach(override => {
                    lines.push(`  - "${override.layerName}" (value: \`${override.value}\`)`);
                });
            }

            lines.push('');
        });
    }

    lines.push('---');
    lines.push(`*Generated by Layered Profile Builder v${APP_VERSION} on ${new Date().toLocaleDateString()}*`);

    return lines.join('\n');
} 