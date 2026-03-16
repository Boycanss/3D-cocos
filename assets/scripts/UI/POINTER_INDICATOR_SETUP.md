# 3D Pointer Indicator Setup Guide

## Overview
The **PointerIndicator** is a 3D world-space indicator that points toward the current flag relative to the Main Character (MC). Unlike the old UI-based FlagIndicator, this new system uses a 3D model positioned in the game world.

## Features
- **3D Model Support**: Uses your pointer 3D asset (circle with pointed shape)
- **World-Space Positioning**: Positioned under the MC but NOT as a child node
- **Dynamic Rotation**: Rotates to always point toward the current flag
- **Distance-Based Visibility**: Fades and hides based on proximity to flag
- **Real-time Updates**: Updates every frame to track both MC and flag positions

## Setup Instructions

### Step 1: Prepare Your 3D Pointer Asset
1. Import your pointer 3D model into the project
2. The model should have:
   - A circular base
   - A pointed shape on one side (the direction indicator)
   - Default forward direction along the Z-axis (standard Cocos Creator convention)

### Step 2: Create Pointer Node in Scene
1. In your game scene, create a new **3D Node** (not a child of the MC)
2. Name it something like `PointerIndicator` or `FlagPointer`
3. Add your 3D pointer model as a child of this node
4. Position it at ground level (Y = 0.5 approximately)
5. **Important**: Do NOT make this a child of the player node

### Step 3: Add PointerIndicator Component
1. Select the pointer node you created
2. Add the **PointerIndicator** component to it
3. Configure the properties:

#### Required Properties
- **Player Node**: Drag the MC node here
- **Flag Manager**: Drag the GameManager node (which has FlagManager component)

#### Optional Properties (with defaults)
- **Height Offset** (default: 0.5): Height above ground where pointer is positioned
- **Distance From Player** (default: 2.0): How far from player center the pointer appears
- **Hide Distance** (default: 10): Distance at which pointer completely hides
- **Fade Distance** (default: 20): Distance at which pointer starts fading in/out

### Step 4: Remove Old FlagIndicator (Optional)
If you want to completely replace the old UI-based FlagIndicator:
1. Find and disable/remove the old FlagIndicator component
2. Or keep both if you want both UI and 3D indicators

## How It Works

### Position Update
- Pointer is positioned at a fixed distance from the MC in the direction of the flag
- Height is set to `heightOffset` above ground
- Position updates every frame to follow the MC

### Rotation Update
- Pointer rotates around the Y-axis to face the flag
- Rotation is calculated using `atan2` for smooth directional pointing
- Only horizontal direction is considered (Y-axis ignored)

### Visibility Logic
```
If distance to flag < hideDistance:
  → Pointer is hidden (active = false)

Else if distance to flag < fadeDistance:
  → Pointer is visible but scaled down (fading effect)
  → Scale increases as distance increases

Else:
  → Pointer is fully visible at full scale
```

## Configuration Examples

### Subtle Indicator (Close to Player)
```
Height Offset: 0.3
Distance From Player: 1.5
Hide Distance: 8
Fade Distance: 15
```

### Prominent Indicator (Far from Player)
```
Height Offset: 1.0
Distance From Player: 3.5
Hide Distance: 12
Fade Distance: 25
```

### Aggressive Indicator (Always Visible)
```
Height Offset: 0.5
Distance From Player: 2.0
Hide Distance: 5
Fade Distance: 10
```

## Public API

### Methods
```typescript
// Show or hide the pointer manually
setVisible(visible: boolean): void

// Get current distance to flag
getDistanceToFlag(): number

// Check if pointer is currently visible
isVisible(): boolean
```

### Example Usage
```typescript
// In another script
const pointerIndicator = this.node.getComponent(PointerIndicator);

// Hide pointer
pointerIndicator.setVisible(false);

// Check distance
const distance = pointerIndicator.getDistanceToFlag();
if (distance < 5) {
    console.log("Flag is very close!");
}

// Check visibility
if (pointerIndicator.isVisible()) {
    console.log("Pointer is currently visible");
}
```

## Troubleshooting

### Pointer Not Appearing
- Check that `pointerNode` is assigned in the inspector
- Verify the pointer node is active in the scene
- Ensure FlagManager has an active flag spawned
- Check that distance to flag is greater than `hideDistance`

### Pointer Not Rotating Correctly
- Verify your 3D model's default forward direction is along Z-axis
- Check that the pointer node's rotation is not locked
- Ensure the flag position is being updated correctly

### Pointer Appearing in Wrong Position
- Adjust `heightOffset` to match your ground level
- Adjust `distanceFromPlayer` to position it correctly relative to MC
- Verify player node position is being updated correctly

### Performance Issues
- The component updates every frame - this is intentional for smooth tracking
- If performance is an issue, consider reducing update frequency
- Check that you don't have multiple PointerIndicator components running

## Migration from FlagIndicator

If you're replacing the old UI-based FlagIndicator:

1. **Keep the old component** for now (it won't interfere)
2. **Test the new PointerIndicator** thoroughly
3. **Once satisfied**, disable/remove the old FlagIndicator
4. **Update any code** that references FlagIndicator to use PointerIndicator instead

## Notes

- The pointer is positioned in world space, not UI space
- It will be affected by camera position and rotation
- The pointer rotates only around the Y-axis (vertical axis)
- Distance calculations use 3D world coordinates
- The pointer is NOT a child of the player, so it won't follow player rotation

## Future Enhancements

Possible improvements:
- Add pulsing animation when flag is very close
- Add sound effects when pointer points at flag
- Add trail effect following the pointer
- Add different pointer models for different flag levels
- Add arrow/line connecting pointer to flag
