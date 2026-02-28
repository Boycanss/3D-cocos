# CharacterController Collision Fix

## The Problem

**CharacterController doesn't trigger standard `onTriggerEnter` events!**

Your player uses `CharacterController` which has its own collision system:
- Uses `onControllerTriggerEnter` event
- Doesn't fire regular `onTriggerEnter` events
- This is why the flag wasn't being collected

## The Solution

We've implemented a **dual detection system** that works with both:
1. **CharacterController** (your player) - via event emission
2. **Regular Colliders** (other objects) - via standard triggers

### How It Works

**PlayerController detects flag collision:**
```typescript
private onControllerColliderHit(contact: CharacterControllerContact) {
    const hitNode = contact.collider.node;
    
    // Check for Flag collision first
    const Flag = hitNode.getComponent('Flag');
    if (Flag) {
        // Emit event to flag
        hitNode.emit('player-collision', this);
        return;
    }
    
    // Handle other collisions (obstacles, etc.)
    // ...
}
```

**Flag listens for both methods:**
```typescript
start() {
    // Method 1: Standard trigger (for regular colliders)
    collider.on('onTriggerEnter', this.onTriggerEnter, this);
    
    // Method 2: CharacterController event (for player)
    this.node.on('player-collision', this.onPlayerCollision, this);
}
```

## What Changed

### PlayerController.ts
- Added flag detection in `onControllerColliderHit()`
- Emits `'player-collision'` event when hitting a flag
- Added console logs for debugging

### Flag.ts
- Added `onPlayerCollision()` method for CharacterController
- Kept `onTriggerEnter()` as fallback for regular colliders
- Both methods call the same `collectFlag()` function
- Added detailed logging

## Testing

**Run your game and check console:**

1. **When player touches flag:**
   ```
   PlayerController: Collided with Flag
   PlayerController: Hit a Flag!
   Flag: onPlayerCollision called. IsCollected: false
   >>>>>> Flag Collected via CharacterController!
   Flag Level X collected!
   ```

2. **If using regular collider (not CharacterController):**
   ```
   Flag: onTriggerEnter called. IsCollected: false
   Flag: Collided with node: Player
   >>>>>> Flag Collected via Trigger!
   ```

## Why This Works

**CharacterController Collision Flow:**
```
Player moves → CharacterController detects collision
    ↓
onControllerTriggerEnter fires
    ↓
PlayerController.onControllerColliderHit() called
    ↓
Checks if hit node has Flag component
    ↓
Emits 'player-collision' event to flag node
    ↓
Flag.onPlayerCollision() receives event
    ↓
Flag collected!
```

## Collider Requirements

**Flag must have:**
- ✓ Collider component (CylinderCollider, SphereCollider, BoxCollider, etc.)
- ✓ isTrigger = true
- ✓ Appropriate size (radius/size ≥ 2.0)
- ✓ Flag component

**Player must have:**
- ✓ CharacterController component
- ✓ PlayerController component
- ✓ Appropriate collision layers

## Supported Collider Types

CharacterController can collide with **ALL** collider types:
- ✓ BoxCollider
- ✓ SphereCollider
- ✓ CylinderCollider ← **Yes, this works!**
- ✓ CapsuleCollider
- ✓ MeshCollider
- ✓ Any other collider type

## Benefits of This Approach

1. **Works with CharacterController** - Primary use case
2. **Backward compatible** - Still works with regular colliders
3. **Flexible** - Can be used by other systems
4. **Debuggable** - Extensive logging for troubleshooting
5. **Clean** - Doesn't modify core collision system

## Common Issues

**Still not working?**

1. **Check console logs** - Should see "PlayerController: Collided with..."
2. **Verify collider size** - Make it bigger (radius = 2.0+)
3. **Check isTrigger** - Must be checked ✓
4. **Verify layers** - Player and Flag must be on compatible layers
5. **Check node active** - Flag node must be active

**No console logs at all?**
- Collider might be too small
- Physics layers not set up correctly
- Flag node might be inactive

**Logs show collision but no collection?**
- Check if `_isCollected` is already true
- Verify PlayerController component exists
- Check FlagBuffManager is on player node

## Alternative Approach (Not Used)

We could have also:
- Made Flag check distance to player every frame (less efficient)
- Used a separate trigger collider on player (more complex)
- Modified CharacterController settings (not recommended)

The event-based approach is cleaner and more performant.
