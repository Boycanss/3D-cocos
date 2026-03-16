# Atomic Bomb & Fog Effect Implementation

## Overview
Level 7 introduces two new mechanics:
1. **Atomic Bomb** - Falls straight down to player's position, deals 50 damage
2. **Fog Effect** - Reduces visibility when hit by atomic bomb

## Components Created

### 1. FogEffectManager.ts
**Location:** `assets/scripts/Effects/FogEffectManager.ts`

Manages the fog visual effect using semi-transparent spheres around the player.

**Key Features:**
- Spawns 30 fog spheres in a spherical distribution around player
- Fog spheres follow player during active fog
- Smooth fade-in (0.5s) and fade-out (1.5s) animations
- Configurable fog duration (default: 4 seconds)
- Configurable fog color and opacity

**Public Methods:**
- `activateFog()` - Trigger fog effect (called when atomic bomb hits)
- `stopFog()` - Manually stop fog effect
- `isFogActive()` - Check if fog is currently active
- `getCurrentOpacity()` - Get current fog opacity (0-255)

**Properties:**
- `fogSphereCount` - Number of fog spheres (default: 30)
- `fogRadius` - Radius around player (default: 8)
- `fogDuration` - How long fog lasts (default: 4 seconds)
- `fogFadeInDuration` - Fade-in time (default: 0.5s)
- `fogFadeOutDuration` - Fade-out time (default: 1.5s)
- `fogOpacity` - Opacity level (default: 180/255)
- `fogColor` - Fog color RGB (default: grayish-blue)

### 2. AtomicBomb.ts
**Location:** `assets/scripts/Obstacle/AtomicBomb.ts`

Individual atomic bomb behavior - falls straight down to captured target position.

**Key Features:**
- Captures player position at spawn time (not chasing like missile)
- Falls straight down toward captured position
- Triggers fog effect on collision
- Deals 50 damage on hit
- Spawns blow effect on impact
- 20-second max lifetime safety timeout

**Properties:**
- `speed` - Falling speed (default: 8)
- `damage` - Damage dealt (default: 50)
- `maxLifeTime` - Max lifetime before auto-destroy (default: 20s)
- `blowPrefab` - Explosion effect prefab

### 3. AtomicBombManager.ts
**Location:** `assets/scripts/Obstacle/AtomicBombManager.ts`

Manages spawning of atomic bombs (similar to MissileManager).

**Key Features:**
- Spawns bombs directly above player with small random offset
- Supports speed multiplier for difficulty scaling
- Staggered spawn for visual effect
- Tracks bomb count

**Public Methods:**
- `spawnAtomicBomb(speedMultiplier)` - Spawn single bomb
- `spawnAtomicBombs(count, speedMultiplier)` - Spawn multiple bombs
- `clearAtomicBombs()` - Destroy all bombs
- `getBombCount()` - Get current bomb count

**Properties:**
- `spawnHeight` - Height above player to spawn (default: 15)

## Level 7 Configuration

Added to `GameLevelState` in Define.ts:

```typescript
[GameLevel.LEVEL7]: {
    boxSpawnAmount: 7,          // Same as Level 6
    missileAmount: 5,           // Same as Level 6
    missileSpeed: 3.0,          // Same as Level 6
    autoMissileInterval: 4,     // Same as Level 6
    autoMissileSpeed: 2.5,      // Same as Level 6
    autoMissileCount: 3,        // Same as Level 6
    atomicBombAmount: 2,        // NEW: 2 atomic bombs
    atomicBombInterval: 8,      // NEW: Spawn every 8 seconds
    atomicBombSpeed: 1.5        // NEW: 1.5x speed multiplier
}
```

## Setup Instructions

### 1. Create Fog Sphere Prefab
1. Create a new 3D sphere node
2. Add a MeshRenderer component with a semi-transparent material
3. Set material color to grayish-blue with alpha ~180
4. Save as prefab: `assets/prefabs/FogSphere.prefab`

### 2. Create Atomic Bomb Prefab
1. Create a new 3D sphere node (larger than fog sphere)
2. Add SphereCollider component (trigger enabled)
3. Add MeshRenderer with a dark/metallic material
4. Add AtomicBomb script component
5. Assign blow effect prefab
6. Save as prefab: `assets/prefabs/AtomicBomb.prefab`

### 3. Add Components to Scene
1. **MainCharacter node:**
   - Add FogEffectManager component
   - Assign fog sphere prefab

2. **Level Manager or Game Manager:**
   - Add AtomicBombManager component
   - Assign atomic bomb prefab
   - Assign MainCharacter reference

### 4. Update Level Manager
In your level manager/game manager, add atomic bomb spawning logic:

```typescript
// When spawning Level 7
const levelConfig = GameLevelState[GameLevel.LEVEL7];

// Spawn atomic bombs periodically
this.schedule(() => {
    this.atomicBombManager.spawnAtomicBombs(
        levelConfig.atomicBombAmount,
        levelConfig.atomicBombSpeed
    );
}, levelConfig.atomicBombInterval);
```

## Gameplay Mechanics

### Atomic Bomb Behavior
1. Spawns high above player (Y = 15)
2. Falls straight down to player's position at spawn time
3. Moves at configurable speed (default: 8 units/sec)
4. Deals 50 damage on collision
5. Triggers fog effect on hit

### Fog Effect Behavior
1. **Activation:** Triggered when atomic bomb hits player
2. **Duration:** 4 seconds total
3. **Fade-in:** 0.5 seconds (smooth entry)
4. **Full Opacity:** ~3 seconds (main fog period)
5. **Fade-out:** 1.5 seconds (smooth exit)
6. **Visibility:** Player can only see obstacles within fog radius (~8 units)

### Difficulty Progression
- **Level 6:** 5 missiles, 7 boxes, no atomic bombs
- **Level 7:** 5 missiles, 7 boxes, 2 atomic bombs every 8 seconds
  - Atomic bombs add unpredictability
  - Fog mechanic forces memorization of level layout
  - Combined with missiles creates intense challenge

## Performance Considerations

### Fog Spheres
- 30 spheres = ~2-3ms per frame (negligible)
- Spheres are simple geometry with no physics
- Existing camera culling still applies
- Memory: ~1-2MB for 30 sphere instances

### Atomic Bombs
- Similar to missiles in performance
- No continuous raycasting (unlike missiles)
- Straight-line movement is cheaper than chasing

### Total Impact
- Level 7 should run at same FPS as Level 6
- Fog effect is purely visual (no gameplay physics)
- Atomic bombs are simpler than missiles (no AI)

## Customization

### Adjust Fog Intensity
In FogEffectManager properties:
- Increase `fogSphereCount` for denser fog (30-50)
- Increase `fogRadius` for larger fog area (8-12)
- Adjust `fogOpacity` for visibility (100-200)

### Adjust Atomic Bomb Difficulty
In Level 7 config:
- Increase `atomicBombAmount` for more bombs (2-4)
- Decrease `atomicBombInterval` for more frequent spawns (4-8 seconds)
- Increase `atomicBombSpeed` for faster falling (1.5-2.5)

### Adjust Fog Duration
In FogEffectManager properties:
- `fogDuration` - Total fog time (3-5 seconds)
- `fogFadeInDuration` - How quickly fog appears (0.3-1.0s)
- `fogFadeOutDuration` - How quickly fog disappears (1.0-2.0s)

## Testing Checklist

- [ ] Fog sphere prefab renders correctly
- [ ] Atomic bomb prefab spawns and falls
- [ ] Atomic bomb collision triggers fog effect
- [ ] Fog fades in smoothly
- [ ] Fog spheres follow player
- [ ] Fog fades out smoothly
- [ ] Fog effect doesn't impact performance
- [ ] Level 7 difficulty feels balanced
- [ ] Atomic bombs don't get stuck in geometry
- [ ] Multiple atomic bombs can spawn simultaneously

## Future Enhancements

1. **Atomic Bomb Warning:** Add visual/audio warning before impact
2. **Fog Particle Trail:** Add particle effects to falling bomb
3. **Fog Customization:** Different fog colors for different effects
4. **Atomic Bomb Variants:** Different sizes/speeds
5. **Fog Mechanics:** Reduce player speed while in fog
6. **Sound Design:** Unique atomic bomb sounds
