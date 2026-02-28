# Fixes Applied - Flag Level & Scoring

## 🐛 Issues Fixed

### Issue 1: Flag Level Not Matching Difficulty
**Problem:** Flags were spawning at random levels (Lv1, Lv3, Lv5) regardless of game difficulty.

**Root Cause:** FlagManager was using weighted random selection instead of difficulty level.

**Solution:**
- Added `gameManager` reference to FlagManager
- Created `getFlagLevelFromDifficulty()` method
- Flag level now directly matches game difficulty level

**Result:**
```
Game Difficulty Level 1 → Flag Level 1
Game Difficulty Level 2 → Flag Level 2
Game Difficulty Level 3 → Flag Level 3
Game Difficulty Level 4 → Flag Level 4
Game Difficulty Level 5 → Flag Level 5
```

### Issue 2: Score Not Increasing on Flag Collection
**Problem:** Score didn't increase when collecting flags.

**Root Cause:** Flag was trying to get ScoreManager from player node, but ScoreManager is on GameManager node.

**Solution:**
- Flag emits event with flag level: `'flag-collected', flagNode, flagLevel`
- FlagManager listens to this event
- FlagManager gets ScoreManager from its own node (GameManager)
- FlagManager calls `scoreManager.awardFlagPoints(flagLevel)`

**Result:**
```
Flag collected → Event emitted → FlagManager receives event
    → FlagManager notifies ScoreManager → Score increases!
```

## 📝 Code Changes

### FlagManager.ts

**Added:**
```typescript
@property(GameManager)
gameManager: GameManager = null;

private getFlagLevelFromDifficulty(): FlagLevel {
    const difficultyLevel = this.gameManager.getDifficultyLevel();
    // Maps difficulty to flag level
}

private onFlagCollected(flagNode: Node, flagLevel: number): void {
    const scoreManager = this.node.getComponent(ScoreManager);
    if (scoreManager) {
        scoreManager.awardFlagPoints(flagLevel);
    }
}
```

**Changed:**
```typescript
// OLD: const flagLevel = this.getRandomFlagLevel();
// NEW: const flagLevel = this.getFlagLevelFromDifficulty();
```

### Flag.ts

**Changed:**
```typescript
// OLD: this.node.emit('flag-collected', this.node);
// NEW: this.node.emit('flag-collected', this.node, this._flagLevel);
```

**Removed:**
```typescript
// No longer needed - ScoreManager is on GameManager, not player
const scoreManager = player.node.getComponent(ScoreManager);
```

### Define.ts

**Added:**
```typescript
export enum ScoreValues {
    // All score values moved here
}
```

## ✅ Setup Checklist

To make everything work:

1. **Assign GameManager reference in FlagManager:**
   - Select GameManager node
   - Find FlagManager component
   - Assign `gameManager` property to the GameManager component

2. **Add ScoreManager to GameManager:**
   - Select GameManager node
   - Add ScoreManager component
   - Assign player node and UI labels

3. **Verify hierarchy:**
   ```
   GameManager
   ├─ GameManager Component
   ├─ FlagManager Component (gameManager assigned)
   └─ ScoreManager Component (playerNode assigned)
   ```

## 🎮 Expected Behavior

### Flag Level Progression

**Game starts (Difficulty Lv1):**
- First flag spawns: **Level 1** (50 points)
- Score increases by 50 when collected

**After 30 seconds (Difficulty Lv2):**
- Next flag spawns: **Level 2** (100 points)
- Score increases by 100 when collected

**After 60 seconds (Difficulty Lv3):**
- Next flag spawns: **Level 3** (200 points)
- Score increases by 200 when collected

**And so on...**

### Console Output

**When flag spawns:**
```
FlagManager: Spawned Level 1 flag on LowBox "Platform_02" at distance 12.3m
```

**When flag is collected:**
```
Flag Level 1 collected!
FlagManager: Notified ScoreManager about Level 1 flag collection
ScoreManager: Flag Level 1 collected! +50 points
FlagManager: Flag collected! Next flag will spawn after interval.
```

**If ScoreManager is missing:**
```
FlagManager: ScoreManager not found on GameManager node
```

## 🔍 Debugging

### Check Flag Level
```typescript
// In console when flag spawns
const flag = flagManager.getCurrentFlag();
const flagComponent = flag.getComponent(Flag);
console.log('Current flag level:', flagComponent.getFlagLevel());
```

### Check Difficulty Level
```typescript
// In console
const gameManager = node.getComponent(GameManager);
console.log('Current difficulty:', gameManager.getDifficultyLevel());
```

### Check Score Increase
```typescript
// Before collecting flag
console.log('Score before:', scoreManager.getScore());

// After collecting flag
console.log('Score after:', scoreManager.getScore());
```

## ⚠️ Important Notes

**Flag level now scales with difficulty:**
- Early game: Easy flags (Lv1-2)
- Mid game: Medium flags (Lv3)
- Late game: Hard flags (Lv4-5)

**Score progression:**
- Level 1 flag: 50 points
- Level 2 flag: 100 points (2x)
- Level 3 flag: 200 points (4x)
- Level 4 flag: 350 points (7x)
- Level 5 flag: 500 points (10x)

**Multipliers still apply:**
- Flag buff multiplier (x1.0 - x3.0)
- Combo multiplier (x1.2 - x2.0)
- Speed bonus (x1.1)

So a Level 5 flag with x2.0 combo and x3.0 flag buff = 500 × 2.0 × 3.0 = **3000 points!**
