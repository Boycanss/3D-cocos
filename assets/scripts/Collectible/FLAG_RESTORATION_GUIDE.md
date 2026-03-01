# Flag Restoration System - Balance Guide

## 🏥 Health & Stamina Restoration

Flags now provide **instant restoration** on collection, making them even more valuable!

## 📊 Restoration Values by Level

### Level 1 (Early Game Support)
```typescript
Health: +15 HP (15% of max)
Stamina: +20 Energy (20% of max)
```
**Purpose:** Small boost to help beginners
**Scenario:** Recover from 1-2 obstacle hits

### Level 2 (Moderate Recovery)
```typescript
Health: +25 HP (25% of max)
Stamina: +35 Energy (35% of max)
```
**Purpose:** Noticeable recovery
**Scenario:** Recover from 2-3 hits or 1 dash + parkour

### Level 3 (Significant Recovery)
```typescript
Health: +40 HP (40% of max)
Stamina: +50 Energy (50% of max)
```
**Purpose:** Major recovery, game-changing
**Scenario:** Recover from heavy damage or stamina depletion

### Level 4 (Major Recovery)
```typescript
Health: +60 HP (60% of max)
Stamina: +75 Energy (75% of max)
```
**Purpose:** Near-full recovery
**Scenario:**救命 (lifesaver) when low on resources

### Level 5 (Full Recovery)
```typescript
Health: +100 HP (Full restore)
Stamina: +100 Energy (Full restore)
```
**Purpose:** Complete reset, legendary reward
**Scenario:** Second chance, enables risky plays

## 🎯 Balance Rationale

### Health Restoration

**Max HP = 100**

| Level | Restore | % | Damage Negated | Reasoning |
|-------|---------|---|----------------|-----------|
| **Lv1** | 15 | 15% | ~1 obstacle hit | Small help |
| **Lv2** | 25 | 25% | ~2 obstacle hits | Noticeable |
| **Lv3** | 40 | 40% | ~3 obstacle hits | Significant |
| **Lv4** | 60 | 60% | ~4 obstacle hits | Major recovery |
| **Lv5** | 100 | 100% | Full reset | Legendary |

**Why these values?**
- Scales with difficulty (harder levels = more damage taken)
- Level 5 = full heal (feels legendary)
- Early levels give small boost (not overpowered)
- Late levels can save you from death

### Stamina Restoration

**Max Stamina = 100**

| Level | Restore | % | Actions Enabled | Reasoning |
|-------|---------|---|-----------------|-----------|
| **Lv1** | 20 | 20% | 2 jumps or 1 dash | Quick boost |
| **Lv2** | 35 | 35% | 4 jumps or 2 dashes | Moderate |
| **Lv3** | 50 | 50% | 6 jumps or 4 dashes | Half refill |
| **Lv4** | 75 | 75% | 9 jumps or 6 dashes | Major refill |
| **Lv5** | 100 | 100% | Full reset | Complete refill |

**Why these values?**
- Enables immediate parkour after collection
- Level 5 = full stamina (enables aggressive play)
- Scales with flag difficulty (farther = better reward)
- Encourages flag hunting when low on stamina

## 🎮 Gameplay Impact

### Scenario 1: Low Health Recovery

**Before collecting flag:**
```
Health: 30/100 (critical!)
Stamina: 45/100
Status: Defensive play, avoiding risks
```

**After collecting Lv3 flag:**
```
Health: 70/100 (+40) ✅ Safe!
Stamina: 95/100 (+50) ✅ Full energy!
Status: Can play aggressively again
```

### Scenario 2: Stamina Depletion

**Before collecting flag:**
```
Health: 80/100
Stamina: 15/100 (exhausted!)
Status: Can't dash, limited parkour
```

**After collecting Lv4 flag:**
```
Health: 100/100 (+20, capped)
Stamina: 90/100 (+75) ✅ Almost full!
Status: Can chain multiple parkour moves
```

### Scenario 3: Near Death Save

**Before collecting flag:**
```
Health: 10/100 (near death!)
Stamina: 5/100 (exhausted!)
Status: One hit = game over
```

**After collecting Lv5 flag:**
```
Health: 100/100 (+90) ✅ Full health!
Stamina: 100/100 (+95) ✅ Full stamina!
Invincibility: 2 seconds ✅ Safe!
Status: Complete reset, second chance!
```

## 💡 Strategic Value

### Risk/Reward Analysis

**Level 1 Flag (Close, Easy):**
- Risk: Low (close to player)
- Reward: +15 HP, +20 Stamina, 100 points
- **Value:** Good for topping off resources

**Level 3 Flag (Medium Distance):**
- Risk: Medium (requires travel)
- Reward: +40 HP, +50 Stamina, 400 points, x2.0 score
- **Value:** Game-changing recovery

**Level 5 Flag (Far, Dangerous):**
- Risk: High (very far, many obstacles)
- Reward: +100 HP, +100 Stamina, 1000 points, x3.0 score, 2s invincibility
- **Value:** Complete reset, worth the risk!

### When to Hunt Flags

**Hunt Lv1-2 flags when:**
- ✅ Health > 60% (topping off)
- ✅ Stamina > 50% (not desperate)
- ✅ Safe opportunity

**Hunt Lv3-4 flags when:**
- ⚠️ Health 30-60% (need recovery)
- ⚠️ Stamina 20-50% (running low)
- ⚠️ Worth the risk

**Hunt Lv5 flags when:**
- 🚨 Health < 30% (desperate!)
- 🚨 Stamina < 20% (exhausted!)
- 🚨 High risk but necessary
- 💎 OR when healthy for massive score boost

## 📈 Progression Balance

### Early Game (Lv1-2 Flags)

**Typical damage taken:** 15-30 HP
**Typical stamina used:** 30-50 Energy

**Lv1 Flag Restoration:**
- Health: 15 HP → Covers 1 hit
- Stamina: 20 Energy → Covers 2-3 jumps
- **Assessment:** Helpful but not overpowered

**Lv2 Flag Restoration:**
- Health: 25 HP → Covers 2 hits
- Stamina: 35 Energy → Covers 1 dash + parkour
- **Assessment:** Noticeable improvement

### Mid Game (Lv3 Flags)

**Typical damage taken:** 40-60 HP
**Typical stamina used:** 60-80 Energy

**Lv3 Flag Restoration:**
- Health: 40 HP → Covers 3-4 hits
- Stamina: 50 Energy → Half refill
- **Assessment:** Significant recovery, worth hunting

### Late Game (Lv4-5 Flags)

**Typical damage taken:** 60-90 HP
**Typical stamina used:** 80-100 Energy

**Lv4 Flag Restoration:**
- Health: 60 HP → Covers 4-5 hits
- Stamina: 75 Energy → Almost full
- **Assessment:** Major recovery, can save run

**Lv5 Flag Restoration:**
- Health: 100 HP → Full heal
- Stamina: 100 Energy → Full refill
- **Assessment:** Complete reset, legendary

## 🎊 Complete Flag Benefits Summary

### Level 1 (Difficulty Lv1, 0-30s)
**Instant:**
- ❤️ +15 HP
- ⚡ +20 Stamina
- 💰 +100 Points

**Buff (10s):**
- 🏃 +5% Speed
- 💯 x1.0 Score

**Total Value:** Small boost, good start

### Level 2 (Difficulty Lv2, 30-60s)
**Instant:**
- ❤️ +25 HP
- ⚡ +35 Stamina
- 💰 +200 Points

**Buff (12s):**
- 🏃 +10% Speed
- 💪 -10% Stamina Cost
- 💯 x1.5 Score

**Total Value:** Solid recovery + buffs

### Level 3 (Difficulty Lv3, 60-90s)
**Instant:**
- ❤️ +40 HP
- ⚡ +50 Stamina
- 💰 +400 Points

**Buff (15s):**
- 🏃 +15% Speed
- 💪 -20% Stamina Cost
- 🔄 +25% Regen
- 💯 x2.0 Score

**Total Value:** Game-changing recovery

### Level 4 (Difficulty Lv4, 90-120s)
**Instant:**
- ❤️ +60 HP
- ⚡ +75 Stamina
- 💰 +700 Points

**Buff (18s):**
- 🏃 +20% Speed
- 💪 -30% Stamina Cost
- 🔄 +50% Regen
- ⚡ -25% Dash Cooldown
- 💯 x2.5 Score

**Total Value:** Major recovery + powerful buffs

### Level 5 (Difficulty Lv5, 120s+)
**Instant:**
- ❤️ +100 HP (FULL HEAL!)
- ⚡ +100 Stamina (FULL REFILL!)
- 💰 +1000 Points

**Buff (20s):**
- 🏃 +25% Speed
- 💪 -40% Stamina Cost
- 🔄 +75% Regen
- ⚡ -50% Dash Cooldown
- 🛡️ 2s Invincibility
- 💯 x3.0 Score

**Total Value:** LEGENDARY - Complete reset + god mode

## 🎯 Design Philosophy

### Instant Restoration
**Purpose:** Immediate tactical value
- Rewards risky flag hunting
- Can save you from death
- Enables aggressive play
- Feels satisfying

### Buff Duration
**Purpose:** Strategic ongoing value
- Multiplies future earnings
- Enhances playstyle
- Creates power windows
- Encourages skilled play

### Combined Value
**Instant + Buff = Complete Package**
- Immediate survival benefit
- Long-term score benefit
- Risk/reward is clear
- Every flag level feels distinct

## 📊 Value Comparison

### Total Value Analysis (60s after collection)

**Level 1:**
- Instant: 15 HP + 20 Stamina + 100 pts
- Buff value: ~50 pts (10s × x1.0)
- **Total: ~150 pts + small recovery**

**Level 3:**
- Instant: 40 HP + 50 Stamina + 400 pts
- Buff value: ~600 pts (15s × x2.0)
- **Total: ~1000 pts + major recovery**

**Level 5:**
- Instant: 100 HP + 100 Stamina + 1000 pts
- Buff value: ~1800 pts (20s × x3.0)
- **Total: ~2800 pts + full reset**

## 🎮 Playtesting Scenarios

### Scenario: Desperate Recovery
```
Player at 20 HP, 10 Stamina
Sees Lv5 flag far away
Risk: Might die getting there
Reward: Full heal + full stamina + 1000 pts

Decision: High risk, high reward!
Result: Epic moment if successful
```

### Scenario: Optimal Timing
```
Player at 60 HP, 40 Stamina
Sees Lv3 flag medium distance
Risk: Moderate
Reward: 40 HP + 50 Stamina + 400 pts + x2.0 buff

Decision: Perfect timing!
Result: Back to full power + score boost
```

### Scenario: Greedy Play
```
Player at 90 HP, 80 Stamina (healthy)
Sees Lv5 flag
Risk: Moderate (already healthy)
Reward: 10 HP + 20 Stamina + 1000 pts + x3.0 buff

Decision: Worth it for score!
Result: Massive score boost
```

## ⚖️ Balance Considerations

### Not Overpowered Because:
1. **Flags are rare** (15s spawn interval)
2. **Higher levels are far** (risky to reach)
3. **Only one flag at a time** (can't spam)
4. **Difficulty scales** (more damage taken at higher levels)

### Perfectly Balanced Because:
1. **Scales with difficulty** (Lv5 flags appear when you need them most)
2. **Risk matches reward** (far flags = better restoration)
3. **Strategic choices** (hunt now or wait?)
4. **Feels rewarding** (instant feedback)

## 🎊 Summary

### Restoration Values

| Level | Health | Stamina | Recovery % | Use Case |
|-------|--------|---------|------------|----------|
| **1** | +15 | +20 | 15-20% | Top off |
| **2** | +25 | +35 | 25-35% | Moderate recovery |
| **3** | +40 | +50 | 40-50% | Major recovery |
| **4** | +60 | +75 | 60-75% | Near-full recovery |
| **5** | +100 | +100 | 100% | Complete reset |

### Why These Values Work

**Progressive Scaling:**
- Each level is meaningfully better
- Clear progression
- Matches difficulty curve

**Balanced Impact:**
- Early flags: Helpful but not game-breaking
- Late flags: Powerful but rare and risky
- Level 5: Legendary but hardest to reach

**Strategic Depth:**
- Hunt flags when low on resources
- Or hunt for score when healthy
- Multiple valid strategies

**Fun Factor:**
- Instant gratification (immediate heal)
- Long-term benefit (buff duration)
- Exciting risk/reward moments
- Feels rewarding to collect

## 🎮 Expected Player Reactions

**Collecting Lv1 flag:**
"Nice, got a little boost!"

**Collecting Lv3 flag:**
"Yes! Back in the game!"

**Collecting Lv5 flag at low health:**
"SAVED! Full heal! This is amazing!"

**Collecting Lv5 flag at full health:**
"1000 points + x3.0 multiplier! Let's go!"

The restoration system adds **tactical depth** and makes flags feel like **exciting power-ups** rather than just score bonuses! 🎁✨
