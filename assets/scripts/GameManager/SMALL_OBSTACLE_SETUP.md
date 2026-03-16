# Small Obstacle System Setup Guide

## Overview
The **ObstacleManager** has been updated to support spawning small obstacles (small boxes) alongside regular obstacles. Small obstacles add variety and increase difficulty in higher levels.

## Features
- **Difficulty-Based Spawning**: Small obstacles only appear in Level 5 and 6
- **Balanced Distribution**: 
  - Level 5: 30% small obstacles (interesting variation)
  - Level 6: 40% small obstacles (expert challenge)
- **Separate Collision Detection**: Small obstacles use a smaller collision radius for tighter placement
- **Automatic Calculation**: Small obstacle count is calculated automatically based on total obstacle count

## Setup Instructions

### Step 1: Prepare Small Obstacle Prefab
1. Create or import your small obstacle (small box) model
2. Set up the prefab with:
   - 3D model/mesh
   - Collider component (for collision detection)
   - Box component (with boxType set to appropriate type)
3. Make sure it's smaller than the regular obstacle for visual distinction

### Step 2: Assign Prefab in Inspector
1. Select the **GameManager** node in your scene
2. Find the **ObstacleManager** component
3. Assign your small obstacle prefab to the **Small Obstacle Prefab** property
4. The regular **Obstacle Prefab** should already be assigned

### Step 3: Adjust Collision Radius (Optional)
The default collision radius for small obstacles is 1.5 units. You can adjust:
- **Small Obstacle Check Radius**: Distance to check for collisions when spawning small obstacles
- **Obstacle Check Radius**: Distance to check for collisions when spawning regular obstacles

## Difficulty Progression

### Level 1-4
- **No small obstacles** - Focus on learning mechanics with regular obstacles
- Pure regular obstacle spawning

### Level 5
- **30% small obstacles** - Introduces variety and increases difficulty
- Example: If 6 obstacles spawn, ~2 will be small, ~4 will be regular
- Creates interesting navigation challenges

### Level 6
- **40% small obstacles** - Expert level with more variety
- Example: If 7 obstacles spawn, ~3 will be small, ~4 will be regular
- Requires mastery of movement mechanics

## How It Works

### Spawn Process
1. **Calculate Distribution**: Based on difficulty level, determine how many small vs regular obstacles
2. **Spawn Regular Obstacles**: Spawn the calculated number of regular obstacles
3. **Spawn Small Obstacles**: Spawn the calculated number of small obstacles
4. **Collision Avoidance**: Each type uses its own collision radius to prevent overlapping

### Collision Detection
- **Regular Obstacles**: Check radius of 2.0 units
- **Small Obstacles**: Check radius of 1.5 units
- Prevents obstacles from spawning too close to each other or the player

## Configuration Examples

### Conservative (Fewer Small Obstacles)
Modify `calculateSmallObstacleCount()`:
```typescript
case 5:
    return Math.floor(totalCount * 0.2);  // 20% instead of 30%
case 6:
    return Math.floor(totalCount * 0.3);  // 30% instead of 40%
```

### Aggressive (More Small Obstacles)
```typescript
case 5:
    return Math.floor(totalCount * 0.4);  // 40% instead of 30%
case 6:
    return Math.floor(totalCount * 0.5);  // 50% instead of 40%
```

### Extreme (Expert Only)
```typescript
case 5:
    return 0;  // No small obstacles in Level 5
case 6:
    return Math.floor(totalCount * 0.5);  // 50% in Level 6 only
```

## Troubleshooting

### Small Obstacles Not Appearing
- Check that **Small Obstacle Prefab** is assigned in the inspector
- Verify the prefab has a Collider component
- Check that difficulty level is 5 or 6
- Ensure the prefab is valid and not corrupted

### Small Obstacles Overlapping
- Increase **Small Obstacle Check Radius** to prevent tight placement
- Reduce the percentage in `calculateSmallObstacleCount()`
- Check that both prefabs have proper colliders

### Performance Issues
- Small obstacles use the same spawning system as regular obstacles
- If performance is an issue, reduce total obstacle count in Define.ts
- Consider reducing small obstacle percentage in higher levels

### Obstacles Not Spawning at All
- Verify **Obstacle Prefab** is assigned
- Check that **Player Node** is assigned
- Ensure **Plane Node** is assigned for boundary checking
- Check console for warning messages

## Customization

### Change Small Obstacle Percentage
Edit the `calculateSmallObstacleCount()` method in ObstacleManager.ts:
```typescript
case 5:
    return Math.floor(totalCount * 0.3);  // Change 0.3 to desired percentage
case 6:
    return Math.floor(totalCount * 0.4);  // Change 0.4 to desired percentage
```

### Add Small Obstacles to Lower Levels
Uncomment or add cases in `calculateSmallObstacleCount()`:
```typescript
case 4:
    return Math.floor(totalCount * 0.1);  // 10% small obstacles in Level 4
```

### Adjust Collision Radius
In the inspector or code:
```typescript
@property(CCFloat)
smallObstacleCheckRadius: number = 1.5;  // Adjust this value
```

## Design Rationale

### Why Only Level 5 & 6?
- Levels 1-4 focus on learning core mechanics
- Small obstacles add complexity that's best introduced at higher difficulties
- Prevents overwhelming new players

### Why 30% and 40%?
- 30% in Level 5 provides interesting variation without overwhelming
- 40% in Level 6 increases challenge for expert players
- Percentages are high enough to be noticeable but not dominant
- Maintains balance with other difficulty increases (missiles, speed, etc.)

### Why Separate Collision Radius?
- Small obstacles are physically smaller
- Tighter collision detection allows closer placement
- Creates more dynamic and interesting obstacle patterns
- Prevents wasted space in the spawn area

## Future Enhancements

Possible improvements:
- Add medium-sized obstacles as a third variation
- Implement obstacle clustering (small obstacles near large ones)
- Add visual effects when small obstacles spawn
- Create obstacle patterns based on difficulty
- Add different small obstacle types with unique properties
