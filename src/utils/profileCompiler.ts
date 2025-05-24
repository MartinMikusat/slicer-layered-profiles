import { applyPatch, deepClone } from 'fast-json-patch';
import type {
    Card,
    BaseProfile,
    CompiledProfile,
    ConflictMap,
    Conflict,
    SettingChange
} from '../types';

/**
 * Compiles a final profile by applying cards to a base profile
 */
export function compileProfile(
    baseProfile: BaseProfile,
    cards: Card[],
    cardOrder: string[]
): CompiledProfile {
    // Start with a deep clone of the base profile data
    let compiledData = deepClone(baseProfile.data);

    // Get enabled cards in the correct order
    const enabledCards = cardOrder
        .map(id => cards.find(card => card.id === id))
        .filter((card): card is Card => card !== undefined && card.enabled);

    // Apply patches in order
    const appliedCards: Card[] = [];
    for (const card of enabledCards) {
        try {
            // Apply the card's patches
            const result = applyPatch(compiledData, card.patch, /* validate */ true);

            if (result.newDocument) {
                compiledData = result.newDocument;
                appliedCards.push(card);
            }
        } catch (error) {
            console.warn(`Failed to apply card "${card.name}":`, error);
            // Continue with other cards even if one fails
        }
    }

    // Detect conflicts
    const conflicts = detectConflicts(enabledCards);

    return {
        baseProfile,
        appliedCards,
        finalData: compiledData,
        conflicts,
        metadata: {
            compiled: new Date().toISOString(),
            cardCount: appliedCards.length,
            conflictCount: Object.keys(conflicts).length,
        },
    };
}

/**
 * Detects conflicts between cards by finding overlapping paths
 */
export function detectConflicts(cards: Card[]): ConflictMap {
    const conflicts: ConflictMap = {};
    const pathToCards: Record<string, Array<{ card: Card; index: number }>> = {};

    // Group cards by the paths they modify
    cards.forEach((card, index) => {
        card.patch.forEach(operation => {
            if (operation.op === 'replace' || operation.op === 'add') {
                const path = operation.path;
                if (!pathToCards[path]) {
                    pathToCards[path] = [];
                }
                pathToCards[path].push({ card, index });
            }
        });
    });

    // Find conflicts (paths modified by multiple cards)
    Object.entries(pathToCards).forEach(([path, cardEntries]) => {
        if (cardEntries.length > 1) {
            // Sort by order (last one wins)
            cardEntries.sort((a, b) => a.index - b.index);

            const winningEntry = cardEntries[cardEntries.length - 1];
            const overriddenEntries = cardEntries.slice(0, -1);

            // Get the winning value from the patch
            const winningOperation = winningEntry.card.patch.find(op => op.path === path);
            const finalValue = winningOperation && 'value' in winningOperation ? winningOperation.value : undefined;

            conflicts[path] = {
                path,
                cards: cardEntries.map(entry => entry.card.id),
                finalValue,
                overriddenValues: overriddenEntries.map(entry => {
                    const operation = entry.card.patch.find(op => op.path === path);
                    return {
                        cardId: entry.card.id,
                        cardName: entry.card.name,
                        value: operation && 'value' in operation ? operation.value : undefined,
                    };
                }),
            };
        }
    });

    return conflicts;
}

/**
 * Updates setting previews for cards based on a base profile
 */
export function updateCardPreviews(
    cards: Card[],
    baseProfile: BaseProfile
): Card[] {
    return cards.map(card => ({
        ...card,
        preview: generateSettingPreview(card, baseProfile.data),
    }));
}

/**
 * Generates human-readable preview of what a card changes
 */
export function generateSettingPreview(
    card: Card,
    baseData: Record<string, any>
): SettingChange[] {
    const changes: SettingChange[] = [];

    card.patch.forEach(operation => {
        if (operation.op === 'replace' || operation.op === 'add') {
            const path = operation.path;
            const newValue = operation.value;

            // Get the old value from the base data
            const oldValue = getValueAtPath(baseData, path);

            // Convert path to human-readable info
            const settingInfo = parseSettingPath(path);

            changes.push({
                path,
                key: settingInfo.name,
                oldValue,
                newValue,
                unit: settingInfo.unit,
                section: settingInfo.section,
            });
        }
    });

    return changes;
}

/**
 * Gets a value from an object using a JSON pointer path
 */
function getValueAtPath(obj: any, path: string): any {
    if (!path.startsWith('/')) return undefined;

    const parts = path.slice(1).split('/');
    let current = obj;

    for (const part of parts) {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        current = current[part];
    }

    return current;
}

/**
 * Converts a JSON pointer path to human-readable setting information
 */
function parseSettingPath(path: string): {
    name: string;
    unit?: string;
    section: string;
} {
    // Basic mapping of common paths to human names
    const pathMappings: Record<string, { name: string; unit?: string; section: string }> = {
        '/print_settings/layer_height': { name: 'Layer Height', unit: 'mm', section: 'Quality' },
        '/print_settings/first_layer_height': { name: 'First Layer Height', unit: 'mm', section: 'Quality' },
        '/print_settings/perimeter_speed': { name: 'Perimeter Speed', unit: 'mm/s', section: 'Speed' },
        '/print_settings/infill_speed': { name: 'Infill Speed', unit: 'mm/s', section: 'Speed' },
        '/print_settings/travel_speed': { name: 'Travel Speed', unit: 'mm/s', section: 'Speed' },
        '/print_settings/fill_density': { name: 'Infill Density', unit: '%', section: 'Infill' },
        '/print_settings/fill_pattern': { name: 'Infill Pattern', section: 'Infill' },
        '/filament_settings/temperature': { name: 'Nozzle Temperature', unit: '°C', section: 'Temperature' },
        '/filament_settings/first_layer_temperature': { name: 'First Layer Temp', unit: '°C', section: 'Temperature' },
        '/filament_settings/bed_temperature': { name: 'Bed Temperature', unit: '°C', section: 'Temperature' },
        '/filament_settings/min_fan_speed': { name: 'Min Fan Speed', unit: '%', section: 'Cooling' },
        '/filament_settings/max_fan_speed': { name: 'Max Fan Speed', unit: '%', section: 'Cooling' },
    };

    const mapped = pathMappings[path];
    if (mapped) {
        return mapped;
    }

    // Fallback: parse the path to get a reasonable name
    const parts = path.split('/');
    const settingName = parts[parts.length - 1];
    const section = parts[1] || 'Settings';

    return {
        name: settingName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        section: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };
}

/**
 * Validates that a patch can be applied to a profile
 */
export function validateCard(card: Card, baseData: Record<string, any>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // Try to apply the patch to a clone to see if it works
        const testData = deepClone(baseData);
        applyPatch(testData, card.patch, true);
    } catch (error) {
        errors.push(`Patch application failed: ${error}`);
    }

    // Check for common issues
    card.patch.forEach((operation, index) => {
        if (!operation.path || !operation.path.startsWith('/')) {
            errors.push(`Operation ${index}: Invalid path "${operation.path}"`);
        }

        if (operation.op === 'replace' || operation.op === 'add') {
            if (operation.value === undefined) {
                warnings.push(`Operation ${index}: No value specified for ${operation.path}`);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
} 