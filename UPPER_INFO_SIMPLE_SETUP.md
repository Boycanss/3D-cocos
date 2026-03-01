# Upper Info - Simple Setup (NO PREFAB NEEDED!)

## ✅ Good News: No Prefab Creation Required!

The system now creates everything **programmatically in code**. You don't need to create any prefab!

## 🎯 Super Simple Setup

### Step 1: Verify upperInfo Node Exists

You should already have an `upperInfo` node in your scene (probably above the player).

### Step 2: Assign Properties in Inspector

Select the `upperInfo` node and assign:

1. **Camera Node**: Drag your Main Camera here
2. **Player Node**: Drag your Player node here
3. **Health Icon**: Drag your health sprite frame here
4. **Energy Icon**: Drag your energy sprite frame here

**Optional settings (can leave as default):**
- Vertical Spacing: 0.4
- Float Distance: 0.8
- Display Duration: 1.5
- Icon Scale: 0.005
- Text Scale: 0.008

### Step 3: Done!

That's it! No prefab creation needed. The system creates all nodes in code.

## 🎮 How It Works

### Automatic Creation

When health or stamina changes, the code automatically:

1. **Creates a container node**
2. **Creates an Icon node** with Sprite component
   - Uses your HealthIcon or EnergyIcon
   - Positioned on the left
   - Scaled for 3D world space
3. **Creates a Text node** with Label component
   - Shows "+50" or "-20"
   - Colored light blue (+) or red (-)
   - Positioned on the right
   - Scaled for 3D world space
4. **Animates** (floats up and fades out)
5. **Auto-destroys** after 1.5 seconds

### Code Structure Created

```typescript
displayNode (container)
├─ Icon (Sprite)
│  ├─ Position: (-0.15, 0, 0)
│  ├─ Scale: (0.005, 0.005, 1)
│  └─ SpriteFrame: HealthIcon or EnergyIcon
│
└─ Text (Label)
   ├─ Position: (0.05, 0, 0)
   ├─ Scale: (0.008, 0.008, 1)
   ├─ String: "+50" or "-20"
   └─ Color: Light blue or Red
```

## 🎨 What You'll See

**Collecting Level 3 Flag:**
```
[❤️] +40  ← Light blue, floats up
[⚡] +50  ← Light blue, floats up
```

**Taking Damage:**
```
[❤️] -20  ← Red, floats up
```

**Using Dash:**
```
[⚡] -12  ← Red, floats up
```

**Multiple changes stack:**
```
[⚡] +50  ← Top (newest)
[❤️] -20  ← Middle  
[❤️] +15  ← Bottom (oldest)
```

## 🔧 Adjusting Scale

If the text/icons are too small or too large, adjust in inspector:

**Too small?**
- Increase Icon Scale: 0.01
- Increase Text Scale: 0.015

**Too large?**
- Decrease Icon Scale: 0.003
- Decrease Text Scale: 0.005

## 🎯 Position in Scene

The upperInfo node should be positioned above the player:

**Option 1: Child of Player**
```
Player
└─ upperInfo (Position: 0, 2.5, 0)
```
Automatically follows player.

**Option 2: Separate Node**
```
Scene
├─ Player
└─ upperInfo (Position: matches player + offset)
```
You'll need to update position to follow player.

## 📊 Console Output

When working correctly:
```
upperInfo: Showing health change: +40
upperInfo: Showing stamina change: +50
upperInfo: Showing health change: -20
upperInfo: Showing stamina change: -12
```

## ✅ Checklist

- [ ] upperInfo node exists in scene
- [ ] upperInfo component attached
- [ ] Camera Node assigned
- [ ] Player Node assigned
- [ ] Health Icon sprite frame assigned
- [ ] Energy Icon sprite frame assigned
- [ ] upperInfo positioned above player (Y: ~2.5)
- [ ] Test by collecting flag or taking damage

## 🎊 Result

**No prefab creation needed!** Just assign the properties and it works. The system creates beautiful floating stat changes in 3D world space! 🎮✨

## 🐛 Troubleshooting

**Nothing appears:**
- Check console for "upperInfo: Showing..." messages
- Verify Camera Node and Player Node are assigned
- Check if upperInfo node is visible in scene
- Adjust Icon Scale and Text Scale if too small

**Icons not showing:**
- Verify HealthIcon and EnergyIcon are assigned
- Check sprite frames are valid
- Icons might be too small (increase iconScale)

**Text not showing:**
- Text might be too small (increase textScale)
- Check if Label component is being created
- Verify colors are not transparent

**Not facing camera:**
- Verify Camera Node is assigned
- Check lookAt is working in update()
