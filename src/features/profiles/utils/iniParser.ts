/**
 * INI Parser for PrusaSlicer profile files
 * Handles the specific format used by PrusaSlicer including:
 * - Section headers [section:name]
 * - Key-value pairs
 * - Multi-line values
 * - Comments starting with #
 * - Special PrusaSlicer formatting
 */

export interface INISection {
    name: string;
    type: 'vendor' | 'printer_model' | 'printer' | 'print' | 'filament';
    data: Record<string, unknown>;
    inherits?: string;
}

export interface ParsedINI {
    vendor?: INISection;
    printer_models: INISection[];
    printers: INISection[];
    prints: INISection[];
    filaments: INISection[];
}

/**
 * Parse a PrusaSlicer INI file into structured data
 */
export function parseINI(content: string): ParsedINI {
    const lines = content.split('\n');
    const result: ParsedINI = {
        printer_models: [],
        printers: [],
        prints: [],
        filaments: []
    };

    let currentSection: INISection | null = null;
    let currentValue = '';
    let currentKey = '';
    let inMultiLineValue = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and comments
        if (line === '' || line.startsWith('#')) {
            continue;
        }

        // Check for section header
        const sectionMatch = line.match(/^\[([^:]+)(?::(.+))?\]$/);
        if (sectionMatch) {
            // Save previous section
            if (currentSection) {
                if (inMultiLineValue && currentKey) {
                    currentSection.data[currentKey] = currentValue.trim();
                }
                addSectionToResult(result, currentSection);
            }

            // Start new section
            const sectionType = sectionMatch[1] as 'vendor' | 'printer_model' | 'printer' | 'print' | 'filament';
            const sectionName = sectionMatch[2] || sectionMatch[1];

            currentSection = {
                name: sectionName,
                type: sectionType,
                data: {}
            };

            inMultiLineValue = false;
            currentValue = '';
            currentKey = '';
            continue;
        }

        if (!currentSection) {
            continue;
        }

        // Handle multi-line values (lines that don't contain =)
        if (inMultiLineValue && !line.includes('=')) {
            currentValue += (currentValue ? '\n' : '') + line;
            continue;
        }

        // Finish multi-line value if we encounter a new key
        if (inMultiLineValue && line.includes('=')) {
            currentSection.data[currentKey] = currentValue.trim();
            inMultiLineValue = false;
            currentValue = '';
            currentKey = '';
        }

        // Parse key-value pair
        const kvMatch = line.match(/^([^=]+)=(.*)$/);
        if (kvMatch) {
            const key = kvMatch[1].trim();
            const value = kvMatch[2];

            // Check if this is the start of a multi-line value
            if (isMultiLineValue(key, value)) {
                currentKey = key;
                currentValue = value;
                inMultiLineValue = true;
            } else {
                currentSection.data[key] = parseValue(key, value);
            }
        }
    }

    // Save final section
    if (currentSection) {
        if (inMultiLineValue && currentKey) {
            currentSection.data[currentKey] = currentValue.trim();
        }
        addSectionToResult(result, currentSection);
    }

    return result;
}

/**
 * Check if a key-value pair represents a multi-line value
 */
function isMultiLineValue(key: string, value: string): boolean {
    // G-code fields are typically multi-line
    const multiLineKeys = [
        'start_gcode',
        'end_gcode',
        'before_layer_gcode',
        'layer_gcode',
        'toolchange_gcode',
        'between_objects_gcode',
        'color_change_gcode',
        'start_filament_gcode',
        'end_filament_gcode',
        'printer_notes'
    ];

    return multiLineKeys.includes(key) || value.includes('\\n');
}

/**
 * Parse individual values to appropriate types
 */
function parseValue(key: string, value: string): unknown {
    const trimmed = value.trim();

    // Handle empty values
    if (trimmed === '') {
        return '';
    }

    // Handle boolean values
    if (trimmed === '1' || trimmed.toLowerCase() === 'true') {
        return true;
    }
    if (trimmed === '0' || trimmed.toLowerCase() === 'false') {
        return false;
    }

    // Handle numeric values
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed);
        return Number.isInteger(num) ? parseInt(trimmed) : num;
    }

    // Handle arrays (comma or semicolon separated)
    if (trimmed.includes(',') || trimmed.includes(';')) {
        const separator = trimmed.includes(';') ? ';' : ',';
        return trimmed.split(separator).map(item => {
            const parsed = parseValue('', item.trim());
            return typeof parsed === 'string' ? item.trim() : parsed;
        });
    }

    // Handle coordinate pairs like "0x0,250x0,250x210,0x210"
    if (key === 'bed_shape' && trimmed.includes('x')) {
        return trimmed.split(',').map(coord => {
            const [x, y] = coord.split('x').map(n => parseInt(n.trim()));
            return { x, y };
        });
    }

    // Return as string
    return trimmed;
}

/**
 * Add a section to the appropriate array in the result
 */
function addSectionToResult(result: ParsedINI, section: INISection): void {
    // Handle inherits property
    if (section.data.inherits) {
        section.inherits = section.data.inherits as string;
        delete section.data.inherits;
    }

    switch (section.type) {
        case 'vendor':
            result.vendor = section;
            break;
        case 'printer_model':
            result.printer_models.push(section);
            break;
        case 'printer':
            result.printers.push(section);
            break;
        case 'print':
            result.prints.push(section);
            break;
        case 'filament':
            result.filaments.push(section);
            break;
    }
}

/**
 * Resolve inheritance in INI sections
 * This applies inherited properties from parent sections
 */
export function resolveInheritance<T extends { name: string; inherits?: string; data: Record<string, unknown> }>(
    sections: T[]
): T[] {
    const sectionMap = new Map<string, T>();
    sections.forEach(section => sectionMap.set(section.name, section));

    const resolved = new Set<string>();

    function resolveSection(section: T): T {
        if (resolved.has(section.name)) {
            return section;
        }

        if (section.inherits) {
            const parent = sectionMap.get(section.inherits);
            if (parent && !resolved.has(parent.name)) {
                resolveSection(parent);
            }

            if (parent) {
                // Merge parent data into child (child overrides parent)
                section.data = { ...parent.data, ...section.data };
            }
        }

        resolved.add(section.name);
        return section;
    }

    return sections.map(resolveSection);
}

/**
 * Extract a complete printer profile by combining printer, print, and filament settings
 */
export function extractPrinterProfile(
    parsedINI: ParsedINI,
    printerName: string
): {
    printer: INISection;
    defaultPrint?: INISection;
    defaultFilament?: INISection;
} | null {
    // Resolve inheritance for all sections
    const resolvedPrinters = resolveInheritance(parsedINI.printers);
    const resolvedPrints = resolveInheritance(parsedINI.prints);
    const resolvedFilaments = resolveInheritance(parsedINI.filaments);

    const printer = resolvedPrinters.find(p => p.name === printerName);
    if (!printer) {
        return null;
    }

    // Find default print and filament profiles
    const defaultPrintName = printer.data.default_print_profile;
    const defaultFilamentName = printer.data.default_filament_profile;

    const defaultPrint = defaultPrintName
        ? resolvedPrints.find(p => p.name === defaultPrintName)
        : undefined;

    const defaultFilament = defaultFilamentName
        ? resolvedFilaments.find(f => f.name === defaultFilamentName)
        : undefined;

    return {
        printer,
        defaultPrint,
        defaultFilament
    };
} 