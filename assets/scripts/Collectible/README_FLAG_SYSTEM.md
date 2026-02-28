# Flag System Documentation

## Overview
The Flag System provides collectible flags that spawn on top of LowBox obstacles and grant temporary buffs to the player. Higher-level flags spawn on LowBoxes that are farther from the player, creating risk/reward gameplay.

## Components

### 1. FlagManager
**Location:** `assets/scripts/GameManager/FlagManager.ts`

Manages flag spawning on LowBox obstacles, positioning, and lifecycle.

**Key Properties:**
- `flagPrefab`: The flag prefab to spawn
- `playerNode`: Reference to the player
- `obstacleManagerNode`: Reference to ObstacleManager to find LowBoxes
- `flagHeightOffset`: Height above the LowBox (default: 2.0m)
- `spawnInterval`: Time between spawns (default: 15s)
- `maxActiveFlags`: Maximum concurrent flags (default: 3)
- `minLowBoxesRequired`: Minimum LowBoxes needed before spawning (default: 3)

**Spawn Probabilities:**
- Level 1: 40%
- Level 2: 30%
- Level 3: 15%
- Level 4: 10%
- Level 5: 5%

### 2. Flag
**Location:** `assets/scripts/Collectible/Flag.ts`

Individual flag behavior including rotation, bobbing animation, and collection.

**Key Properties:**
- `rotationSpeed`: Rotation speed in degrees/second
- `bobHeight`: Vertical bobbing distance
- `bobSpeed`: Speed of bobbing animation
- `visualNode`: The visual mesh/sprite node

### 3. FlagBuffManager
**Location:** `assets/scripts/Collectible/FlagBuffManager.ts`

Manages buff application, duration, and stat modifications.

**Key Methods:**
- `applyFlagBuff(level)`: Apply a flag buff
- `getScoreMultiplier()`: Get current score multiplier
- `getStaminaCostMultiplier()`: Get stamina cost reduction
- `isInvincible()`: Check invincibility status
- `getRemainingBuffTime()`: Get remaining buff duration

## Flag Benefits by Level

### Level 1 (Common)
- **Score Multiplier:** 1.0x
- **Speed Boost:** +5%
- **Duration:** 10 seconds
- **Spawn Location:** Closest 20% of LowBoxes

### Level 2 (Uncommon)
- **Score Multiplier:** 1.5x
- **Speed Boost:** +10%
- **Stamina Reduction:** -10%
- **Duration:** 12 seconds
- **Spawn Location:** 20-40% distance range

### Level 3 (Rare)
- **Score Multiplier:** 2.0x
- **Speed Boost:** +15%
- **Stamina Reduction:** -20%
- **Regen Boost:** +25%
- **Duration:** 15 seconds
- **Spawn Location:** 40-60% distance range (middle)

### Level 4 (Epic)
- **Score Multiplier:** 2.5x
- **Speed Boost:** +20%
- **Stamina Reduction:** -30%
- **Regen Boost:** +50%
- **Dash Cooldown Reduction:** -25%
- **Duration:** 18 seconds
- **Spawn Location:** 60-80% distance range

### Level 5 (Legendary)
- **Score Multiplier:** 3.0x
- **Speed Boost:** +25%
- **Stamina Reduction:** -40%
- **Regen Boost:** +75%
- **Dash Cooldown Reduction:** -50%
- **Invincibility:** 2 seconds
- **Duration:** 20 seconds
- **Spawn Location:** Farthest 20% of LowBoxes

## Setup Instructions

### 1. Create Flag Prefab
1. Create a 3D model or sprite for the flag visual
2. Add a **Collider** component (set as **Trigger**)
3. Add the **Flag** component
4. Assign the visual node to `visualNode`
5. Save as a prefab

### 2. Setup GameManager
1. Add **FlagManager** component to your GameManager node
2. Assign the flag prefab
3. Assign the player node
4. Assign the ObstacleManager node (the node that contains spawned obstacles)
5. Adjust spawn settings as needed (flagHeightOffset, spawnInterval, etc.)

### 3. Setup Player
1. Add **FlagBuffManager** component to the player node
2. The component will automatically find PlayerController, StaminaManager, and Actor

### 4. Integration with Scoring System
In your scoring system, multiply score by:
```typescript
const buffManager = player.getComponent(FlagBuffManager);
const scoreMultiplier = buffManager.getScoreMultiplier();
const finalScore = baseScore * scoreMultiplier;
```

### 5. Integration with Stamina System
Modify StaminaManager to use the cost multiplier:
```typescript
const buffManager = this.playerNode.getComponent(FlagBuffManager);
const costMultiplier = buffManager.getStaminaCostMultiplier();
this.reduceStamina(Energy.RUN * deltaTime * costMultiplier);
```

## How It Works

**LowBox-Based Spawning:**
- Flags spawn on top of LowBox obstacles (not randomly in the world)
- The system scans all LowBox nodes and stores them in an array
- Higher-level flags spawn on LowBoxes that are farther from the player
- Each LowBox can only have one flag at a time
- Minimum 3 LowBoxes required before flags start spawning

**Distance-Based Selection:**
- Level 1: Spawns on closest 20% of available LowBoxes
- Level 2: Spawns on 20-40% distance range
- Level 3: Spawns on 40-60% distance range (middle)
- Level 4: Spawns on 60-80% distance range
- Level 5: Spawns on farthest 20% of available LowBoxes

This creates natural risk/reward gameplay where players must venture further to get better buffs.

## Customization

### Adjust Spawn Weights
In `FlagManager.onLoad()`:
```typescript
this._flagWeights.set(FlagLevel.LEVEL1, 50); // Increase Level 1 spawn rate
this._flagWeights.set(FlagLevel.LEVEL5, 10); // Increase Level 5 spawn rate
```

### Modify Benefits
In `FlagBuffManager.getFlagBenefits()`, adjust the values for each level.

### Change Visual Appearance
In `Flag.applyVisualForLevel()`, add custom logic for:
- Different colors per level
- Particle effects
- Scale variations
- Material changes

## Testing

### Manual Spawn
```typescript
const flagManager = gameManager.getComponent(FlagManager);
flagManager.spawnFlagAtLevel(FlagLevel.LEVEL5); // Spawn a Level 5 flag
```

### Check Available LowBoxes
```typescript
const flagManager = gameManager.getComponent(FlagManager);
console.log(`Available LowBoxes: ${flagManager.getAvailableLowBoxCount()}`);
```

### Debug Info
The system logs detailed information:
- Flag spawn events with level and distance
- Buff application with all benefits
- Buff expiration events
- Warnings when no LowBoxes are available

## Tips

1. **Balance:** Higher-level flags spawn on farther LowBoxes, creating risk/reward gameplay
2. **Visual Feedback:** Add particle effects or UI indicators for active buffs
3. **Sound Effects:** Add audio cues for flag collection and buff expiration
4. **Buff Stacking:** Currently, new buffs replace old ones. Modify if you want stacking
5. **Invincibility Visual:** Add a visual effect when the player is invincible
6. **LowBox Requirement:** Ensure your obstacle spawning creates enough LowBoxes for flags

## Troubleshooting

**Flags not spawning:**
- Check that flagPrefab, playerNode, and obstacleManagerNode are assigned
- Verify the Flag component is on the prefab
- Ensure at least 3 LowBoxes exist in the scene
- Check that obstacles have the Box component with boxType set to LOWBOX
- Check console for warnings

**Buffs not applying:**
- Ensure FlagBuffManager is on the player node
- Verify PlayerController, StaminaManager, and Actor components exist
- Check console for buff application logs

**Collision not working:**
- Ensure the flag has a Collider set as Trigger
- Verify the player has a Collider or CharacterController
- Check physics layer settings

**Flags spawning on same LowBox:**
- The system prevents this automatically
- If it happens, check that Flag.getParentLowBox() is working correctly
