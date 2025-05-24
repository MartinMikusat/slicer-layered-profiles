import { convertINIToBaseProfiles } from './profileConverter';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { BaseProfile } from '../../../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Build-time script to convert PrusaSlicer INI files to JSON
 * This runs during build, not in the browser
 */
export function buildRealProfiles(): void {
    try {
        // Path to the real PrusaSlicer INI file
        const iniPath = join(__dirname, '../realProfiles/PrusaSlicer-settings-prusa-fff-main/PrusaResearch/2.2.10.ini');
        const outputPath = join(__dirname, '../realProfiles/generated');

        console.log('Converting PrusaSlicer INI to JSON...');
        const iniContent = readFileSync(iniPath, 'utf-8');

        // Convert popular printer configurations
        const targetPrinters = [
            // MK3S Series (most popular)
            'Original Prusa i3 MK3S & MK3S+',
            'Original Prusa i3 MK3S & MK3S+ 0.6 nozzle',
            'Original Prusa i3 MK3S & MK3S+ 0.25 nozzle',

            // MINI Series (compact)
            'Original Prusa MINI & MINI+',
            'Original Prusa MINI & MINI+ Input Shaper',
            'Original Prusa MINI & MINI+ 0.6 nozzle',

            // XL Series (large format)
            'Original Prusa XL 0.4 nozzle',
            'Original Prusa XL - 2T 0.4 nozzle'
        ];

        const profiles = convertINIToBaseProfiles(iniContent, targetPrinters);

        // Create output directory if it doesn't exist
        try {
            writeFileSync(join(outputPath, '.gitkeep'), '');
        } catch {
            // Directory already exists
        }

        // Write individual profile files
        profiles.forEach(profile => {
            const filename = `${profile.id}.json`;
            const filepath = join(outputPath, filename);
            writeFileSync(filepath, JSON.stringify(profile, null, 2));
            console.log(`Generated: ${filename}`);
        });

        // Write profiles index
        const indexData = {
            profiles: profiles.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                metadata: p.metadata
            })),
            generated: new Date().toISOString()
        };

        writeFileSync(
            join(outputPath, 'profiles-index.json'),
            JSON.stringify(indexData, null, 2)
        );

        console.log(`Successfully converted ${profiles.length} profiles to JSON`);

    } catch (error) {
        console.error('Failed to build real profiles:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildRealProfiles();
} 