# Dust Effect System Setup Guide

## 🌪️ Overview

A 3D dust particle system that creates realistic dust effects at the player's feet during:
- **Dash** - Explosive dust burst (12 particles)
- **Slide** - Continuous dust trail
- **Wall Run** - Continuous dust trail

Uses 3D sphere objects with transparent materials for authentic dust appearance.

## 📋 Setup Steps

### Step 1: Create Dust Particle Prefab

1. **Create a new 3D Sphere:**
   - Right-click in Hierarchy → 3D Object → Sphere
   - Name it "DustParticle"
   - Scale it down to (0.1, 0.1, 0.1)

2. **Setup Transparent Material:**
   - Create new Material in Assets
   - Name it "DustMaterial"
   - Set **Technique** to **Transparent** (not Opaque)
   - Set **Albedo Color** to light brown/gray (e.g., 139, 119, 101, 255)
   - Adjust **Alpha** for transparency (start with 180-200)

3. **Apply Material:**
   - Assign DustMaterial to the sphere's MeshRenderer
   - The sphere should now appear semi-transparent

4. **Add DustParticle Component:**
   - Select the DustParticle sphere
   - Add Component → Search "DustParticle" → Add

5. **Save as Prefab:**
   - Drag DustParticle from Hierarchy to Assets folder
   - Delete the instance from scene (keep only prefab)

### Step 2: Setup DustEffectManager (Same as GhostEffect)

1. **Add DustEffectManager to Player:**
   - Select your **Player** node (same node that has PlayerController)
   - Add Component → Search "DustEffectManager" → Add

2. **Configure Properties:**
   - **Dust Particle Prefab**: Assign your DustParticle prefab
   - **Foot Offset**: 0.1 (height above ground)
   - **Enable Dust Effects**: true

### Step 3: No Additional Integration Needed!

The system works exactly like GhostEffect:
- ✅ **DustEffectManager component** is on the Player node
- ✅ **PlayerController automatically finds it** via `this.node.getComponent(DustEffectManager)`
- ✅ **No property assignments** needed in PlayerController

### Step 4: Test the Effects

1. **Play the game**
2. **Test Dash** - Should see explosive dust burst
3. **Test Slide** - Should see continuous dust trail
4. **Test Wall Run** - Should see continuous dust trail

## 🎨 Material Setup Details

### Transparent Material Settings

**Basic Setup:**
```
Material Name: DustMaterial
Technique: Transparent
Effect: builtin-standard-transparent
```

**Color Settings:**
```
Albedo: RGB(139, 119, 101) - Light brown
Alpha: 180-200 (adjust for desired transparency)
```

**Advanced Settings (Optional):**
```
Metallic: 0.0
Roughness: 0.8-1.0 (for matte dust look)
Normal Map: None (or subtle dust texture)
```

### Alternative Color Schemes

**Desert Dust:**
- RGB(194, 154, 108) - Sandy brown

**Concrete Dust:**
- RGB(169, 169, 169) - Light gray

**Dirt Dust:**
- RGB(101, 67, 33) - Dark brown

## 🎮 Effect Behaviors

### Dash Burst Effect
- **Particle Count**: 12 particles
- **Direction**: 360-degree spread from player
- **Animation**: Quick burst outward
- **Duration**: 0.8 seconds
- **Scale**: 0.15-0.25 (random)

### Slide Trail Effect
- **Particle Count**: Continuous (1 every 0.1s)
- **Direction**: Backward from movement
- **Animation**: Slower, trailing effect
- **Duration**: 1.2 seconds per particle
- **Scale**: 0.1-0.2 (random)

### Wall Run Trail Effect
- **Same as slide trail**
- **Automatically starts/stops with wall running**

## 🔧 Customization

### Adjust Particle Count
```typescript
// In PlayerController.ts, modify the dash call:
this.callDustEffect('burst', 15); // More particles for bigger burst
```

### Modify Dust Colors
Edit the DustMaterial:
- Change Albedo color for different dust types
- Adjust Alpha for more/less transparency

### Change Effect Timing
```typescript
// In DustEffectManager.ts:
private _trailInterval: number = 0.08; // Faster trail (more particles)
```

### Disable Effects
```typescript
// In DustEffectManager inspector:
Enable Dust Effects: false
```

## 🎯 Performance Notes

### Optimization Features
- **Automatic Cleanup** - Particles destroy themselves after animation
- **Pooling Ready** - Easy to add object pooling if needed
- **Efficient Animation** - Uses Cocos tween system
- **Transparent Rendering** - Proper alpha blending

### Performance Tips
- Keep particle count reasonable (8-15 per burst)
- Use simple sphere geometry
- Avoid complex textures on dust material
- Consider pooling for high-frequency effects

## 🐛 Troubleshooting

### No Dust Effects Appearing
1. Check DustEffectManager is assigned to PlayerController
2. Verify DustParticle prefab has DustParticle component
3. Check "Enable Dust Effects" is true
4. Look for console warnings

### Particles Not Transparent
1. Verify material Technique is set to **Transparent**
2. Check Alpha value is less than 255
3. Ensure material is applied to sphere MeshRenderer

### Effects Too Intense/Weak
1. Adjust particle count in PlayerController calls
2. Modify trail interval in DustEffectManager
3. Change particle scale ranges in DustParticle

### Performance Issues
1. Reduce particle count
2. Shorten particle lifetime
3. Add object pooling (advanced)

## 📊 Effect Specifications

| Action | Particles | Duration | Direction | Scale |
|--------|-----------|----------|-----------|-------|
| **Dash** | 12 | 0.8s | 360° spread | 0.15-0.25 |
| **Slide** | Continuous | 1.2s each | Backward | 0.1-0.2 |
| **Wall Run** | Continuous | 1.2s each | Backward | 0.1-0.2 |

Your dust effect system is now ready to make parkour actions feel more dynamic and impactful! 🌪️