import type { Operation } from 'fast-json-patch';

// Core types for INI data
export type INIValue = string | number | boolean | number[] | string[];
export type INIData = Record<string, INIValue | Record<string, INIValue> | INIValue[] | Record<string, any>>;

// Core Profile Types
export interface BaseProfile {
    id: string;
    name: string;
    description: string;
    version: string;
    data: INIData; // The original INI data as JSON
    metadata: {
        printer?: string;
        nozzle?: string;
        material?: string;
        quality?: string;
        author?: string;
        created?: string;
    };
}

// Layer System
export interface Layer {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    patch: Operation[]; // JSON Patch operations
    metadata: {
        author?: string;
        version?: string;
        tags?: string[];
        category?: 'temperature' | 'speed' | 'quality' | 'support' | 'infill' | 'other';
        created?: string;
        modified?: string;
    };
    preview?: SettingChange[]; // Human-readable preview of changes
}

export interface SettingChange {
    path: string; // JSON path like "/print_settings/layer_height"
    key: string; // Human-readable key like "Layer Height"
    oldValue?: INIValue;
    newValue: INIValue;
    unit?: string; // "mm", "%", "°C", etc.
    section?: string; // INI section like "print_settings"
}

// Conflict Detection
export interface Conflict {
    path: string;
    layers: string[]; // IDs of layers that modify this path
    finalValue: INIValue; // The value that wins (last layer)
    overriddenValues: Array<{
        layerId: string;
        layerName: string;
        value: INIValue;
    }>;
}

export type ConflictMap = Record<string, Conflict>;

// Application State
export interface AppState {
    selectedBaseProfile: string;
    layers: Layer[];
    layerOrder: string[]; // Ordered list of layer IDs for drag/drop
    conflicts: ConflictMap;
    compiledProfile: CompiledProfile | null;
    exportSettings: ExportSettings;
    uiState: UIState;
}

export interface CompiledProfile {
    baseProfile: BaseProfile;
    appliedLayers: Layer[];
    finalData: INIData;
    conflicts: ConflictMap;
    metadata: {
        compiled: string;
        layerCount: number;
        conflictCount: number;
    };
}

export interface ExportSettings {
    includeComments: boolean;
    includeMetadata: boolean;
    filename: string;
    format: 'ini' | 'json';
}

export interface UIState {
    draggedLayer: string | null;
    selectedLayer: string | null;
    showConflicts: boolean;
    showDemo: boolean;
    tourStep: number | null;
}

// Project Save/Load
export interface ProjectData {
    version: string;
    name: string;
    baseProfile: string;
    layers: Layer[];
    layerOrder: string[];
    exportSettings: ExportSettings;
    metadata: {
        created: string;
        modified: string;
        description?: string;
    };
}

// API/Service Types
export interface ProfileService {
    listBaseProfiles(): BaseProfile[];
    getBaseProfile(id: string): BaseProfile | null;
    parseINI(content: string): INIData;
    generateINI(data: INIData): string;
}

export interface LayerService {
    createLayer(data: Partial<Layer>): Layer;
    validateLayer(layer: Layer): ValidationResult;
    applyLayer(profile: INIData, layer: Layer): INIData;
    detectConflicts(layers: Layer[]): ConflictMap;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// Demo Data
export interface DemoLayer extends Omit<Layer, 'id'> {
    demoId: string;
}

// Error Types
export type AppError =
    | { type: 'PROFILE_NOT_FOUND'; profileId: string }
    | { type: 'LAYER_INVALID'; layerId: string; errors: string[] }
    | { type: 'PATCH_FAILED'; layerId: string; error: string }
    | { type: 'EXPORT_FAILED'; error: string }
    | { type: 'IMPORT_FAILED'; error: string };

// Event Types for hooks
export interface AppEvent {
    type: string;
    payload?: unknown;
    timestamp: number;
}

export type AppAction =
    | { type: 'SET_BASE_PROFILE'; profileId: string }
    | { type: 'ADD_LAYER'; layer: Layer }
    | { type: 'UPDATE_LAYER'; layerId: string; updates: Partial<Layer> }
    | { type: 'REMOVE_LAYER'; layerId: string }
    | { type: 'REORDER_LAYERS'; layerOrder: string[] }
    | { type: 'TOGGLE_LAYER'; layerId: string }
    | { type: 'LOAD_DEMO' }
    | { type: 'RESET_STATE' }
    | { type: 'UNDO' }
    | { type: 'REDO' }; 