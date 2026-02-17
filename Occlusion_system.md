# Occlusion System Documentation

## Overview
This documentation describes the occlusion system implemented in the Parkour game project. The system handles camera occlusion by hiding objects that block the line of sight between the camera and player, preventing visual artifacts while maintaining performance.

## System Components

### CameraController.ts
The main controller that manages the occlusion detection and state management.

#### Key Features:
- Uses raycasting to detect objects blocking the camera-player line
- Implements a delay-based restoration system to prevent flickering
- Tracks hidden nodes and their restoration timers
- Uses frame confirmation to ensure stable occlusion detection
- Supports both direct node manipulation and Occludable component usage

#### Core Logic:
1. **Raycasting**: Casts rays from camera to player to detect occluding objects
2. **Frame Confirmation**: Requires objects to be hit consistently for 2 frames before hiding
3. **State Management**: 
   - Only changes `node.active` when actual state transitions occur
   - Uses `Set<Node>` for fast lookup of hidden nodes and current hits
   - Uses `Map<Node, number>` for per-node restoration timers
4. **Delay Restoration**: Objects are restored after 0.25 seconds of no occlusion
5. **Performance Optimization**: 
   - Only processes state changes when necessary
   - Clears timers and data structures each frame
   - Prevents unnecessary toggling of active states

### Occludable.ts
Component that can be attached to nodes to handle their occlusion behavior.

#### Key Features:
- Stores original active state for restoration
- Handles occlusion state changes through `setOccluded()` method
- Provides `resetOcclusion()` method to restore original state
- Works alongside CameraController for consistent occlusion behavior

#### Core Logic:
1. **State Tracking**: Stores the original active state in `_originalActiveState`
2. **Occlusion Control**: 
   - `setOccluded(true)` - Deactivates the node
   - `setOccluded(false)` - Restores the original active state
3. **Prevention of Unnecessary Changes**: Only changes node state when transitioning between active/inactive states

## System Flow

### Update Cycle:
1. **Clear Frame Data**: Reset current hits and previous hits sets
2. **Raycast**: Cast rays from camera to player to detect occluding objects
3. **Frame Confirmation**: Track how long objects have been hit (require 2 consecutive frames)
4. **Hide New Occluders**: 
   - Cancel pending restores for hit objects
   - Hide objects that are newly detected as occluders
5. **Handle Restore**: 
   - For hidden objects not currently hit:
     - Start restore timer if not already started
     - When timer expires, restore object to original state

## Performance Considerations

### Optimizations:
- **Set-based Lookups**: Uses `Set<Node>` for O(1) lookup of hidden nodes and current hits
- **Map-based Timers**: Uses `Map<Node, number>` for per-node timer management
- **State Change Prevention**: Only changes `node.active` when actual state transitions occur
- **Frame Confirmation**: Prevents flickering by requiring consistent hits over multiple frames
- **Timer Management**: Properly cleans up timers to prevent memory leaks

### Best Practices:
- Never toggle `node.active` every frame
- Only hide root building nodes (as per project structure)
- Use delay mechanism to prevent flickering
- Implement proper state transition checks

## Usage Guidelines

### For Objects:
1. Attach `Occludable` component to nodes that should be hidden during occlusion
2. Ensure objects are properly configured with collision detection
3. The system will automatically manage the active state

### For CameraController:
1. Assign the player target node
2. Configure movement speed and offset
3. The system will automatically handle occlusion detection and restoration

## Technical Details

### Data Structures:
- `_hiddenNodes`: `Set<Node>` - Tracks currently hidden nodes
- `_restoreTimers`: `Map<Node, number>` - Tracks restoration timers for each node
- `_currentHits`: `Set<Node>` - Tracks nodes hit in current frame
- `_hitFrameCounter`: `Map<Node, number>` - Tracks how many consecutive frames each node has been hit

### Constants:
- `_restoreDelay`: 0.25 seconds - Delay before restoring nodes
- `_hitConfirmationFrames`: 2 frames - Required consecutive hits to trigger occlusion

### Methods:
- `setOccluded(isOccluded: boolean)`: Controls occlusion state of node
- `resetOcclusion()`: Restores original node state
- `update(deltaTime)`: Main update loop handling occlusion detection and state management

## Error Prevention
- Checks for existing timers before creating new ones
- Verifies node state before changing `node.active`
- Properly cleans up data structures each frame
- Prevents duplicate state changes through careful conditional logic

This system provides a robust, performance-optimized solution for camera occlusion that prevents flickering while maintaining visual quality.
