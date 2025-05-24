import React, { useState, useEffect } from 'react';
import { loadCustomLayers, removeCustomLayer, duplicateCustomLayer } from './customLayerService';
import { defaultLayers } from './defaultLayers';
import type { Layer } from '../../types';
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

interface LayerLibraryProps {
    onLayerSelect?: (layer: Layer) => void;
    onLayerEdit?: (layer: Layer) => void;
    selectedLayerIds?: string[];
    mode?: 'browse' | 'select';
    trigger?: React.ReactNode;
}

const LayerLibrary: React.FC<LayerLibraryProps> = ({
    onLayerSelect,
    onLayerEdit,
    selectedLayerIds = [],
    mode = 'browse',
    trigger
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customLayers, setCustomLayers] = useState<Layer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Load custom layers when component mounts or dialog opens
    useEffect(() => {
        if (isOpen) {
            loadLayers();
        }
    }, [isOpen]);

    const loadLayers = () => {
        const layers = loadCustomLayers();
        setCustomLayers(layers);
    };

    // Combine default layers with custom layers
    const allLayers = [...defaultLayers, ...customLayers];

    // Filter layers based on search and category
    const filteredLayers = allLayers.filter(layer => {
        const matchesSearch = searchQuery === '' ||
            layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            layer.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' ||
            layer.metadata?.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Get unique categories from all layers
    const categories = ['all', ...new Set(allLayers.map(layer => layer.metadata?.category).filter(Boolean))];

    const handleLayerSelect = (layer: Layer) => {
        if (onLayerSelect) {
            onLayerSelect(layer);
            if (mode === 'select') {
                setIsOpen(false);
            }
        }
    };

    const handleLayerEdit = (layer: Layer) => {
        if (onLayerEdit) {
            onLayerEdit(layer);
            setIsOpen(false);
        }
    };

    const handleLayerDuplicate = (layer: Layer) => {
        const duplicated = duplicateCustomLayer(layer.id);
        if (duplicated) {
            loadLayers(); // Refresh the list
        }
    };

    const handleLayerRemove = (layer: Layer) => {
        if (confirm(`Are you sure you want to delete "${layer.name}"?`)) {
            const success = removeCustomLayer(layer.id);
            if (success) {
                loadLayers(); // Refresh the list
            }
        }
    };

    const isLayerSelected = (layerId: string) => selectedLayerIds.includes(layerId);
    const isDefaultLayer = (layer: Layer) => layer.id.startsWith('default-');

    const defaultTrigger = (
        <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Layer Library
            {allLayers.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                    {allLayers.length}
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
                        Layer Library
                        <Badge variant="outline" className="ml-2">
                            {defaultLayers.length} built-in
                        </Badge>
                        {customLayers.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {customLayers.length} custom
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* Controls */}
                <div className="flex flex-col gap-4 border-b pb-4">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search layers..."
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

                {/* Layer List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredLayers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                            {allLayers.length === 0 ? (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No layers available</h3>
                                    <p className="text-gray-500 mb-4">Create your first custom layer to get started</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No layers match your search</h3>
                                    <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'
                            : 'space-y-3 p-4'
                        }>
                            {filteredLayers.map(layer => (
                                <LayerLibraryItem
                                    key={layer.id}
                                    layer={layer}
                                    isSelected={isLayerSelected(layer.id)}
                                    viewMode={viewMode}
                                    mode={mode}
                                    isDefault={isDefaultLayer(layer)}
                                    onSelect={() => handleLayerSelect(layer)}
                                    onEdit={() => handleLayerEdit(layer)}
                                    onDuplicate={() => handleLayerDuplicate(layer)}
                                    onRemove={() => handleLayerRemove(layer)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {mode === 'select' && (
                    <div className="border-t pt-4 text-center text-sm text-gray-500">
                        {mode === 'select' ? 'Click a layer to add it to your profile' : 'Manage your custom layers'}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

interface LayerLibraryItemProps {
    layer: Layer;
    isSelected: boolean;
    viewMode: 'grid' | 'list';
    mode: 'browse' | 'select';
    isDefault: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
}

const LayerLibraryItem: React.FC<LayerLibraryItemProps> = ({
    layer,
    isSelected,
    viewMode,
    mode,
    isDefault,
    onSelect,
    onEdit,
    onDuplicate,
    onRemove
}) => {
    const { name, description, metadata } = layer;

    if (viewMode === 'list') {
        return (
            <div className={`
        flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${mode === 'select' ? 'cursor-pointer' : ''}
      `} onClick={mode === 'select' ? onSelect : undefined}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{name}</h4>
                        {isDefault && (
                            <Badge variant="outline" className="text-xs">
                                Built-in
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {metadata?.category || 'other'}
                        </Badge>
                    </div>
                    {description && (
                        <p className="text-sm text-gray-500 truncate mt-1">{description}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                        {layer.preview?.length || 0} changes
                    </div>
                </div>
                <div className="flex gap-1 ml-4">
                    {mode === 'select' ? (
                        <Button size="sm" onClick={onSelect}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" onClick={onSelect}>
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={onDuplicate}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            {!isDefault && (
                                <>
                                    <Button size="sm" variant="outline" onClick={onEdit}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
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
                <h4 className="font-medium text-gray-900 truncate">{name}</h4>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                    {isDefault && (
                        <Badge variant="outline" className="text-xs">
                            Built-in
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                        {metadata?.category || 'other'}
                    </Badge>
                </div>
            </div>

            {description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
            )}

            <div className="text-xs text-gray-400 mb-3">
                {layer.preview?.length || 0} setting changes
            </div>

            <div className="flex gap-1">
                {mode === 'select' ? (
                    <Button size="sm" className="w-full gap-2" onClick={onSelect}>
                        <Plus className="h-4 w-4" />
                        Add to Profile
                    </Button>
                ) : (
                    <>
                        <Button size="sm" variant="outline" onClick={onSelect} className="flex-1">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={onDuplicate}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        {!isDefault && (
                            <>
                                <Button size="sm" variant="outline" onClick={onEdit}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LayerLibrary; 