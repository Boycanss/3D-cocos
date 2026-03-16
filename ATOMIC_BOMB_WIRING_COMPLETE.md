# Atomic Bomb Wiring - Complete Setup Guide

## What Was Wired Up

### 1. GameManager.ts Updates
Added atomic bomb spawning system to GameManager following the same pattern as missiles.

**Changes Made:**
- Imported `AtomicBombManager`
- Added `lastAutoAtomicBombTime` and `currentAutoAtomicBombInterval` tracking
- Added `updateAutoAtomicBombs()` method to update() loop
- Added `spawnAutoAtomicBombs()` method to spawn bombs
- Updated `updateDifficulty()` to support Level 7 and set atomic bomb interval
- Updated `resetTimer()` to reset atomic bomb timers
- Updated `getDifficultyInterval()` to include Level 7 progression

**Difficulty Progression:**
- Level 1-6: No atomic bombs
- Level 7: Atomic bombs spawn every 8 seconds (2 bombs per spawn)

**Timeline to Level 7:**
- Level 1: 0-30s
- Level 2: 30-75s
- Level 3: 75-135s
- Level 4: 135-210s
- Level 5: 210-300s
- Level 6: 300-420s
- Level 7: 420s+ (atomic bombs start spawning)

### 2. Define.ts Updates
- Added `LEVEL7` to `GameLevel` enum
- Added atomic bomb properties to `LevelState` interface
- Added Level 7 configuration to `GameLevelState`
- Added `ATOMIC_BOMB_DAMAGE = 50` to `Damage` enum

## Scene Setup Instructions

### Step 1: Create Fog Sphere Prefab
1. Create a new 3D Node
2. Add a Sphere mesh (or use a primitive)
3. Add MeshRenderer component
4. Create/assign a semi-transparent material:
   - Color: Grayish-blue (100, 100, 120)
   - Opacity: ~180/255 (70%)
   - Enable transparency/blending
5. Save as: `assets/prefabs/FogSphere.prefab`

### Step 2: Create Atomic Bomb Prefab
1. Create a new 3D Node
2. Add a Sphere mesh (larger than fog sphere)
3. Add SphereCollider component:
   - Enable "isTrigger"
   - Set radius to ~0.5
4. Add MeshRenderer with dark/metallic material
5. Add AtomicBomb script component
6. Assign the blow effect prefab (reuse missile blow effect)
7. Save as: `assets/prefabs/AtomicBomb.prefab`

### Step 3: Add Components to GameManager Node
In your scene, find the GameManager node and add:

1. **AtomicBombManager Component**
   - Assign AtomicBomb prefab
   - Assign MainCharacter reference
   - Set spawnHeight to 15

2. **MissileManager Component** (if not already present)
   - Assign Missile prefab
   - Assign MainCharacter reference

### Step 4: Add FogEffectManager to MainCharacter
1. Select MainCharacter node
2. Add FogEffectManager component
3. Assign fog sphere prefab
4. Configure fog properties:
   - fogSphereCount: 30
   - fogRadius: 8
   - fogDuration: 4
   - fogOpacity: 180

## How It Works

### Atomic Bomb Spawning Flow
```
GameManager.update()
  ↓
updateAutoAtomicBombs() [only at Level 7+]
  ↓
spawnAutoAtomicBombs()
  ↓
AtomicBombManager.spawnAtomicBombs()
  ↓
AtomicBomb instances spawn and fall
```

### Collision & Fog Flow
```
AtomicBomb collides with player
  ↓
AtomicBomb.onTriggerEnter()
  ↓
destroyBomb()
  ↓
FogEffectManager.activateFog()
  ↓
Fog spheres spawn and fade in
  ↓
Fog lasts 4 seconds
  ↓
Fog fades out and spheres destroyed
```

## Testing Checklist

### Before Testing
- [ ] Fog sphere prefab created and assigned
- [ ] Atomic bomb prefab created and assigned
- [ ] AtomicBombManager added to GameManager node
- [ ] FogEffectManager added to MainCharacter node
- [ ] All prefab references assigned in inspector

### Gameplay Testing
- [ ] Game starts at Level 1
- [ ] Difficulty increases every 30-120 seconds
- [ ] Level 7 reached after ~7 minutes
- [ ] Atomic bombs spawn at Level 7
- [ ] Bombs fall straight down
- [ ] Bombs deal 50 damage on hit
- [ ] Fog effect triggers on bomb hit
- [ ] Fog spheres appear around player
- [ ] Fog fades in smoothly (0.5s)
- [ ] Fog stays visible for ~3 seconds
- [ ] Fog fades out smoothly (1.5s)
- [ ] Multiple bombs can spawn simultaneously
- [ ] Fog effect doesn't crash game
- [ ] Performance remains smooth at Level 7

### Debug Logging
The following console logs will appear:
```
🎮 Difficulty increased to level 7, next interval: 120s
💣 Auto-spawned 2 atomic bombs at speed 1.5 (Level 7)
🌫️ Fog effect activated!
🌫️ Fog effect stopped!
```

## Performance Optimization Tips

If experiencing performance issues:

1. **Reduce fog spheres:**
   - Lower `fogSphereCount` from 30 to 20
   - Reduces rendering load

2. **Reduce fog radius:**
   - Lower `fogRadius` from 8 to 6
   - Smaller visibility area

3. **Reduce atomic bomb spawn rate:**
   - Increase `atomicBombInterval` in Level 7 config (8 → 10)
   - Fewer bombs spawning

4. **Reduce atomic bomb count:**
   - Lower `atomicBombAmount` in Level 7 config (2 → 1)
   - Fewer bombs per spawn

## Customization Examples

### Make Fog More Intense
```typescript
// In FogEffectManager properties:
fogSphereCount: 50      // More spheres
fogRadius: 10           // Larger area
fogOpacity: 220         // More opaque
fogDuration: 5          // Longer duration
```

### Make Atomic Bombs More Frequent
```typescript
// In Define.ts Level 7 config:
atomicBombAmount: 3     // 3 bombs per spawn
atomicBombInterval: 5   // Every 5 seconds
atomicBombSpeed: 2.0    // Faster falling
```

### Make Fog Less Intense
```typescript
// In FogEffectManager properties:
fogSphereCount: 15      // Fewer spheres
fogRadius: 5            // Smaller area
fogOpacity: 100         // More transparent
fogDuration: 2          // Shorter duration
```

## Troubleshooting

### Atomic Bombs Not Spawning
- Check AtomicBombManager is added to GameManager node
- Check AtomicBomb prefab is assigned
- Check MainCharacter reference is set
- Check game reaches Level 7 (7+ minutes)
- Check console for error messages

### Fog Not Appearing
- Check FogEffectManager is added to MainCharacter
- Check fog sphere prefab is assigned
- Check material has transparency enabled
- Check fog opacity is > 0
- Verify atomic bomb collision is triggering

### Performance Issues
- Reduce fogSphereCount (30 → 20)
- Reduce atomicBombAmount (2 → 1)
- Increase atomicBombInterval (8 → 10)
- Check if other effects are running simultaneously

### Bombs Getting Stuck
- Increase spawnHeight (15 → 20)
- Check for colliders blocking spawn area
- Verify bomb speed is > 0

## Next Steps

1. Create the prefabs (fog sphere and atomic bomb)
2. Add components to scene
3. Test in gameplay
4. Adjust difficulty/balance as needed
5. Fine-tune fog and bomb parameters
6. Add sound effects (optional)
7. Add visual warning before bomb impact (optional)
