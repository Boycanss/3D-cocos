# Flag Indicator System - Setup Guide

## Overview
The Flag Indicator system provides an off-screen arrow that points to the current flag's location, helping players navigate to collectibles that are outside their view.

## Components

### 1. FlagIndicator
**Location:** `assets/scripts/UI/FlagIndicator.ts`

Main component that displays an arrow pointing to the flag when it's off-screen.

**Features:**
- Shows arrow only when flag is off-screen
- Automatically hides when flag is on-screen or too close
- Arrow rotates to point at flag location
- Pulsing animation for visibility
- Fades based on distance
- Clamped to screen edges with margin

### 2. FlagDistanceDisplay (Optional)
**Location:** `assets/scripts/UI/FlagDistanceDisplay.ts`

Optional component to display the distance to the flag in meters.

## Setup Instructions

### Step 1: Create Arrow Sprite/Image

1. **Import an arrow image** into your project (or create one)
   - Recommended: Simple arrow pointing right →
   - Format: PNG with transparency
   - Size: 64x64 or 128x128 pixels

2. **Create a Sprite Frame** from your arrow image

### Step 2: Setup UI Canvas

Your UI hierarchy should look like this:

```
Canvas (Screen Space)
├─ FlagIndicatorNode (empty node)
│  ├─ FlagIndicator Component
│  └─ ArrowSprite (Sprite node)
│     ├─ Sprite Component
│     └─ UIOpacity Component (auto-added)
│
└─ DistanceLabel (optional)
   ├─ Label Component
   └─ FlagDistanceDisplay Component
```

### Step 3: Create the Indicator Node

1. **In your Canvas**, create a new empty node called `FlagIndicatorNode`
2. Set its position to (0, 0, 0) - center of screen
3. Make sure it has a **UITransform** component

### Step 4: Create the Arrow Sprite

1. **Create a child node** under `FlagIndicatorNode` called `ArrowSprite`
2. Add a **Sprite** component
3. Assign your arrow sprite frame
4. Set the sprite size (e.g., 64x64)
5. **Important:** Make sure the arrow image points **RIGHT** (→) by default

### Step 5: Add FlagIndicator Component

1. Select `FlagIndicatorNode`
2. Add the **FlagIndicator** component
3. Configure properties:

**Required References:**
- **Player Node**: Assign your player/main character node
- **Main Camera**: Assign your main camera
- **Flag Manager**: Assign the FlagManager component (from GameManager)
- **Arrow Node**: Assign the ArrowSprite node you created

**Optional Settings:**
- **Edge Margin**: 50 (distance from screen edge)
- **Fade Distance**: 20 (distance at which arrow starts fading)
- **Hide Distance**: 10 (distance at which arrow hides completely)
- **Arrow Scale**: 1.0 (base size)
- **Pulse Speed**: 2.0 (animation speed)
- **Pulse Amount**: 0.2 (scale variation)

### Step 6: Optional Distance Display

1. Create a **Label** node in your Canvas
2. Position it where you want (e.g., top center)
3. Add the **FlagDistanceDisplay** component
4. Configure:
   - **Player Node**: Assign player
   - **Flag Manager**: Assign FlagManager
   - **Distance Label**: Assign the Label component
   - **Show Distance**: true
   - **Decimal Places**: 1
   - **Prefix Text**: "Distance: " (optional)
   - **Suffix Text**: "m"

## How It Works

### Arrow Behavior

**When Flag is Off-Screen:**
- Arrow appears at screen edge
- Points toward flag location
- Pulses to draw attention
- Rotates as player/flag moves

**When Flag is On-Screen:**
- Arrow automatically hides
- No visual clutter

**When Player is Close:**
- Arrow fades out (< 20m by default)
- Completely hides (< 10m by default)

### Technical Details

**Screen Space Conversion:**
```typescript
// Converts 3D world position to 2D screen position
this.mainCamera.convertToUINode(flagPos, this.node, flagScreenPos);
```

**Edge Clamping:**
- Arrow stays within screen bounds
- Respects edge margin setting
- Smooth positioning

**Rotation Calculation:**
```typescript
// Arrow rotates to point at flag
const angle = Math.atan2(flagScreenPos.y - clampedPos.y, flagScreenPos.x - clampedPos.x);
```

## Customization

### Change Arrow Appearance

**Different Colors:**
- Use different sprite frames for different flag levels
- Modify sprite color in the Sprite component

**Different Sizes:**
- Adjust `arrowScale` property
- Modify sprite size in UITransform

**Different Animation:**
- Adjust `pulseSpeed` for faster/slower pulsing
- Adjust `pulseAmount` for more/less scale change

### Modify Behavior

**Change Fade Distances:**
```typescript
// In FlagIndicator inspector
fadeDistance: 30  // Start fading at 30m
hideDistance: 15  // Hide completely at 15m
```

**Change Edge Margin:**
```typescript
edgeMargin: 100  // Arrow stays 100 pixels from edge
```

**Disable Pulsing:**
```typescript
pulseAmount: 0  // No pulsing animation
```

## Advanced Features

### Add Level-Based Colors

Modify `FlagIndicator.update()` to change arrow color based on flag level:

```typescript
const currentFlag = this.flagManager.getCurrentFlag();
const flagComponent = currentFlag.getComponent(Flag);
const flagLevel = flagComponent.getFlagLevel();

// Change arrow color based on level
switch(flagLevel) {
    case FlagLevel.LEVEL1:
        this._arrowSprite.color = new Color(255, 255, 255); // White
        break;
    case FlagLevel.LEVEL5:
        this._arrowSprite.color = new Color(255, 215, 0); // Gold
        break;
}
```

### Add Distance-Based Urgency

Make the arrow pulse faster when closer:

```typescript
private updatePulseAnimation(distance: number, deltaTime: number): void {
    // Pulse faster when closer
    const urgencyMultiplier = Math.max(1, 30 / distance);
    this._pulseTimer += deltaTime * this.pulseSpeed * urgencyMultiplier;
    
    const pulseScale = 1 + Math.sin(this._pulseTimer) * this.pulseAmount;
    const finalScale = this.arrowScale * pulseScale;
    this.arrowNode.setScale(finalScale, finalScale, 1);
}
```

### Add Sound Effects

Play a sound when arrow appears/disappears:

```typescript
if (isOnScreen) {
    if (this.arrowNode.active) {
        // Play "target in sight" sound
        this.arrowNode.active = false;
    }
} else {
    if (!this.arrowNode.active) {
        // Play "target off screen" sound
        this.arrowNode.active = true;
    }
}
```

## Troubleshooting

**Arrow not appearing:**
- Check that all references are assigned (Player, Camera, FlagManager, ArrowNode)
- Verify flag exists (check FlagManager.hasActiveFlag())
- Ensure Canvas is in Screen Space mode
- Check that arrow sprite is visible (not transparent)

**Arrow pointing wrong direction:**
- Make sure arrow image points RIGHT (→) by default
- Check camera orientation
- Verify UITransform is on FlagIndicatorNode

**Arrow not rotating:**
- Check that ArrowNode has proper pivot point (center)
- Verify rotation calculations in console

**Arrow stuck at edge:**
- Check edgeMargin value
- Verify screen size calculations
- Check UITransform size

**Distance display not showing:**
- Verify Label component is assigned
- Check that showDistance is true
- Ensure FlagManager has active flag

## Example Configuration

**For a 1920x1080 screen:**
```
Edge Margin: 80
Fade Distance: 25
Hide Distance: 12
Arrow Scale: 1.2
Pulse Speed: 2.5
Pulse Amount: 0.15
```

**For mobile (smaller screen):**
```
Edge Margin: 40
Fade Distance: 20
Hide Distance: 10
Arrow Scale: 0.8
Pulse Speed: 3.0
Pulse Amount: 0.2
```

## Performance Notes

- Indicator updates every frame but is lightweight
- Only active when flag exists
- Automatically disabled when not needed
- No physics calculations, only math operations
