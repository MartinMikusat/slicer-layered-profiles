// Application Constants
export const APP_VERSION = '0.1.0';
export const PROJECT_VERSION = '1.0';

// UI Constants
export const UI = {
    DRAG_DELAY: 200,
    TOAST_DURATION: 3000,
    CARD_ANIMATION_DURATION: 300,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    PROJECT_STATE: 'slc_project_state',
    USER_SETTINGS: 'slc_user_settings',
    DEMO_SHOWN: 'slc_demo_shown',
} as const;

// Default Export Settings
export const DEFAULT_EXPORT_SETTINGS = {
    includeComments: true,
    includeMetadata: true,
    filename: 'custom_profile.ini',
    format: 'ini' as const,
};

// Card Categories
export const CARD_CATEGORIES = {
    temperature: 'Temperature',
    speed: 'Speed & Acceleration',
    quality: 'Quality & Resolution',
    support: 'Support & Adhesion',
    infill: 'Infill & Density',
    other: 'Other Settings',
} as const;

// INI Section Names (common PrusaSlicer sections)
export const INI_SECTIONS = {
    PRINT_SETTINGS: 'print_settings',
    FILAMENT_SETTINGS: 'filament_settings',
    PRINTER_SETTINGS: 'printer_settings',
} as const;

// Common Setting Paths (for easier card creation)
export const SETTING_PATHS = {
    // Quality
    LAYER_HEIGHT: '/print_settings/layer_height',
    FIRST_LAYER_HEIGHT: '/print_settings/first_layer_height',

    // Speed
    PERIMETER_SPEED: '/print_settings/perimeter_speed',
    INFILL_SPEED: '/print_settings/infill_speed',
    TRAVEL_SPEED: '/print_settings/travel_speed',

    // Temperature
    NOZZLE_TEMP: '/filament_settings/temperature',
    FIRST_LAYER_TEMP: '/filament_settings/first_layer_temperature',
    BED_TEMP: '/filament_settings/bed_temperature',

    // Cooling
    FAN_SPEED: '/filament_settings/fan_always_on',
    MIN_FAN_SPEED: '/filament_settings/min_fan_speed',
    MAX_FAN_SPEED: '/filament_settings/max_fan_speed',

    // Infill
    FILL_DENSITY: '/print_settings/fill_density',
    FILL_PATTERN: '/print_settings/fill_pattern',
} as const;

// Human-readable setting names
export const SETTING_NAMES: Record<string, { name: string; unit?: string; section: string }> = {
    [SETTING_PATHS.LAYER_HEIGHT]: { name: 'Layer Height', unit: 'mm', section: 'Quality' },
    [SETTING_PATHS.FIRST_LAYER_HEIGHT]: { name: 'First Layer Height', unit: 'mm', section: 'Quality' },
    [SETTING_PATHS.PERIMETER_SPEED]: { name: 'Perimeter Speed', unit: 'mm/s', section: 'Speed' },
    [SETTING_PATHS.INFILL_SPEED]: { name: 'Infill Speed', unit: 'mm/s', section: 'Speed' },
    [SETTING_PATHS.TRAVEL_SPEED]: { name: 'Travel Speed', unit: 'mm/s', section: 'Speed' },
    [SETTING_PATHS.NOZZLE_TEMP]: { name: 'Nozzle Temperature', unit: '°C', section: 'Temperature' },
    [SETTING_PATHS.FIRST_LAYER_TEMP]: { name: 'First Layer Temp', unit: '°C', section: 'Temperature' },
    [SETTING_PATHS.BED_TEMP]: { name: 'Bed Temperature', unit: '°C', section: 'Temperature' },
    [SETTING_PATHS.MIN_FAN_SPEED]: { name: 'Min Fan Speed', unit: '%', section: 'Cooling' },
    [SETTING_PATHS.MAX_FAN_SPEED]: { name: 'Max Fan Speed', unit: '%', section: 'Cooling' },
    [SETTING_PATHS.FILL_DENSITY]: { name: 'Infill Density', unit: '%', section: 'Infill' },
    [SETTING_PATHS.FILL_PATTERN]: { name: 'Infill Pattern', section: 'Infill' },
};

// Error Messages
export const ERROR_MESSAGES = {
    PROFILE_NOT_FOUND: 'Base profile not found',
    CARD_VALIDATION_FAILED: 'Card validation failed',
    PATCH_APPLICATION_FAILED: 'Failed to apply card changes',
    EXPORT_FAILED: 'Failed to export profile',
    IMPORT_FAILED: 'Failed to import project',
    INVALID_JSON: 'Invalid JSON format',
    INVALID_INI: 'Invalid INI format',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    PROFILE_EXPORTED: 'Profile exported successfully',
    PROJECT_SAVED: 'Project saved successfully',
    PROJECT_LOADED: 'Project loaded successfully',
    CARD_ADDED: 'Card added successfully',
    DEMO_LOADED: 'Demo cards loaded',
} as const; 