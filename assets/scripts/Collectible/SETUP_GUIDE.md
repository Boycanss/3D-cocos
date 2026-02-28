# Flag System - Quick Setup Guide

## 🎯 What You Need

1. **Platforms Parent Node** - The node that contains all your platform children
2. **LowBox Obstacles** - Platforms/obstacles with the `Box` component and `boxType` set to `LOWBOX`
3. **Flag Prefab** - A prefab with the `Flag` component and a trigger collider
4. **Player Node** - Your player character

## 📋 Setup Steps

### Step 1: Prepare Your Flag Prefab
```
Flag Prefab Structure:
├─ Flag (root node)
│  ├─ Flag Component
│  ├─ Collider (IsTrigger = true)
│  └─ Visual Node (child)
│     └─ Your 3D model/sprite
```

1. Create a new node for the flag
2. Add a **Collider** component and check **IsTrigger**
3. Add the **Flag** component
4. Create a child node with your visual (mesh/sprite)
5. Assign the visual node to the Flag component's `visualNode` property
6. Save as a prefab

### Step 2: Setup GameManager
1. Select your **GameManager** node
2. Add the **FlagManager** component
3. Configure properties:
   - **Flag Prefab**: Assign your flag prefab
   - **Player Node**: Assign your player node
   - **Platforms Parent Node**: Assign the parent node that contains all platforms
   - **Flag Height Offset**: 2.0 (height above LowBox)
   - **Spawn Interval**: 15.0 (seconds between spawns)
   - **Max Active Flags**: 3
   - **Min LowBoxes Required**: 3

### Step 3: Setup Player
1. Select your **Player** node
2. Add the **FlagBuffManager** component
3. That's it! It will automatically find:
   - PlayerController
   - StaminaManager
   - Actor

### Step 4: Verify Your Platforms
Make sure your platforms have:
- **Box** component
- `boxType` set to **LOWBOX** (for platforms you want flags to spawn on)

## 🎮 How It Works

**Automatic Scanning:**
- FlagManager scans all children of the `platformsParentNode`
- Finds all nodes with Box component where `boxType == LOWBOX`
- Stores them in an array

**Smart Spawning:**
- Level 1 flags spawn on **closest 20%** of LowBoxes
- Level 5 flags spawn on **farthest 20%** of LowBoxes
- Each LowBox can only have one flag at a time
- Requires minimum 3 LowBoxes before spawning

**Buff System:**
- Collecting a flag applies temporary buffs
- Higher level = better buffs (speed, stamina, score multiplier)
- Level 5 includes 2 seconds of invincibility!

## 🧪 Testing

### Check if it's working:
```typescript
// In console or debug script
const flagManager = gameManager.getComponent(FlagManager);
console.log(`Available LowBoxes: ${flagManager.getAvailableLowBoxCount()}`);
console.log(`Active Flags: ${flagManager.getActiveFlagCount()}`);
```

### Manual spawn for testing:
```typescript
const flagManager = gameManager.getComponent(FlagManager);
flagManager.spawnFlagAtLevel(FlagLevel.LEVEL5); // Spawn a legendary flag
```

## ⚠️ Troubleshooting

**"No available LowBoxes" warning:**
- Check that `platformsParentNode` is assigned
- Verify platforms have the `Box` component
- Ensure `boxType` is set to `LOWBOX`
- Need at least 3 LowBoxes

**Flags not collecting:**
- Verify flag prefab has a trigger collider
- Check player has a collider/CharacterController
- Ensure FlagBuffManager is on player node

**Buffs not applying:**
- Check console for buff application logs
- Verify PlayerController, StaminaManager, and Actor exist on player

## 📊 Flag Levels & Benefits

| Level | Spawn Location | Score | Speed | Stamina | Regen | Dash CD | Invincible | Duration |
|-------|---------------|-------|-------|---------|-------|---------|------------|----------|
| 1     | Closest 20%   | 1.0x  | +5%   | -       | -     | -       | -          | 10s      |
| 2     | 20-40%        | 1.5x  | +10%  | -10%    | -     | -       | -          | 12s      |
| 3     | 40-60%        | 2.0x  | +15%  | -20%    | +25%  | -       | -          | 15s      |
| 4     | 60-80%        | 2.5x  | +20%  | -30%    | +50%  | -25%    | -          | 18s      |
| 5     | Farthest 20%  | 3.0x  | +25%  | -40%    | +75%  | -50%    | 2s         | 20s      |

## 🎨 Customization Tips

**Change spawn rates:**
Edit `FlagManager.onLoad()` to adjust probabilities

**Modify benefits:**
Edit `FlagBuffManager.getFlagBenefits()` to change buff values

**Visual feedback:**
Add particle effects in `Flag.applyVisualForLevel()`

**Different colors per level:**
Use materials or sprite changes based on flag level
