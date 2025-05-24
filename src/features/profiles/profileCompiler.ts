import { applyPatch, deepClone } from 'fast-json-patch';
import type {
    Layer,
    BaseProfile,
    CompiledProfile,
    ConflictMap,
    SettingChange,
    INIData,
    INIValue
} from '../../types';

/**
 * Compiles a final profile by applying layers to a base profile
 */
export function compileProfile(
    baseProfile: BaseProfile,
    layers: Layer[],
    layerOrder: string[]
): CompiledProfile {
    // Start with a deep clone of the base profile data
    let compiledData = deepClone(baseProfile.data);

    // Get enabled layers in the correct order
    const enabledLayers = layerOrder
        .map(id => layers.find(layer => layer.id === id))
        .filter((layer): layer is Layer => layer !== undefined && layer.enabled);

    // Apply patches in order
    const appliedLayers: Layer[] = [];
    for (const layer of enabledLayers) {
        try {
            // Apply the layer's patches
            const result = applyPatch(compiledData, layer.patch, /* validate */ true);

            if (result.newDocument) {
                compiledData = result.newDocument;
                appliedLayers.push(layer);
            }
        } catch (error) {
            console.warn(`Failed to apply layer "${layer.name}":`, error);
            // Continue with other layers even if one fails
        }
    }

    // Detect conflicts
    const conflicts = detectConflicts(enabledLayers);

    return {
        baseProfile,
        appliedLayers,
        finalData: compiledData,
        conflicts,
        metadata: {
            compiled: new Date().toISOString(),
            layerCount: appliedLayers.length,
            conflictCount: Object.keys(conflicts).length,
        },
    };
}

/**
 * Detects conflicts between layers by finding overlapping paths
 */
export function detectConflicts(layers: Layer[]): ConflictMap {
    const conflicts: ConflictMap = {};
    const pathToLayers: Record<string, Array<{ layer: Layer; index: number }>> = {};

    // Group layers by the paths they modify
    layers.forEach((layer, index) => {
        layer.patch.forEach(operation => {
            if (operation.op === 'replace' || operation.op === 'add') {
                const path = operation.path;
                if (!pathToLayers[path]) {
                    pathToLayers[path] = [];
                }
                pathToLayers[path].push({ layer, index });
            }
        });
    });

    // Find conflicts (paths modified by multiple layers)
    Object.entries(pathToLayers).forEach(([path, layerEntries]) => {
        if (layerEntries.length > 1) {
            // Sort by order (last one wins)
            layerEntries.sort((a, b) => a.index - b.index);

            const winningEntry = layerEntries[layerEntries.length - 1];
            const overriddenEntries = layerEntries.slice(0, -1);

            // Get the winning value from the patch
            const winningOperation = winningEntry.layer.patch.find(op => op.path === path);
            const finalValue = winningOperation && 'value' in winningOperation ? winningOperation.value : undefined;

            conflicts[path] = {
                path,
                layers: layerEntries.map(entry => entry.layer.id),
                finalValue,
                overriddenValues: overriddenEntries.map(entry => {
                    const operation = entry.layer.patch.find(op => op.path === path);
                    return {
                        layerId: entry.layer.id,
                        layerName: entry.layer.name,
                        value: operation && 'value' in operation ? operation.value : undefined,
                    };
                }),
            };
        }
    });

    return conflicts;
}

/**
 * Updates setting previews for layers based on a base profile
 */
export function updateLayerPreviews(
    layers: Layer[],
    baseProfile: BaseProfile
): Layer[] {
    return layers.map(layer => ({
        ...layer,
        preview: generateSettingPreview(layer, baseProfile.data),
    }));
}

/**
 * Generates human-readable preview of what a layer changes
 */
export function generateSettingPreview(
    layer: Layer,
    baseData: INIData
): SettingChange[] {
    const changes: SettingChange[] = [];

    layer.patch.forEach(operation => {
        if (operation.op === 'replace' || operation.op === 'add') {
            const path = operation.path;
            const newValue = operation.value as INIValue;

            // Get the old value from the base data
            const oldValue = getValueAtPath(baseData, path) as INIValue | undefined;

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
function getValueAtPath(obj: unknown, path: string): unknown {
    if (!path.startsWith('/')) return undefined;

    const parts = path.slice(1).split('/');
    let current = obj;

    for (const part of parts) {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
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
export function validateLayer(layer: Layer, baseData: INIData): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // Try to apply the patch to a clone to see if it works
        const testData = deepClone(baseData);
        applyPatch(testData, layer.patch, true);
    } catch (error) {
        errors.push(`Patch application failed: ${error}`);
    }

    // Check for common issues
    layer.patch.forEach((operation, index) => {
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