import type { DemoCard } from '../../types';

// Demo cards that showcase the functionality
export const demoCards: DemoCard[] = [
    {
        demoId: 'faster-perimeters',
        name: 'Faster Perimeters',
        description: 'Increase perimeter speed for faster printing while maintaining quality',
        enabled: true,
        metadata: {
            category: 'speed',
            tags: ['speed', 'perimeter', 'optimization'],
            author: 'Demo',
            version: '1.0',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/perimeter_speed',
                value: 60
            }
        ],
        preview: [
            {
                path: '/print_settings/perimeter_speed',
                key: 'Perimeter Speed',
                oldValue: 45,
                newValue: 60,
                unit: 'mm/s',
                section: 'Speed'
            }
        ]
    },
    {
        demoId: 'higher-temp',
        name: 'Higher Temperature',
        description: 'Increase nozzle temperature for better layer adhesion',
        enabled: true,
        metadata: {
            category: 'temperature',
            tags: ['temperature', 'adhesion', 'quality'],
            author: 'Demo',
            version: '1.0',
        },
        patch: [
            {
                op: 'replace',
                path: '/filament_settings/temperature',
                value: 225
            },
            {
                op: 'replace',
                path: '/filament_settings/first_layer_temperature',
                value: 230
            }
        ],
        preview: [
            {
                path: '/filament_settings/temperature',
                key: 'Nozzle Temperature',
                oldValue: 215,
                newValue: 225,
                unit: '°C',
                section: 'Temperature'
            },
            {
                path: '/filament_settings/first_layer_temperature',
                key: 'First Layer Temp',
                oldValue: 215,
                newValue: 230,
                unit: '°C',
                section: 'Temperature'
            }
        ]
    },
    {
        demoId: 'more-cooling',
        name: 'Aggressive Cooling',
        description: 'Increase fan speeds for better overhangs and bridging',
        enabled: true,
        metadata: {
            category: 'other',
            tags: ['cooling', 'fan', 'overhangs', 'bridging'],
            author: 'Demo',
            version: '1.0',
        },
        patch: [
            {
                op: 'replace',
                path: '/filament_settings/min_fan_speed',
                value: 50
            },
            {
                op: 'replace',
                path: '/filament_settings/max_fan_speed',
                value: 100
            }
        ],
        preview: [
            {
                path: '/filament_settings/min_fan_speed',
                key: 'Min Fan Speed',
                oldValue: 35,
                newValue: 50,
                unit: '%',
                section: 'Cooling'
            },
            {
                path: '/filament_settings/max_fan_speed',
                key: 'Max Fan Speed',
                oldValue: 100,
                newValue: 100,
                unit: '%',
                section: 'Cooling'
            }
        ]
    },
    {
        demoId: 'dense-infill',
        name: 'Dense Infill',
        description: 'Increase infill density for stronger parts',
        enabled: true,
        metadata: {
            category: 'infill',
            tags: ['infill', 'strength', 'density'],
            author: 'Demo',
            version: '1.0',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/fill_density',
                value: 40
            }
        ],
        preview: [
            {
                path: '/print_settings/fill_density',
                key: 'Infill Density',
                oldValue: 20,
                newValue: 40,
                unit: '%',
                section: 'Infill'
            }
        ]
    },
    {
        demoId: 'fine-quality',
        name: 'Fine Quality',
        description: 'Reduce layer height for higher quality prints',
        enabled: false, // Disabled by default to show toggle functionality
        metadata: {
            category: 'quality',
            tags: ['quality', 'layer-height', 'detail'],
            author: 'Demo',
            version: '1.0',
        },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/layer_height',
                value: 0.15
            },
            {
                op: 'replace',
                path: '/print_settings/first_layer_height',
                value: 0.2
            }
        ],
        preview: [
            {
                path: '/print_settings/layer_height',
                key: 'Layer Height',
                oldValue: 0.2,
                newValue: 0.15,
                unit: 'mm',
                section: 'Quality'
            },
            {
                path: '/print_settings/first_layer_height',
                key: 'First Layer Height',
                oldValue: 0.2,
                newValue: 0.2,
                unit: 'mm',
                section: 'Quality'
            }
        ]
    }
]; 