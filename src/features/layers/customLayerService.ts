import type { Layer } from '../../types';

const CUSTOM_LAYERS_STORAGE_KEY = 'layered-profile-builder-custom-layers';
const CUSTOM_LAYERS_VERSION = '1.0';

interface StoredCustomLayers {
    version: string;
    layers: Layer[];
    lastModified: string;
}

/**
 * Load custom layers from localStorage
 */
export function loadCustomLayers(): Layer[] {
    try {
        const stored = localStorage.getItem(CUSTOM_LAYERS_STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const data: StoredCustomLayers = JSON.parse(stored);

        // Version check - if version doesn't match, return empty array
        if (data.version !== CUSTOM_LAYERS_VERSION) {
            console.warn('Custom layers version mismatch, clearing stored layers');
            clearCustomLayers();
            return [];
        }

        return data.layers || [];
    } catch (error) {
        console.error('Failed to load custom layers:', error);
        return [];
    }
}

/**
 * Save custom layers to localStorage
 */
export function saveCustomLayers(layers: Layer[]): boolean {
    try {
        const data: StoredCustomLayers = {
            version: CUSTOM_LAYERS_VERSION,
            layers,
            lastModified: new Date().toISOString(),
        };

        localStorage.setItem(CUSTOM_LAYERS_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save custom layers:', error);
        return false;
    }
}

/**
 * Add a new custom layer
 */
export function addCustomLayer(layer: Layer): boolean {
    try {
        const existingLayers = loadCustomLayers();

        // Check if layer with same ID already exists
        const existingIndex = existingLayers.findIndex(l => l.id === layer.id);
        if (existingIndex >= 0) {
            console.warn('Layer with ID already exists:', layer.id);
            return false;
        }

        const updatedLayers = [...existingLayers, layer];
        return saveCustomLayers(updatedLayers);
    } catch (error) {
        console.error('Failed to add custom layer:', error);
        return false;
    }
}

/**
 * Update an existing custom layer
 */
export function updateCustomLayer(layerId: string, updates: Partial<Layer>): boolean {
    try {
        const existingLayers = loadCustomLayers();
        const layerIndex = existingLayers.findIndex(l => l.id === layerId);

        if (layerIndex === -1) {
            console.warn('Layer not found for update:', layerId);
            return false;
        }

        const updatedLayer = {
            ...existingLayers[layerIndex],
            ...updates,
            metadata: {
                ...existingLayers[layerIndex].metadata,
                ...updates.metadata,
                modified: new Date().toISOString(),
            },
        };

        const updatedLayers = [...existingLayers];
        updatedLayers[layerIndex] = updatedLayer;

        return saveCustomLayers(updatedLayers);
    } catch (error) {
        console.error('Failed to update custom layer:', error);
        return false;
    }
}

/**
 * Remove a custom layer
 */
export function removeCustomLayer(layerId: string): boolean {
    try {
        const existingLayers = loadCustomLayers();
        const filteredLayers = existingLayers.filter(l => l.id !== layerId);

        if (filteredLayers.length === existingLayers.length) {
            console.warn('Layer not found for removal:', layerId);
            return false;
        }

        return saveCustomLayers(filteredLayers);
    } catch (error) {
        console.error('Failed to remove custom layer:', error);
        return false;
    }
}

/**
 * Duplicate a custom layer with a new ID
 */
export function duplicateCustomLayer(layerId: string, newName?: string): Layer | null {
    try {
        const existingLayers = loadCustomLayers();
        const originalLayer = existingLayers.find(l => l.id === layerId);

        if (!originalLayer) {
            console.warn('Layer not found for duplication:', layerId);
            return null;
        }

        const duplicatedLayer: Layer = {
            ...originalLayer,
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newName || `${originalLayer.name} (Copy)`,
            metadata: {
                ...originalLayer.metadata,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
            },
        };

        if (addCustomLayer(duplicatedLayer)) {
            return duplicatedLayer;
        }

        return null;
    } catch (error) {
        console.error('Failed to duplicate custom layer:', error);
        return null;
    }
}

/**
 * Clear all custom layers
 */
export function clearCustomLayers(): boolean {
    try {
        localStorage.removeItem(CUSTOM_LAYERS_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear custom layers:', error);
        return false;
    }
}

/**
 * Check if a layer is a custom layer (vs demo layer)
 */
export function isCustomLayer(layer: Layer): boolean {
    return layer.id.startsWith('custom-');
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
        const stored = localStorage.getItem(CUSTOM_LAYERS_STORAGE_KEY);
        const used = stored ? new Blob([stored]).size : 0;

        // Rough estimate of localStorage limit (usually 5-10MB)
        const available = 5 * 1024 * 1024; // 5MB
        const percentage = (used / available) * 100;

        return { used, available, percentage };
    } catch {
        return { used: 0, available: 0, percentage: 0 };
    }
} 