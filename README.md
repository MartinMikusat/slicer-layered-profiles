# Layered Profile Builder

A browser-based tool for composing PrusaSlicer profiles from simple "layers". Build custom 3D printing profiles by combining and reordering setting modifications.

**Desktop Application**: Designed exclusively for desktop use - optimized for efficient workflows on desktop screens.

**Status**: Advanced MVP Complete ✅  
**Ready For**: Real-world testing and PrusaSlicer profile integration

> 📋 **For Developers**: See [`PROJECT_COMPLETION_SUMMARY.md`](PROJECT_COMPLETION_SUMMARY.md) for comprehensive MVP documentation and technical details.

## 🎯 What is this?

Instead of manually editing complex slicer profiles, this tool lets you:

1. **Pick a base profile** (e.g., "MK4 0.4mm Quality")  
2. **Add change layers** (e.g., "Higher Temperature", "Faster Speed")  
3. **Drag to reorder** - later layers override earlier ones  
4. **Download** a standard PrusaSlicer `.ini` file  

## ✨ Complete Features

### Core Functionality ✅
- 🔄 **Layer-based editing** - Apply changes as composable layers
- 🎯 **Conflict resolution** - Last-write-wins with visual conflict indicators
- 📱 **Browser-based** - No installation, runs entirely in your browser
- 💾 **Local storage** - Your projects auto-save locally
- 📥 **Standard export** - Generates normal PrusaSlicer `.ini` files

### Custom Layer Creation ✅
- 🔧 **Build your own layers** - Create custom setting modifications
- 🔍 **Setting browser** - Pick from any profile setting with guided interface
- ✅ **Input validation** - Type checking and value validation
- 💾 **Save & organize** - Persistent storage with categories and metadata

### Layer Library Management ✅
- 📚 **Layer library** - Comprehensive collection interface with search/filter
- 🔍 **Smart search** - Find layers by name, description, or category
- 🏷️ **Category filtering** - Organize by temperature, speed, quality, support, etc.
- ⚙️ **Full CRUD** - Create, edit, duplicate, delete custom layers

### User Experience ✅
- 🎪 **Demo mode** - Try it instantly with pre-made layers
- 🖱️ **Drag & drop** - Intuitive layer reordering
- 👀 **Live preview** - See setting changes in real-time
- 🖥️ **Desktop optimized** - Clean layouts designed for desktop workflows
- ⚡ **Fast** - No server required, everything runs locally
- 🎯 **Guided tours** - Interactive onboarding and help

### Developer Features ✅
- 🔧 **TypeScript** - Full type safety with strict mode
- 🧪 **Tested** - Core functionality covered by tests
- 📝 **Well documented** - Clean code with comprehensive guides
- 🏗️ **Extensible** - Feature-based architecture for easy expansion

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
2. See 5 example layers with different modifications
3. Drag layers to reorder them
4. Toggle layers on/off to see conflicts
5. Export the final profile as `.ini`

## 🎮 How to Use

### Basic Workflow

1. **Select Base Profile**
   - Choose from MK4 profiles (Quality, Speed, Draft)
   - See profile summary in sidebar

2. **Add Layers**
   - Load demo layers or create custom ones
   - Each layer modifies specific settings
   - Preview shows exactly what changes

3. **Organize Layers**
   - Drag layers to reorder
   - Later layers override earlier ones
   - Conflicts are highlighted automatically

4. **Export Profile**
   - Click "Export INI" when ready
   - Download standard PrusaSlicer file
   - Import into PrusaSlicer normally

### Understanding Layers

Layers are simple JSON patches that modify settings:

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

Each layer shows:
- **Name & description** - What it does
- **Setting preview** - "Temperature: 215°C → 225°C"
- **Category badge** - temperature, speed, quality, etc.
- **Order number** - Position in the stack

### Conflict Resolution

When multiple layers modify the same setting:
- **Last layer wins** - Layers lower in the list override earlier ones
- **Visual indicators** - Conflicting layers show warning icons
- **Clear tooltips** - Hover to see which layer's value is used

## 🏗️ Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks  
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── constants/      # App constants and settings
├── data/           # Sample profiles and demo layers
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
Base Profile → Apply Layers (ordered) → Detect Conflicts → Export INI
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

### Adding New Layers

1. Create layer definition in `src/data/demoLayers.ts`
2. Use JSON Patch format for modifications
3. Include preview for user-friendly display
4. Test with different base profiles

### Adding New Profiles

1. Add profile to `src/data/baseProfiles.ts`
2. Follow PrusaSlicer INI structure
3. Include comprehensive metadata
4. Test layer compatibility

### Development Guidelines

See `.cursorrules` for detailed coding standards including:
- Component structure patterns
- State management approach  
- Error handling strategy
- Performance considerations

## 📋 MVP Complete - Next Steps

### ✅ Completed Advanced MVP
The project includes a complete, production-ready foundation:
- **Complete profile building workflow** from base selection to INI export
- **Custom layer creation system** with guided interface and validation
- **Layer library management** with search, filter, and organization
- **Full user experience** with tours, mobile support, and accessibility
- **Technical excellence** with TypeScript, testing, and clean architecture

### 🎯 Next Phase: Real PrusaSlicer Integration
The next logical step is integrating real PrusaSlicer profiles to unlock production use:

- **Profile data collection** from official Prusa repositories
- **INI parser development** for real PrusaSlicer format  
- **Profile integration** replacing demo layers with real ones
- **End-to-end validation** with actual PrusaSlicer compatibility

### 🔮 Future Enhancements
With the solid MVP foundation, future opportunities include:
- **Community layer sharing** and marketplace
- **Advanced conflict resolution** with manual override options
- **Multi-profile export** for complete printer setups
- **Cloud synchronization** for cross-device project sharing

## 📈 Success Metrics Achieved

The MVP has successfully met all objectives:
- ✅ **Functional workflow** - Complete profile building from start to finish
- ✅ **Custom creation** - Users can build their own modification layers
- ✅ **Library management** - Comprehensive organization and search
- ✅ **PrusaSlicer compatibility** - Standard INI export format
- ✅ **User experience** - Intuitive interface with guided onboarding
- ✅ **Technical quality** - Type-safe, tested, maintainable codebase

**Ready for real-world testing and production deployment** 🚀

## ❓ FAQ & Troubleshooting

### General Usage

**Q: What PrusaSlicer versions are supported?**
A: The tool generates standard `.ini` files compatible with PrusaSlicer 2.4+ and should work with newer versions.

**Q: Can I use this with other slicers like Cura or SuperSlicer?**
A: Currently optimized for PrusaSlicer. Other slicers may not recognize all settings or formatting.

**Q: How many layers can I add?**
A: No hard limit, but performance is optimized for up to 50 layers. More layers may slow down the interface.

**Q: Can I create my own layers?**
A: Yes! See the "Layer Creation Format" section below for the JSON structure.

### Technical Issues

**Q: Export isn't working / Downloaded file is empty**
A: 
- Check browser console for errors
- Ensure you have a base profile selected
- Try with demo layers first to verify functionality
- Clear browser cache and reload

**Q: Layers aren't applying / Settings not changing**
A:
- Verify your JSON patch syntax
- Check that paths exist in the base profile
- Ensure layers are enabled (not grayed out)
- Try reordering layers - later layers override earlier ones

**Q: App is slow / Unresponsive**
A:
- Reduce number of layers (especially if you have 20+)
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

## 📝 Layer Creation Format

Want to create your own layers? Here's the complete structure:

### Basic Layer Structure

```typescript
interface DemoLayer {
  demoId: string;           // Unique identifier
  name: string;             // Display name
  description: string;      // What the layer does
  enabled: boolean;         // Whether layer is active
  metadata: {
    category: 'speed' | 'temperature' | 'quality' | 'infill' | 'other';
    tags: string[];         // Searchable tags
    author?: string;        // Creator name
    version?: string;       // Layer version
  };
  patch: Operation[];       // JSON Patch operations
  preview: PreviewItem[];   // User-friendly change descriptions
}
```

### JSON Patch Operations

Layers use [RFC 6902 JSON Patch](https://tools.ietf.org/html/rfc6902) format:

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