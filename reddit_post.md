# Layered 3D Printer Profiles: Like CSS for Slicer Settings

# Disclaimer

**This project was specifically chosen to test an LLM-first workflow for writing code. The entire codebase, documentation, and this RFC were written entirely by Claude 4 (except this disclaimer). I've had this idea in mind for a long time but never had the spare time to work on it. All the replies in the comments will be written by me, it's not like I'm trying to replace my entire existence with AI**

## The Problem

Managing slicer profiles is a pain. You want to print minis with good supports? Copy your quality profile, tweak 10 settings. Need the same supports on your speed profile? Copy and tweak again. Now you have 50 profiles that are 90% identical.

What if you could just say "Quality Profile + Dense Supports + Slow First Layer" and get exactly what you want?

Think of it like CSS for slicer settings. You have:

- **Base Profile**: Your starting point (like "0.2mm Quality")
- **Layers**: Modifications you can stack on top (like "Dense Supports", "Slow First Layer", "High Temp")
- **Composition**: Drag, drop, reorder layers to build exactly what you need
- **Export**: Get a normal INI file that works with your slicer

## How It Works

1. Pick a base profile
2. Add layers for the changes you want
3. Reorder them if there are conflicts (last one wins)
4. Export as regular slicer profile
5. Done!

## Try It Now

**Live Demo**: [https://martinmikusat.github.io/slicer-layered-profiles/](https://martinmikusat.github.io/slicer-layered-profiles/)

The interface shows:
- Base profile selection
- Drag-and-drop layer composition
- Visual conflict indicators
- Real-time export preview
- Custom layer creation

*Note: This is an MVP with demo data. Exported profiles should be validated before actual printing.*

## Why This Matters

**For beginners**: No more copying profiles and hunting through hundreds of settings. Just add the layers you need.

**For experts**: Create reusable layers once, apply everywhere. Share your optimizations with the community.

**For everyone**: Less profile bloat, easier experimentation, better organization.

## Example Workflows

**Miniature Printing**:
Base: "0.15mm Detail" + "Dense Supports" + "Slow Overhangs" = Perfect mini profile

**Speed Printing**:
Base: "0.3mm Speed" + "High Flow" + "Minimal Supports" = Fast functional parts

**Problem Solving**:
Having adhesion issues? Just add "Slow First Layer" to any profile instead of editing each one.

## What's Next?

This is an early proof-of-concept. To make it production-ready, it needs:

- Real printer profiles (not just demo data)
- Community testing and feedback
- Broader slicer compatibility
- Performance optimization

The goal is to shift from "hundreds of similar profiles" to "composable, reusable modifications" that grow with community knowledge.

## Feedback Welcome

Try the demo and let me know what you think! Is this something you'd actually use? What layers would you want to see? What am I missing? 