# Scoring System Analysis & Balance

## 📊 Game Mechanics Analysis

### Positive Actions (Score Gain)

| Action | Frequency | Difficulty | Base Score | Reasoning |
|--------|-----------|------------|------------|-----------|
| **Survival Time** | Continuous | Easy | **1 point/sec** | Passive reward for staying alive |
| **Running** | Continuous | Easy | **2 points/sec** | Encourages movement |
| **Wall Running** | Situational | Medium | **5 points/sec** | Requires skill + stamina management |
| **Vaulting** | Per action | Medium | **10 points** | Requires timing + positioning |
| **Jumping** | Per action | Easy | **3 points** | Basic parkour move |
| **Dashing** | Per action | Medium | **8 points** | Requires stamina + cooldown management |
| **Sliding** | Per action | Medium | **7 points** | Requires timing + momentum |
| **Flag Collection Lv1** | Rare | Easy | **50 points** | Closest flags |
| **Flag Collection Lv2** | Rare | Medium | **100 points** | Medium distance |
| **Flag Collection Lv3** | Rare | Medium-Hard | **200 points** | Far distance |
| **Flag Collection Lv4** | Very Rare | Hard | **350 points** | Very far distance |
| **Flag Collection Lv5** | Very Rare | Very Hard | **500 points** | Farthest + legendary |
| **Combo Multiplier** | Continuous | Hard | **x1.5 - x3.0** | Chaining actions without damage |

### Negative Actions (Score Loss)

| Action | Frequency | Impact | Score Penalty | Reasoning |
|--------|-----------|--------|---------------|-----------|
| **Taking Damage** | Occasional | Medium | **-20 points** | Punishment for poor play |
| **Hitting Obstacle** | Occasional | Medium | **-15 points** | Collision penalty |
| **Hitting Missile** | Occasional | High | **-30 points** | Harder to avoid |
| **Falling into Survival Zone** | Rare | High | **-50 points** | Major mistake |
| **Idling (>3 sec)** | Rare | Low | **-5 points/sec** | Discourages camping |

### Multipliers & Bonuses

| Condition | Multiplier | Duration | Notes |
|-----------|------------|----------|-------|
| **Flag Buff Active** | x1.0 - x3.0 | 10-20s | Based on flag level |
| **Combo Chain (3+ actions)** | x1.2 | Until damage | Encourages aggressive play |
| **Combo Chain (5+ actions)** | x1.5 | Until damage | Rewards skilled play |
| **Combo Chain (10+ actions)** | x2.0 | Until damage | Master level |
| **Perfect Run (No damage)** | x1.5 | Entire run | Bonus at end |
| **Speed Bonus (>80% max speed)** | x1.1 | While fast | Encourages momentum |

## 🎯 Balanced Scoring Values

### Base Points Per Action

```typescript
export enum ScoreValues {
    // Continuous Actions (per second)
    SURVIVAL = 1,
    RUNNING = 2,
    WALL_RUNNING = 5,
    
    // Single Actions
    JUMP = 3,
    SLIDE = 7,
    DASH = 8,
    VAULT = 10,
    
    // Flag Collection
    FLAG_LEVEL_1 = 50,
    FLAG_LEVEL_2 = 100,
    FLAG_LEVEL_3 = 200,
    FLAG_LEVEL_4 = 350,
    FLAG_LEVEL_5 = 500,
    
    // Penalties
    DAMAGE_TAKEN = -20,
    OBSTACLE_HIT = -15,
    MISSILE_HIT = -30,
    SURVIVAL_ZONE_HIT = -50,
    IDLE_PENALTY = -5,  // per second after 3 seconds
}
```

## 📈 Score Progression Example

**30-second run scenario:**

```
Time: 0-10s (Learning phase)
- Survival: 10 points (10s × 1)
- Running: 20 points (10s × 2)
- 2 Jumps: 6 points (2 × 3)
- 1 Vault: 10 points
- Hit obstacle: -15 points
Subtotal: 31 points

Time: 10-20s (Getting better)
- Survival: 10 points
- Running: 16 points (8s × 2)
- Wall Running: 10 points (2s × 5)
- 1 Dash: 8 points
- 1 Slide: 7 points
- Combo x1.2: +6 points
Subtotal: 57 points

Time: 20-30s (Mastery + Flag)
- Survival: 10 points
- Running: 20 points (10s × 2)
- Flag Lv3 collected: 200 points
- Flag buff x2.0: +40 points (20s of actions)
- Combo x1.5: +30 points
Subtotal: 300 points

Total: 388 points in 30 seconds
```

## ⚖️ Balance Considerations

### Why These Values?

**1. Survival (1 pt/s)**
- Base reward ensures everyone gets points
- 60 points per minute is minimal but fair
- Encourages staying alive

**2. Running (2 pt/s)**
- Double survival rate
- Encourages movement over camping
- 120 points per minute if constantly running

**3. Wall Running (5 pt/s)**
- 2.5x running rate
- Requires skill + stamina management
- High risk (can fall) = high reward

**4. Parkour Moves (3-10 pts)**
- Jump (3): Most common, lowest reward
- Slide (7): Requires timing
- Dash (8): Limited by cooldown + stamina
- Vault (10): Requires obstacle + positioning

**5. Flags (50-500 pts)**
- Level 1 (50): Easy to reach, small bonus
- Level 5 (500): Very far, huge reward
- Risk/reward scales with distance
- Rare spawns justify high values

**6. Penalties (-15 to -50)**
- Damage (-20): Moderate punishment
- Obstacle (-15): Slightly less than damage
- Missile (-30): Harder to avoid
- Survival Zone (-50): Major mistake
- Balanced to hurt but not devastate

**7. Multipliers (x1.1 - x3.0)**
- Flag buffs (x1.0-x3.0): Temporary power
- Combo chains (x1.2-x2.0): Skill-based
- Speed bonus (x1.1): Encourages momentum
- Perfect run (x1.5): End-game bonus

## 🎮 Gameplay Impact

### Early Game (0-30s)
- Focus: Learning mechanics
- Expected Score: 50-150 points
- Main Sources: Survival + basic parkour

### Mid Game (30s-2min)
- Focus: Chaining actions
- Expected Score: 300-800 points
- Main Sources: Combos + wall running

### Late Game (2min+)
- Focus: Flag hunting + combos
- Expected Score: 1000+ points
- Main Sources: Flags + multipliers

### Skill Levels

**Beginner (First try):**
- 200-400 points in 1 minute
- Mostly survival + running
- Few parkour moves

**Intermediate (Learning):**
- 600-1000 points in 1 minute
- Regular parkour moves
- Some wall running
- 1-2 flags collected

**Advanced (Skilled):**
- 1500-2500 points in 1 minute
- Constant combos
- Efficient wall running
- 3-4 flags collected
- Few mistakes

**Master (Speedrunner):**
- 3000+ points in 1 minute
- Perfect combos
- Flag buff stacking
- No damage taken
- Perfect run bonus

## 🔄 Dynamic Difficulty Scaling

As game difficulty increases (Level 1-5):

**Obstacles increase:**
- More chances to lose points
- But also more vaulting opportunities

**Missiles increase:**
- Higher penalty risk (-30)
- But dodging gives combo points

**Flags become more valuable:**
- Higher level flags spawn
- Greater risk = greater reward

## 💡 Additional Mechanics

### Combo System
```
3 actions without damage: x1.2
5 actions without damage: x1.5
10 actions without damage: x2.0
Damage taken: Reset combo
```

### Speed Bonus
```
Speed > 80% max speed: x1.1 multiplier
Encourages maintaining momentum
```

### Perfect Run Bonus
```
Complete run without taking damage: x1.5 final score
Displayed at end screen
```

### Idle Penalty
```
No movement for 3+ seconds: -5 points/second
Prevents camping/AFK
```

## 📊 Score Display

**During Gameplay:**
- Current Score (top right)
- Current Multiplier (below score)
- Combo Counter (when active)
- Score Popup (+X points) for actions

**End Screen:**
- Final Score
- Breakdown by category
- Highest Combo
- Flags Collected
- Perfect Run Bonus (if applicable)
- Rank (D, C, B, A, S, SS)

## 🏆 Ranking System

| Rank | Score Range | Description |
|------|-------------|-------------|
| **D** | 0-500 | Beginner |
| **C** | 501-1000 | Learning |
| **B** | 1001-2000 | Competent |
| **A** | 2001-3500 | Skilled |
| **S** | 3501-5000 | Expert |
| **SS** | 5001+ | Master |

## 🎯 Summary

This scoring system:
- ✅ Rewards skill and risk-taking
- ✅ Punishes mistakes moderately
- ✅ Encourages aggressive play
- ✅ Scales with difficulty
- ✅ Provides clear progression
- ✅ Balances all mechanics
- ✅ Creates replayability
