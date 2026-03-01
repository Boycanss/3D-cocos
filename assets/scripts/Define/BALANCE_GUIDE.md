# Game Balance Guide - Fine-Tuned Values

## 🎯 Philosophy

**Core Design Goals:**
1. **Reward skill and risk-taking** - High scores for parkour mastery
2. **Encourage movement** - Running and wall running are highly rewarded
3. **Progressive difficulty** - Smooth curve from easy to challenging
4. **Meaningful choices** - Stamina management matters
5. **Fun over frustration** - Penalties hurt but don't devastate

## ⚡ Energy/Stamina System

### Total Stamina Pool
```typescript
STAMINA = 100
```
**Why 100?**
- Easy to understand (percentage-based)
- Allows ~60 seconds of continuous running
- Forces strategic stamina management
- Regenerates in ~200 seconds at base rate (0.5/s)

### Stamina Costs (Fine-Tuned)

| Action | Cost | Duration | Reasoning |
|--------|------|----------|-----------|
| **Running** | 1.5/s | Continuous | Can run for ~66 seconds continuously |
| **Wall Running** | 2.5/s | Continuous | Can wall run for ~40 seconds |
| **Jump** | 8 | Instant | ~12 jumps from full stamina |
| **Vault** | 6 | Instant | ~16 vaults from full stamina |
| **Dash** | 12 | Instant | ~8 dashes from full stamina (powerful!) |
| **Slide** | 4 | Instant | ~25 slides from full stamina |

### Stamina Regeneration
```typescript
staminaRegenRate = 0.5/s (base)
```
- Full recovery in ~200 seconds (if idle)
- Encourages brief rests between intense parkour
- Flag buffs can boost up to 0.875/s (75% boost)

### Balance Rationale

**Running (1.5/s):**
- Reduced from 2 to allow longer runs
- 66 seconds of continuous running before exhaustion
- Encourages exploration

**Wall Running (2.5/s):**
- Reduced from 3 to encourage this skill
- 40 seconds of wall running possible
- High score reward (8 pts/s) justifies cost

**Dash (12):**
- Increased from 10 - most powerful move
- Limited to ~8 uses from full stamina
- High cost = strategic use

**Jump (8):**
- Reduced from 10 for more frequent use
- ~12 jumps available
- Core parkour mechanic should be accessible

## 🎮 Difficulty Progression

### Level 1 (0-30s) - Tutorial Phase
```typescript
Boxes: 2
Missiles: 0
Focus: Learn basic parkour
Expected Score: 100-300
```

### Level 2 (30-60s) - Introduction
```typescript
Boxes: 3
Missiles: 1 (speed: 1.0x)
Focus: Introduce missiles, maintain parkour
Expected Score: 400-800
```

### Level 3 (60-90s) - Intermediate
```typescript
Boxes: 4
Missiles: 2 (speed: 1.5x)
Focus: Multi-tasking, flag buffs important
Expected Score: 900-1500
```

### Level 4 (90-120s) - Advanced
```typescript
Boxes: 5
Missiles: 3 (speed: 2.0x)
Focus: High-skill parkour, combo chains
Expected Score: 1600-2500
```

### Level 5 (120s+) - Expert
```typescript
Boxes: 6
Missiles: 4 (speed: 2.5x)
Focus: Mastery, perfect execution
Expected Score: 2600-4000+
```

### Why These Values?

**Gradual Increase:**
- Boxes: +1 per level (manageable)
- Missiles: 0 → 1 → 2 → 3 → 4 (not overwhelming)
- Speed: 1.0x → 2.5x (challenging but fair)

**Level 5 Reduced:**
- Missiles: 4 instead of 5 (less spam)
- Speed: 2.5x instead of 3.0x (dodgeable)
- Still very challenging but not unfair

## 📊 Scoring System

### Continuous Scoring (Per Second)

| State | Points/s | Reasoning |
|-------|----------|-----------|
| **Survival** | 1 | Passive reward, always earning |
| **Running** | 3 | 50% increase - encourages movement |
| **Wall Running** | 8 | 166% increase - rewards skill |

**Example:** 30 seconds of wall running = 240 points!

### Action-Based Scoring

| Action | Points | Frequency | Value/Stamina |
|--------|--------|-----------|---------------|
| **Jump** | 5 | High | 0.625 pts/stamina |
| **Slide** | 10 | Medium | 2.5 pts/stamina |
| **Dash** | 12 | Low | 1.0 pts/stamina |
| **Vault** | 15 | Medium | 2.5 pts/stamina |

**Best value:** Slide and Vault (2.5 points per stamina spent)

### Flag Collection Rewards

| Level | Points | Difficulty | Spawn Time | ROI |
|-------|--------|------------|------------|-----|
| **Lv1** | 100 | Easy | 0-30s | Good start |
| **Lv2** | 200 | Medium | 30-60s | 2x reward |
| **Lv3** | 400 | Hard | 60-90s | 4x reward |
| **Lv4** | 700 | Very Hard | 90-120s | 7x reward |
| **Lv5** | 1000 | Expert | 120s+ | 10x reward |

**Why doubled?**
- Flags are rare (15s spawn interval)
- Require risk (traveling to distant LowBoxes)
- Match difficulty progression
- Create exciting moments

### Penalties

| Penalty | Points | Impact |
|---------|--------|--------|
| **Damage** | -25 | ~5 jumps worth |
| **Obstacle** | -20 | ~4 jumps worth |
| **Missile** | -40 | ~8 jumps worth |
| **Survival Zone** | -60 | ~12 jumps worth |
| **Idle** | -3/s | Gentle nudge |

**Balance:**
- Penalties hurt but don't destroy progress
- One mistake ≠ game over
- Encourages careful play without being punishing

## 🏆 Expected Score Ranges

### 1 Minute Gameplay

**Beginner (Learning):**
- 200-500 points
- Mostly survival + running
- Few parkour moves
- Maybe 1 flag

**Intermediate (Competent):**
- 600-1200 points
- Regular parkour moves
- Some wall running
- 2-3 flags collected
- Few mistakes

**Advanced (Skilled):**
- 1500-2500 points
- Constant parkour chains
- Efficient wall running
- All flags collected
- Good combos

**Expert (Master):**
- 3000-5000+ points
- Perfect parkour execution
- Flag buff stacking
- Max combos (x2.0)
- No damage taken

### Score Breakdown Example (60s Expert Run)

```
Base Actions:
- Survival (60s): 60 pts
- Running (40s): 120 pts
- Wall Running (20s): 160 pts
- Parkour moves (15): 150 pts
Subtotal: 490 pts

Flags Collected:
- Flag Lv1: 100 pts
- Flag Lv2: 200 pts
- Flag Lv3: 400 pts
Subtotal: 700 pts

Multipliers:
- Combo x1.5: +178 pts
- Flag buffs: +595 pts
- Speed bonus x1.1: +207 pts

Total: 2170 pts (Rank A)
```

## 🎨 Flag Buff Benefits

### Level 1 (Difficulty Lv1)
```typescript
Score: x1.0 (no bonus - early game)
Speed: +5%
Duration: 10s
```
**Purpose:** Gentle introduction to buff system

### Level 2 (Difficulty Lv2)
```typescript
Score: x1.5
Speed: +10%
Stamina: -10%
Duration: 12s
```
**Purpose:** Noticeable improvement, teaches buff value

### Level 3 (Difficulty Lv3)
```typescript
Score: x2.0
Speed: +15%
Stamina: -20%
Regen: +25%
Duration: 15s
```
**Purpose:** Significant power spike, game-changing

### Level 4 (Difficulty Lv4)
```typescript
Score: x2.5
Speed: +20%
Stamina: -30%
Regen: +50%
Dash CD: -25%
Duration: 18s
```
**Purpose:** Near god-mode, rewards reaching late game

### Level 5 (Difficulty Lv5)
```typescript
Score: x3.0
Speed: +25%
Stamina: -40%
Regen: +75%
Dash CD: -50%
Invincibility: 2s
Duration: 20s
```
**Purpose:** Ultimate power fantasy, legendary reward

## ⚖️ Balance Considerations

### Stamina Economy

**Full stamina (100) allows:**
- 66s running OR
- 40s wall running OR
- 12 jumps OR
- 8 dashes OR
- 16 vaults OR
- 25 slides OR
- Mix of all above

**Regeneration:**
- 0.5/s base = 2 points per second
- With Lv5 flag buff: 0.875/s = 1.75 points per second
- Encourages brief pauses for strategic regen

### Score Progression

**Without flags (60s):**
- Pure survival: 60 pts
- Running only: 180 pts
- With parkour: 400-600 pts

**With flags (60s):**
- 1 flag: +100-400 pts
- 2 flags: +300-600 pts
- 3 flags: +700-1400 pts

**Flags are 2-3x more valuable than parkour!**
- Creates risk/reward gameplay
- Encourages exploration
- Makes flags feel special

### Difficulty Curve

**Obstacle Density:**
```
Lv1: 2 boxes = Easy navigation
Lv2: 3 boxes = Moderate challenge
Lv3: 4 boxes = Requires skill
Lv4: 5 boxes = High difficulty
Lv5: 6 boxes = Expert level
```

**Missile Threat:**
```
Lv1: 0 missiles = Safe learning
Lv2: 1 slow missile = Introduction
Lv3: 2 medium missiles = Multitasking
Lv4: 3 fast missiles = High pressure
Lv5: 4 very fast missiles = Extreme challenge
```

## 🎯 Recommended Tweaks for Different Playstyles

### For Casual Players (Easier)
```typescript
Energy.STAMINA = 150        // More stamina
Energy.RUN = 1.0            // Cheaper running
ScoreValues.DAMAGE_TAKEN = -15  // Less harsh penalties
GameLevelState.LEVEL5.missileAmount = 3  // Fewer missiles
```

### For Hardcore Players (Harder)
```typescript
Energy.STAMINA = 80         // Less stamina
Energy.RUN = 2.0            // More expensive
ScoreValues.DAMAGE_TAKEN = -35  // Harsher penalties
GameLevelState.LEVEL5.missileAmount = 6  // More missiles
```

### For Speedrunners (Fast-Paced)
```typescript
Energy.DASH = 8             // Cheaper dash
ScoreValues.RUNNING = 5     // Higher running reward
ScoreValues.WALL_RUNNING = 12  // Much higher wall run reward
Flag buff durations: -20%   // Shorter buffs, more action
```

## 📈 Progression Feel

**0-30s (Level 1):**
- Learning controls
- Building confidence
- First flag = exciting milestone
- Score: 100-300

**30-60s (Level 2):**
- Comfortable with mechanics
- First missile = new challenge
- Flag buffs feel powerful
- Score: 400-800

**60-90s (Level 3):**
- Chaining parkour moves
- Dodging multiple threats
- Flag hunting becomes strategic
- Score: 900-1500

**90-120s (Level 4):**
- High-skill gameplay
- Combo chains important
- Every move counts
- Score: 1600-2500

**120s+ (Level 5):**
- Mastery required
- Legendary flags = huge rewards
- Perfect execution needed
- Score: 2600-5000+

## 💡 Key Balance Points

### 1. Stamina is Precious
- 100 total = forces strategic use
- Can't spam all moves
- Must choose: dash or save for wall run?

### 2. Flags are Game-Changers
- 100-1000 points = massive rewards
- Buffs multiply future earnings
- Worth the risk to collect

### 3. Penalties are Fair
- -25 for damage = ~5 jumps worth
- Hurts but recoverable
- Encourages careful play

### 4. Difficulty Scales Smoothly
- +1 box per level = manageable
- Missiles introduced gradually
- Speed increases reasonably

### 5. Score Rewards Skill
- Wall running: 8 pts/s (best continuous)
- Vault: 15 pts (best single action)
- Flags: 100-1000 pts (best overall)
- Combos multiply everything

## 🎮 Playtesting Targets

**30-second run:**
- Beginner: 100-200 pts
- Intermediate: 300-500 pts
- Advanced: 600-1000 pts
- Expert: 1200-2000 pts

**60-second run:**
- Beginner: 300-600 pts
- Intermediate: 800-1500 pts
- Advanced: 1800-3000 pts
- Expert: 3500-6000 pts

**120-second run:**
- Beginner: 600-1200 pts
- Intermediate: 1500-3000 pts
- Advanced: 3500-6000 pts
- Expert: 7000-12000 pts

## 🔧 Fine-Tuning Tips

### If Game Feels Too Easy:
- Increase stamina costs (Energy values)
- Reduce stamina pool (STAMINA = 80)
- Increase missile count/speed
- Reduce flag buff durations

### If Game Feels Too Hard:
- Decrease stamina costs
- Increase stamina pool (STAMINA = 120)
- Reduce missile count/speed
- Increase flag buff durations

### If Scores Too High:
- Reduce ScoreValues
- Lower flag collection points
- Reduce multipliers

### If Scores Too Low:
- Increase ScoreValues
- Higher flag collection points
- Increase multipliers

## 📊 Value Comparison Chart

### Stamina Efficiency (Points per Stamina)

| Action | Cost | Points | Efficiency |
|--------|------|--------|------------|
| Running (1s) | 1.5 | 3 | **2.0** |
| Wall Run (1s) | 2.5 | 8 | **3.2** ⭐ Best! |
| Jump | 8 | 5 | 0.625 |
| Slide | 4 | 10 | **2.5** ⭐ |
| Dash | 12 | 12 | 1.0 |
| Vault | 6 | 15 | **2.5** ⭐ |

**Optimal strategy:** Wall running + Slides + Vaults

### Risk vs Reward

| Action | Risk | Reward | Worth It? |
|--------|------|--------|-----------|
| Flag Lv1 | Low | 100 pts | ✅ Always |
| Flag Lv2 | Medium | 200 pts | ✅ Yes |
| Flag Lv3 | High | 400 pts | ✅ Usually |
| Flag Lv4 | Very High | 700 pts | ⚠️ Risky |
| Flag Lv5 | Extreme | 1000 pts | ⚠️ High risk/reward |

## 🎯 Summary of Changes

### Energy System
- ✅ STAMINA: 10000000 → **100** (manageable)
- ✅ RUN: 2 → **1.5** (longer runs)
- ✅ JUMP: 10 → **8** (more jumps)
- ✅ VAULT: 5 → **6** (balanced)
- ✅ DASH: 10 → **12** (more strategic)
- ✅ SLIDE: 3 → **4** (balanced)
- ✅ WALL_RUN: 3 → **2.5** (encourage skill)

### Difficulty
- ✅ Level 2: Added 1 missile (was 0)
- ✅ Level 3: Increased to 2 missiles (was 1)
- ✅ Level 5: Reduced to 4 missiles (was 5)
- ✅ Level 5: Speed 2.5x (was 3.0x)

### Scoring
- ✅ RUNNING: 2 → **3** (50% increase)
- ✅ WALL_RUNNING: 5 → **8** (60% increase)
- ✅ JUMP: 3 → **5** (66% increase)
- ✅ SLIDE: 7 → **10** (43% increase)
- ✅ DASH: 8 → **12** (50% increase)
- ✅ VAULT: 10 → **15** (50% increase)
- ✅ All flags: **Doubled** (more exciting)
- ✅ Penalties: **Increased 20-25%** (more punishing)
- ✅ IDLE_PENALTY: -5 → **-3** (less harsh)

## 🎊 Result

**More Fun:**
- ✅ Longer runs before stamina depletion
- ✅ More frequent parkour moves
- ✅ Higher scores feel more rewarding
- ✅ Flags are exciting milestones
- ✅ Difficulty curve is smoother
- ✅ Skill is highly rewarded

**Better Balance:**
- ✅ Stamina management matters
- ✅ Every action has strategic value
- ✅ Risk/reward is clear
- ✅ Progression feels natural
- ✅ Late game is challenging but fair

These values create a **fast-paced, skill-rewarding parkour experience** that's fun for both casual and hardcore players! 🎮✨
