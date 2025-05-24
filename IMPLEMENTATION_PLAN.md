# Slicer Layer Composer - Implementation Plan

## Weekend MVP Goals
Build a browser-based tool for composing PrusaSlicer profiles from simple "layers" (cards).

## Phase 1: Core Architecture Setup ✅ (1-2 hours)

### ✅ 1.1 Project Initialization
- [x] Create Vite + React + TypeScript project
- [x] Install dependencies: `fast-json-patch`, `@dnd-kit/*`, `lucide-react`
- [x] Set up project structure and cursor rules

### ✅ 1.2 Type Definitions & Core Structure
- [x] Create type definitions in `src/types/`
- [x] Set up basic folder structure
- [x] Create core constants and sample data

### ✅ 1.3 Basic Layout & Routing
- [x] Clean up default Vite template
- [x] Create main app layout
- [x] Set up basic component structure

## Phase 2: Profile System ✅ (2-3 hours)

### ✅ 2.1 Base Profile System
- [x] Create sample PrusaSlicer profiles as JSON
- [x] Implement profile loading and parsing
- [x] Build profile selector component

### ✅ 2.2 Card/Patch System
- [x] Define card data structure
- [x] Implement JSON patch application logic
- [x] Create sample demo cards
- [x] Build conflict detection system

### ✅ 2.3 Profile Compilation
- [x] Combine base profile + cards into final profile
- [x] Implement last-write-wins conflict resolution
- [x] Add real-time profile preview

## Phase 3: User Interface (3-4 hours)

### ✅ 3.1 Card Components
- [x] Build draggable card component
- [x] Add card metadata display
- [x] Implement enable/disable toggle
- [x] Show setting changes preview

### ✅ 3.2 Drag & Drop System
- [x] Implement card reordering with @dnd-kit
- [x] Add visual feedback during drag
- [x] Update card order state
- [x] Handle drop zones and validation

### ✅ 3.3 Conflict Visualization
- [x] Detect setting conflicts between cards
- [x] Show conflict indicators on cards
- [x] Add tooltips explaining conflicts
- [x] Highlight overridden settings

## Phase 4: Core Functionality ✅ (2-3 hours)

### ✅ 4.1 INI Export System
- [x] Convert final JSON profile to INI format
- [x] Validate INI structure
- [x] Implement file download
- [x] Add export metadata/comments

### ✅ 4.2 Project Persistence
- [x] Save/load project state to localStorage
- [x] Export project as JSON file
- [x] Import project from JSON file
- [x] Handle migration/versioning

### ✅ 4.3 Demo & Sample Data
- [x] Create 3-5 demo cards (temperature, speed, quality)
- [x] Add "Load Demo" button
- [x] Pre-populate with working example
- [x] Add tooltips explaining each demo card

## Phase 5: Polish & Testing ✅ (2-3 hours)

### ✅ 5.1 User Experience Improvements
- [x] Add undo/redo functionality
- [x] Implement keyboard shortcuts
- [x] Add loading states and error handling
- [ ] Improve mobile responsiveness

### ✅ 5.2 Advanced Features
- [x] URL-based project sharing (base64 encoding)
- [x] Basic onboarding tour
- [x] Auto-generate change summary for RFC
- [x] Add card search/filtering

### 🔲 5.3 Testing & Validation
- [ ] Unit tests for core utilities
- [ ] Test with real PrusaSlicer profiles
- [ ] E2E test for main user flow
- [ ] Performance testing with many cards

## Phase 6: Documentation & Deployment (1 hour)

### 🔲 6.1 Documentation
- [ ] Update README with usage instructions
- [ ] Document card creation format
- [ ] Add FAQ and troubleshooting
- [ ] Create RFC-ready summary

### 🔲 6.2 Deployment Preparation
- [ ] Build production version
- [ ] Test deployment locally
- [ ] Prepare GitHub Pages deployment
- [ ] Create release checklist

## Success Criteria

### Must Have (MVP)
- ✅ Base profile selection
- ✅ Card system with JSON patches
- ✅ Drag & drop card ordering
- ✅ Conflict detection and last-write-wins
- ✅ INI file export
- ✅ Local project save/load
- ✅ 3+ working demo cards

### Should Have (Polish)
- ✅ Undo/redo functionality
- ✅ Setting change previews
- ✅ Basic conflict visualization
- ✅ Mobile-friendly design
- ✅ Error handling

### Could Have (Advanced)
- ✅ URL sharing
- ✅ Onboarding tour
- ✅ RFC markdown export
- ✅ Card metadata and versioning

## Technical Decisions

### Architecture
- **State Management**: React hooks + localStorage (no Redux needed)
- **Drag & Drop**: @dnd-kit (better accessibility than react-dnd)
- **Patch System**: fast-json-patch (RFC 6901/6902 compliant)
- **File Format**: Standard PrusaSlicer INI

### Data Flow
```
Base Profile → Apply Cards (ordered) → Detect Conflicts → Export INI
     ↓                ↓                      ↓
   JSON             Patches               Final JSON → INI
```

### Performance Considerations
- Debounce profile compilation (500ms)
- Memo-ize card components
- Lazy load demo data
- Optimize drag operations

## Risk Mitigation

### Time Management
- Focus on core flow first
- Cut features aggressively if behind
- Test early and often
- Keep scope minimal but functional

### Technical Risks
- INI parsing edge cases → Start with simple test cases
- Complex nested settings → Document limitations clearly
- Browser compatibility → Target modern browsers only
- Performance with many cards → Test with 20+ cards

## Next Steps

1. **Start with Phase 1.2** - Set up types and basic structure
2. **Create sample data** - Real PrusaSlicer profile snippets
3. **Build incrementally** - Test each phase before moving on
4. **Document as you go** - Capture decisions and gotchas

Remember: **Perfect is the enemy of good**. Ship a working MVP that demonstrates the concept clearly. 