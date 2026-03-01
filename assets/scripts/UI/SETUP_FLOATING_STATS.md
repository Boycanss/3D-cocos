# Quick Setup Guide: Floating Stat Display

Follow these steps to add the floating stat display system to your player character.

## Step 1: Create the Node Hierarchy

In your scene hierarchy, add a new empty node under your player:

```
Scene
└── Player (your player node)
    └── FloatingStatDisplay (NEW - Empty Node)
```

**How to create:**
1. Right-click on your Player node
2. Select "Create Empty Node"
3. Rename it to "FloatingStatDisplay"

## Step 2: Add the Component

1. Select the `FloatingStatDisplay` node
2. In the Inspector panel, click "Add Component"
3. Search for "FloatingStatDisplay"
4. Click to add the component

## Step 3: Assign Required References

In the FloatingStatDisplay component properties:

### Required (Must Assign)
- **Camera Node**: Drag your main camera node here
- **Player Node**: Drag your player node here
- **Health Icon**: Assign a sprite frame for health (e.g., heart icon)
- **Energy Icon**: Assign a sprite frame for stamina (e.g., lightning icon)

### Optional (Can Use Defaults)
- **Vertical Spacing**: `0.4` (space between stacked displays)
- **Float Height**: `1.0` (how high displays float)
- **Display Duration**: `2.0` (how long displays last)
- **Icon Scale**: `0.5` (icon size)
- **Text Scale**: `0.015` (text size)
- **Font Size**: `72` (label font size)
- **Head Offset**: `2.5` (height above player's head)
- **Enable Billboard**: `✓` (always face camera)
- **Min Change Threshold**: `1` (minimum change to display)

## Step 4: Create Icon Assets (If Needed)

If you don't have health/stamina icons:

1. Import icon images to your project
2. Set texture type to "Sprite Frame"
3. Assign them to the component

**Recommended icon sizes:** 128x128 or 256x256 pixels

## Step 5: Test

Run your game and:
- Take damage → Should see red "-X" with health icon
- Collect flag → Should see blue "+X" with health icon
- Use stamina → Should see red "-X" with energy icon
- Regenerate stamina → Should see blue "+X" with energy icon

## Troubleshooting

### Nothing appears
- Check that Camera Node and Player Node are assigned
- Check that icons are assigned
- Check console for errors

### Display too small/large
- Adjust `iconScale` and `textScale`
- Try: iconScale = 0.3 to 0.8, textScale = 0.01 to 0.02

### Display too high/low
- Adjust `headOffset`
- Try: 2.0 to 3.5 depending on character height

### Too many displays (spam)
- Increase `minChangeThreshold` to 5 or 10
- This filters out small stamina regen ticks

## Manual Triggering (Optional)

To manually show stat changes from your code:

```typescript
// Get the component
const floatingStats = this.floatingStatDisplayNode.getComponent(FloatingStatDisplay);

// Show health change
floatingStats.showStatChange('health', 25);  // +25 health (blue)
floatingStats.showStatChange('health', -10); // -10 health (red)

// Show stamina change
floatingStats.showStatChange('stamina', 30);  // +30 stamina (blue)
floatingStats.showStatChange('stamina', -15); // -15 stamina (red)
```

## Features You Get

✅ Automatic monitoring of health and stamina changes
✅ Color-coded displays (blue = increase, red = decrease)
✅ Billboard effect (always faces camera)
✅ Smooth tween animations (float up, pop-in, fade out)
✅ Bottom-up stacking for multiple displays
✅ 3D world space positioning above player's head

## Next Steps

- Read `README_FLOATING_STATS.md` for detailed documentation
- Customize colors in `FloatingStatDisplay.ts`
- Adjust animation timings in `animateDisplay()` method
- Add more stat types if needed (mana, shield, etc.)

## Common Adjustments

### For Larger Characters
```
headOffset = 3.5
iconScale = 0.6
textScale = 0.018
```

### For Smaller Characters
```
headOffset = 2.0
iconScale = 0.4
textScale = 0.012
```

### For Fast-Paced Games
```
displayDuration = 1.5
minChangeThreshold = 5
```

### For Slow-Paced Games
```
displayDuration = 3.0
minChangeThreshold = 1
```

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all references are assigned
3. Check that icons are valid SpriteFrame assets
4. Ensure camera and player nodes are active
5. Review `README_FLOATING_STATS.md` for detailed troubleshooting
