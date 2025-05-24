import type { Card } from '../../types';

const CUSTOM_CARDS_STORAGE_KEY = 'layered-profile-builder-custom-cards';
const CUSTOM_CARDS_VERSION = '1.0';

interface StoredCustomCards {
    version: string;
    cards: Card[];
    lastModified: string;
}

/**
 * Load custom cards from localStorage
 */
export function loadCustomCards(): Card[] {
    try {
        const stored = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const data: StoredCustomCards = JSON.parse(stored);

        // Version check - if version doesn't match, return empty array
        if (data.version !== CUSTOM_CARDS_VERSION) {
            console.warn('Custom cards version mismatch, clearing stored cards');
            clearCustomCards();
            return [];
        }

        return data.cards || [];
    } catch (error) {
        console.error('Failed to load custom cards:', error);
        return [];
    }
}

/**
 * Save custom cards to localStorage
 */
export function saveCustomCards(cards: Card[]): boolean {
    try {
        const data: StoredCustomCards = {
            version: CUSTOM_CARDS_VERSION,
            cards,
            lastModified: new Date().toISOString(),
        };

        localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save custom cards:', error);
        return false;
    }
}

/**
 * Add a new custom card
 */
export function addCustomCard(card: Card): boolean {
    try {
        const existingCards = loadCustomCards();

        // Check if card with same ID already exists
        const existingIndex = existingCards.findIndex(c => c.id === card.id);
        if (existingIndex >= 0) {
            console.warn('Card with ID already exists:', card.id);
            return false;
        }

        const updatedCards = [...existingCards, card];
        return saveCustomCards(updatedCards);
    } catch (error) {
        console.error('Failed to add custom card:', error);
        return false;
    }
}

/**
 * Update an existing custom card
 */
export function updateCustomCard(cardId: string, updates: Partial<Card>): boolean {
    try {
        const existingCards = loadCustomCards();
        const cardIndex = existingCards.findIndex(c => c.id === cardId);

        if (cardIndex === -1) {
            console.warn('Card not found for update:', cardId);
            return false;
        }

        const updatedCard = {
            ...existingCards[cardIndex],
            ...updates,
            metadata: {
                ...existingCards[cardIndex].metadata,
                ...updates.metadata,
                modified: new Date().toISOString(),
            },
        };

        const updatedCards = [...existingCards];
        updatedCards[cardIndex] = updatedCard;

        return saveCustomCards(updatedCards);
    } catch (error) {
        console.error('Failed to update custom card:', error);
        return false;
    }
}

/**
 * Remove a custom card
 */
export function removeCustomCard(cardId: string): boolean {
    try {
        const existingCards = loadCustomCards();
        const filteredCards = existingCards.filter(c => c.id !== cardId);

        if (filteredCards.length === existingCards.length) {
            console.warn('Card not found for removal:', cardId);
            return false;
        }

        return saveCustomCards(filteredCards);
    } catch (error) {
        console.error('Failed to remove custom card:', error);
        return false;
    }
}

/**
 * Duplicate a custom card with a new ID
 */
export function duplicateCustomCard(cardId: string, newName?: string): Card | null {
    try {
        const existingCards = loadCustomCards();
        const originalCard = existingCards.find(c => c.id === cardId);

        if (!originalCard) {
            console.warn('Card not found for duplication:', cardId);
            return null;
        }

        const duplicatedCard: Card = {
            ...originalCard,
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newName || `${originalCard.name} (Copy)`,
            metadata: {
                ...originalCard.metadata,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
            },
        };

        if (addCustomCard(duplicatedCard)) {
            return duplicatedCard;
        }

        return null;
    } catch (error) {
        console.error('Failed to duplicate custom card:', error);
        return null;
    }
}

/**
 * Clear all custom cards
 */
export function clearCustomCards(): boolean {
    try {
        localStorage.removeItem(CUSTOM_CARDS_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear custom cards:', error);
        return false;
    }
}

/**
 * Check if a card is a custom card (vs demo card)
 */
export function isCustomCard(card: Card): boolean {
    return card.id.startsWith('custom-');
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
        const stored = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
        const used = stored ? new Blob([stored]).size : 0;

        // Rough estimate of localStorage limit (usually 5-10MB)
        const available = 5 * 1024 * 1024; // 5MB
        const percentage = (used / available) * 100;

        return { used, available, percentage };
    } catch (error) {
        return { used: 0, available: 0, percentage: 0 };
    }
} 