import type { BaseProfile } from '../../../types';

// Import statically generated profile data (browser-compatible)
import mk3s04 from './generated/mk3s-mk3s-0.4.json';
import mk3s06 from './generated/mk3s-mk3s-06-nozzle-0.6.json';
import mk3s025 from './generated/mk3s-mk3s-025-nozzle-0.25.json';
import mini04 from './generated/mini-mini-0.4.json';
import miniIS from './generated/mini-mini-input-shaper-0.4.json';
import mini06 from './generated/mini-mini-06-nozzle-0.6.json';
import xl04 from './generated/xl-04-nozzle-0.4.json';
import xl2t from './generated/xl-2t-04-nozzle-0.4.json';

/**
 * Real PrusaSlicer profiles converted from official INI files
 * These are loaded as static JSON imports, browser-compatible
 */
export const realProfiles: BaseProfile[] = [
    mk3s04 as BaseProfile,
    mk3s06 as BaseProfile,
    mk3s025 as BaseProfile,
    mini04 as BaseProfile,
    miniIS as BaseProfile,
    mini06 as BaseProfile,
    xl04 as BaseProfile,
    xl2t as BaseProfile
];

console.log(`Loaded ${realProfiles.length} real PrusaSlicer profiles`); 