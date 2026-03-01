# Floating Display Not Visible - Troubleshooting

## 🔍 Most Likely Issues

### Issue 1: Sprite and Label Don't Render in 3D by Default

**Problem:** Sprite and Label components are designed for 2D UI, not 3D world space.

**Solution:** We need to use a different approach for 3D.

## ✅ Alternative Solutions

### Solution A: Use 3D Sprites (Recommended)

Instead of UI Sprite/Label, we can use:
1. **Billboard component** - Makes sprites face camera
2. **3D Sprite rendering** - Renders in 3D space
3. **TextMesh** - 3D text (if available)

### Solution B: Use World Space Canvas

Create a Canvas in World Space mode that renders in 3D.

### Solution C: Use Simple 3D Meshes

Use colored cubes/spheres for icons and skip text.

## 🎯 Quick Fix: Check These First

### 1. Check Console Logs

When you collect a flag, you should see:
```
FloatingStatDisplay: Created health display: +40
  - Container position: Vec3(0, 0, 0)
  - Icon scale: Vec3(1, 1, 1)
  - Text scale: Vec3(0.02, 0.02, 1)
  - Label string: "+40"
  - Label color: Color(100, 200, 255, 255)
FloatingStatDisplay: health +40 - Total active: 1
```

**If you see these logs:** Nodes are being created, but not rendering.

### 2. Check Hierarchy

In Cocos Creator Hierarchy, you should see:
```
FloatingStatDisplay
└─ FloatingStat_health_1234567890
   ├─ Icon
   └─ Text
```

**If you see these nodes:** They exist but aren't visible.

### 3. Check Node Properties

Select the `FloatingStat_health` node:
- Is it active? ✓
- Is it visible? ✓
- Check position (should be near 0, 0, 0)
- Check scale (should be visible)

## 🔧 Immediate Fix Options

### Option 1: Increase Scales Dramatically

In FloatingStatDisplay inspector, try:
```
Icon Scale: 5.0 (much bigger!)
Text Scale: 0.1 (much bigger!)
```

### Option 2: Check Camera Culling

The camera might not be rendering these nodes:
1. Select Main Camera
2. Check Camera component
3. Verify culling mask includes the layer
4. Check near/far clipping planes

### Option 3: Use Debug Rendering

Add this to `createFloatingDisplay()` to verify position:
```typescript
// After creating container
console.log('Container world position:', container.worldPosition);
console.log('Parent (this.node) world position:', this.node.worldPosition);
console.log('Camera world position:', this.cameraNode.worldPosition);
```

## 💡 Working Alternative: Use MeshRenderer

Since Sprite/Label might not work in 3D, here's a simpler approach using just console logs for now:

```typescript
private createFloatingDisplay(statType: 'health' | 'stamina', change: number): void {
    const isIncrease = change > 0;
    const value = Math.abs(Math.round(change));
    const symbol = statType === 'health' ? '❤️' : '⚡';
    const color = isIncrease ? '💙' : '❤️';
    
    console.log(`${color} ${symbol} ${isIncrease ? '+' : '-'}${value}`);
    
    // TODO: Implement 3D rendering
}
```

## 🎯 Recommended Next Steps

### Step 1: Verify System is Working

Check console logs when:
- Collecting flags
- Taking damage
- Using abilities

You should see the creation logs.

### Step 2: Try Extreme Scales

Set in inspector:
```
Icon Scale: 10.0
Text Scale: 0.5
```

If still not visible, it's a rendering issue.

### Step 3: Check Layer and Visibility

1. Select FloatingStatDisplay node
2. Check Layer (should be Default or same as player)
3. Check if camera can see this layer
4. Try changing layer to see if it helps

### Step 4: Alternative - Use 3D Text Plugin

Cocos Creator might need a 3D text plugin or custom shader for text in 3D space.

## 🎮 Quick Test

Add this to your PlayerController or any component:

```typescript
import { find } from 'cc';

// In onKeyDown
if (event.keyCode === KeyCode.KEY_T) {
    const floatingDisplay = find('FloatingStatDisplay')?.getComponent('FloatingStatDisplay');
    if (floatingDisplay) {
        console.log('Testing floating display...');
        floatingDisplay.createFloatingDisplay('health', 40);
    }
}
```

Press T and check:
1. Console logs appear? ✓
2. Node created in hierarchy? ✓
3. Node visible in scene view? ❓
4. Node visible in game view? ❓

## 🔍 Debug Checklist

- [ ] Console shows "Created health display" messages
- [ ] Nodes appear in hierarchy
- [ ] Nodes have Icon and Text children
- [ ] Icon has Sprite component with sprite frame
- [ ] Text has Label component with string
- [ ] Container position is above player
- [ ] Scales are reasonable (not 0.00001)
- [ ] Camera can see the layer
- [ ] Nodes are active

## 💡 If Still Not Working

The issue is likely that **Sprite and Label components don't render properly in 3D world space** in Cocos Creator.

**Best solution:**
1. Use a **World Space Canvas** instead
2. Or use **3D models** for icons
3. Or use **Billboard component** with sprites
4. Or use **particle systems** for visual feedback

Would you like me to implement one of these alternative approaches?
