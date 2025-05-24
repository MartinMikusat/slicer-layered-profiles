import { PROJECT_VERSION, STORAGE_KEYS, ERROR_MESSAGES } from '../../constants';
import type { ProjectData, Card, ExportSettings } from '../../types';

/**
 * Create project data structure for saving
 */
export function createProjectData(
    name: string,
    baseProfile: string,
    cards: Card[],
    cardOrder: string[],
    exportSettings: ExportSettings,
    description?: string
): ProjectData {
    const now = new Date().toISOString();

    return {
        version: PROJECT_VERSION,
        name,
        baseProfile,
        cards,
        cardOrder,
        exportSettings,
        metadata: {
            created: now,
            modified: now,
            description,
        },
    };
}

/**
 * Save project to localStorage
 */
export function saveProjectToStorage(projectData: ProjectData): boolean {
    try {
        const dataToSave = {
            ...projectData,
            metadata: {
                ...projectData.metadata,
                modified: new Date().toISOString(),
            },
        };

        localStorage.setItem(STORAGE_KEYS.PROJECT_STATE, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Failed to save project to localStorage:', error);
        return false;
    }
}

/**
 * Load project from localStorage
 */
export function loadProjectFromStorage(): ProjectData | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
        if (!stored) {
            return null;
        }

        const projectData = JSON.parse(stored) as ProjectData;

        // Migrate if needed
        return migrateProjectData(projectData);
    } catch (error) {
        console.error('Failed to load project from localStorage:', error);
        return null;
    }
}

/**
 * Export project as JSON file
 */
export function exportProjectAsJSON(projectData: ProjectData): string {
    try {
        return JSON.stringify(projectData, null, 2);
    } catch (error) {
        console.error('Failed to export project as JSON:', error);
        throw new Error(ERROR_MESSAGES.EXPORT_FAILED);
    }
}

/**
 * Import project from JSON string
 */
export function importProjectFromJSON(jsonString: string): ProjectData {
    try {
        const projectData = JSON.parse(jsonString) as ProjectData;

        // Validate basic structure
        if (!validateProjectData(projectData)) {
            throw new Error(ERROR_MESSAGES.INVALID_JSON);
        }

        // Migrate if needed
        return migrateProjectData(projectData);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        console.error('Failed to import project from JSON:', error);
        throw new Error(ERROR_MESSAGES.IMPORT_FAILED);
    }
}

/**
 * Download project as JSON file
 */
export function downloadProjectFile(projectData: ProjectData, filename?: string): void {
    try {
        const jsonContent = exportProjectAsJSON(projectData);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download project file:', error);
        throw new Error(ERROR_MESSAGES.EXPORT_FAILED);
    }
}

/**
 * Validate project data structure
 */
function validateProjectData(data: unknown): data is ProjectData {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const obj = data as Record<string, unknown>;

    return (
        typeof obj.version === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.baseProfile === 'string' &&
        Array.isArray(obj.cards) &&
        Array.isArray(obj.cardOrder) &&
        !!obj.exportSettings &&
        typeof obj.exportSettings === 'object' &&
        !!obj.metadata &&
        typeof obj.metadata === 'object' &&
        typeof (obj.metadata as Record<string, unknown>).created === 'string' &&
        typeof (obj.metadata as Record<string, unknown>).modified === 'string'
    );
}

/**
 * Migrate project data to current version
 */
function migrateProjectData(data: ProjectData): ProjectData {
    // For now, just ensure we have the current version
    // In the future, this would handle version-specific migrations

    if (data.version !== PROJECT_VERSION) {
        console.warn(`Migrating project from version ${data.version} to ${PROJECT_VERSION}`);

        // Add any migration logic here for future versions
        // For now, just update the version
        data.version = PROJECT_VERSION;
        data.metadata.modified = new Date().toISOString();
    }

    return data;
}

/**
 * Clear saved project from localStorage
 */
export function clearStoredProject(): boolean {
    try {
        localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
        return true;
    } catch (error) {
        console.error('Failed to clear stored project:', error);
        return false;
    }
}

/**
 * Check if there's a saved project in localStorage
 */
export function hasStoredProject(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEYS.PROJECT_STATE) !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Auto-save project data with debouncing
 */
let autoSaveTimeout: NodeJS.Timeout | null = null;

export function autoSaveProject(projectData: ProjectData, delay: number = 1000): void {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(() => {
        saveProjectToStorage(projectData);
    }, delay);
} 