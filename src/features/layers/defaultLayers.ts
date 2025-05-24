import type { Layer } from '../../types';

// Default/built-in layers available in the Layer Library
export const defaultLayers: Layer[] = [
    {
        id: 'default-small-models',
        name: 'Small Models',
        description: 'Optimized settings for printing small, detailed models with slower speeds and reduced cooling',
        enabled: false,
        metadata: {
            category: 'quality',
            tags: ['small-parts', 'detail', 'precision', 'slow-print'],
            author: 'Prusa',
            version: '1.0',
            created: '2024-01-01T00:00:00.000Z',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/perimeter_speed',
                value: 25
            },
            {
                op: 'replace',
                path: '/print_settings/external_perimeter_speed',
                value: 20
            },
            {
                op: 'replace',
                path: '/print_settings/infill_speed',
                value: 40
            },
            {
                op: 'replace',
                path: '/print_settings/small_perimeter_speed',
                value: 15
            },
            {
                op: 'replace',
                path: '/filament_settings/min_fan_speed',
                value: 20
            },
            {
                op: 'replace',
                path: '/filament_settings/max_fan_speed',
                value: 60
            },
            {
                op: 'replace',
                path: '/filament_settings/bridge_fan_speed',
                value: 80
            }
        ],
        preview: [
            {
                path: '/print_settings/perimeter_speed',
                key: 'Perimeter Speed',
                oldValue: 45,
                newValue: 25,
                unit: 'mm/s',
                section: 'Speed'
            },
            {
                path: '/print_settings/external_perimeter_speed',
                key: 'External Perimeter Speed',
                oldValue: 25,
                newValue: 20,
                unit: 'mm/s',
                section: 'Speed'
            },
            {
                path: '/print_settings/infill_speed',
                key: 'Infill Speed',
                oldValue: 80,
                newValue: 40,
                unit: 'mm/s',
                section: 'Speed'
            },
            {
                path: '/print_settings/small_perimeter_speed',
                key: 'Small Perimeter Speed',
                oldValue: 25,
                newValue: 15,
                unit: 'mm/s',
                section: 'Speed'
            },
            {
                path: '/filament_settings/min_fan_speed',
                key: 'Min Fan Speed',
                oldValue: 35,
                newValue: 20,
                unit: '%',
                section: 'Cooling'
            },
            {
                path: '/filament_settings/max_fan_speed',
                key: 'Max Fan Speed',
                oldValue: 100,
                newValue: 60,
                unit: '%',
                section: 'Cooling'
            },
            {
                path: '/filament_settings/bridge_fan_speed',
                key: 'Bridge Fan Speed',
                oldValue: 100,
                newValue: 80,
                unit: '%',
                section: 'Cooling'
            }
        ]
    },
    {
        id: 'default-organic-supports',
        name: 'Organic Supports',
        description: 'Enable organic supports with increased interface layers for easier removal and better surface quality',
        enabled: false,
        metadata: {
            category: 'support',
            tags: ['supports', 'organic', 'interface', 'overhang', 'removal'],
            author: 'Prusa',
            version: '1.0',
            created: '2024-01-01T00:00:00.000Z',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/support_material',
                value: true
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_style',
                value: 'organic'
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_threshold',
                value: 45
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_interface_layers',
                value: 4
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_bottom_interface_layers',
                value: 2
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_interface_spacing',
                value: 0.15
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_xy_spacing',
                value: '80%'
            },
            {
                op: 'replace',
                path: '/print_settings/support_material_contact_distance',
                value: 0.15
            }
        ],
        preview: [
            {
                path: '/print_settings/support_material',
                key: 'Generate Supports',
                oldValue: false,
                newValue: true,
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_style',
                key: 'Support Style',
                oldValue: 'grid',
                newValue: 'organic',
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_threshold',
                key: 'Overhang Threshold',
                oldValue: 0,
                newValue: 45,
                unit: '°',
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_interface_layers',
                key: 'Interface Layers',
                oldValue: 2,
                newValue: 4,
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_bottom_interface_layers',
                key: 'Bottom Interface Layers',
                oldValue: 0,
                newValue: 2,
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_interface_spacing',
                key: 'Interface Spacing',
                oldValue: 0.2,
                newValue: 0.15,
                unit: 'mm',
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_xy_spacing',
                key: 'XY Separation',
                oldValue: '60%',
                newValue: '80%',
                section: 'Support Material'
            },
            {
                path: '/print_settings/support_material_contact_distance',
                key: 'Contact Distance',
                oldValue: 0.2,
                newValue: 0.15,
                unit: 'mm',
                section: 'Support Material'
            }
        ]
    },
    {
        id: 'default-fuzzy-skin',
        name: 'Fuzzy Skin',
        description: 'Add a textured surface finish to exterior walls for better grip and aesthetic appeal',
        enabled: false,
        metadata: {
            category: 'other',
            tags: ['texture', 'surface', 'grip', 'aesthetics', 'finish'],
            author: 'Prusa',
            version: '1.0',
            created: '2024-01-01T00:00:00.000Z',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/fuzzy_skin',
                value: 'outside'
            },
            {
                op: 'replace',
                path: '/print_settings/fuzzy_skin_thickness',
                value: 0.4
            },
            {
                op: 'replace',
                path: '/print_settings/fuzzy_skin_point_dist',
                value: 0.8
            },
            {
                op: 'replace',
                path: '/print_settings/external_perimeter_speed',
                value: 30
            }
        ],
        preview: [
            {
                path: '/print_settings/fuzzy_skin',
                key: 'Fuzzy Skin',
                oldValue: 'none',
                newValue: 'outside',
                section: 'Quality'
            },
            {
                path: '/print_settings/fuzzy_skin_thickness',
                key: 'Fuzzy Skin Thickness',
                oldValue: 0.3,
                newValue: 0.4,
                unit: 'mm',
                section: 'Quality'
            },
            {
                path: '/print_settings/fuzzy_skin_point_dist',
                key: 'Fuzzy Skin Point Distance',
                oldValue: 0.8,
                newValue: 0.8,
                unit: 'mm',
                section: 'Quality'
            },
            {
                path: '/print_settings/external_perimeter_speed',
                key: 'External Perimeter Speed',
                oldValue: 25,
                newValue: 30,
                unit: 'mm/s',
                section: 'Speed'
            }
        ]
    }
]; 