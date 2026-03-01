# Stamina System Balance Guide

## ⚡ Stamina Regeneration - Fine-Tuned

### New Value
```typescript
STAMINA_REGEN_RATE = 1.2 points/second
```

**Increased from 0.5 to 1.2 (140% faster!)**

## 📊 Stamina Economy Analysis

### Full Recovery Time
```
100 stamina ÷ 1.2 regen/s = 83.3 seconds
```

**Previous:** 200 seconds (too slow!)
**New:** 83 seconds (much better)

### Practical Recovery Times

| Stamina Used | Recovery Time | Scenario |
|--------------|---------------|----------|
| **12** (1 dash) | 10 seconds | Quick recovery |
| **25** (3 jumps) | 21 seconds | Short rest |
| **50** (half bar) | 42 seconds | Medium rest |
| **100** (full bar) | 83 seconds | Full recovery |

## 🎮 Gameplay Impact

### Before (0.5 regen/s)
```
Dash (12 stamina) → Wait 24 seconds to recover
Jump (8 stamina) → Wait 16 seconds to recover
```
**Problem:** Too slow, discourages action

### After (1.2 regen/s)
```
Dash (12 stamina) → Wait 10 seconds to recover
Jump (8 stamina) → Wait 7 seconds to recover
```
**Result:** Faster pacing, more action!

## 🔄 Stamina Flow Examples

### Scenario 1: Aggressive Parkour
```
Start: 100 stamina
- Dash: -12 → 88 stamina
- Jump: -8 → 80 stamina
- Vault: -6 → 74 stamina
- Slide: -4 → 70 stamina
- Run 10s: -15 → 55 stamina
- Idle 20s: +24 → 79 stamina
- Ready for more action!
```

### Scenario 2: Wall Running Focus
```
Start: 100 stamina
- Wall run 30s: -75 → 25 stamina
- Idle 30s: +36 → 61 stamina
- Wall run 20s: -50 → 11 stamina
- Idle 40s: +48 → 59 stamina
- Sustainable with breaks!
```

### Scenario 3: Mixed Gameplay
```
Start: 100 stamina
- Run 20s: -30 → 70 stamina
- Jump + Vault: -14 → 56 stamina
- Idle 10s: +12 → 68 stamina
- Dash + Slide: -16 → 52 stamina
- Run 15s: -22.5 → 29.5 stamina
- Idle 25s: +30 → 59.5 stamina
- Continuous action with brief rests!
```

## 🎯 Balance Rationale

### Why 1.2 regen/s?

**1. Faster Pacing**
- Encourages more frequent parkour
- Less waiting, more action
- Matches fast-paced parkour gameplay

**2. Strategic Resting**
- 10-20 second breaks are meaningful
- Don't need to idle for minutes
- Can plan next move while recovering

**3. Stamina Management Still Matters**
- Can't spam all moves continuously
- Must choose when to go all-out
- Brief rests are strategic

**4. Math Works Out**
```
Running cost: 1.5/s
Regen rate: 1.2/s
Net drain while running: -0.3/s

Can run for: 100 ÷ 0.3 = 333 seconds if alternating run/idle!
```

**5. Flag Buffs Are Valuable**
```
Base regen: 1.2/s
With Lv3 flag (+25%): 1.5/s
With Lv4 flag (+50%): 1.8/s
With Lv5 flag (+75%): 2.1/s

Lv5 flag = full recovery in 48 seconds!
```

## 📈 Comparison Chart

### Stamina Drain vs Regen

| Activity | Drain/s | Regen/s | Net | Sustainable? |
|----------|---------|---------|-----|--------------|
| **Idle** | 0 | 1.2 | +1.2 | ✅ Infinite |
| **Running** | 1.5 | 0 | -1.5 | ⚠️ 66 seconds |
| **Wall Running** | 2.5 | 0 | -2.5 | ⚠️ 40 seconds |
| **Run + Rest (50/50)** | 0.75 | 0.6 | -0.15 | ⚠️ 666 seconds |
| **With Lv5 Flag** | 0.9 | 2.1 | +1.2 | ✅ Infinite! |

### Recovery Efficiency

| Action Cost | Old Recovery | New Recovery | Improvement |
|-------------|--------------|--------------|-------------|
| **Dash (12)** | 24s | 10s | **140% faster** |
| **Jump (8)** | 16s | 7s | **128% faster** |
| **Vault (6)** | 12s | 5s | **140% faster** |
| **Slide (4)** | 8s | 3.3s | **142% faster** |

## 🎊 Gameplay Feel

### Before (0.5 regen/s)
- ❌ Too much waiting
- ❌ Slow pacing
- ❌ Frustrating downtime
- ❌ Discourages action

### After (1.2 regen/s)
- ✅ Quick recovery
- ✅ Fast pacing
- ✅ Minimal downtime
- ✅ Encourages parkour

## 🔧 Integration with Flag Buffs

### Flag Buff Multipliers

| Flag Level | Regen Boost | Final Regen/s | Full Recovery |
|------------|-------------|---------------|---------------|
| **None** | 0% | 1.2 | 83s |
| **Lv1** | 0% | 1.2 | 83s |
| **Lv2** | 0% | 1.2 | 83s |
| **Lv3** | +25% | 1.5 | 67s |
| **Lv4** | +50% | 1.8 | 56s |
| **Lv5** | +75% | 2.1 | 48s |

**With Lv5 flag:**
- Regen almost as fast as running drains!
- Can maintain near-infinite parkour
- Feels powerful and rewarding

## 💡 Advanced Strategies

### Stamina Cycling
```
1. Use 50 stamina (parkour moves)
2. Idle 20s → Recover 24 stamina
3. Use 50 stamina again
4. Idle 20s → Recover 24 stamina
5. Repeat

Net: Sustainable high-action gameplay!
```

### Flag Buff Optimization
```
Collect Lv5 flag → 2.1 regen/s for 20 seconds
= 42 stamina recovered while buffed
= Can do 5 dashes or 7 vaults during buff!
```

### Wall Run Mastery
```
Wall run 30s: -75 stamina
Idle 30s: +36 stamina
Wall run 15s: -37.5 stamina
Idle 30s: +36 stamina

Sustainable with 30s rest cycles!
```

## 🎯 Recommended Values Summary

### Core Stamina Values
```typescript
STAMINA = 100              // Total pool
STAMINA_REGEN_RATE = 1.2   // Regen per second (idle)
```

### Action Costs
```typescript
RUN = 1.5/s       // 66s continuous
WALL_RUN = 2.5/s  // 40s continuous
JUMP = 8          // 12 jumps
VAULT = 6         // 16 vaults
DASH = 12         // 8 dashes
SLIDE = 4         // 25 slides
```

### Recovery Times
```
Small action (4-8): 3-7 seconds
Medium action (12): 10 seconds
Heavy use (50): 42 seconds
Full recovery: 83 seconds
```

## 🎮 Playtesting Results

### Expected Gameplay Loop

**Active Phase (30-40s):**
- Constant parkour moves
- Wall running
- Flag hunting
- Stamina depletes to 20-30%

**Recovery Phase (15-20s):**
- Light running or idle
- Positioning for next flag
- Stamina recovers to 60-70%

**Repeat:**
- Sustainable gameplay
- No long boring waits
- Action-packed experience

### Player Feedback Targets

**"I can do parkour frequently"** ✅
- 1.2 regen allows quick recovery
- Don't feel stamina-starved

**"Stamina management matters"** ✅
- Can't spam everything
- Must choose moves wisely
- Strategic depth

**"Flag buffs feel powerful"** ✅
- +75% regen is noticeable
- Enables aggressive play
- Rewarding to collect

## 🔄 Alternative Values (If Needed)

### For More Casual Play
```typescript
STAMINA_REGEN_RATE = 1.5  // Even faster recovery
```

### For Hardcore Challenge
```typescript
STAMINA_REGEN_RATE = 0.8  // Slower recovery, more strategic
```

### For Speedrun Mode
```typescript
STAMINA_REGEN_RATE = 2.0  // Very fast, constant action
```

## 📊 Final Balance Summary

**Stamina System:**
- ✅ 100 total stamina (manageable)
- ✅ 1.2 regen/s (140% faster than before)
- ✅ 83s full recovery (reasonable)
- ✅ 10s recovery for dash (quick)

**Result:**
- Fast-paced parkour gameplay
- Strategic stamina management
- Minimal frustrating downtime
- Flag buffs feel impactful
- Balanced for fun and challenge

The new 1.2 regen rate creates a **dynamic, action-packed experience** while maintaining strategic depth! 🎮⚡
