import { useState, useEffect, useMemo } from 'react';
import { compileProfile, updateCardPreviews } from '../utils/profileCompiler';
import { UI } from '../constants';
import type { BaseProfile, Card, CompiledProfile } from '../types';

/**
 * Hook for managing profile compilation with debounced updates
 */
export function useProfileCompiler(
    baseProfile: BaseProfile,
    cards: Card[],
    cardOrder: string[]
) {
    const [compiledProfile, setCompiledProfile] = useState<CompiledProfile | null>(null);
    const [isCompiling, setIsCompiling] = useState(false);

    // Update card previews when base profile changes
    const cardsWithPreviews = useMemo(() => {
        return updateCardPreviews(cards, baseProfile);
    }, [cards, baseProfile]);

    // Debounced compilation effect
    useEffect(() => {
        setIsCompiling(true);

        const timeoutId = setTimeout(() => {
            try {
                const compiled = compileProfile(baseProfile, cardsWithPreviews, cardOrder);
                setCompiledProfile(compiled);
            } catch (error) {
                console.error('Profile compilation failed:', error);
                setCompiledProfile(null);
            } finally {
                setIsCompiling(false);
            }
        }, UI.DEBOUNCE_DELAY);

        return () => clearTimeout(timeoutId);
    }, [baseProfile, cardsWithPreviews, cardOrder]);

    // Helper to get final setting values
    const getFinalValue = (path: string) => {
        if (!compiledProfile) return undefined;

        const parts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
        let current = compiledProfile.finalData;

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
        cardsWithPreviews,
        isCompiling,
        getFinalValue,
        hasConflict,
        getConflict,
    };
} 