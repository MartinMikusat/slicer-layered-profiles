import React from 'react';
import type { CompiledProfile, BaseProfile, SettingChange, INIValue } from '../../../types';
import { Badge } from './badge';
import {
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

interface ProfileSummaryProps {
    selectedProfile: BaseProfile;
    compiledProfile: CompiledProfile | null;
    isCompiling: boolean;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
    selectedProfile,
    compiledProfile,
    isCompiling
}) => {
    // Get all changes as a flat list instead of grouped by section
    const getAllChanges = () => {
        if (!compiledProfile || !compiledProfile.appliedLayers.length) return [];

        const allChanges: SettingChange[] = [];

        compiledProfile.appliedLayers.forEach(layer => {
            if (layer.preview) {
                layer.preview.forEach(change => {
                    allChanges.push(change);
                });
            }
        });

        return allChanges;
    };

    // Format value for display
    const formatValue = (value: INIValue | null | undefined, unit?: string) => {
        if (value === null || value === undefined) return 'unset';
        const formattedValue = typeof value === 'number' ? value.toString() : String(value);
        return unit ? `${formattedValue}${unit}` : formattedValue;
    };

    // Get key settings overview
    const getKeySettings = () => {
        const data = compiledProfile?.finalData || selectedProfile.data;

        // Helper function to safely get nested value
        const getNestedValue = (section: string, key: string): INIValue | undefined => {
            const sectionData = data[section];
            if (sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
                return (sectionData as Record<string, INIValue>)[key];
            }
            return undefined;
        };

        return [
            {
                label: 'Layer Height',
                value: formatValue(getNestedValue('print_settings', 'layer_height'), 'mm'),
                path: '/print_settings/layer_height'
            },
            {
                label: 'Temperature',
                value: formatValue(getNestedValue('filament_settings', 'temperature'), '°C'),
                path: '/filament_settings/temperature'
            },
            {
                label: 'Speed',
                value: formatValue(getNestedValue('print_settings', 'perimeter_speed'), 'mm/s'),
                path: '/print_settings/perimeter_speed'
            },
            {
                label: 'Infill',
                value: formatValue(getNestedValue('print_settings', 'fill_density'), '%'),
                path: '/print_settings/fill_density'
            }
        ];
    };

    const allChanges = getAllChanges();
    const hasChanges = allChanges.length > 0;
    const hasConflicts = compiledProfile && Object.keys(compiledProfile.conflicts).length > 0;
    const keySettings = getKeySettings();

    return (
        <div className="space-y-4">
            {/* Loading state */}
            {isCompiling && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    Compiling profile...
                </div>
            )}

            {/* Key Settings Overview */}
            <div className="space-y-3">
                <h4 className="font-medium text-sm">Key Settings</h4>
                {keySettings.map(setting => {
                    const hasConflict = compiledProfile?.conflicts[setting.path];
                    return (
                        <div key={setting.label} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                {setting.label}
                                {hasConflict && (
                                    <div title="Has conflicts">
                                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                                    </div>
                                )}
                            </span>
                            <span className={`font-semibold ${hasConflict ? 'text-orange-600' : ''}`}>
                                {setting.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Applied Layers Summary */}
            {compiledProfile && (
                <div className="pt-3 border-t space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Applied Layers:</span>
                        <span className="font-semibold">{compiledProfile.appliedLayers.length}</span>
                    </div>

                    {hasConflicts && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Conflicts:
                            </span>
                            <span className="font-semibold text-orange-600">
                                {Object.keys(compiledProfile.conflicts).length}
                            </span>
                        </div>
                    )}

                    {hasChanges && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Changes:</span>
                            <span className="font-semibold">
                                {allChanges.length}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* All Changes - Simple List */}
            {hasChanges && (
                <div className="pt-3 border-t space-y-3">
                    <h4 className="font-medium text-sm">All Changes</h4>
                    <div className="space-y-2">
                        {allChanges.map((change, index) => {
                            const hasConflict = compiledProfile?.conflicts[change.path];
                            return (
                                <div key={`${change.path}-${index}`} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        {change.key}
                                        {hasConflict && (
                                            <div title="Has conflicts">
                                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                            </div>
                                        )}
                                        {!hasConflict && (
                                            <div title="Applied successfully">
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            </div>
                                        )}
                                    </span>
                                    <span className={`font-semibold ${hasConflict ? 'text-orange-600' : ''}`}>
                                        {formatValue(change.newValue, change.unit)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Applied Layers List */}
            {compiledProfile && compiledProfile.appliedLayers.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                    <h4 className="font-medium text-sm">Applied Layers</h4>
                    <div className="space-y-1">
                        {compiledProfile.appliedLayers.map((layer, index) => (
                            <div key={layer.id} className="text-xs flex items-center justify-between p-2 bg-accent/30 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium">{layer.name}</span>
                                    {layer.metadata?.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {layer.metadata.category}
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-muted-foreground">
                                    {layer.preview?.length || 0} changes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No changes state */}
            {!hasChanges && !isCompiling && (
                <div className="pt-3 border-t text-center py-4">
                    <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No modifications applied
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Add layers to see changes here
                    </p>
                </div>
            )}
        </div>
    );
};

export { ProfileSummary }; 