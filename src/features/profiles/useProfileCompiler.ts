import { useState, useEffect, useMemo } from 'react';
import { compileProfile, updateLayerPreviews } from './profileCompiler';
import type { BaseProfile, Layer, CompiledProfile } from '../../types';

/**
 * Hook for managing profile compilation
 */
export function useProfileCompiler(
    baseProfile: BaseProfile,
    layers: Layer[],
    layerOrder: string[]
) {
    const [compiledProfile, setCompiledProfile] = useState<CompiledProfile | null>(null);
    const [isCompiling, setIsCompiling] = useState(false);

    // Update layer previews when base profile changes
    const layersWithPreviews = useMemo(() => {
        return updateLayerPreviews(layers, baseProfile);
    }, [layers, baseProfile]);

    // Immediate compilation effect
    useEffect(() => {
        setIsCompiling(true);

        try {
            const compiled = compileProfile(baseProfile, layersWithPreviews, layerOrder);
            setCompiledProfile(compiled);
        } catch (error) {
            console.error('Profile compilation failed:', error);
            setCompiledProfile(null);
        } finally {
            setIsCompiling(false);
        }
    }, [baseProfile, layersWithPreviews, layerOrder]);

    // Helper to get final setting values
    const getFinalValue = (path: string) => {
        if (!compiledProfile) return undefined;

        const parts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
        let current: any = compiledProfile.finalData;

        for (const part of parts) {
            if (current == null || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }

        return current;
    };

    // Helper to check if a setting has conflicts
    const hasConflict = (path: string) => {
        return compiledProfile?.conflicts[path] !== undefined;
    };

    // Helper to get conflict info for a path
    const getConflict = (path: string) => {
        return compiledProfile?.conflicts[path];
    };

    return {
        compiledProfile,
        layersWithPreviews,
        isCompiling,
        getFinalValue,
        hasConflict,
        getConflict,
    };
} 