# Billboard Effect Explanation

## What is a Billboard?

A **billboard** is a 3D object that always faces the camera, regardless of the camera's position or rotation. This technique is commonly used for:
- Health bars in 3D games
- Floating damage numbers
- Name tags above characters
- UI elements in 3D space

## Why Use Billboard for Stat Display?

Without billboard behavior, the stat display would:
- Be unreadable from certain angles
- Appear backwards when camera is behind it
- Look distorted when viewed from the side

With billboard behavior, the stat display:
- Always faces the camera
- Remains readable from any angle
- Maintains consistent appearance

## Visual Example

```
Top View (Looking Down):

Without Billboard:
    Camera
      |
      v
    [+25]  ← Display faces forward (unreadable from this angle)
      ↑
    Player

With Billboard:
    Camera
      |
      v
    [+25]  ← Display rotates to face camera (readable!)
      ↑
    Player


Side View:

Without Billboard:
    Camera → [+25]  ← Display faces forward (sideways to camera)
               ↑
             Player

With Billboard:
    Camera → [+25]  ← Display rotates to face camera
               ↑
             Player
```

## How It Works in Cocos Creator

Cocos Creator doesn't have a built-in Billboard component, but we achieve the same effect using the `lookAt()` method:

```typescript
update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        // Make this node look at the camera's world position
        this.node.lookAt(this.cameraNode.worldPosition);
    }
}
```

### Step-by-Step Process

1. **Get Camera Position**: `this.cameraNode.worldPosition`
2. **Rotate Node**: `this.node.lookAt(cameraPosition)`
3. **Result**: Node's forward direction points at camera

## Technical Details

### lookAt() Method

The `lookAt()` method:
- Takes a target position (Vec3)
- Rotates the node to face that position
- Updates the node's rotation quaternion
- Happens every frame in `update()`

### Performance

**Cost per frame:**
- 1 world position lookup
- 1 lookAt calculation
- Minimal performance impact

**Optimization:**
- Only runs when `enableBillboard` is true
- Can be disabled for static displays
- No additional draw calls

## Comparison with Other Approaches

### Approach 1: Manual Rotation (Not Recommended)
```typescript
// Calculate direction vector
const direction = Vec3.subtract(new Vec3(), cameraPos, nodePos);
// Calculate rotation angles
const rotation = Quat.fromViewUp(new Quat(), direction, Vec3.UP);
// Apply rotation
this.node.setRotation(rotation);
```
**Pros:** More control
**Cons:** Complex, error-prone, more code

### Approach 2: lookAt() (Recommended)
```typescript
this.node.lookAt(this.cameraNode.worldPosition);
```
**Pros:** Simple, reliable, one line
**Cons:** None

### Approach 3: Screen Space UI (Alternative)
Use Canvas with Screen Space mode instead of world space.
**Pros:** No billboard needed
**Cons:** Can't position in 3D world, harder to integrate with 3D gameplay

## When to Use Billboard

### Good Use Cases ✅
- Floating damage numbers
- Health/stamina displays
- Name tags above characters
- Collectible indicators
- Quest markers
- Interaction prompts

### Bad Use Cases ❌
- Static UI elements (use Canvas instead)
- Elements that should rotate with objects
- Elements that need to face a specific direction
- Performance-critical scenarios with hundreds of billboards

## Customization Options

### Enable/Disable Billboard

```typescript
@property({ tooltip: 'Enable billboard effect (always face camera)' })
enableBillboard: boolean = true;
```

Set to `false` if you want the display to:
- Face a fixed direction
- Rotate with the player
- Use custom rotation logic

### Partial Billboard (Y-axis only)

For displays that should only rotate horizontally:

```typescript
update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        const cameraPos = this.cameraNode.worldPosition.clone();
        const nodePos = this.node.worldPosition.clone();
        
        // Only use X and Z (ignore Y)
        cameraPos.y = nodePos.y;
        
        this.node.lookAt(cameraPos);
    }
}
```

## Testing Billboard Behavior

### Test Checklist

1. **Front View**: Display should be readable
2. **Back View**: Display should flip to face camera
3. **Side View**: Display should rotate to face camera
4. **Moving Camera**: Display should smoothly track camera
5. **Multiple Angles**: Test from various positions

### Debug Visualization

Add debug lines to visualize the billboard effect:

```typescript
import { gfx } from 'cc';

update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        this.node.lookAt(this.cameraNode.worldPosition);
        
        // Debug: Draw line from display to camera
        const start = this.node.worldPosition;
        const end = this.cameraNode.worldPosition;
        // Use Cocos Creator's debug draw (if available)
    }
}
```

## Common Issues

### Issue 1: Display Upside Down
**Cause:** Node's up vector is incorrect
**Solution:** Ensure node's local rotation is (0, 0, 0) initially

### Issue 2: Display Jittering
**Cause:** Camera and display updating in wrong order
**Solution:** Use `lateUpdate()` instead of `update()`

```typescript
lateUpdate(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        this.node.lookAt(this.cameraNode.worldPosition);
    }
}
```

### Issue 3: Display Not Rotating
**Cause:** Camera node reference is null or invalid
**Solution:** Check that `cameraNode` is assigned in Inspector

### Issue 4: Display Rotates Strangely
**Cause:** Parent node has rotation/scale
**Solution:** Ensure parent node has identity transform

## Advanced: Billboard with Constraints

### Lock Y-Axis Rotation
```typescript
update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        const cameraPos = this.cameraNode.worldPosition.clone();
        const nodePos = this.node.worldPosition.clone();
        
        // Keep same Y level
        cameraPos.y = nodePos.y;
        
        this.node.lookAt(cameraPos);
    }
}
```

### Smooth Billboard (Lerp)
```typescript
update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        const targetRotation = new Quat();
        const direction = Vec3.subtract(new Vec3(), 
            this.cameraNode.worldPosition, 
            this.node.worldPosition
        );
        Quat.fromViewUp(targetRotation, direction, Vec3.UP);
        
        // Smooth rotation
        const currentRotation = this.node.rotation;
        Quat.slerp(currentRotation, currentRotation, targetRotation, deltaTime * 5);
        this.node.setRotation(currentRotation);
    }
}
```

## References

- Cocos Creator Node API: `node.lookAt()`
- Cocos Creator Transform System
- Billboard technique in 3D graphics
- World space vs Screen space UI

## Summary

**Billboard Effect:**
- Makes 3D objects always face the camera
- Essential for readable world-space UI
- Implemented with `node.lookAt()` in Cocos Creator
- Minimal performance cost
- Easy to enable/disable

**For FloatingStatDisplay:**
- Ensures stat changes are always readable
- Works from any camera angle
- Updates every frame automatically
- Can be disabled if needed
