# RFC: Layered Profile Composition for 3D Printer Slicing Software

# Disclaimer

**This project was specifically chosen to test an LLM-first workflow for writing code. The entire codebase, documentation, and this RFC were written entirely by Claude 4 (except this disclaimer). I've had this idea in mind for a long time but never had the spare time to work on it. All the replies in the comments will be written by me, it's not like I'm trying to replace my entire existence with AI**

## Abstract

This document proposes a layered composition system for managing 3D printer slicer profiles, addressing the complexity and maintenance overhead of current profile management approaches. The proposed system allows users to compose profiles from modular "layers" that encapsulate specific setting modifications, enabling more intuitive profile customization and reuse.

## 1. Introduction

### 1.1 Problem Statement

Current 3D printer slicer software (e.g., PrusaSlicer, Cura) requires users to manage profiles as monolithic configuration files containing hundreds of interdependent settings. This approach presents several challenges:

1. **High barrier to entry**: New users must understand complex parameter interactions to create custom profiles
2. **Maintenance overhead**: Similar profiles differing by few parameters require separate maintenance
3. **Limited reusability**: Common setting modifications cannot be easily applied across different base profiles
4. **Error-prone workflow**: Manual parameter editing increases risk of configuration errors

### 1.2 Scope

This RFC defines a layer-based composition system that:
- Maintains compatibility with existing slicer software through standard INI export
- Provides a browser-based interface requiring no installation
- Implements conflict resolution for overlapping parameter modifications
- Supports both novice and expert user workflows

## 2. Architecture Overview

### 2.1 Core Components

**Base Profile**: A complete slicer configuration serving as the foundation for composition.

**Modification Layer**: A discrete set of parameter changes with associated metadata, implemented as RFC 6902 JSON Patch operations.

**Composition Engine**: Applies layers sequentially to base profiles with conflict detection and resolution.

**Export Module**: Generates standard slicer-compatible INI files from composed profiles.

### 2.2 Data Model

```
Profile := BaseProfile + OrderedList<ModificationLayer>

ModificationLayer := {
  name: string,
  description: string,
  category: string,
  parameterChanges: ParameterModification[],
  metadata: LayerMetadata
}
```

### 2.3 Composition Process

1. Load base profile configuration
2. Apply modification layers in sequential order
3. Detect parameter conflicts when multiple layers modify the same setting
4. Resolve conflicts using last-write-wins strategy with user visibility
5. Validate final configuration for consistency
6. Generate standard slicer-compatible output file

## 3. User Interface Design

### 3.1 Primary Workflow

1. **Profile Selection**: User selects base profile from available options
2. **Layer Composition**: User adds modification layers via:
   - Selection from curated library
   - Custom layer creation through guided interface
   - Import from external sources
3. **Reordering**: Drag-and-drop interface for layer precedence management
4. **Conflict Resolution**: Visual indicators for parameter conflicts with resolution options
5. **Export**: Generate and download standard slicer INI file

### 3.2 Layer Management Interface

- **Layer Library**: Searchable collection with category filtering
- **Layer Editor**: Form-based interface for custom layer creation
- **Preview System**: Real-time display of parameter changes and conflicts

## 4. Implementation Considerations

### 4.1 Conflict Resolution

When multiple layers modify the same parameter:
- **Detection**: Path-based analysis identifies overlapping modifications
- **Resolution**: Last-write-wins with visual indicators
- **User Control**: Reordering interface allows precedence adjustment

### 4.2 Validation

- **Type Safety**: Validate parameter types and value ranges
- **Dependency Checking**: Ensure parameter combinations remain valid
- **Export Verification**: Validate generated INI files against slicer requirements

### 4.3 Extensibility

- **Custom Layer Types**: Support for user-defined modification patterns
- **Import/Export**: Standard formats for sharing layer configurations
- **Community Integration**: Layer sharing and discovery mechanisms

## 5. Example Use Cases

### 5.1 Beginner User Scenario

User wants to print a miniature with better support:
1. Select "MK4 0.4mm Quality" base profile
2. Add "Dense Supports" layer from library
3. Add "Higher Temperature" layer for adhesion
4. Export composed profile to PrusaSlicer

### 5.2 Expert User Scenario

User creates reusable speed optimization layer:
1. Access layer creation interface
2. Define speed parameter modifications
3. Add metadata and documentation
4. Save to personal library
5. Apply to multiple base profiles

### 5.3 Community Sharing

Users share specialized layers:
1. Export layer as JSON
2. Share via community platforms
3. Import to personal library
4. Apply to local profiles

## 6. Design Principles

### 6.1 User Experience Focus

- **Immediate Feedback**: Real-time preview of parameter changes and conflicts
- **Progressive Disclosure**: Simple interface with advanced options available when needed
- **Error Prevention**: Validation and guidance to prevent invalid configurations

### 6.2 Compatibility and Portability

- **Standard Output**: Generate files compatible with existing slicer software
- **Cross-Platform**: Browser-based solution requiring no installation
- **Offline Capable**: Local operation without server dependencies

## 7. Future Considerations

### 7.1 Advanced Features

- **Conditional Layers**: Modifications that adapt based on print characteristics
- **Template System**: Higher-level patterns for common printing scenarios
- **Direct Integration**: Seamless workflow with existing slicer software
- **Collaborative Features**: Shared workspaces and team layer libraries

### 7.2 Community Ecosystem

- **Layer Marketplace**: Curated collection of community-contributed layers
- **Knowledge Sharing**: Best practices and optimization patterns
- **Quality Assurance**: Community validation and rating systems

## 8. Implementation Status

### 8.1 Current State

A functional proof-of-concept demonstrating the core workflow has been developed and is available at [https://martinmikusat.github.io/slicer-layered-profiles/](https://martinmikusat.github.io/slicer-layered-profiles/), including:
- Complete layer composition workflow
- Intuitive drag-and-drop interface
- Custom layer creation tools
- Standard file export functionality
- Visual conflict detection and resolution

**Note**: This is an MVP demonstration using synthetic demo profiles and layers. While the workflow is functional, the system is not yet production-ready and exported profiles should be validated before use in actual 3D printing.

### 8.2 Next Steps

The concept requires further development in:
- Integration with real printer profiles
- Community testing and feedback incorporation
- Extended compatibility across different slicer software
- Performance optimization for complex layer combinations

## 9. Conclusion

The proposed layered profile composition system addresses fundamental usability challenges in 3D printer profile management while preserving compatibility with existing tools and workflows. The modular approach provides accessible entry points for new users while offering sophisticated customization capabilities for experienced practitioners.

This approach represents a shift from monolithic configuration management toward composable, reusable modification patterns that can evolve with community knowledge and best practices. 