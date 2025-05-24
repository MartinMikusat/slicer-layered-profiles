import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/components/dialog';
import { Button } from '../ui/components/button';
import { Input } from '../ui/components/input';
import { Label } from '../ui/components/label';
import type { BaseProfile } from '../../types';

interface SettingPickerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProfile: BaseProfile;
    onSettingSelected: (setting: SettingInfo) => void;
}

interface SettingInfo {
    path: string;
    key: string;
    currentValue: string | number | boolean;
    section: string;
    unit?: string;
    description?: string;
    newValue?: string;
}

// Helper to get a human-readable key from a setting path
const getSettingKey = (key: string): string => {
    // Convert snake_case to Title Case
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper to determine unit from setting key
const getSettingUnit = (key: string): string | undefined => {
    const keyLower = key.toLowerCase();

    if (keyLower.includes('temperature') || keyLower.includes('temp')) {
        return '°C';
    }
    if (keyLower.includes('speed') || keyLower.includes('rate')) {
        return 'mm/s';
    }
    if (keyLower.includes('height') || keyLower.includes('width') || keyLower.includes('diameter')) {
        return 'mm';
    }
    if (keyLower.includes('density') || keyLower.includes('flow') || keyLower.includes('percent')) {
        return '%';
    }
    if (keyLower.includes('time') || keyLower.includes('delay')) {
        return 's';
    }

    return undefined;
};

// Get human-readable section name
const getSectionName = (section: string): string => {
    const sectionMap: Record<string, string> = {
        print_settings: 'Print Settings',
        filament_settings: 'Filament Settings',
        printer_settings: 'Printer Settings',
    };

    return sectionMap[section] || section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const SettingPicker: React.FC<SettingPickerProps> = ({
    isOpen,
    onClose,
    selectedProfile,
    onSettingSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['print_settings']));
    const [selectedSetting, setSelectedSetting] = useState<SettingInfo | null>(null);
    const [newValue, setNewValue] = useState('');

    // Parse profile data into organized settings
    const organizedSettings = useMemo(() => {
        const sections: Record<string, SettingInfo[]> = {};

        // Walk through the profile data and extract settings
        Object.entries(selectedProfile.data).forEach(([sectionKey, sectionData]) => {
            if (typeof sectionData === 'object' && sectionData !== null) {
                const settings: SettingInfo[] = [];

                Object.entries(sectionData).forEach(([settingKey, value]) => {
                    // Skip complex objects and arrays, focus on primitive values
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        settings.push({
                            path: `/${sectionKey}/${settingKey}`,
                            key: getSettingKey(settingKey),
                            currentValue: value,
                            section: sectionKey,
                            unit: getSettingUnit(settingKey),
                        });
                    }
                });

                if (settings.length > 0) {
                    sections[sectionKey] = settings.sort((a, b) => a.key.localeCompare(b.key));
                }
            }
        });

        return sections;
    }, [selectedProfile.data]);

    // Filter settings based on search term
    const filteredSections = useMemo(() => {
        if (!searchTerm.trim()) {
            return organizedSettings;
        }

        const filtered: Record<string, SettingInfo[]> = {};
        const term = searchTerm.toLowerCase();

        Object.entries(organizedSettings).forEach(([sectionKey, settings]) => {
            const matchingSettings = settings.filter(setting =>
                setting.key.toLowerCase().includes(term) ||
                setting.path.toLowerCase().includes(term) ||
                setting.currentValue.toString().toLowerCase().includes(term)
            );

            if (matchingSettings.length > 0) {
                filtered[sectionKey] = matchingSettings;
            }
        });

        return filtered;
    }, [organizedSettings, searchTerm]);

    const toggleSection = useCallback((sectionKey: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionKey)) {
                newSet.delete(sectionKey);
            } else {
                newSet.add(sectionKey);
            }
            return newSet;
        });
    }, []);

    const handleSettingClick = useCallback((setting: SettingInfo) => {
        setSelectedSetting(setting);
        setNewValue(setting.currentValue.toString());
    }, []);

    const handleAddSetting = useCallback(() => {
        if (selectedSetting && newValue.trim()) {
            onSettingSelected({
                ...selectedSetting,
                newValue: newValue.trim(),
            });
            onClose();
            setSelectedSetting(null);
            setNewValue('');
            setSearchTerm('');
        }
    }, [selectedSetting, newValue, onSettingSelected, onClose]);

    const handleClose = useCallback(() => {
        onClose();
        setSelectedSetting(null);
        setNewValue('');
        setSearchTerm('');
    }, [onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings size={20} />
                        Select Setting to Modify
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 gap-4 min-h-0">
                    {/* Settings Browser */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search settings..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Settings Tree */}
                        <div className="flex-1 overflow-y-auto border rounded-md">
                            {Object.entries(filteredSections).map(([sectionKey, settings]) => (
                                <div key={sectionKey} className="border-b last:border-b-0">
                                    <button
                                        onClick={() => toggleSection(sectionKey)}
                                        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-muted text-left font-medium"
                                    >
                                        {expandedSections.has(sectionKey) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        {getSectionName(sectionKey)}
                                        <span className="text-sm text-muted-foreground ml-auto">
                                            {settings.length} settings
                                        </span>
                                    </button>

                                    {expandedSections.has(sectionKey) && (
                                        <div className="border-t">
                                            {settings.map((setting) => (
                                                <button
                                                    key={setting.path}
                                                    onClick={() => handleSettingClick(setting)}
                                                    className={`w-full px-6 py-2 text-left hover:bg-muted/50 border-b last:border-b-0 ${selectedSetting?.path === setting.path ? 'bg-accent' : ''
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-sm">{setting.key}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {setting.currentValue}{setting.unit}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {setting.path}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Setting Editor */}
                    <div className="w-80 border-l pl-4">
                        {selectedSetting ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedSetting.key}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedSetting.path}</p>
                                </div>

                                <div>
                                    <Label htmlFor="current-value">Current Value</Label>
                                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                                        {selectedSetting.currentValue}{selectedSetting.unit}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="new-value">New Value</Label>
                                    <Input
                                        id="new-value"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        placeholder={`Enter new value${selectedSetting.unit ? ` (${selectedSetting.unit})` : ''}`}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <Button onClick={handleAddSetting} className="w-full">
                                        Add This Setting
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <Settings size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Select a setting from the left to modify it</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button onClick={handleClose} variant="outline">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 