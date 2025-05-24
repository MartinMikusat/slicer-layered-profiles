import { useState, useMemo } from 'react'
import { Search, Filter, X, Tag } from 'lucide-react'
import type { Card } from '../../types'

interface CardSearchProps {
    cards: Card[]
    onFilteredCardsChange: (filteredCards: Card[]) => void
    className?: string
}

const categories = [
    'temperature',
    'speed',
    'quality',
    'support',
    'infill',
    'other'
] as const

export function CardSearch({ cards, onFilteredCardsChange, className = '' }: CardSearchProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
    const [showFilters, setShowFilters] = useState(false)

    // Get all unique tags from cards
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        cards.forEach(card => {
            card.metadata.tags?.forEach(tag => tagSet.add(tag))
        })
        return Array.from(tagSet).sort()
    }, [cards])

    // Filter cards based on search term and filters
    const filteredCards = useMemo(() => {
        let filtered = cards

        // Text search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(card =>
                card.name.toLowerCase().includes(term) ||
                card.description.toLowerCase().includes(term) ||
                card.metadata.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                card.metadata.author?.toLowerCase().includes(term)
            )
        }

        // Category filter
        if (selectedCategories.size > 0) {
            filtered = filtered.filter(card =>
                card.metadata.category && selectedCategories.has(card.metadata.category)
            )
        }

        // Tag filter
        if (selectedTags.size > 0) {
            filtered = filtered.filter(card =>
                card.metadata.tags?.some(tag => selectedTags.has(tag))
            )
        }

        return filtered
    }, [cards, searchTerm, selectedCategories, selectedTags])

    // Notify parent of filtered cards
    useMemo(() => {
        onFilteredCardsChange(filteredCards)
    }, [filteredCards, onFilteredCardsChange])

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => {
            const newSet = new Set(prev)
            if (newSet.has(category)) {
                newSet.delete(category)
            } else {
                newSet.add(category)
            }
            return newSet
        })
    }

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev)
            if (newSet.has(tag)) {
                newSet.delete(tag)
            } else {
                newSet.add(tag)
            }
            return newSet
        })
    }

    const clearAllFilters = () => {
        setSearchTerm('')
        setSelectedCategories(new Set())
        setSelectedTags(new Set())
    }

    const hasActiveFilters = searchTerm.trim() || selectedCategories.size > 0 || selectedTags.size > 0

    return (
        <div className={`card-search ${className}`}>
            <div className="search-header">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search cards by name, description, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="search-clear"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <button
                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={16} />
                    Filters
                    {hasActiveFilters && <span className="filter-indicator" />}
                </button>
            </div>

            {showFilters && (
                <div className="search-filters">
                    {/* Categories */}
                    <div className="filter-group">
                        <h4>Categories</h4>
                        <div className="filter-options">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`filter-option ${selectedCategories.has(category) ? 'active' : ''}`}
                                    onClick={() => handleCategoryToggle(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div className="filter-group">
                            <h4>Tags</h4>
                            <div className="filter-options">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`filter-option tag ${selectedTags.has(tag) ? 'active' : ''}`}
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        <Tag size={12} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasActiveFilters && (
                        <div className="filter-actions">
                            <button className="clear-filters" onClick={clearAllFilters}>
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="search-results">
                <span className="results-count">
                    {filteredCards.length} of {cards.length} cards
                    {hasActiveFilters && ' (filtered)'}
                </span>
            </div>
        </div>
    )
} 