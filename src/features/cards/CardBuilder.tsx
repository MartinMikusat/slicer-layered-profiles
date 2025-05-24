import React, { useState, useCallback, useEffect } from 'react';
import { Plus, X, FileText, Wrench, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/components/dialog';
import { Button } from '../ui/components/button';
import { Input } from '../ui/components/input';
import { Textarea } from '../ui/components/textarea';
import { Label } from '../ui/components/label';
import { SettingPicker } from './SettingPicker';
import type { Card, BaseProfile, SettingChange } from '../../types';
import type { Operation } from 'fast-json-patch';

interface CardBuilderProps {
    selectedProfile: BaseProfile;
    onCardCreated: (card: Card) => void;
    onCardUpdated?: (card: Card) => void;
    editingCard?: Card | null;
    onEditingClear?: () => void;
    trigger?: React.ReactNode;
}

interface CardFormData {
    name: string;
    description: string;
    category: 'temperature' | 'speed' | 'quality' | 'support' | 'infill' | 'other';
    author: string;
    tags: string[];
    modifications: Array<{
        path: string;
        key: string;
        currentValue: any;
        newValue: string;
        unit?: string;
        section?: string;
    }>;
}

interface SettingInfo {
    path: string;
    key: string;
    currentValue: any;
    section: string;
    unit?: string;
    description?: string;
    newValue?: string;
}

const CATEGORIES = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'speed', label: 'Speed' },
    { value: 'quality', label: 'Quality' },
    { value: 'support', label: 'Support' },
    { value: 'infill', label: 'Infill' },
    { value: 'other', label: 'Other' },
] as const;

export const CardBuilder: React.FC<CardBuilderProps> = ({
    selectedProfile,
    onCardCreated,
    onCardUpdated,
    editingCard,
    onEditingClear,
    trigger,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettingPicker, setShowSettingPicker] = useState(false);
    const [formData, setFormData] = useState<CardFormData>({
        name: '',
        description: '',
        category: 'other',
        author: '',
        tags: [],
        modifications: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [tagInput, setTagInput] = useState('');

    // Determine if we're in edit mode
    const isEditMode = Boolean(editingCard);

    // Automatically open dialog when editing a card
    useEffect(() => {
        if (editingCard) {
            setIsOpen(true);
        }
    }, [editingCard]);

    // Load card data when editing
    useEffect(() => {
        if (editingCard && isOpen) {
            // Convert patch operations back to modifications
            const modifications = editingCard.preview?.map(change => ({
                path: change.path,
                key: change.key,
                currentValue: change.oldValue,
                newValue: String(change.newValue),
                unit: change.unit,
                section: change.section,
            })) || [];

            setFormData({
                name: editingCard.name,
                description: editingCard.description,
                category: (editingCard.metadata?.category as CardFormData['category']) || 'other',
                author: editingCard.metadata?.author || '',
                tags: editingCard.metadata?.tags || [],
                modifications,
            });
        } else if (!editingCard) {
            resetForm();
        }
    }, [editingCard, isOpen]);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            description: '',
            category: 'other',
            author: '',
            tags: [],
            modifications: [],
        });
        setErrors({});
        setTagInput('');
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Card name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.modifications.length === 0) {
            newErrors.modifications = 'At least one setting modification is required';
        }

        // Validate modifications
        formData.modifications.forEach((mod, index) => {
            if (!mod.newValue.trim()) {
                newErrors[`modification-${index}`] = 'New value is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const generateCardId = useCallback((): string => {
        return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    const createPatchOperations = useCallback((): Operation[] => {
        return formData.modifications.map(mod => ({
            op: 'replace' as const,
            path: mod.path,
            value: parseValue(mod.newValue, typeof mod.currentValue),
        }));
    }, [formData.modifications]);

    const createPreview = useCallback((): SettingChange[] => {
        return formData.modifications.map(mod => ({
            path: mod.path,
            key: mod.key,
            oldValue: mod.currentValue,
            newValue: parseValue(mod.newValue, typeof mod.currentValue),
            unit: mod.unit,
            section: mod.section,
        }));
    }, [formData.modifications]);

    const parseValue = (value: string, targetType: string): any => {
        if (targetType === 'number') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        if (targetType === 'boolean') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return value;
    };

    const handleSubmit = useCallback(() => {
        if (!validateForm()) {
            return;
        }

        if (isEditMode && editingCard && onCardUpdated) {
            // Update existing card
            const updatedCard: Card = {
                ...editingCard,
                name: formData.name.trim(),
                description: formData.description.trim(),
                patch: createPatchOperations(),
                metadata: {
                    ...editingCard.metadata,
                    category: formData.category,
                    author: formData.author.trim() || 'Custom',
                    tags: formData.tags,
                    modified: new Date().toISOString(),
                },
                preview: createPreview(),
            };

            onCardUpdated(updatedCard);
        } else {
            // Create new card
            const newCard: Card = {
                id: generateCardId(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                enabled: true,
                patch: createPatchOperations(),
                metadata: {
                    category: formData.category,
                    author: formData.author.trim() || 'Custom',
                    version: '1.0',
                    tags: formData.tags,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                },
                preview: createPreview(),
            };

            onCardCreated(newCard);
        }

        setIsOpen(false);
        resetForm();
    }, [formData, validateForm, isEditMode, editingCard, onCardUpdated, createPatchOperations, createPreview, onCardCreated, resetForm, generateCardId]);

    const handleTagAdd = useCallback(() => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
            }));
        }
        setTagInput('');
    }, [tagInput, formData.tags]);

    const handleTagRemove = useCallback((tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    }, []);

    const handleSettingSelected = useCallback((setting: SettingInfo) => {
        // Check if this setting is already being modified
        const existingIndex = formData.modifications.findIndex(mod => mod.path === setting.path);

        if (existingIndex >= 0) {
            // Update existing modification
            setFormData(prev => ({
                ...prev,
                modifications: prev.modifications.map((mod, index) =>
                    index === existingIndex
                        ? {
                            ...mod,
                            currentValue: setting.currentValue,
                            unit: setting.unit,
                            newValue: setting.newValue || setting.currentValue.toString()
                        }
                        : mod
                ),
            }));
        } else {
            // Add new modification
            setFormData(prev => ({
                ...prev,
                modifications: [
                    ...prev.modifications,
                    {
                        path: setting.path,
                        key: setting.key,
                        currentValue: setting.currentValue,
                        newValue: setting.newValue || setting.currentValue.toString(),
                        unit: setting.unit,
                        section: setting.section,
                    },
                ],
            }));
        }
    }, [formData.modifications]);

    const handleRemoveModification = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            modifications: prev.modifications.filter((_, i) => i !== index),
        }));
    }, []);

    const handleModificationValueChange = useCallback((index: number, newValue: string) => {
        setFormData(prev => ({
            ...prev,
            modifications: prev.modifications.map((mod, i) =>
                i === index ? { ...mod, newValue } : mod
            ),
        }));
    }, []);

    const defaultTrigger = (
        <Button className="flex items-center gap-2 tour-create-card">
            <Plus size={16} />
            Create Custom Card
        </Button>
    );

    const handleDialogOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open && isEditMode) {
            // When closing in edit mode, clear the editing state
            resetForm();
            if (onEditingClear) {
                onEditingClear();
            }
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                {!isEditMode && (
                    <DialogTrigger asChild>
                        {trigger || defaultTrigger}
                    </DialogTrigger>
                )}
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isEditMode ? <Edit size={20} /> : <Wrench size={20} />}
                            {isEditMode ? 'Edit Custom Card' : 'Create Custom Card'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="card-name">Card Name *</Label>
                                <Input
                                    id="card-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Faster Print Speed"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="card-description">Description *</Label>
                                <Textarea
                                    id="card-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe what this card does and why someone would use it..."
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="card-category">Category</Label>
                                    <select
                                        id="card-category"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            category: e.target.value as CardFormData['category']
                                        }))}
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="card-author">Author</Label>
                                    <Input
                                        id="card-author"
                                        value={formData.author}
                                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                        placeholder="Your name (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleTagRemove(tag)}
                                            className="hover:text-destructive"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleTagAdd();
                                        }
                                    }}
                                />
                                <Button onClick={handleTagAdd} variant="outline" size="sm">
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Setting Modifications */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Setting Modifications *</Label>
                                <Button
                                    onClick={() => setShowSettingPicker(true)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus size={16} />
                                    Add Setting
                                </Button>
                            </div>

                            {formData.modifications.length === 0 ? (
                                <div className="border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center text-muted-foreground">
                                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No setting modifications added yet.</p>
                                    <p className="text-sm">Click "Add Setting" to start modifying profile settings.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {formData.modifications.map((mod, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{mod.key}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Current: {mod.currentValue}{mod.unit} →
                                                    </span>
                                                    <Input
                                                        value={mod.newValue}
                                                        onChange={(e) => handleModificationValueChange(index, e.target.value)}
                                                        className="h-6 text-xs w-20"
                                                        placeholder="New value"
                                                    />
                                                    {mod.unit && <span className="text-xs text-muted-foreground">{mod.unit}</span>}
                                                </div>
                                                {errors[`modification-${index}`] && (
                                                    <p className="text-xs text-destructive mt-1">{errors[`modification-${index}`]}</p>
                                                )}
                                            </div>
                                            <Button
                                                onClick={() => handleRemoveModification(index)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.modifications && (
                                <p className="text-sm text-destructive mt-1">{errors.modifications}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    resetForm();
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {isEditMode ? 'Update Card' : 'Create Card'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Setting Picker Modal */}
            <SettingPicker
                isOpen={showSettingPicker}
                onClose={() => setShowSettingPicker(false)}
                selectedProfile={selectedProfile}
                onSettingSelected={handleSettingSelected}
            />
        </>
    );
}; 