# StatChange 3D Prefab - Correct Creation Guide

## 🎯 Important: This is a 3D World-Space Prefab, NOT UI!

The upperInfo displays floating text in **3D world space** above the player's head, similar to damage numbers in RPG games.

## 📦 Two Approaches

### Approach 1: Simple Text-Only (Recommended)

Since you're in 3D, we'll use **TextMesh** or **Label3D** instead of UI components.

However, Cocos Creator 3D doesn't have built-in 3D text. So we have two options:

### Option A: Use Billboard UI (Recommended)

Create a **Canvas in World Space** that always faces the camera.

### Option B: Use 3D Sprites with Numbers

Use sprite sheets with number textures.

## ✅ Recommended Solution: Billboard Canvas

Let me update the upperInfo.ts to work with 3D world space properly:

