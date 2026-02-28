# Flag Collision Troubleshooting Guide

## Common Issue: Flag Not Triggering Collection

If your flag isn't being collected when the player touches it, follow this checklist:

## ✅ Checklist

### 1. Flag Collider Setup

**On the Flag Prefab/Node:**
- [ ] Has a **Collider** component (BoxCollider, SphereCollider, or CapsuleCollider)
- [ ] Collider **isTrigger** is checked ✓
- [ ] Collider **size** is appropriate (not too small)
- [ ] Collider is **enabled**
- [ ] Node is **active**

**How to verify:**
```typescript
// In Flag.start(), check console for:
"Flag: Collider found and listener attached. IsTrigger: true"

// If you see this warning, add a collider:
"Flag: No Collider component found on flag node!"
```

### 2. Player Collider Setup

**On the Player Node:**
- [ ] Has a **CharacterController** component (you're using this)
- [ ] CharacterController is **enabled**
- [ ] CharacterController has appropriate **radius/height**

**Important:** CharacterController uses its own collision system, not regular Collider events!

### 3. Physics Layer Settings

**Check Physics Layers:**
1. Open **Project Settings** → **Physics**
2. Verify collision matrix:
   - Flag's layer can collide with Player's layer
   - Both layers are checked in the collision matrix

**Common layer setup:**
- Player: Layer 1 (Default)
- Flag: Layer 1 (Default) or Layer 2 (Collectible)
- Make sure these layers can collide with each other

### 4. Collider Size Verification

**Flag Collider might be too small:**

```typescript
// Add this to Flag.start() to debug collider size
const collider = this.node.getComponent(Collider);
if (collider) {
    console.log(`Flag Collider Type: ${collider.constructor.name}`);
    if (collider instanceof BoxCollider) {
        console.log(`Flag Box Size: ${collider.size}`);
    } else if (collider instanceof SphereCollider) {
        console.log(`Flag Sphere Radius: ${collider.radius}`);
    }
}
```

**Recommended sizes:**
- **SphereCollider**: radius = 1.5 to 2.0
- **BoxCollider**: size = (2, 2, 2) or larger

### 5. Node Hierarchy Check

**Player hierarchy might affect collision:**

```
Player (has PlayerController)
├─ CharacterController (collision happens here)
└─ Visual Mesh
```

The collision event might be triggered on the CharacterController node, not the Player node.

**Solution:** Check parent node for PlayerController (already added in updated code)

## 🔧 Quick Fixes

### Fix 1: Increase Collider Size

Make the flag collider bigger:

**In Cocos Creator Inspector:**
1. Select Flag prefab
2. Find Collider component
3. If SphereCollider: Set radius to **2.0**
4. If BoxCollider: Set size to **(2, 2, 2)**

### Fix 2: Verify Trigger is Checked

**In Cocos Creator Inspector:**
1. Select Flag prefab
2. Find Collider component
3. Check **isTrigger** checkbox ✓

### Fix 3: Check Physics Layers

**In Cocos Creator:**
1. Select Flag node
2. Check **Layer** property (top of inspector)
3. Select Player node
4. Check **Layer** property
5. Go to **Project Settings** → **Physics** → **Collision Matrix**
6. Ensure these layers can collide

### Fix 4: Add Debug Visualization

Add this to Flag component to visualize collider:

```typescript
import { Color, MeshRenderer, utils } from 'cc';

start() {
    // ... existing code ...
    
    // Visualize collider for debugging
    this.visualizeCollider();
}

private visualizeCollider(): void {
    const collider = this.node.getComponent(Collider);
    if (!collider) return;
    
    // Add a semi-transparent mesh to see collider bounds
    const meshRenderer = this.node.getComponent(MeshRenderer);
    if (meshRenderer) {
        meshRenderer.material.setProperty('mainColor', new Color(0, 255, 0, 100));
    }
}
```

## 🐛 Advanced Debugging

### Enable Detailed Logging

The updated Flag.ts now includes detailed logging:

**Expected console output when working:**
```
Flag: Collider found and listener attached. IsTrigger: true
Flag: onTriggerEnter called. IsCollected: false
Flag: Collided with node: Player
>>>>>> Flag Collected!
Flag Level 1 collected!
```

**If you see this:**
```
Flag: No Collider component found on flag node!
```
→ Add a Collider component to the flag

**If you see this:**
```
Flag: Collided with node: CharacterController
Flag: Checking parent node: Player
>>>>>> Flag Collected!
```
→ Working correctly! CharacterController is child of Player

**If you see this:**
```
Flag: Collided with node: SomeOtherNode
Flag: No PlayerController found on SomeOtherNode or its parent
```
→ Flag is colliding with wrong object, check layers

### Test Collision Manually

Add this temporary test to Flag component:

```typescript
update(deltaTime: number) {
    // ... existing code ...
    
    // TEST: Check distance to player
    if (this.playerNode) {
        const playerPos = this.playerNode.getWorldPosition();
        const flagPos = this.node.getWorldPosition();
        const distance = Vec3.distance(playerPos, flagPos);
        
        if (distance < 3) {
            console.log(`Player is ${distance.toFixed(2)}m from flag`);
        }
    }
}
```

## 🎯 Recommended Setup

### Flag Prefab Structure

```
Flag (root)
├─ Flag Component ✓
├─ SphereCollider (isTrigger: true, radius: 2.0) ✓
└─ Visual (child node)
   └─ MeshRenderer or Sprite
```

### Flag Collider Settings

**SphereCollider (Recommended):**
- Type: Sphere
- Is Trigger: ✓ (checked)
- Radius: 2.0
- Center: (0, 0, 0)

**BoxCollider (Alternative):**
- Type: Box
- Is Trigger: ✓ (checked)
- Size: (2, 2, 2)
- Center: (0, 0, 0)

### Player Setup

**CharacterController:**
- Radius: 0.5
- Height: 2.0
- Step Offset: 0.5

## 🔍 Still Not Working?

### Check Physics System

Add this to GameManager or any component:

```typescript
import { PhysicsSystem } from 'cc';

start() {
    console.log('Physics System Enabled:', PhysicsSystem.instance.enable);
    console.log('Physics Gravity:', PhysicsSystem.instance.gravity);
}
```

### Verify Event System

Add this to Flag.start():

```typescript
start() {
    // ... existing code ...
    
    // Test if events work at all
    this.node.on('test-event', () => {
        console.log('Event system working!');
    });
    
    this.node.emit('test-event');
}
```

### Check Node Validity

```typescript
start() {
    console.log('Flag node valid:', this.node.isValid);
    console.log('Flag node active:', this.node.active);
    console.log('Flag node position:', this.node.worldPosition);
}
```

## 📝 Common Mistakes

1. **Forgot to check isTrigger** → Collider acts as solid wall
2. **Collider too small** → Player passes through without touching
3. **Wrong physics layer** → Layers don't interact
4. **Collider on wrong node** → Should be on same node as Flag component
5. **Node inactive** → Collider doesn't work if node is inactive
6. **Multiple colliders** → Only one should be trigger

## ✨ Working Example

Here's a complete working setup:

**Flag Prefab:**
```
Flag
├─ Transform: Position (0, 2, 0)
├─ Flag Component
├─ SphereCollider
│  ├─ isTrigger: true
│  ├─ radius: 2.0
│  └─ center: (0, 0, 0)
└─ FlagVisual (child)
   └─ MeshRenderer
```

**Player:**
```
Player
├─ Transform: Position (0, 0, 0)
├─ PlayerController Component
├─ CharacterController
│  ├─ radius: 0.5
│  └─ height: 2.0
└─ PlayerMesh (child)
```

**Physics Settings:**
- Layer 0 (Default) collides with Layer 0 ✓
- Gravity: (0, -9.8, 0)
- Physics enabled: true

## 🎮 Test Procedure

1. **Place flag in scene** at known position (e.g., 0, 2, 10)
2. **Run game**
3. **Check console** for "Flag: Collider found and listener attached"
4. **Move player** toward flag
5. **Watch console** for collision logs
6. **Verify collection** when player touches flag

If you follow this guide and still have issues, check:
- Cocos Creator version compatibility
- Physics engine settings
- Project-specific physics configuration
