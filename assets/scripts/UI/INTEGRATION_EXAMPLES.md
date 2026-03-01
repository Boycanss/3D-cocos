# FloatingStatDisplay Integration Examples

This guide shows how to integrate the FloatingStatDisplay system with various game systems.

## Table of Contents
1. [Flag Collection System](#flag-collection-system)
2. [Damage System](#damage-system)
3. [Stamina System](#stamina-system)
4. [Health Regeneration](#health-regeneration)
5. [Custom Stat Changes](#custom-stat-changes)

---

## Flag Collection System

### Automatic Display (Already Working)

The FloatingStatDisplay automatically monitors health and stamina changes, so flag restoration will show automatically:

```typescript
// In FlagBuffManager.ts or Flag.ts
const actor = this.playerNode.getComponent(Actor);
const staminaManager = playerController.staminaManager;

// Restore health (display shows automatically)
actor.heal(FlagRestoration.HEALTH_LEVEL_1);

// Restore stamina (display shows automatically)
staminaManager.addStamina(FlagRestoration.STAMINA_LEVEL_1);
```

### Manual Display (More Control)

For immediate feedback or custom timing:

```typescript
// In FlagBuffManager.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

export class FlagBuffManager extends Component {
    @property(Node)
    floatingStatDisplayNode: Node = null;

    applyFlagBuff(level: FlagLevel): void {
        const benefits = this.getFlagBenefits(level);
        const actor = this.playerNode.getComponent(Actor);
        const staminaManager = this.getStaminaManager();
        const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);

        // Restore health
        if (benefits.healthRestore > 0) {
            actor.heal(benefits.healthRestore);
            
            // Manual display (optional, for immediate feedback)
            if (floatingStats) {
                floatingStats.showStatChange('health', benefits.healthRestore);
            }
        }

        // Restore stamina
        if (benefits.staminaRestore > 0) {
            staminaManager.addStamina(benefits.staminaRestore);
            
            // Manual display (optional)
            if (floatingStats) {
                floatingStats.showStatChange('stamina', benefits.staminaRestore);
            }
        }
    }
}
```

---

## Damage System

### Obstacle Collision

```typescript
// In Box.ts or obstacle collision handler
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

onCollisionEnter(event: ICollisionEvent) {
    const otherNode = event.otherCollider.node;
    const actor = otherNode.getComponent(Actor);
    
    if (actor && !actor.isDead) {
        const damage = 10;
        
        // Apply damage
        actor.takeDamage(damage);
        
        // Display shows automatically via monitoring
        // No need to manually trigger
    }
}
```

### Missile Hit

```typescript
// In Missile.ts
onCollisionEnter(event: ICollisionEvent) {
    const otherNode = event.otherCollider.node;
    const actor = otherNode.getComponent(Actor);
    
    if (actor && !actor.isDead) {
        const damage = 25;
        
        // Apply damage
        actor.takeDamage(damage);
        
        // Display shows automatically
        // Red "-25" with health icon will appear
    }
}
```

### Survival Zone Damage

```typescript
// In SurvivalZone.ts
update(deltaTime: number) {
    if (this.isPlayerInZone && !this.actor.isDead) {
        const damage = this.damagePerSecond * deltaTime;
        
        // Apply continuous damage
        this.actor.takeDamage(damage);
        
        // Display will show when accumulated damage > minChangeThreshold
    }
}
```

---

## Stamina System

### Action Costs

All stamina-consuming actions automatically show displays:

```typescript
// In PlayerController.ts or action handlers

// Jump
this.staminaManager.reduceStamina(Energy.JUMP);
// Shows: Red "-8" with energy icon

// Dash
this.staminaManager.reduceStamina(Energy.DASH);
// Shows: Red "-12" with energy icon

// Slide
this.staminaManager.reduceStamina(Energy.SLIDE);
// Shows: Red "-4" with energy icon

// Vault
this.staminaManager.reduceStamina(Energy.VAULT);
// Shows: Red "-6" with energy icon

// Wall Run (per second)
this.staminaManager.reduceStamina(Energy.WALL_RUN * deltaTime);
// Shows when accumulated > minChangeThreshold
```

### Stamina Regeneration

```typescript
// In StaminaManager.ts
update(deltaTime: number) {
    if (this.stamina < Energy.STAMINA) {
        const regenAmount = Energy.STAMINA_REGEN_RATE * deltaTime;
        this.stamina += regenAmount;
        
        // Display shows automatically when accumulated > minChangeThreshold
        // Blue "+X" with energy icon
    }
}
```

### Adjusting Regen Display Frequency

To avoid spam from continuous regeneration:

```typescript
// In FloatingStatDisplay component properties
minChangeThreshold = 5; // Only show when regen accumulates to 5+

// Or in code:
const floatingStats = this.node.getComponent(FloatingStatDisplay);
floatingStats.minChangeThreshold = 5;
```

---

## Health Regeneration

### Automatic Regen

```typescript
// In Actor.ts
regenHealth(deltaTime: number) {
    if (this.autoRegen && this.currentHp < this.maxHp && this._regenActive) {
        const regenAmount = this.regenRate * deltaTime;
        this.currentHp += regenAmount;
        
        // Display shows automatically when accumulated > minChangeThreshold
        // Blue "+X" with health icon
    }
}
```

### Instant Heal

```typescript
// In Actor.ts or healing system
heal(amount: number) {
    const healAmt = Math.max(0, amount);
    this.currentHp += healAmt;
    if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
    
    // Display shows automatically
    // Blue "+X" with health icon
}
```

---

## Custom Stat Changes

### Power-Up Collection

```typescript
// In PowerUp.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

onCollect(player: Node): void {
    const actor = player.getComponent(Actor);
    const playerController = player.getComponent(PlayerController);
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    switch (this.powerUpType) {
        case 'health_pack':
            actor.heal(50);
            // Shows automatically: Blue "+50"
            break;
            
        case 'energy_drink':
            playerController.staminaManager.addStamina(30);
            // Shows automatically: Blue "+30"
            break;
            
        case 'full_restore':
            actor.heal(100);
            playerController.staminaManager.addStamina(100);
            // Shows both: Blue "+100" for health and stamina
            break;
    }
}
```

### Buff/Debuff System

```typescript
// In BuffManager.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

applyBuff(buffType: string, player: Node): void {
    const actor = player.getComponent(Actor);
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    switch (buffType) {
        case 'health_boost':
            // Increase max health and current health
            actor.maxHp += 50;
            actor.heal(50);
            // Shows: Blue "+50"
            break;
            
        case 'poison':
            // Apply damage over time
            this.schedule(() => {
                actor.takeDamage(5);
                // Shows: Red "-5" every tick
            }, 1.0, 10); // 10 ticks, 1 second apart
            break;
    }
}
```

### Level Up System

```typescript
// In LevelSystem.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

onLevelUp(player: Node): void {
    const actor = player.getComponent(Actor);
    const playerController = player.getComponent(PlayerController);
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    // Restore health and stamina on level up
    const healthRestore = 50;
    const staminaRestore = 50;
    
    actor.heal(healthRestore);
    playerController.staminaManager.addStamina(staminaRestore);
    
    // Shows both automatically
    // Blue "+50" for health
    // Blue "+50" for stamina
    
    // Optional: Manual trigger for guaranteed display
    if (floatingStats) {
        floatingStats.showStatChange('health', healthRestore);
        floatingStats.showStatChange('stamina', staminaRestore);
    }
}
```

---

## Advanced Integration

### Combo System

Show stat changes based on combo multiplier:

```typescript
// In ComboSystem.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

onComboComplete(player: Node, comboCount: number): void {
    const staminaManager = player.getComponent(PlayerController).staminaManager;
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    // Restore stamina based on combo
    const staminaReward = comboCount * 5;
    staminaManager.addStamina(staminaReward);
    
    // Shows: Blue "+X" where X = combo * 5
}
```

### Achievement System

```typescript
// In AchievementSystem.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

onAchievementUnlocked(achievement: string, player: Node): void {
    const actor = player.getComponent(Actor);
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    // Reward player with health/stamina
    const rewards = this.getAchievementRewards(achievement);
    
    if (rewards.health > 0) {
        actor.heal(rewards.health);
        // Shows automatically
    }
    
    if (rewards.stamina > 0) {
        const staminaManager = player.getComponent(PlayerController).staminaManager;
        staminaManager.addStamina(rewards.stamina);
        // Shows automatically
    }
}
```

### Critical Hit System

```typescript
// In CombatSystem.ts
import { FloatingStatDisplay } from '../UI/FloatingStatDisplay';

dealDamage(target: Node, baseDamage: number, isCritical: boolean): void {
    const actor = target.getComponent(Actor);
    const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
    
    const damage = isCritical ? baseDamage * 2 : baseDamage;
    
    actor.takeDamage(damage);
    
    // Shows automatically with appropriate color
    // Red "-X" for normal damage
    // Red "-XX" for critical damage
    
    // Optional: Different display for critical hits
    if (isCritical && floatingStats) {
        // Could add special effect or different color
        // by modifying FloatingStatDisplay.ts
    }
}
```

---

## Best Practices

### 1. Let Automatic Monitoring Handle Most Cases

```typescript
// ✅ Good: Let automatic monitoring work
actor.takeDamage(10);
actor.heal(20);
staminaManager.reduceStamina(Energy.DASH);

// ❌ Avoid: Manually triggering when automatic works
actor.takeDamage(10);
floatingStats.showStatChange('health', -10); // Redundant!
```

### 2. Manual Triggering for Special Cases

```typescript
// ✅ Good: Manual trigger for instant feedback
const healthRestore = this.calculateFlagRestore(level);
actor.heal(healthRestore);
floatingStats.showStatChange('health', healthRestore); // Immediate display

// ✅ Good: Manual trigger for predicted changes
const predictedDamage = this.calculateFutureDamage();
floatingStats.showStatChange('health', -predictedDamage); // Preview
```

### 3. Adjust Threshold for Different Systems

```typescript
// For continuous damage/regen
floatingStats.minChangeThreshold = 5; // Reduce spam

// For discrete actions
floatingStats.minChangeThreshold = 1; // Show all changes
```

### 4. Reference Management

```typescript
// ✅ Good: Cache reference in start()
start() {
    this.floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);
}

// ❌ Avoid: Getting component every frame
update() {
    const floatingStats = this.node.getComponent(FloatingStatDisplay); // Slow!
}
```

---

## Debugging Integration

### Check if Display is Working

```typescript
// In your system
const floatingStats = this.floatingStatDisplayNode?.getComponent(FloatingStatDisplay);

if (!floatingStats) {
    console.error('FloatingStatDisplay not found!');
    return;
}

// Test display
floatingStats.showStatChange('health', 25);
floatingStats.showStatChange('stamina', -15);
```

### Monitor Stat Changes

```typescript
// In Actor.ts or StaminaManager.ts
takeDamage(amount: number) {
    console.log(`Health: ${this.currentHp} -> ${this.currentHp - amount}`);
    this.currentHp -= amount;
}

reduceStamina(amount: number) {
    console.log(`Stamina: ${this.stamina} -> ${this.stamina - amount}`);
    this.stamina -= amount;
}
```

### Verify Automatic Monitoring

```typescript
// In FloatingStatDisplay.ts (temporary debug)
private monitorStatChanges(): void {
    if (actor) {
        const currentHealth = actor.currentHp;
        if (currentHealth !== this._previousHealth) {
            const change = currentHealth - this._previousHealth;
            console.log(`Health changed: ${change}`);
            this.createFloatingDisplay('health', change);
        }
    }
}
```

---

## Summary

**Automatic Display (Recommended):**
- Works for most cases
- No extra code needed
- Monitors health and stamina changes
- Shows displays automatically

**Manual Display (Special Cases):**
- Instant feedback for important events
- Preview/prediction displays
- Custom timing control
- Special effects or variations

**Integration Steps:**
1. Ensure FloatingStatDisplay is set up on player
2. Let automatic monitoring handle regular changes
3. Use manual triggering for special cases
4. Adjust `minChangeThreshold` as needed
5. Test from different camera angles

**Common Patterns:**
- Flag collection: Automatic ✅
- Damage: Automatic ✅
- Stamina consumption: Automatic ✅
- Regeneration: Automatic ✅
- Power-ups: Automatic or Manual
- Special events: Manual
