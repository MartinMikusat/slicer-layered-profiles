import { describe, it, expect } from 'vitest';
import { compileProfile, detectConflicts, generateSettingPreview } from '../../profiles/profileCompiler';
import type { BaseProfile, Card } from '../../../types';

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

// Mock cards for testing
const mockCards: Card[] = [
    {
        id: 'card-1',
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
        id: 'card-2',
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
        id: 'card-3',
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
            const result = compileProfile(mockBaseProfile, mockCards.slice(0, 2), ['card-1', 'card-2']);

            expect(result.finalData.filament_settings.temperature).toBe(225);
            expect(result.finalData.print_settings.perimeter_speed).toBe(60);
            expect(result.appliedCards).toHaveLength(2);
        });

        it('should handle disabled cards', () => {
            const cardsWithDisabled = [
                { ...mockCards[0], enabled: false },
                mockCards[1],
            ];

            const result = compileProfile(mockBaseProfile, cardsWithDisabled, ['card-1', 'card-2']);

            expect(result.finalData.filament_settings.temperature).toBe(215); // Original value
            expect(result.finalData.print_settings.perimeter_speed).toBe(60); // Modified
            expect(result.appliedCards).toHaveLength(1);
        });

        it('should implement last-write-wins for conflicts', () => {
            const result = compileProfile(mockBaseProfile, mockCards, ['card-1', 'card-3']);

            // card-3 should win since it's last
            expect(result.finalData.filament_settings.temperature).toBe(230);
            expect(Object.keys(result.conflicts)).toHaveLength(1);
        });
    });

    describe('detectConflicts', () => {
        it('should detect conflicts between cards', () => {
            const conflicts = detectConflicts([mockCards[0], mockCards[2]]);

            expect(conflicts['/filament_settings/temperature']).toBeDefined();
            expect(conflicts['/filament_settings/temperature'].cards).toEqual(['card-1', 'card-3']);
            expect(conflicts['/filament_settings/temperature'].finalValue).toBe(230);
        });

        it('should not report conflicts for non-overlapping cards', () => {
            const conflicts = detectConflicts([mockCards[0], mockCards[1]]);

            expect(Object.keys(conflicts)).toHaveLength(0);
        });
    });

    describe('generateSettingPreview', () => {
        it('should generate human-readable preview', () => {
            const preview = generateSettingPreview(mockCards[0], mockBaseProfile.data);

            expect(preview).toHaveLength(1);
            expect(preview[0].key).toBe('Nozzle Temperature');
            expect(preview[0].oldValue).toBe(215);
            expect(preview[0].newValue).toBe(225);
            expect(preview[0].unit).toBe('°C');
        });
    });
}); 