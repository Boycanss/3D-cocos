# Scoring System - Setup Guide

## 🎯 Quick Setup

### Step 1: Add ScoreManager to GameManager

1. Select your **GameManager** node
2. Add the **ScoreManager** component
3. Assign properties:
   - **Player Node**: Your player node
   - **Score Label**: UI Label for score display
   - **Multiplier Label**: UI Label for multiplier (optional)
   - **Combo Label**: UI Label for combo counter (optional)
   - **Idle Threshold**: 3.0 seconds
   - **Speed Bonus Threshold**: 0.8 (80% of max speed)

### Step 2: Create UI Labels

**Recommended UI Layout:**
```
Canvas
├─ ScoreDisplay (Label)
│  └─ Text: "Score: 0"
│
├─ MultiplierDisplay (Label)
│  └─ Text: "x1.0"
│
└─ ComboDisplay (Label)
   └─ Text: "Combo: 0"
```

### Step 3: That's It!

The ScoreManager automatically:
- ✅ Tracks all player actions
- ✅ Awards points based on movement state
- ✅ Applies multipliers from flags
- ✅ Manages combo chains
- ✅ Handles damage penalties
- ✅ Updates UI in real-time

## 📊 How Scoring Works

### Continuous Scoring (Per Second)

**While Idle:**
- +1 point/sec (survival)

**While Running:**
- +2 points/sec (running)
- +1 point/sec (survival)
- **Total: 3 pts/sec**

**While Wall Running:**
- +5 points/sec (wall running)
- +1 point/sec (survival)
- **Total: 6 pts/sec**
- **Adds to combo!**

### Action-Based Scoring

**When you perform an action:**
```typescript
Jump:  +3 points  + combo
Slide: +7 points  + combo
Dash:  +8 points  + combo
Vault: +10 points + combo
```

### Flag Collection

**Instant points + combo:**
```
Level 1: +50 points
Level 2: +100 points
Level 3: +200 points
Level 4: +350 points
Level 5: +500 points
```

**Plus flag buff multiplier for future points!**

### Combo System

**Combo builds when you:**
- Perform parkour actions (jump, slide, dash, vault)
- Wall run
- Collect flags

**Combo multipliers:**
- 3+ actions: **x1.2** multiplier
- 5+ actions: **x1.5** multiplier
- 10+ actions: **x2.0** multiplier

**Combo resets when:**
- You take damage
- No action for 2 seconds

### Multiplier Stacking

**Example calculation:**
```
Base action: 10 points (vault)
× Combo (5 actions): x1.5
× Flag buff (Level 3): x2.0
× Speed bonus: x1.1
= 10 × 1.5 × 2.0 × 1.1 = 33 points!
```

## 🎮 Gameplay Examples

### Beginner Run (30 seconds)
```
Survival (30s): 30 points
Running (20s): 40 points
Jumps (3): 9 points
Hit obstacle: -15 points
Total: 64 points (Rank: D)
```

### Intermediate Run (30 seconds)
```
Survival (30s): 30 points
Running (25s): 50 points
Wall Running (5s): 25 points
Vault (2): 20 points
Dash (2): 16 points
Flag Lv1: 50 points
Combo x1.2: +23 points
Total: 214 points (Rank: C)
```

### Advanced Run (30 seconds)
```
Survival (30s): 30 points
Running (20s): 40 points
Wall Running (10s): 50 points
Parkour moves: 50 points
Flag Lv3: 200 points
Flag buff x2.0: +200 points
Combo x1.5: +142 points
Speed bonus x1.1: +78 points
Total: 790 points (Rank: C)
```

### Master Run (60 seconds)
```
Survival (60s): 60 points
Running (50s): 100 points
Wall Running (20s): 100 points
Parkour moves: 150 points
Flags (Lv3 + Lv5): 700 points
Flag buffs: +500 points
Combo x2.0: +810 points
Speed bonus: +243 points
Perfect run x1.5: +1331 points
Total: 3994 points (Rank: A)
```

## 🏆 Ranking System

| Rank | Score | Description |
|------|-------|-------------|
| **D** | 0-500 | Beginner - Learning the ropes |
| **C** | 501-1000 | Competent - Getting the hang of it |
| **B** | 1001-2000 | Skilled - Solid parkour skills |
| **A** | 2001-3500 | Expert - Mastered the mechanics |
| **S** | 3501-5000 | Elite - Near perfect execution |
| **SS** | 5001+ | Master - Flawless performance |

## 🔧 Integration with Existing Systems

### Flag Collection (Already Integrated)

The Flag component automatically calls:
```typescript
scoreManager.awardFlagPoints(this._flagLevel);
```

### Damage Penalties (Automatic)

ScoreManager monitors Actor HP and applies penalties automatically.

### State-Based Scoring (Automatic)

ScoreManager tracks PlayerController state changes and awards points.

## 📈 Advanced Features

### Perfect Run Bonus

If player completes the run without taking damage:
```typescript
finalScore = currentScore × 1.5
```

Displayed at end screen with special message!

### Speed Bonus

When moving at >80% max speed:
```typescript
points × 1.1
```

Encourages maintaining momentum.

### Idle Penalty

After 3 seconds of idling:
```typescript
-5 points per second
```

Prevents camping and encourages action.

## 🎨 UI Customization

### Score Display Format

**Current implementation:**
```
Score: 1234
```

**You can customize to:**
```
🏆 1,234 pts
SCORE: 1234
1234
```

### Multiplier Display

**Shows when active:**
```
x2.5
```

**Hidden when x1.0**

### Combo Display

**Shows when 3+ actions:**
```
Combo: 7
```

**Hidden when < 3**

## 🐛 Debugging

### Check Score Calculation

Add to ScoreManager:
```typescript
public logScoreBreakdown(): void {
    console.log('=== Score Breakdown ===');
    console.log(`Current Score: ${this._currentScore}`);
    console.log(`Combo Count: ${this._comboCount}`);
    console.log(`Combo Multiplier: x${this._comboMultiplier}`);
    console.log(`Has Taken Damage: ${this._hasTakenDamage}`);
    console.log('=====================');
}
```

### Test Scoring

```typescript
// In console or test script
const scoreManager = gameManager.getComponent(ScoreManager);
scoreManager.awardPoints(100); // Add 100 points
console.log(scoreManager.getScore()); // Check current score
```

## ⚙️ Balance Adjustments

### If scores are too high:
- Reduce continuous action values (RUNNING, WALL_RUNNING)
- Lower flag collection points
- Reduce multipliers

### If scores are too low:
- Increase parkour action values
- Increase flag points
- Add more bonus multipliers

### If penalties are too harsh:
- Reduce penalty values
- Remove idle penalty
- Increase damage threshold

## 📝 Notes

**Score is saved with BestRunManager:**
- Integrate with existing best time system
- Save both time and score
- Display on game over screen

**Multipliers stack multiplicatively:**
- Combo × Flag Buff × Speed Bonus
- Can create very high scores with skill

**Negative scores prevented:**
- Score cannot go below 0
- Penalties still apply but won't create debt
