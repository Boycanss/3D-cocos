# Floating Stat Display System

A 3D world-space UI system that displays health and stamina changes above the player's head with billboard behavior, tween animations, and automatic stacking.

## Features

✅ **Billboard Effect**: Always faces the camera using `node.lookAt()`
✅ **Color-Coded Display**:
- Light blue (RGB: 100, 200, 255) for increases
- Red (RGB: 255, 80, 80) for decreases
✅ **Icon + Text Display**: Shows stat icon with +/- value
✅ **Tween Animations**:
- Float up animation
- Pop-in scale effect
- Fade out animation
✅ **Bottom-Up Stacking**: Multiple displays stack vertically
✅ **3D World Space**: Positioned above player's head
✅ **Automatic Monitoring**: Tracks health and stamina changes

## Setup

### 1. Create the Display Node

In your scene hierarchy:
```
Scene
└── Player
    └── FloatingStatDisplay (Empty Node)
```

### 2. Add Component

1. Select the `FloatingStatDisplay` node
2. Add the **FloatingStatDisplay** component
3. Configure the properties (see below)

### 3. Configure Properties

#### Required References
- **Camera Node**: Assign your main camera node
- **Player Node**: Assign your player/character node
- **Health Icon**: Assign a sprite frame for health icon
- **Energy Icon**: Assign a sprite frame for stamina/energy icon

#### Display Settings
- **Vertical Spacing**: `0.4` - Space between stacked displays
- **Float Height**: `1.0` - How high displays float up
- **Display Duration**: `2.0` - How long displays last (seconds)

#### Visual Settings
- **Icon Scale**: `0.5` - Size of the icon in world space
- **Text Scale**: `0.015` - Size of the text in world space
- **Font Size**: `72` - Font size for the label

#### Position Settings
- **Head Offset**: `2.5` - Height above player's head
- **Enable Billboard**: `true` - Always face camera
- **Min Change Threshold**: `1` - Minimum change to display

## How It Works

### Billboard Behavior

The component uses Cocos Creator's `node.lookAt()` method to achieve billboard behavior:

```typescript
update(deltaTime: number) {
    if (this.enableBillboard && this.cameraNode) {
        this.node.lookAt(this.cameraNode.worldPosition);
    }
}
```

This ensures the display always faces the camera, making it readable from any angle.

### Automatic Stat Monitoring

The system automatically monitors health and stamina changes:

```typescript
private monitorStatChanges(): void {
    // Check health change
    if (currentHealth !== this._previousHealth) {
        const change = currentHealth - this._previousHealth;
        this.createFloatingDisplay('health', change);
    }
    
    // Check stamina change (with threshold)
    if (Math.abs(change) > this.minChangeThreshold) {
        this.createFloatingDisplay('stamina', change);
    }
}
```

### Display Creation

Each display consists of:
1. **Container Node**: Holds icon and text
2. **Icon Sprite**: Shows health or stamina icon
3. **Text Label**: Shows +/- value with color coding

### Animation Sequence

1. **Pop-in** (0.3s): Scale from 0.5 → 1.2 → 1.0
2. **Float up** (2.0s): Move upward by `floatHeight`
3. **Fade out** (1.2s): Fade to transparent after 40% of duration

### Stacking System

When multiple displays are active:
- New displays appear at the bottom
- Existing displays move up smoothly
- Each display maintains `verticalSpacing` distance
- Expired displays are removed automatically

## Manual Triggering

You can manually trigger stat displays from other scripts:

```typescript
// Get the FloatingStatDisplay component
const floatingStats = this.floatingStatDisplayNode.getComponent(FloatingStatDisplay);

// Show health increase
floatingStats.showStatChange('health', 25);

// Show stamina decrease
floatingStats.showStatChange('stamina', -15);
```

## Color Coding

### Increases (Light Blue)
- RGB: `(100, 200, 255)`
- Used for: Health restoration, stamina regeneration
- Prefix: `+`

### Decreases (Red)
- RGB: `(255, 80, 80)`
- Used for: Damage taken, stamina consumption
- Prefix: `-`

## Integration Examples

### Flag Collection System

When a flag restores health/stamina:

```typescript
// In FlagBuffManager or similar
const actor = this.playerNode.getComponent(Actor);
const floatingStats = this.floatingStatDisplayNode.getComponent(FloatingStatDisplay);

// Restore health
actor.heal(healthRestore);
floatingStats.showStatChange('health', healthRestore);

// Restore stamina
staminaManager.addStamina(staminaRestore);
floatingStats.showStatChange('stamina', staminaRestore);
```

### Damage System

When player takes damage:

```typescript
// In collision handler
actor.takeDamage(damageAmount);
// Display will automatically show (monitored by FloatingStatDisplay)
```

### Stamina Consumption

When performing actions:

```typescript
// In PlayerController
staminaManager.reduceStamina(Energy.DASH);
// Display will automatically show if change > minChangeThreshold
```

## Troubleshooting

### Display Not Appearing

**Check:**
- Camera Node is assigned
- Player Node is assigned
- Icons are assigned (SpriteFrame assets)
- Component is active and enabled

**Debug:**
```typescript
console.log('Camera:', this.cameraNode);
console.log('Player:', this.playerNode);
console.log('Health Icon:', this.healthIcon);
console.log('Energy Icon:', this.energyIcon);
```

### Display Not Facing Camera

**Check:**
- `enableBillboard` is set to `true`
- Camera Node reference is correct
- Camera is active in the scene

**Solution:**
The billboard effect uses `node.lookAt()` which requires a valid camera world position.

### Display Too Small/Large

**Adjust:**
- `iconScale`: Controls icon size (default: 0.5)
- `textScale`: Controls text size (default: 0.015)
- `fontSize`: Controls label font size (default: 72)

**Note:** World space UI requires different scaling than screen space UI.

### Display Too High/Low

**Adjust:**
- `headOffset`: Height above player's head (default: 2.5)

**Example:**
```typescript
// For taller characters
headOffset = 3.0;

// For shorter characters
headOffset = 2.0;
```

### Too Many Displays (Spam)

**Adjust:**
- `minChangeThreshold`: Minimum change to display (default: 1)

**Example:**
```typescript
// Only show changes > 5
minChangeThreshold = 5;

// Show all changes
minChangeThreshold = 0;
```

### Displays Not Stacking

**Check:**
- `verticalSpacing` is set correctly (default: 0.4)
- Multiple displays are being created
- `restackDisplays()` is being called in update

**Debug:**
```typescript
console.log('Active displays:', this._activeDisplays.length);
```

## Performance Considerations

### Optimization Tips

1. **Threshold**: Use `minChangeThreshold` to avoid spam from small changes
2. **Duration**: Shorter `displayDuration` = fewer active displays
3. **Pooling**: Consider object pooling for high-frequency displays

### Current Performance

- **Update Cost**: Minimal (lookAt + position update)
- **Memory**: Low (displays auto-cleanup after duration)
- **Draw Calls**: 2 per display (icon + text)

## Advanced Customization

### Custom Colors

Edit the color values in `createFloatingDisplay()`:

```typescript
// For increases
label.color = new Color(100, 200, 255, 255); // Light blue

// For decreases
label.color = new Color(255, 80, 80, 255); // Red
```

### Custom Animation

Modify `animateDisplay()` to change animation behavior:

```typescript
// Faster pop-in
tween(container)
    .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
    .to(0.05, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
    .start();

// Bounce effect
tween(container)
    .to(this.displayDuration, { position: endPos }, { easing: 'bounceOut' })
    .start();
```

### Custom Stat Types

Extend the system to support more stat types:

```typescript
// Add new stat type
type StatType = 'health' | 'stamina' | 'mana' | 'shield';

// Add new icon property
@property(SpriteFrame)
manaIcon: SpriteFrame = null;

// Update createFloatingDisplay to handle new type
if (statType === 'mana' && this.manaIcon) {
    iconSprite.spriteFrame = this.manaIcon;
}
```

## Technical Details

### Billboard Implementation

Cocos Creator doesn't have a built-in Billboard component, but the same effect is achieved using:

```typescript
node.lookAt(cameraWorldPosition);
```

This rotates the node to face the camera every frame, creating the billboard effect.

### World Space Positioning

The display is positioned in 3D world space:

```typescript
private updatePositionAbovePlayer(): void {
    const playerPos = this.playerNode.getWorldPosition();
    this.node.setWorldPosition(
        playerPos.x,
        playerPos.y + this.headOffset,
        playerPos.z
    );
}
```

### Stacking Algorithm

Displays stack from bottom to top:

```typescript
// New display at bottom
const stackY = this._activeDisplays.length * this.verticalSpacing;

// Restack when displays are removed
private restackDisplays(): void {
    for (let i = 0; i < this._activeDisplays.length; i++) {
        const targetY = i * this.verticalSpacing;
        // Smooth transition to new position
        tween(display.node)
            .to(0.3, { position: new Vec3(x, targetY, z) })
            .start();
    }
}
```

## Best Practices

1. **Icon Design**: Use clear, recognizable icons for health and stamina
2. **Threshold Tuning**: Adjust `minChangeThreshold` based on your game's stat ranges
3. **Duration Balance**: 2-3 seconds is ideal for readability without clutter
4. **Color Contrast**: Ensure colors are visible against your game's background
5. **Testing**: Test from different camera angles to ensure billboard works correctly

## Related Systems

- **Actor.ts**: Health management
- **StaminaManager.ts**: Stamina management
- **FlagBuffManager.ts**: Flag restoration system
- **PlayerController.ts**: Player actions and stamina consumption

## Version History

- **v1.0**: Initial implementation with basic display
- **v2.0**: Added billboard behavior, stacking, and enhanced animations
