import { describe, it, expect } from 'vitest';
import { compileProfile, detectConflicts, generateSettingPreview } from '../../profiles/profileCompiler';
import type { BaseProfile, Layer } from '../../../types';

// Mock base profile for testing
const mockBaseProfile: BaseProfile = {
    id: 'test-profile',
    name: 'Test Profile',
    description: 'A test profile',
    version: '1.0',
    metadata: {
        printer: 'Test Printer',
        author: 'Test',
    },
    data: {
        print_settings: {
            layer_height: 0.2,
            perimeter_speed: 45,
            fill_density: 20,
        },
        filament_settings: {
            temperature: 215,
            min_fan_speed: 35,
        },
    },
};

// Mock layers for testing
const mockLayers: Layer[] = [
    {
        id: 'layer-1',
        name: 'Higher Temperature',
        description: 'Increase temperature',
        enabled: true,
        metadata: { category: 'temperature' },
        patch: [
            {
                op: 'replace',
                path: '/filament_settings/temperature',
                value: 225,
            },
        ],
    },
    {
        id: 'layer-2',
        name: 'Faster Speed',
        description: 'Increase speed',
        enabled: true,
        metadata: { category: 'speed' },
        patch: [
            {
                op: 'replace',
                path: '/print_settings/perimeter_speed',
                value: 60,
            },
        ],
    },
    {
        id: 'layer-3',
        name: 'Another Temperature',
        description: 'Another temperature change',
        enabled: true,
        metadata: { category: 'temperature' },
        patch: [
            {
                op: 'replace',
                path: '/filament_settings/temperature',
                value: 230,
            },
        ],
    },
];

describe('profileCompiler', () => {
    describe('compileProfile', () => {
        it('should apply patches to base profile', () => {
            const result = compileProfile(mockBaseProfile, mockLayers.slice(0, 2), ['layer-1', 'layer-2']);

            expect((result.finalData.filament_settings as any).temperature).toBe(225);
            expect((result.finalData.print_settings as any).perimeter_speed).toBe(60);
            expect(result.appliedLayers).toHaveLength(2);
        });

        it('should handle disabled layers', () => {
            const layersWithDisabled = [
                { ...mockLayers[0], enabled: false },
                mockLayers[1],
            ];

            const result = compileProfile(mockBaseProfile, layersWithDisabled, ['layer-1', 'layer-2']);

            expect((result.finalData.filament_settings as any).temperature).toBe(215); // Original value
            expect((result.finalData.print_settings as any).perimeter_speed).toBe(60); // Modified
            expect(result.appliedLayers).toHaveLength(1);
        });

        it('should implement last-write-wins for conflicts', () => {
            const result = compileProfile(mockBaseProfile, mockLayers, ['layer-1', 'layer-3']);

            // layer-3 should win since it's last
            expect((result.finalData.filament_settings as any).temperature).toBe(230);
            expect(Object.keys(result.conflicts)).toHaveLength(1);
        });
    });

    describe('detectConflicts', () => {
        it('should detect conflicts between layers', () => {
            const conflicts = detectConflicts([mockLayers[0], mockLayers[2]]);

            expect(conflicts['/filament_settings/temperature']).toBeDefined();
            expect(conflicts['/filament_settings/temperature'].layers).toEqual(['layer-1', 'layer-3']);
            expect(conflicts['/filament_settings/temperature'].finalValue).toBe(230);
        });

        it('should not report conflicts for non-overlapping layers', () => {
            const conflicts = detectConflicts([mockLayers[0], mockLayers[1]]);

            expect(Object.keys(conflicts)).toHaveLength(0);
        });
    });

    describe('generateSettingPreview', () => {
        it('should generate human-readable preview', () => {
            const preview = generateSettingPreview(mockLayers[0], mockBaseProfile.data);

            expect(preview).toHaveLength(1);
            expect(preview[0].key).toBe('Nozzle Temperature');
            expect(preview[0].oldValue).toBe(215);
            expect(preview[0].newValue).toBe(225);
            expect(preview[0].unit).toBe('°C');
        });
    });
}); 