import type { BaseProfile, INIData, INIValue } from '../../../types';
import { parseINI, extractPrinterProfile, type INISection } from './iniParser';

/**
 * Convert a PrusaSlicer INI file to our BaseProfile format
 */
export function convertINIToBaseProfile(
    iniContent: string,
    printerName: string
): BaseProfile | null {
    try {
        const parsed = parseINI(iniContent);
        const printerData = extractPrinterProfile(parsed, printerName);

        if (!printerData) {
            console.warn(`Printer profile "${printerName}" not found in INI`);
            return null;
        }

        const { printer, defaultPrint, defaultFilament } = printerData;

        // Generate profile metadata
        const metadata = extractProfileMetadata(printer, parsed.vendor);

        // Combine all settings into a single data object
        const profileData = combineProfileData(printer, defaultPrint, defaultFilament);

        return {
            id: generateProfileId(printerName, printer),
            name: generateProfileName(printer),
            description: generateProfileDescription(printer, metadata),
            version: (parsed.vendor?.data.config_version as string) || '1.0',
            data: profileData,
            metadata
        };
    } catch (error) {
        console.error('Error converting INI to BaseProfile:', error);
        return null;
    }
}

/**
 * Convert multiple printers from a single INI file
 */
export function convertINIToBaseProfiles(
    iniContent: string,
    printerNames?: string[]
): BaseProfile[] {
    try {
        const parsed = parseINI(iniContent);

        // If no specific printer names provided, convert all non-abstract printers
        const targetPrinters = printerNames || parsed.printers
            .filter(p => !p.name.startsWith('*') && !p.name.includes('MMU'))
            .map(p => p.name);

        const profiles: BaseProfile[] = [];

        for (const printerName of targetPrinters) {
            const profile = convertINIToBaseProfile(iniContent, printerName);
            if (profile) {
                profiles.push(profile);
            }
        }

        return profiles;
    } catch (error) {
        console.error('Error converting INI to BaseProfiles:', error);
        return [];
    }
}

/**
 * Extract metadata from printer and vendor sections
 */
function extractProfileMetadata(
    printer: INISection,
    vendor?: INISection
): BaseProfile['metadata'] {
    const printerData = printer.data;

    // Extract printer model and variant info
    const printerModel = (printerData.printer_model as string) || 'Unknown';
    const nozzleSize = printerData.nozzle_diameter || printerData.printer_variant || '0.4';

    // Determine quality level from profile name
    let quality = 'Standard';
    if (printer.name.toLowerCase().includes('detail')) quality = 'Detail';
    else if (printer.name.toLowerCase().includes('quality')) quality = 'Quality';
    else if (printer.name.toLowerCase().includes('speed')) quality = 'Speed';
    else if (printer.name.toLowerCase().includes('draft')) quality = 'Draft';

    return {
        printer: printerModel,
        nozzle: `${nozzleSize}mm`,
        material: 'PLA', // Default, could be extracted from default filament
        quality,
        author: (vendor?.data.name as string) || 'Prusa Research',
        created: new Date().toISOString().split('T')[0]
    };
}

/**
 * Combine printer, print, and filament settings into unified data structure
 */
function combineProfileData(
    printer: INISection,
    defaultPrint?: INISection,
    defaultFilament?: INISection
): INIData {
    // Organize settings by category to match our existing structure
    const printerSettings = extractPrinterSettings(printer.data);
    const printSettings = defaultPrint ? extractPrintSettings(defaultPrint.data) : {};
    const filamentSettings = defaultFilament ? extractFilamentSettings(defaultFilament.data) : {};

    return {
        printer_settings: printerSettings,
        print_settings: printSettings,
        filament_settings: filamentSettings
    };
}

/**
 * Extract and clean printer-specific settings
 */
function extractPrinterSettings(data: Record<string, unknown>): Record<string, INIValue> {
    // Key printer settings that affect physical capabilities
    const settings: Record<string, INIValue> = {};

    // Bed and build volume
    if (data.bed_shape) {
        const bedShape = Array.isArray(data.bed_shape) ? data.bed_shape : [];
        if (bedShape.length >= 3) {
            settings.bed_size_x = (bedShape[2] as { x?: number })?.x || 250;
            settings.bed_size_y = (bedShape[2] as { y?: number })?.y || 210;
        }
    }
    settings.max_print_height = data.max_print_height as number || 200;

    // Nozzle settings
    settings.nozzle_diameter = data.nozzle_diameter as number || 0.4;
    settings.max_layer_height = data.max_layer_height as number || 0.25;
    settings.min_layer_height = data.min_layer_height as number || 0.05;

    // Retraction settings
    settings.retract_length = data.retract_length as number || 0.8;
    settings.retract_speed = data.retract_speed as number || 35;
    settings.retract_lift = data.retract_lift as number || 0.4;

    // Machine limits (for display/validation)
    settings.machine_max_feedrate_x = data.machine_max_feedrate_x as number || 200;
    settings.machine_max_feedrate_y = data.machine_max_feedrate_y as number || 200;
    settings.machine_max_feedrate_z = data.machine_max_feedrate_z as number || 12;
    settings.machine_max_acceleration_x = data.machine_max_acceleration_x as number || 1000;
    settings.machine_max_acceleration_y = data.machine_max_acceleration_y as number || 1000;

    return settings;
}

/**
 * Extract and organize print settings
 */
function extractPrintSettings(data: Record<string, unknown>): Record<string, INIValue> {
    const settings: Record<string, INIValue> = {};

    // Layer settings
    settings.layer_height = data.layer_height as number || 0.2;
    settings.first_layer_height = data.first_layer_height as number || settings.layer_height as number;

    // Perimeter settings
    settings.perimeters = data.perimeters as number || 2;
    settings.perimeter_speed = data.perimeter_speed as number || 60;
    settings.external_perimeter_speed = data.external_perimeter_speed as number || settings.perimeter_speed as number;

    // Infill settings
    settings.fill_density = data.fill_density as number || 20;
    settings.fill_pattern = data.fill_pattern as string || 'cubic';
    settings.infill_speed = data.infill_speed as number || 80;

    // Top/bottom layers
    settings.top_solid_layers = data.top_solid_layers as number || 3;
    settings.bottom_solid_layers = data.bottom_solid_layers as number || 3;
    if (data.top_infill_extrusion_width !== undefined) {
        settings.top_infill_extrusion_width = data.top_infill_extrusion_width as INIValue;
    }

    // Speed settings
    settings.travel_speed = data.travel_speed as number || 150;
    settings.first_layer_speed = data.first_layer_speed as number || 30;

    // Support settings
    settings.support_material = data.support_material as boolean || false;
    settings.support_material_threshold = data.support_material_threshold as number || 0;
    settings.support_material_angle = data.support_material_angle as number || 0;

    // Skirt/brim
    settings.skirts = data.skirts as number || 1;
    settings.skirt_distance = data.skirt_distance as number || 6;
    settings.brim_width = data.brim_width as number || 0;

    return settings;
}

/**
 * Extract and organize filament settings
 */
function extractFilamentSettings(data: Record<string, unknown>): Record<string, INIValue> {
    const settings: Record<string, INIValue> = {};

    // Temperature settings
    settings.temperature = data.temperature as number || data.first_layer_temperature as number || 210;
    settings.first_layer_temperature = data.first_layer_temperature as number || settings.temperature as number;
    settings.bed_temperature = data.bed_temperature as number || data.first_layer_bed_temperature as number || 60;
    settings.first_layer_bed_temperature = data.first_layer_bed_temperature as number || settings.bed_temperature as number;

    // Cooling settings
    settings.fan_always_on = data.fan_always_on !== false;
    settings.min_fan_speed = data.min_fan_speed as number || 35;
    settings.max_fan_speed = data.max_fan_speed as number || 100;
    settings.bridge_fan_speed = data.bridge_fan_speed as number || 100;
    settings.disable_fan_first_layers = data.disable_fan_first_layers as number || 3;

    // Material properties
    settings.filament_diameter = data.filament_diameter as number || 1.75;
    settings.extrusion_multiplier = data.extrusion_multiplier as number || 1.0;
    settings.filament_density = data.filament_density as number || 1.24;

    // Advanced settings
    if (data.filament_retract_length !== undefined) {
        settings.retract_length_override = data.filament_retract_length as INIValue;
    }
    if (data.filament_retract_speed !== undefined) {
        settings.retract_speed_override = data.filament_retract_speed as INIValue;
    }

    return settings;
}

/**
 * Generate a unique profile ID
 */
function generateProfileId(
    printerName: string,
    _printer: INISection,
): string {
    const name = printerName.toLowerCase();
    const variant = _printer.data.printer_variant || _printer.data.nozzle_diameter || '0.4';

    // Create a clean, unique ID
    const cleanName = name
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/original-prusa-/g, '')
        .replace(/i3-/g, '');

    return `${cleanName}-${variant}`.toLowerCase();
}

/**
 * Generate a human-readable profile name
 */
function generateProfileName(printer: INISection): string {
    const name = printer.name;
    const variant = printer.data.printer_variant || printer.data.nozzle_diameter;

    if (variant && !name.includes(variant.toString())) {
        return `${name} ${variant}mm`;
    }

    return name;
}

/**
 * Generate a profile description
 */
function generateProfileDescription(
    _printer: INISection,
    metadata: BaseProfile['metadata']
): string {
    const printerModel = metadata.printer;
    const nozzle = metadata.nozzle;
    const quality = metadata.quality;

    return `${quality} profile for ${printerModel} with ${nozzle} nozzle`;
} 