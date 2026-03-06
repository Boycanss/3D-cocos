# Game Flow Manager Setup Guide

This guide explains how to implement the instant play/replay game flow system.

## Overview

The system provides:
- **Start State**: Player can drag character anywhere on map, then press play
- **Playing State**: Normal gameplay with camera following player
- **Instant Replay**: Game over immediately returns to start state

## Components

### 1. GameFlowManager
Main controller that manages game states and transitions.

### 2. PlayerPlacementHandler
Handles player drag & drop validation and visual feedback.

### 3. StartScreenUI
Manages start screen UI elements and animations.

## Scene Setup

### Step 1: UI Hierarchy (Your Current Scene Structure ✅)

Your existing structure is perfect:
```
UI (Canvas - Screen Space) ✅
├── Gameplay_UI (Container) ✅ Already exists
│   ├── Stamina ✅
│   ├── Health ✅ 
│   ├── Debug UI ✅
│   ├── GameIndicator ✅
│   ├── Stats ✅
│   └── TouchControls (if using mobile)
├── StartScreen_UI (Container) ✅ Already exists
│   ├── PlayButton ✅ Already exists
│   ├── AYOLogo ✅ Already exists
│   └── Instruction ✅ Already exists
```

**Your UI structure is already correctly set up!**

### Step 2: Setup GameFlowManager

1. **Add GameFlowManager component** to your existing **GameManager** node

2. **Assign References (based on your scene):**
   - `gameplayCamera`: **Main Camera** node
   - `cameraController`: **Main Camera's CameraController** component  
   - `playerNode`: **MainCharacter** node
   - `playgroundNode`: **PlayGround** node
   - `gameManager`: **GameManager's GameManager** component (same node)
   - `gameplayUIContainer`: **Gameplay_UI** node
   - `startScreenUI`: **StartScreen_UI's StartScreenUI** component (add this first)
   - `placementHandler`: **GameManager's PlayerPlacementHandler** component (add this first)

3. **Configure Camera Settings:**
   - `gameplayCameraRotation`: (-35, -45, 0)
   - `gameplayCameraOrthoHeight`: 5.1
   - `startScreenCameraRotation`: (-45, -45, 0) 
   - `startScreenCameraOrthoHeight`: 15.0

4. **Configure Transitions:**
   - `cameraTransitionDuration`: 1.0
   - `uiTransitionDuration`: 0.5

### Step 3: Setup PlayerPlacementHandler

1. **Add PlayerPlacementHandler component** to a GameObject

2. **Assign References:**
   - `playerNode`: Player character
   - `playgroundNode`: Playground bounds
   - `placementIndicator`: Visual feedback node (optional)

3. **Configure Validation:**
   - `validationRadius`: 1.0
   - `validColor`: Green (0, 255, 0, 100)
   - `invalidColor`: Red (255, 0, 0, 100)

### Step 4: Setup StartScreenUI

1. **Add StartScreenUI component** to your existing **StartScreen_UI** node

2. **Assign References (based on your scene):**
   - `playButton`: **PlayButton's Button** component
   - `gameLogo`: **AYOLogo** node
   - `instructionLabel`: **Instruction's Label** component
   - `bestTimeDisplay`: Create new Label node or use existing (optional)
   - `startScreenContainer`: **StartScreen_UI** node (self-reference)

3. **Configure Animations:**
   - `logoPulseScale`: 1.1
   - `logoPulseDuration`: 2.0
   - `buttonHoverScale`: 1.05
   - `fadeDuration`: 0.3

## Player Setup

### Enable Drag & Drop

The player node needs:
1. **Collider component** for touch/mouse detection
2. **Input events enabled** (handled automatically by GameFlowManager)

### Character Controller

Ensure the player has:
- `CapsuleCharacterController` for physics
- `PlayerController` for movement
- Proper collision layers set up

## Playground Setup

The playground node should:
1. **Define bounds** for player placement
2. **Have appropriate scale** for constraint calculations
3. **Be positioned** to encompass the playable area

## Obstacle Integration

Obstacles need:
1. **Box component** with proper `ObstacleType`
2. **Colliders** for placement validation
3. **Proper physics layers**

## Testing Checklist

### Start State
- [ ] Camera zooms out to show full map
- [ ] Player can be dragged around
- [ ] Invalid placements are rejected
- [ ] UI elements hide/show during drag
- [ ] Play button works

### Playing State
- [ ] Camera smoothly transitions to gameplay view
- [ ] Camera follows player
- [ ] Gameplay UI appears
- [ ] Player controls work
- [ ] Game timer starts

### Game Over
- [ ] Returns to start state
- [ ] Player position is preserved
- [ ] UI resets properly
- [ ] Best time updates

## Customization

### Camera Behavior
Adjust camera settings in GameFlowManager:
- Start screen height for map overview
- Gameplay settings for optimal play view
- Transition duration for smooth feel

### Placement Validation
Modify PlayerPlacementHandler:
- Validation radius for collision checking
- Ground detection sensitivity
- Visual feedback style

### UI Animations
Customize StartScreenUI:
- Logo pulse animation
- Button hover effects
- Transition timings

## Troubleshooting

### Player Won't Drag
- Check if player node has collider
- Verify input events are enabled
- Ensure GameFlowManager is in START state

### Invalid Placement Always
- Check obstacle collision layers
- Verify Box components on obstacles
- Adjust validation radius

### Camera Not Following
- Ensure CameraController is assigned
- Check camera target is set to player
- Verify camera transitions complete

### UI Not Showing
- Check UI container active states
- Verify StartScreenUI component setup
- Ensure proper Canvas configuration

## Performance Notes

- Placement validation uses raycasting - limit frequency if needed
- Camera transitions use tweening - adjust duration for performance
- UI animations can be disabled for low-end devices

## Integration with Existing Code

The system integrates with:
- **GameManager**: Timer and game over events
- **PlayerController**: Enable/disable during states
- **TouchControlManager**: Show/hide touch controls
- **Existing UI**: Gameplay elements container

No changes needed to core gameplay mechanics - only state management.