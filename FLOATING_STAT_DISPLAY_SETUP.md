# Floating Stat Display - Complete Setup Guide

## 🎯 What This Does

Creates **3D floating text** above the player's head showing:
- ❤️ **+40** (light blue) when health increases
- ⚡ **+50** (light blue) when stamina increases  
- ❤️ **-20** (red) when health decreases
- ⚡ **-12** (red) when stamina decreases

Multiple displays stack from bottom to top and float upward!

## ✅ Setup Steps

### Step 1: Create FloatingStatDisplay Node

**In your scene hierarchy:**

1. **Find your Player node**
2. **Right-click Player** → Create Empty Node
3. **Rename** to `FloatingStatDisplay`
4. **Set Position:** (0, 2.5, 0) - above player's head
5. **Add Component:** FloatingStatDisplay

### Step 2: Assign Properties

**Select FloatingStatDisplay node, in Inspector:**

**Required:**
- ✅ **Camera Node**: Drag Main Camera here
- ✅ **Player Node**: Drag Player node here
- ✅ **Health Icon**: Drag your health sprite frame
- ✅ **Energy Icon**: Drag your energy sprite frame

**Optional (can use defaults):**
- Vertical Spacing: 0.4
- Float Height: 1.0
- Display Duration: 2.0
- Icon Scale: 0.3
- Text Scale: 0.01
- Font Size: 48

### Step 3: Done!

That's it! The system will automatically:
- Monitor health and stamina changes
- Create floating displays when changes occur
- Animate them upward
- Fade them out
- Stack multiple displays
- Clean up expired displays

## 🎮 How It Works

### Automatic Detection

The component monitors every frame:
```typescript
Current Health vs Previous Health
Current Stamina vs Previous Stamina

If different → Create floating display!
```

### Display Creation (Programmatic)

When a change is detected:
```typescript
1. Create container node
2. Create Icon node (Sprite with your icon)
3. Create Text node (Label with colored text)
4. Position above player
5. Stack with other displays
6. Animate up and fade out
7. Auto-destroy after duration
```

### Stacking Behavior

```
[⚡] +50  ← 3rd display (top)
[❤️] +40  ← 2nd display (middle)
[❤️] -15  ← 1st display (bottom)

All float upward together!
```

## 🎨 Visual Specifications

### Colors

**Increase (Positive):**
```
RGB(100, 200, 255) - Light blue
Alpha: 255 → 0 (fades out)
```

**Decrease (Negative):**
```
RGB(255, 80, 80) - Red
Alpha: 255 → 0 (fades out)
```

### Animation

**Movement:**
- Starts at stack position
- Floats up 1.0 units (configurable)
- Duration: 2.0 seconds
- Easing: sineOut (smooth deceleration)

**Fade:**
- Visible for 30% of duration (0.6s)
- Fades out for 70% of duration (1.4s)
- Easing: quadIn (smooth fade)

### Scaling

**Icon:**
- Scale: 0.3 (world space)
- Adjustable if too small/large

**Text:**
- Scale: 0.01 (world space)
- Font size: 48 (before scaling)
- Adjustable if too small/large

## 🔧 Adjusting for Your Scene

### If Text/Icons Too Small

Increase scales:
```
Icon Scale: 0.5
Text Scale: 0.015
```

### If Text/Icons Too Large

Decrease scales:
```
Icon Scale: 0.2
Text Scale: 0.005
```

### If Displays Too Close Together

Increase spacing:
```
Vertical Spacing: 0.6
```

### If Displays Float Too High/Low

Adjust float height:
```
Float Height: 1.5 (higher)
Float Height: 0.5 (lower)
```

## 🎮 When Displays Appear

### Health Changes

**Increases (+):**
- Collecting flags: +15, +25, +40, +60, +100
- Health regeneration (if active)

**Decreases (-):**
- Obstacle damage: -15 to -30
- Missile damage: -30 to -50
- Survival zone: -50

### Stamina Changes

**Increases (+):**
- Collecting flags: +20, +35, +50, +75, +100
- (Small regen amounts filtered out)

**Decreases (-):**
- Jump: -8
- Vault: -6
- Dash: -12
- Slide: -4
- (Running/wall running continuous drain filtered out)

## 📊 Example Scenarios

### Collecting Level 5 Flag

**Displays shown:**
```
[❤️] +100  ← Light blue (full health restore)
[⚡] +100  ← Light blue (full stamina restore)
```

Both stack above player, float up together, fade out.

### Taking Missile Hit

**Display shown:**
```
[❤️] -30  ← Red (damage taken)
```

Floats up and fades out in red.

### Rapid Actions

**Player does: Dash → Jump → Take damage**

**Displays shown (stacked):**
```
[❤️] -20  ← Top (damage, red)
[⚡] -8   ← Middle (jump, red)
[⚡] -12  ← Bottom (dash, red)
```

All float up together in a stack!

## 🎯 Scene Hierarchy

### Recommended Setup

```
Player (Node)
├─ PlayerController
├─ Actor
├─ CharacterController
├─ ... other components
│
└─ FloatingStatDisplay (Node) ← Create this!
   ├─ Position: (0, 2.5, 0)
   └─ FloatingStatDisplay (Component)
      ├─ cameraNode: Main Camera
      ├─ playerNode: Player
      ├─ healthIcon: Your health sprite
      └─ energyIcon: Your energy sprite
```

**As a child of Player:**
- ✅ Automatically follows player
- ✅ Positioned above head
- ✅ Always faces camera

## 🐛 Troubleshooting

### Nothing Appears

**Check console:**
```
FloatingStatDisplay: health +40
FloatingStatDisplay: stamina +50
```

If you see these messages but no visuals:
- Icons/text might be too small (increase scales)
- Check if sprite frames are assigned
- Verify node is positioned above player

### Icons Not Showing

**Check:**
- [ ] healthIcon sprite frame assigned
- [ ] energyIcon sprite frame assigned
- [ ] Sprite frames are valid
- [ ] iconScale is not too small (try 0.5)

### Text Not Showing

**Check:**
- [ ] textScale is not too small (try 0.015)
- [ ] fontSize is reasonable (48)
- [ ] Label color is not transparent
- [ ] Camera can see the node

### Not Facing Camera

**Check:**
- [ ] cameraNode is assigned
- [ ] Camera is active
- [ ] lookAt is working

### Displays Overlapping

**Increase vertical spacing:**
```
Vertical Spacing: 0.6 or 0.8
```

## 💡 Advanced Customization

### Different Colors

Edit in `createFloatingDisplay()`:
```typescript
// Green for increase
label.color = new Color(100, 255, 100, 255);

// Orange for decrease
label.color = new Color(255, 150, 50, 255);
```

### Add Outline to Text

```typescript
const outline = textNode.addComponent(LabelOutline);
outline.color = new Color(0, 0, 0, 255);
outline.width = 2;
```

### Different Animation

```typescript
// Bounce effect
tween(container)
    .to(duration, { position: endPos }, { easing: 'elasticOut' })
    .start();

// Quick pop
tween(container)
    .to(duration, { position: endPos }, { easing: 'backOut' })
    .start();
```

### Scale Animation

Add scale animation:
```typescript
tween(container)
    .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
    .to(duration - 0.2, { scale: new Vec3(0.8, 0.8, 1) })
    .start();
```

## 🎊 Features

✅ **No prefab needed** - Everything created in code
✅ **Works in 3D** - No UI/Canvas issues
✅ **Auto-stacking** - Multiple displays stack nicely
✅ **Smooth animations** - Float up and fade out
✅ **Camera facing** - Always readable
✅ **Color-coded** - Blue = good, Red = bad
✅ **Icon support** - Uses your sprite frames
✅ **Auto-cleanup** - Removes expired displays
✅ **Configurable** - All values adjustable in inspector

## 🎮 Testing

### Quick Test

1. **Run the game**
2. **Take damage** from an obstacle
   - Should see: [❤️] -20 (red)
3. **Collect a flag**
   - Should see: [❤️] +40 (blue) and [⚡] +50 (blue)
4. **Use dash**
   - Should see: [⚡] -12 (red)

### Manual Test (Add to PlayerController)

```typescript
// In onKeyDown
if (event.keyCode === KeyCode.KEY_T) {
    const floatingDisplay = find('FloatingStatDisplay')?.getComponent(FloatingStatDisplay);
    if (floatingDisplay) {
        floatingDisplay.showHealthChange(25);
        floatingDisplay.showStaminaChange(50);
    }
}
```

## 📏 Recommended Values

**For typical 3D scene:**
```
Vertical Spacing: 0.4
Float Height: 1.0
Display Duration: 2.0
Icon Scale: 0.3
Text Scale: 0.01
Font Size: 48
```

**For close-up camera:**
```
Icon Scale: 0.2
Text Scale: 0.008
```

**For far camera:**
```
Icon Scale: 0.5
Text Scale: 0.015
```

## ✨ Result

You now have a **professional floating damage/heal number system** like in RPG games, working perfectly in 3D world space! 🎮✨
