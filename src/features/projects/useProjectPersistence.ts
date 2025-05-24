import { useState, useEffect, useCallback } from 'react';
import {
    createProjectData,
    saveProjectToStorage,
    loadProjectFromStorage,
    autoSaveProject,
    hasStoredProject,
    clearStoredProject,
    downloadProjectFile,
    importProjectFromJSON,
} from './projectPersistence';
import { DEFAULT_EXPORT_SETTINGS } from '../../constants';
import type { Card, ExportSettings, BaseProfile } from '../../types';

interface UseProjectPersistenceOptions {
    autoSaveEnabled?: boolean;
    autoSaveDelay?: number;
}

interface ProjectPersistenceState {
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    isLoading: boolean;
    error: string | null;
}

export function useProjectPersistence(
    baseProfile: BaseProfile,
    cards: Card[],
    cardOrder: string[],
    exportSettings: ExportSettings = DEFAULT_EXPORT_SETTINGS,
    options: UseProjectPersistenceOptions = {}
) {
    const { autoSaveEnabled = true, autoSaveDelay = 2000 } = options;

    const [state, setState] = useState<ProjectPersistenceState>({
        hasUnsavedChanges: false,
        lastSaved: null,
        isLoading: false,
        error: null,
    });

    const [projectName, setProjectName] = useState<string>('Untitled Project');
    const [projectDescription, setProjectDescription] = useState<string>('');

    // Auto-save when data changes
    useEffect(() => {
        if (!autoSaveEnabled || cards.length === 0) {
            return;
        }

        setState(prev => ({ ...prev, hasUnsavedChanges: true }));

        const projectData = createProjectData(
            projectName,
            baseProfile.id,
            cards,
            cardOrder,
            exportSettings,
            projectDescription
        );

        autoSaveProject(projectData, autoSaveDelay);

        // Update state to reflect auto-save
        const timeoutId = setTimeout(() => {
            setState(prev => ({
                ...prev,
                hasUnsavedChanges: false,
                lastSaved: new Date(),
                error: null,
            }));
        }, autoSaveDelay + 100); // Slightly after auto-save

        return () => clearTimeout(timeoutId);
    }, [baseProfile.id, cards, cardOrder, exportSettings, projectName, projectDescription, autoSaveEnabled, autoSaveDelay]);

    // Load project on mount if available
    useEffect(() => {
        if (hasStoredProject()) {
            setState(prev => ({ ...prev, isLoading: true }));

            try {
                const storedProject = loadProjectFromStorage();
                if (storedProject) {
                    setProjectName(storedProject.name);
                    setProjectDescription(storedProject.metadata.description || '');
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        lastSaved: new Date(storedProject.metadata.modified),
                        error: null,
                    }));

                    // Note: Project loaded successfully
                    console.log('Project loaded from storage:', storedProject.name);
                }
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to load saved project',
                }));
                console.error('Failed to load stored project:', error);
            }
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Manual save
    const saveProject = useCallback(() => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const projectData = createProjectData(
                projectName,
                baseProfile.id,
                cards,
                cardOrder,
                exportSettings,
                projectDescription
            );

            const success = saveProjectToStorage(projectData);

            if (success) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    hasUnsavedChanges: false,
                    lastSaved: new Date(),
                    error: null,
                }));
                return { success: true, projectData };
            } else {
                throw new Error('Failed to save project');
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to save project',
            }));
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }, [baseProfile.id, cards, cardOrder, exportSettings, projectName, projectDescription]);

    // Load project
    const loadProject = useCallback(() => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const projectData = loadProjectFromStorage();

            if (projectData) {
                setProjectName(projectData.name);
                setProjectDescription(projectData.metadata.description || '');
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    hasUnsavedChanges: false,
                    lastSaved: new Date(projectData.metadata.modified),
                    error: null,
                }));
                return { success: true, projectData };
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'No saved project found',
                }));
                return { success: false, error: 'No saved project found' };
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load project',
            }));
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }, []);

    // Export project to file
    const exportProject = useCallback((filename?: string) => {
        try {
            const projectData = createProjectData(
                projectName,
                baseProfile.id,
                cards,
                cardOrder,
                exportSettings,
                projectDescription
            );

            downloadProjectFile(projectData, filename);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export project';
            setState(prev => ({ ...prev, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [baseProfile.id, cards, cardOrder, exportSettings, projectName, projectDescription]);

    // Import project from file
    const importProject = useCallback((jsonString: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const projectData = importProjectFromJSON(jsonString);

            setProjectName(projectData.name);
            setProjectDescription(projectData.metadata.description || '');
            setState(prev => ({
                ...prev,
                isLoading: false,
                hasUnsavedChanges: false,
                lastSaved: new Date(projectData.metadata.modified),
                error: null,
            }));

            return { success: true, projectData };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import project';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Clear project
    const clearProject = useCallback(() => {
        try {
            clearStoredProject();
            setProjectName('Untitled Project');
            setProjectDescription('');
            setState({
                hasUnsavedChanges: false,
                lastSaved: null,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear project';
            setState(prev => ({ ...prev, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        // State
        ...state,
        projectName,
        projectDescription,
        hasStoredProject: hasStoredProject(),

        // Actions
        setProjectName,
        setProjectDescription,
        saveProject,
        loadProject,
        exportProject,
        importProject,
        clearProject,
        clearError,
    };
} 