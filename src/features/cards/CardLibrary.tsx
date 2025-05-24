import React, { useState, useEffect } from 'react';
import { loadCustomCards, removeCustomCard, duplicateCustomCard } from './customCardService';
import type { Card } from '../../types';
import { Button } from '../ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/components/dialog';
import { Input } from '../ui/components/input';
import { Badge } from '../ui/components/badge';
import {
    Search,
    BookOpen,
    Plus,
    Copy,
    Trash2,
    Edit,
    Filter,
    Grid,
    List
} from 'lucide-react';

interface CardLibraryProps {
    onCardSelect?: (card: Card) => void;
    onCardEdit?: (card: Card) => void;
    selectedCardIds?: string[];
    mode?: 'browse' | 'select';
    trigger?: React.ReactNode;
}

const CardLibrary: React.FC<CardLibraryProps> = ({
    onCardSelect,
    onCardEdit,
    selectedCardIds = [],
    mode = 'browse',
    trigger
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customCards, setCustomCards] = useState<Card[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Load custom cards when component mounts or dialog opens
    useEffect(() => {
        if (isOpen) {
            loadCards();
        }
    }, [isOpen]);

    const loadCards = () => {
        const cards = loadCustomCards();
        setCustomCards(cards);
    };

    // Filter cards based on search and category
    const filteredCards = customCards.filter(card => {
        const matchesSearch = searchQuery === '' ||
            card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' ||
            card.metadata?.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Get unique categories from all cards
    const categories = ['all', ...new Set(customCards.map(card => card.metadata?.category).filter(Boolean))];

    const handleCardSelect = (card: Card) => {
        if (onCardSelect) {
            onCardSelect(card);
            if (mode === 'select') {
                setIsOpen(false);
            }
        }
    };

    const handleCardEdit = (card: Card) => {
        if (onCardEdit) {
            onCardEdit(card);
            setIsOpen(false);
        }
    };

    const handleCardDuplicate = (card: Card) => {
        const duplicated = duplicateCustomCard(card.id);
        if (duplicated) {
            loadCards(); // Refresh the list
        }
    };

    const handleCardRemove = (card: Card) => {
        if (confirm(`Are you sure you want to delete "${card.name}"?`)) {
            const success = removeCustomCard(card.id);
            if (success) {
                loadCards(); // Refresh the list
            }
        }
    };

    const isCardSelected = (cardId: string) => selectedCardIds.includes(cardId);

    const defaultTrigger = (
        <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Card Library
            {customCards.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                    {customCards.length}
                </Badge>
            )}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Card Library
                        <Badge variant="outline" className="ml-2">
                            {customCards.length} cards
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {/* Controls */}
                <div className="flex flex-col gap-4 border-b pb-4">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search cards..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-1 border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="px-3"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="px-3"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Filter by category:</span>
                        <div className="flex gap-1 flex-wrap">
                            {categories.map(category => (
                                <Button
                                    key={category}
                                    variant={categoryFilter === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCategoryFilter(category || 'all')}
                                    className="text-xs"
                                >
                                    {category === 'all' ? 'All' : category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                            {customCards.length === 0 ? (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No custom cards yet</h3>
                                    <p className="text-gray-500 mb-4">Create your first custom card to get started</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cards match your search</h3>
                                    <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'
                            : 'space-y-3 p-4'
                        }>
                            {filteredCards.map(card => (
                                <CardLibraryItem
                                    key={card.id}
                                    card={card}
                                    isSelected={isCardSelected(card.id)}
                                    viewMode={viewMode}
                                    mode={mode}
                                    onSelect={() => handleCardSelect(card)}
                                    onEdit={() => handleCardEdit(card)}
                                    onDuplicate={() => handleCardDuplicate(card)}
                                    onRemove={() => handleCardRemove(card)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {mode === 'select' && (
                    <div className="border-t pt-4 text-center text-sm text-gray-500">
                        {mode === 'select' ? 'Click a card to add it to your profile' : 'Manage your custom cards'}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

interface CardLibraryItemProps {
    card: Card;
    isSelected: boolean;
    viewMode: 'grid' | 'list';
    mode: 'browse' | 'select';
    onSelect: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
}

const CardLibraryItem: React.FC<CardLibraryItemProps> = ({
    card,
    isSelected,
    viewMode,
    mode,
    onSelect,
    onEdit,
    onDuplicate,
    onRemove
}) => {
    if (viewMode === 'list') {
        return (
            <div className={`
        flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${mode === 'select' ? 'cursor-pointer' : ''}
      `} onClick={mode === 'select' ? onSelect : undefined}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{card.name}</h4>
                        <Badge variant="outline" className="text-xs">
                            {card.metadata?.category || 'other'}
                        </Badge>
                    </div>
                    {card.description && (
                        <p className="text-sm text-gray-500 truncate mt-1">{card.description}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                        {card.preview?.length || 0} changes
                    </div>
                </div>
                <div className="flex gap-1 ml-4">
                    {mode === 'select' ? (
                        <Button size="sm" onClick={onSelect}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" onClick={onEdit}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={onDuplicate}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`
      border rounded-lg p-4 hover:shadow-sm transition-all
      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}
      ${mode === 'select' ? 'cursor-pointer hover:bg-gray-50' : ''}
    `} onClick={mode === 'select' ? onSelect : undefined}>
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{card.name}</h4>
                <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                    {card.metadata?.category || 'other'}
                </Badge>
            </div>

            {card.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{card.description}</p>
            )}

            <div className="text-xs text-gray-400 mb-3">
                {card.preview?.length || 0} setting changes
            </div>

            <div className="flex gap-1">
                {mode === 'select' ? (
                    <Button size="sm" className="w-full gap-2" onClick={onSelect}>
                        <Plus className="h-4 w-4" />
                        Add to Profile
                    </Button>
                ) : (
                    <>
                        <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={onDuplicate}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CardLibrary; 