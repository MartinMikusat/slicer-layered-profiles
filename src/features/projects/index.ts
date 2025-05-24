// Projects feature exports
export { ProjectManager } from './ProjectManager'
export { useProjectPersistence } from './useProjectPersistence'
export {
    createProjectData,
    saveProjectToStorage,
    loadProjectFromStorage,
    exportProjectAsJSON,
    importProjectFromJSON,
    downloadProjectFile,
    clearStoredProject,
    hasStoredProject,
    autoSaveProject
} from './projectPersistence'
export {
    encodeProjectToURL,
    decodeProjectFromURL,
    clearProjectFromURL,
    copyToClipboard
} from './urlSharing' 