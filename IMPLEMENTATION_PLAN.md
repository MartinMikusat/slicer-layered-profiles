# Layered Profile Builder - Next Phase Implementation Plan

## Current Status Assessment
✅ **Core MVP Features Complete** - The foundation is solid with:
- Base profile system with compilation
- Card/patch system with conflict detection  
- Drag & drop reordering with visual feedback
- INI export and project persistence
- URL sharing and onboarding tour
- Demo cards and comprehensive UI

## Phase 6.5: Real PrusaSlicer Profile Integration 🎯 (2-3 hours)
**Priority: HIGHEST - Foundation for truly functional profiles**

### 🔲 6.5.1 Profile Data Collection
- [ ] Download real PrusaSlicer profile bundles from official sources:
  - [Prusa FDM profiles](https://github.com/prusa3d/PrusaSlicer-settings-prusa-fff) (MK3S+, MK4, XL, etc.)
  - [Non-Prusa FDM profiles](https://github.com/prusa3d/PrusaSlicer-settings-non-prusa-fff) (Creality, Kingroon, etc.)
  - Community-tested profiles from GitHub repos
- [ ] Parse INI bundle files to extract individual printer configurations
- [ ] Convert INI sections to JSON format for our system
- [ ] Validate profile structure and completeness

### 🔲 6.5.2 Profile Parsing & Conversion
- [ ] Create INI parser utility (`parseINIProfile.ts`)
- [ ] Build profile converter (`convertPrusaProfile.ts`) 
- [ ] Handle multi-printer bundles (extract individual printer profiles)
- [ ] Preserve all original settings and metadata
- [ ] Generate appropriate preview data for UI

### 🔲 6.5.3 Profile Integration & Organization
- [ ] Replace demo profiles with real Prusa profiles
- [ ] Add profile categories: Prusa (MK3S+, MK4), Community (Creality, etc.)
- [ ] Create profile selector with printer manufacturer grouping
- [ ] Add profile metadata display (printer model, nozzle size, material compatibility)
- [ ] Implement profile search/filter by printer type

### 🔲 6.5.4 Validation & Testing
- [ ] Test profile compilation with real settings
- [ ] Validate INI export produces PrusaSlicer-compatible files
- [ ] Test card patches work correctly with real profile structure
- [ ] Verify exported profiles can be imported into actual PrusaSlicer
- [ ] Test with multiple printer types (i3 MK3S+, MK4, Ender 3, etc.)

## Phase 7: Custom Card Creation 🎯 (3-4 hours) 
**Priority: HIGH** - This is the key missing MVP feature

### ✅ 7.1 Card Builder UI
- ✅ Create `CardBuilder.tsx` component with form interface
- ✅ Add "Create Custom Card" button to main interface
- ✅ Implement modal/dialog for card creation
- ✅ Add card template selection (empty, from existing card)

### ✅ 7.2 Setting Editor
- ✅ Build setting path browser/picker from base profile
- ✅ Add value input with type validation (number, string, boolean)
- ✅ Show setting current value vs. new value preview
- ✅ Support multiple setting modifications per card

### ✅ 7.3 Card Metadata Input
- ✅ Add name, description, and category fields
- ✅ Include author, version, and tags input
- ✅ Add card validation before save
- ✅ Generate preview automatically from patches

### ✅ 7.4 Card Management
- ✅ Save custom cards to localStorage with versioning
- ✅ Edit existing custom cards (not demo cards)
- ✅ Duplicate cards to create variations
- ✅ Delete custom cards with confirmation

## Phase 8: Enhanced User Experience 🔲 (2-3 hours)
**Priority: MEDIUM - Polish for better usability**

### 🔲 8.1 Card Library
- [ ] Separate demo cards from custom cards in UI
- [ ] Add card library/collection view
- [ ] Implement card search/filter for custom cards
- [ ] Add card import from JSON/INI snippets

### 🔲 8.2 Profile Enhancement
- [ ] Support multiple base profiles (different printers/materials)
- [ ] Add base profile import from actual PrusaSlicer INI files
- [ ] Show more detailed profile information
- [ ] Add profile comparison feature

### 🔲 8.3 Better Conflict Handling
- [ ] Visual conflict resolution interface
- [ ] Allow manual conflict resolution (not just last-wins)
- [ ] Show setting dependency warnings
- [ ] Add conflict explanation tooltips

## Phase 9: Advanced Features 🔲 (2-3 hours)
**Priority: LOW - Nice-to-have enhancements**

### 🔲 9.1 Card Templates & Presets
- [ ] Create card template system (speed boost, quality improve, etc.)
- [ ] Add preset card collections for common use cases
- [ ] Export/import card collections
- [ ] Community card sharing format

### 🔲 9.2 Advanced Export Options
- [ ] Multi-profile export (different quality settings)
- [ ] Export to PrusaSlicer bundle format
- [ ] Add print time estimation integration
- [ ] Export validation warnings

### 🔲 9.3 Mobile Optimizations
- [ ] Improve touch-based drag and drop
- [ ] Optimize card layout for mobile
- [ ] Add swipe gestures for card management
- [ ] Touch-friendly card creation interface

## Phase 10: Testing & Polish 🔲 (2 hours)
**Priority: MEDIUM - Essential for quality**

### 🔲 10.1 Testing Suite
- [ ] Unit tests for card creation logic
- [ ] Integration tests for custom card workflow
- [ ] E2E test: create card → add to profile → export
- [ ] Regression tests for existing functionality

### 🔲 10.2 Error Handling & Validation
- [ ] Better error messages for card creation
- [ ] Input validation with helpful feedback
- [ ] Graceful handling of malformed custom cards
- [ ] Recovery from localStorage corruption

### 🔲 10.3 Performance & UX
- [ ] Loading states for card operations
- [ ] Optimize large card collections
- [ ] Add keyboard shortcuts for card management
- [ ] Improve accessibility (screen readers, keyboard nav)

## Implementation Priority for Next Session

### 🎯 **NEW Immediate Focus: Real PrusaSlicer Profile Integration (Phase 6.5)**
This is now the highest priority as it makes the tool truly functional with real-world profiles:

1. **Start with Phase 6.5.1** - Download and analyze real PrusaSlicer profiles
2. **Phase 6.5.2** - Build INI parser and converter utilities
3. **Phase 6.5.3** - Integrate real profiles into existing system
4. **Phase 6.5.4** - Validate end-to-end functionality with real profiles

### 📋 **Detailed Next Steps for Real Profile Integration:**

#### Step 1: Profile Data Collection (45 mins)
- Download official Prusa profile bundles (.ini files)
- Download popular community profiles (Creality Ender 3, Kingroon KP3S)
- Analyze INI structure and identify key sections
- Create profile data directory structure

#### Step 2: INI Parser Development (1 hour)
- Build robust INI parser that handles PrusaSlicer format
- Parse sections: `[printer_settings]`, `[print_settings]`, `[filament_settings]`
- Convert to our JSON BaseProfile format
- Preserve metadata and compatibility info

#### Step 3: Profile Integration (45 mins)
- Replace existing demo profiles with real ones
- Update profile selector UI with categories
- Add proper printer metadata display
- Test profile compilation pipeline

#### Step 4: Validation & Export Testing (30 mins)
- Test card patches work with real profile structure
- Validate exported INI files work in actual PrusaSlicer
- Test end-to-end workflow: real profile → cards → export → import

### 🔄 **Then Continue with Custom Card Creation (Phase 7)**
After real profiles are working, proceed with custom card creation as originally planned.

## Real Profile Sources & Integration Plan

### **Key Profile Sources** 
Based on web research of official PrusaSlicer repositories:

**Official Prusa Profiles:**
- **Current repo**: [PrusaSlicer-settings-prusa-fff](https://github.com/prusa3d/PrusaSlicer-settings-prusa-fff)
- **Covers**: Original Prusa i3 MK3S+, MK4, XL, MINI+ series
- **Format**: Bundle .ini files with complete configurations

**Community Profiles:**
- **Non-Prusa repo**: [PrusaSlicer-settings-non-prusa-fff](https://github.com/prusa3d/PrusaSlicer-settings-non-prusa-fff)  
- **Covers**: Creality Ender 3/5, Kingroon KP3S, Artillery, etc.
- **Community curated**: [KP3S-Prusa profiles](https://github.com/RyanT95/KP3S-Prusa) and others

### **Technical Implementation Strategy**

#### INI Bundle Structure (from research):
```ini
# Each bundle contains:
[printer_settings]
# Printer hardware config, bed size, nozzle, etc.

[print_settings] 
# Layer height, speeds, infill, supports, etc.

[filament_settings]
# Temperature, retraction, cooling, material properties
```

#### Our Integration Approach:
```typescript
// Parse real INI → convert to our BaseProfile format
interface BaseProfile {
  id: string; // derived from printer model
  name: string; // "Original Prusa i3 MK3S+ 0.4mm"
  data: {
    printer_settings: {...},
    print_settings: {...}, 
    filament_settings: {...}
  },
  metadata: {
    printer: "MK3S+",
    nozzle: "0.4mm",
    material: "PLA",
    source: "official" | "community"
  }
}
```

### **File Structure for Real Profiles:**
```
src/features/profiles/
├── realProfiles/           # Real PrusaSlicer profiles  
│   ├── prusa/              # Official Prusa profiles
│   │   ├── mk3s.json       # Converted from official INI
│   │   ├── mk4.json
│   │   └── xl.json
│   ├── community/          # Community profiles
│   │   ├── ender3.json     # Popular community printers
│   │   ├── kingroon.json
│   │   └── creality.json
│   └── index.ts            # Profile registry
├── utils/
│   ├── iniParser.ts        # Parse PrusaSlicer INI files
│   ├── profileConverter.ts # Convert INI → BaseProfile
│   └── profileValidator.ts # Validate converted profiles
└── baseProfiles.ts         # Updated to use real profiles
```

## Success Criteria for Custom Card Creation

### Must Have (Core MVP)
- [ ] Create cards with name, description, and category
- [ ] Modify one or more profile settings per card
- [ ] Save custom cards persistently (localStorage)
- [ ] Use custom cards same as demo cards (drag, toggle, conflict detection)
- [ ] Export profiles with custom cards applied

### Should Have (Polish)
- [ ] Validate card inputs before saving
- [ ] Edit existing custom cards
- [ ] Visual preview of setting changes
- [ ] Search/filter custom cards

### Could Have (Advanced)
- [ ] Card templates for common modifications
- [ ] Import cards from JSON/INI
- [ ] Duplicate cards to create variations
- [ ] Share custom cards via URL

## Architecture Notes for Card Creation

### Data Flow
```
User Input → Validate → Generate Patches → Create Card → Save to localStorage → Add to State
```

### File Structure
```
src/features/cards/
├── CardBuilder.tsx          # Main card creation interface
├── SettingPicker.tsx        # Browse profile settings
├── SettingInput.tsx         # Input for individual settings
├── CardForm.tsx             # Complete card metadata form
├── customCardService.ts     # CRUD operations for custom cards
└── index.ts                 # Exports
```

### Integration Points
- **Add to layers feature**: Extend existing card management
- **Integrate with persistence**: Use existing localStorage patterns
- **Extend type definitions**: Add CustomCard type vs DemoCard
- **Enhance UI components**: Reuse existing modal/form components

## Risk Mitigation

### Time Management
- Focus on core creation workflow first
- Use existing UI components where possible
- Defer advanced features (templates, import) if needed
- Test incrementally - don't build everything before testing

### Technical Risks
- **Setting path complexity**: Start with simple top-level settings
- **Input validation**: Use TypeScript for compile-time safety
- **localStorage limits**: Implement basic storage cleanup
- **UI complexity**: Keep card builder simple initially

Remember: The goal is to complete a working custom card creation flow that integrates seamlessly with the existing MVP. Users should be able to create their own modifications and see them work exactly like the demo cards. 