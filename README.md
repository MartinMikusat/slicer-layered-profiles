# Slicer Layer Composer

A browser-based tool for composing PrusaSlicer profiles from simple "layers" (cards). Build custom 3D printing profiles by combining and reordering setting modifications.

## 🎯 What is this?

Instead of manually editing complex slicer profiles, this tool lets you:

1. **Pick a base profile** (e.g., "MK4 0.4mm Quality")  
2. **Add change cards** (e.g., "Higher Temperature", "Faster Speed")  
3. **Drag to reorder** - later cards override earlier ones  
4. **Download** a standard PrusaSlicer `.ini` file  

## ✨ Features

### Core Functionality
- 🔄 **Layer-based editing** - Apply changes as composable cards
- 🎯 **Conflict resolution** - Last-write-wins with visual conflict indicators
- 📱 **Browser-based** - No installation, runs entirely in your browser
- 💾 **Local storage** - Your projects auto-save locally
- 📥 **Standard export** - Generates normal PrusaSlicer `.ini` files

### User Experience
- 🎪 **Demo mode** - Try it instantly with pre-made cards
- 🖱️ **Drag & drop** - Intuitive card reordering
- 👀 **Live preview** - See setting changes in real-time
- 📱 **Mobile friendly** - Works on phones and tablets
- ⚡ **Fast** - No server required, everything runs locally

### Developer Friendly
- 🔧 **TypeScript** - Full type safety
- 🧪 **Tested** - Core functionality covered by tests
- 📝 **Well documented** - Clean code with cursor rules
- 🏗️ **Extensible** - Easy to add new cards and profiles

## 🚀 Quick Start

### Run Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd slicer-layered-profiles

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser (usually http://localhost:5173)
```

### Try the Demo

1. Click "Load Demo" in the header
2. See 5 example cards with different modifications
3. Drag cards to reorder them
4. Toggle cards on/off to see conflicts
5. Export the final profile as `.ini`

## 🎮 How to Use

### Basic Workflow

1. **Select Base Profile**
   - Choose from MK4 profiles (Quality, Speed, Draft)
   - See profile summary in sidebar

2. **Add Cards**
   - Load demo cards or create custom ones
   - Each card modifies specific settings
   - Preview shows exactly what changes

3. **Organize Cards**
   - Drag cards to reorder
   - Later cards override earlier ones
   - Conflicts are highlighted automatically

4. **Export Profile**
   - Click "Export INI" when ready
   - Download standard PrusaSlicer file
   - Import into PrusaSlicer normally

### Understanding Cards

Cards are simple JSON patches that modify settings:

```json
{
  "name": "Higher Temperature",
  "description": "Increase nozzle temp for better adhesion",
  "patch": [
    {
      "op": "replace", 
      "path": "/filament_settings/temperature",
      "value": 225
    }
  ]
}
```

Each card shows:
- **Name & description** - What it does
- **Setting preview** - "Temperature: 215°C → 225°C"
- **Category badge** - temperature, speed, quality, etc.
- **Order number** - Position in the stack

### Conflict Resolution

When multiple cards modify the same setting:
- **Last card wins** - Cards lower in the list override earlier ones
- **Visual indicators** - Conflicting cards show warning icons
- **Clear tooltips** - Hover to see which card's value is used

## 🏗️ Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks  
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── constants/      # App constants and settings
├── data/           # Sample profiles and demo cards
└── App.tsx         # Main application
```

## 🧩 Technical Details

### Tech Stack
- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server  
- **fast-json-patch** - RFC 6902 JSON Patch operations
- **@dnd-kit** - Accessible drag and drop
- **Lucide React** - Beautiful icons

### Architecture
- **Functional components** with hooks
- **TypeScript strict mode** for type safety
- **Local state management** (no Redux needed)
- **localStorage** for persistence
- **JSON Patch** for setting modifications

### Data Flow
```
Base Profile → Apply Cards (ordered) → Detect Conflicts → Export INI
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test

# Type checking
npm run build
```

## 🤝 Contributing

### Adding New Cards

1. Create card definition in `src/data/demoCards.ts`
2. Use JSON Patch format for modifications
3. Include preview for user-friendly display
4. Test with different base profiles

### Adding New Profiles

1. Add profile to `src/data/baseProfiles.ts`
2. Follow PrusaSlicer INI structure
3. Include comprehensive metadata
4. Test card compatibility

### Development Guidelines

See `.cursorrules` for detailed coding standards including:
- Component structure patterns
- State management approach  
- Error handling strategy
- Performance considerations

## 📋 Roadmap

### Phase 1: Core MVP ✅
- [x] Basic profile system
- [x] Card creation and management
- [x] Drag & drop reordering
- [x] Conflict detection
- [x] INI export

### Phase 2: Polish (In Progress)
- [ ] Undo/redo functionality
- [ ] URL-based project sharing
- [ ] Advanced conflict visualization
- [ ] Keyboard shortcuts

### Phase 3: Advanced Features
- [ ] Custom card creation UI
- [ ] Profile import from files
- [ ] Batch operations
- [ ] Plugin system

## 🐛 Known Limitations

- **Profile coverage** - Currently supports basic MK4 profiles only
- **Setting complexity** - Some advanced PrusaSlicer features not covered
- **Browser storage** - Projects stored locally only (no cloud sync)
- **Import validation** - Limited validation of imported profiles

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **PrusaSlicer team** - For the excellent slicer software
- **React community** - For the amazing ecosystem
- **Fast JSON Patch** - For RFC-compliant patch operations

---

**Built for the PrusaSlicer community** 🧡  
*A weekend MVP to explore layered profile composition*
