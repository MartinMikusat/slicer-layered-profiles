# RFC: Layered Profile Builder - Modular Profile System for PrusaSlicer

## Executive Summary

**Problem**: Creating and managing custom PrusaSlicer profiles requires manual editing of complex INI files, making it difficult to experiment with setting combinations or share specific modifications.

**Solution**: A browser-based tool that introduces a "layer" concept to profile management - allowing users to compose profiles from reusable "cards" that modify specific settings.

**Status**: **MVP Complete** - Fully functional tool ready for community testing.

## Key Innovation: Layer-Based Profile Composition

Instead of editing monolithic profile files, users can:

1. **Start with a base profile** (e.g., "MK4 0.4mm Quality")
2. **Add modification cards** (e.g., "Higher Temperature", "Faster Speed") 
3. **Reorder cards** to control setting precedence
4. **Export standard INI files** compatible with PrusaSlicer

This approach makes profile customization:
- **Modular** - Reuse modifications across different base profiles
- **Discoverable** - Browse community cards for specific improvements
- **Conflict-aware** - Visual indicators show when cards override each other
- **Reversible** - Toggle cards on/off to test effects

## Technical Implementation

### Architecture
- **Frontend**: React + TypeScript + Vite (browser-only, no server required)
- **Patch System**: RFC 6902 JSON Patch for precise setting modifications
- **Drag & Drop**: Accessible reordering with @dnd-kit
- **Export**: Standard PrusaSlicer INI format

### Card Structure
```typescript
interface Card {
  name: string;              // "Higher Temperature"
  description: string;       // "Increase nozzle temp for better adhesion"
  patch: Operation[];        // JSON Patch operations
  metadata: {
    category: 'temperature' | 'speed' | 'quality' | 'infill' | 'other';
    tags: string[];          // For search/filtering
  };
  preview: PreviewItem[];    // User-friendly change descriptions
}
```

### Example Card
```json
{
  "name": "Higher Temperature",
  "description": "Increase nozzle temperature for better layer adhesion",
  "patch": [
    {
      "op": "replace",
      "path": "/filament_settings/temperature", 
      "value": 225
    }
  ],
  "preview": [
    {
      "key": "Nozzle Temperature",
      "oldValue": 215,
      "newValue": 225,
      "unit": "°C"
    }
  ]
}
```

## User Experience

### Demo Workflow
1. **Load Demo**: 5 example cards showcase the concept
2. **Base Profile**: Choose from MK4 Quality/Speed/Draft profiles
3. **Add Cards**: Cards show exactly what settings they modify
4. **Reorder**: Drag cards to change precedence (later cards win)
5. **Preview**: Live preview shows final setting values
6. **Export**: Download standard PrusaSlicer INI file

### Conflict Resolution
- **Last-Write-Wins**: Cards lower in the list override earlier ones
- **Visual Indicators**: Conflicting cards show warning icons
- **Clear Tooltips**: Hover to see which card's value is actually used
- **Toggle Testing**: Disable cards to see their impact

## Community Benefits

### For Users
- **Easier Experimentation**: Try setting combinations without manual editing
- **Knowledge Sharing**: Community can share specific improvements as cards
- **Safety**: Can't break profiles - worst case is bad print settings
- **Learning**: See exactly what each modification does

### For Community
- **Standardized Sharing**: Cards provide consistent format for modifications
- **Incremental Improvements**: Build libraries of proven modifications
- **Documentation**: Cards self-document what they do and why
- **Collaboration**: Multiple people can contribute to a profile

## Demo Cards Included

1. **Faster Perimeters** - Speed optimization for external walls
2. **Higher Temperature** - Better layer adhesion for problematic filaments  
3. **Aggressive Cooling** - Improved overhangs and bridging
4. **Dense Infill** - Stronger parts with increased infill density
5. **Fine Quality** - Higher resolution with reduced layer height

Each card demonstrates different aspects of the system and provides immediate value.

## Technical Details

### Browser Compatibility
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile-responsive design
- No installation required

### Performance
- Optimized for up to 50 cards
- Real-time preview with 500ms debouncing
- Local storage for project persistence
- Fast JSON Patch operations

### Extensibility
- Type-safe TypeScript throughout
- Clean component architecture
- Easy to add new base profiles
- Simple card creation format

## Current Limitations & Future Work

### Known Limitations
- **Profile Coverage**: Currently supports basic MK4 profiles only
- **Setting Scope**: Covers common settings, not advanced PrusaSlicer features
- **Storage**: Local browser storage only (no cloud sync)
- **Validation**: Limited validation of setting combinations

### Potential Extensions
1. **Profile Import**: Load user's existing INI files as base profiles
2. **Card Library**: Community repository for sharing cards
3. **Advanced Settings**: Support for more complex PrusaSlicer features
4. **Batch Operations**: Apply same cards to multiple profiles
5. **Visual Editing**: GUI for creating cards without JSON

## Request for Comments

### Questions for Community

1. **Use Cases**: What profile modifications do you make most often?
2. **Card Ideas**: What common adjustments would benefit from standardized cards?
3. **Integration**: How could this integrate with existing PrusaSlicer workflows?
4. **Sharing**: What's the best way to share cards within the community?

### Technical Feedback Wanted

1. **Setting Coverage**: Which PrusaSlicer settings are most important to support?
2. **Profile Format**: Any compatibility issues with specific PrusaSlicer versions?
3. **Performance**: How does it handle with your typical profile complexity?
4. **Edge Cases**: What profile modifications break the current approach?

## Try It Now

**Live Demo**: [Repository URL with GitHub Pages deployment]

1. Click "Load Demo" to see 5 example cards
2. Drag cards to reorder them
3. Toggle cards on/off to see conflicts
4. Export the final profile as .ini file
5. Test in PrusaSlicer to verify compatibility

## Contributing

The project is MIT licensed and welcoming contributions:

- **Card Development**: Create cards for common modifications
- **Profile Support**: Add support for more printer/filament profiles  
- **Feature Requests**: Suggest improvements based on real usage
- **Bug Reports**: Help identify edge cases and compatibility issues

---

**Goal**: Make PrusaSlicer profile customization more accessible, shareable, and collaborative for the entire 3D printing community.

**Status**: MVP complete, ready for community feedback and real-world testing. 