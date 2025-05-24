# Layered Profile Builder

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

### Phase 2: Polish ✅
- [x] Undo/redo functionality
- [x] URL-based project sharing
- [x] Advanced conflict visualization
- [x] Keyboard shortcuts
- [x] Mobile responsiveness
- [x] Error handling & loading states

### Phase 3: Advanced Features ✅
- [x] Auto-generated change summary for RFC
- [x] Card search/filtering
- [x] Basic onboarding tour
- [x] Project import/export

### Current Status: Ready for Production 🚀
The tool is fully functional and ready for use. All core features are implemented and tested.

## ❓ FAQ & Troubleshooting

### General Usage

**Q: What PrusaSlicer versions are supported?**
A: The tool generates standard `.ini` files compatible with PrusaSlicer 2.4+ and should work with newer versions.

**Q: Can I use this with other slicers like Cura or SuperSlicer?**
A: Currently optimized for PrusaSlicer. Other slicers may not recognize all settings or formatting.

**Q: How many cards can I add?**
A: No hard limit, but performance is optimized for up to 50 cards. More cards may slow down the interface.

**Q: Can I create my own cards?**
A: Yes! See the "Card Creation Format" section below for the JSON structure.

### Technical Issues

**Q: Export isn't working / Downloaded file is empty**
A: 
- Check browser console for errors
- Ensure you have a base profile selected
- Try with demo cards first to verify functionality
- Clear browser cache and reload

**Q: Cards aren't applying / Settings not changing**
A:
- Verify your JSON patch syntax
- Check that paths exist in the base profile
- Ensure cards are enabled (not grayed out)
- Try reordering cards - later cards override earlier ones

**Q: App is slow / Unresponsive**
A:
- Reduce number of cards (especially if you have 20+)
- Try clearing localStorage: `localStorage.clear()` in browser console
- Close other browser tabs to free up memory

**Q: Project won't load / Error on startup**
A:
- Clear browser localStorage and refresh
- Check browser console for specific error messages
- Ensure you're using a modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Browser Compatibility

**Q: What browsers are supported?**
A: Modern browsers with ES2020 support:
- Chrome 90+ ✅
- Firefox 88+ ✅ 
- Safari 14+ ✅
- Edge 90+ ✅

**Q: Does this work on mobile?**
A: Yes! The interface is mobile-responsive, though desktop is recommended for the best experience.

## 📝 Card Creation Format

Want to create your own cards? Here's the complete structure:

### Basic Card Structure

```typescript
interface DemoCard {
  demoId: string;           // Unique identifier
  name: string;             // Display name
  description: string;      // What the card does
  enabled: boolean;         // Whether card is active
  metadata: {
    category: 'speed' | 'temperature' | 'quality' | 'infill' | 'other';
    tags: string[];         // Searchable tags
    author?: string;        // Creator name
    version?: string;       // Card version
  };
  patch: Operation[];       // JSON Patch operations
  preview: PreviewItem[];   // User-friendly change descriptions
}
```

### JSON Patch Operations

Cards use [RFC 6902 JSON Patch](https://tools.ietf.org/html/rfc6902) format:

```json
{
  "op": "replace",          // Operation: "replace", "add", "remove"
  "path": "/section/setting", // Path to setting in profile
  "value": 60               // New value
}
```

### Common Setting Paths

```typescript
// Print Settings
"/print_settings/layer_height"           // Layer height (mm)
"/print_settings/perimeter_speed"        // Perimeter speed (mm/s)
"/print_settings/infill_speed"          // Infill speed (mm/s)  
"/print_settings/fill_density"          // Infill density (%)

// Filament Settings
"/filament_settings/temperature"         // Nozzle temp (°C)
"/filament_settings/first_layer_temperature" // First layer temp (°C)
"/filament_settings/min_fan_speed"      // Min fan speed (%)
"/filament_settings/max_fan_speed"      // Max fan speed (%)

// Printer Settings
"/printer_settings/retract_length"      // Retraction distance (mm)
"/printer_settings/retract_speed"       // Retraction speed (mm/s)
```

### Preview Items

Help users understand what changes:

```typescript
interface PreviewItem {
  path: string;        // Same as patch path
  key: string;         // User-friendly setting name
  oldValue: any;       // Original value
  newValue: any;       // New value after patch
  unit?: string;       // Unit (°C, mm/s, %, etc.)
  section: string;     // UI section name
}
```

### Example: Complete Card

```typescript
{
  demoId: 'slower-quality',
  name: 'Slow & Precise',
  description: 'Slower speeds with finer details for high-quality prints',
  enabled: true,
  metadata: {
    category: 'quality',
    tags: ['quality', 'speed', 'precision'],
    author: 'Community',
    version: '1.2'
  },
  patch: [
    {
      op: 'replace',
      path: '/print_settings/layer_height',
      value: 0.1
    },
    {
      op: 'replace', 
      path: '/print_settings/perimeter_speed',
      value: 30
    }
  ],
  preview: [
    {
      path: '/print_settings/layer_height',
      key: 'Layer Height',
      oldValue: 0.2,
      newValue: 0.1,
      unit: 'mm',
      section: 'Quality'
    },
    {
      path: '/print_settings/perimeter_speed', 
      key: 'Perimeter Speed',
      oldValue: 45,
      newValue: 30,
      unit: 'mm/s',
      section: 'Speed'
    }
  ]
}
```

### Testing Your Cards

1. Add card to `src/data/demoCards.ts`
2. Test with different base profiles
3. Verify preview values match actual changes
4. Check for conflicts with other demo cards

## 🐛 Known Limitations

- **Profile coverage** - Currently supports basic MK4 profiles only
- **Setting complexity** - Some advanced PrusaSlicer features not covered  
- **Browser storage** - Projects stored locally only (no cloud sync)
- **Import validation** - Limited validation of imported profiles
- **Large projects** - Performance may degrade with 50+ cards

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **PrusaSlicer team** - For the excellent slicer software
- **React community** - For the amazing ecosystem
- **Fast JSON Patch** - For RFC-compliant patch operations

---

**Built for the PrusaSlicer community** 🧡  
*A weekend MVP to explore layered profile composition*
