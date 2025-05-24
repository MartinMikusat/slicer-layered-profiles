import React, { useRef } from 'react';
import { Save, FolderOpen, Download, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ProjectManagerProps {
    projectName: string;
    projectDescription: string;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    isLoading: boolean;
    error: string | null;
    hasStoredProject: boolean;
    onProjectNameChange: (name: string) => void;
    onProjectDescriptionChange: (description: string) => void;
    onSave: () => void;
    onLoad: () => Promise<{ success: boolean; projectData?: any; error?: string }>;
    onExport: (filename?: string) => void;
    onImport: (jsonString: string) => Promise<{ success: boolean; projectData?: any; error?: string }>;
    onClearError: () => void;
    onProjectLoaded?: (projectData: any) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    projectName,
    projectDescription,
    hasUnsavedChanges,
    lastSaved,
    isLoading,
    error,
    hasStoredProject,
    onProjectNameChange,
    onProjectDescriptionChange,
    onSave,
    onLoad,
    onExport,
    onImport,
    onClearError,
    onProjectLoaded,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadProject = async () => {
        const result = await onLoad();
        if (result.success && result.projectData && onProjectLoaded) {
            onProjectLoaded(result.projectData);
        }
    };

    const handleImportFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const result = await onImport(text);

            if (result.success && result.projectData && onProjectLoaded) {
                onProjectLoaded(result.projectData);
            }
        } catch (err) {
            console.error('Failed to read file:', err);
        }

        // Reset file input
        event.target.value = '';
    };

    const formatLastSaved = (date: Date | null) => {
        if (!date) return 'Never';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 minute ago';
        if (diffMins < 60) return `${diffMins} minutes ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="project-manager">
            <div className="project-info">
                <div className="project-fields">
                    <div className="field-group">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                            id="project-name"
                            type="text"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            placeholder="Enter project name..."
                        />
                    </div>

                    <div className="field-group">
                        <Label htmlFor="project-description">Description (optional)</Label>
                        <Textarea
                            id="project-description"
                            value={projectDescription}
                            onChange={(e) => onProjectDescriptionChange(e.target.value)}
                            placeholder="Describe your profile modifications..."
                            rows={2}
                        />
                    </div>
                </div>

                <div className="project-status">
                    <div className="status-info">
                        <span className={`save-status ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
                            {hasUnsavedChanges ? '● Unsaved changes' : '✓ All changes saved'}
                        </span>
                        <span className="last-saved">
                            Last saved: {formatLastSaved(lastSaved)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="project-actions">
                <Button
                    onClick={onSave}
                    disabled={isLoading}
                    variant="default"
                    size="sm"
                    title="Save project to browser storage"
                >
                    <Save size={16} />
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>

                <Button
                    onClick={handleLoadProject}
                    disabled={isLoading || !hasStoredProject}
                    variant="outline"
                    size="sm"
                    title="Load saved project from browser storage"
                >
                    <FolderOpen size={16} />
                    Load
                </Button>

                <Button
                    onClick={() => onExport()}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    title="Export project as JSON file"
                >
                    <Download size={16} />
                    Export
                </Button>

                <Button
                    onClick={handleImportFile}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    title="Import project from JSON file"
                >
                    <Upload size={16} />
                    Import
                </Button>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <Button onClick={onClearError} variant="ghost" size="sm">
                        <X size={14} />
                    </Button>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}; 