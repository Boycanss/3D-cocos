# Flag Restoration Troubleshooting

## 🔍 Debugging Steps

When you collect a flag, check the console output:

### ✅ Working Correctly

You should see:
```
Flag: Collecting Level 1 flag...
Flag: FlagBuffManager found, applying buff...
FlagBuffManager: Applying instant restoration...
FlagBuffManager: Health to restore: 15
FlagBuffManager: Stamina to restore: 20
FlagBuffManager: Actor found. HP before: 60
FlagBuffManager: ✅ Restored 15 HP (60 → 75)
FlagBuffManager: StaminaManager found. Stamina before: 45.0
FlagBuffManager: ✅ Restored 20.0 Stamina (45.0 → 65.0)
FlagBuffManager: Applied Level 1 buff for 10s
=== Flag Buff Details ===
Health Restore: +15 HP
Stamina Restore: +20 Energy
...
```

### ❌ Problem: FlagBuffManager Not Found

If you see:
```
Flag: FlagBuffManager NOT found on player node!
```

**Solution:**
1. Select your **Player** node in hierarchy
2. Add **FlagBuffManager** component
3. Save scene

### ❌ Problem: Actor Not Found

If you see:
```
FlagBuffManager: ❌ Actor component not found!
```

**Solution:**
1. Select your **Player** node
2. Verify **Actor** component exists
3. If not, add Actor component

### ❌ Problem: StaminaManager Not Found

If you see:
```
FlagBuffManager: ❌ StaminaManager component not found!
```

**Solution:**
1. Check if StaminaManager is on **Player** node
2. If it's on GameManager, you need to get it differently
3. Or add StaminaManager to Player node

## 🔧 Quick Fix Checklist

### Player Node Must Have:
- [ ] **PlayerController** component
- [ ] **FlagBuffManager** component ← Add this!
- [ ] **Actor** component
- [ ] **StaminaManager** component (or reference to it)
- [ ] **CharacterController** component

### Verify Setup

**In Cocos Creator:**
1. Select Player node
2. Check Inspector for all components
3. If FlagBuffManager is missing, add it
4. Save scene

## 🎮 Expected Behavior

### Before Collecting Flag
```
Health: 60/100
Stamina: 45/100
```

### After Collecting Lv3 Flag
```
Health: 100/100 (+40, capped at max)
Stamina: 95/100 (+50)
Score: +400 points
Buff: x2.0 score multiplier for 15s
```

### Console Output
```
Flag: Collecting Level 3 flag...
Flag: FlagBuffManager found, applying buff...
FlagBuffManager: Applying instant restoration...
FlagBuffManager: ✅ Restored 40 HP (60 → 100)
FlagBuffManager: ✅ Restored 50.0 Stamina (45.0 → 95.0)
```

## 🐛 Common Issues

### Issue 1: No Restoration Happening

**Symptoms:**
- Flag collected
- Buffs apply (speed, score multiplier)
- But health/stamina don't increase

**Cause:**
- FlagBuffManager not on player node
- Actor or StaminaManager not found

**Fix:**
- Add FlagBuffManager to player node
- Verify Actor and StaminaManager exist

### Issue 2: Partial Restoration

**Symptoms:**
- Health restores but stamina doesn't
- Or vice versa

**Cause:**
- One component missing (Actor or StaminaManager)

**Fix:**
- Check console for which component is missing
- Add the missing component

### Issue 3: No Console Logs

**Symptoms:**
- Flag collected
- No restoration logs appear

**Cause:**
- FlagBuffManager not being called
- Flag.collectFlag() not executing

**Fix:**
- Check if FlagBuffManager exists on player
- Verify Flag collision is working

## 📋 Component Hierarchy

### Correct Setup

```
Player (Node)
├─ PlayerController (Component)
├─ FlagBuffManager (Component) ← MUST BE HERE
├─ Actor (Component) ← For health
├─ StaminaManager (Component) ← For stamina
├─ CharacterController (Component)
└─ Other components...
```

### Alternative Setup (If StaminaManager is on GameManager)

If your StaminaManager is on GameManager node, you need to modify FlagBuffManager.start():

```typescript
start() {
    this._playerController = this.node.getComponent(PlayerController);
    this._actor = this.node.getComponent(Actor);
    
    // Get StaminaManager from GameManager instead
    const gameManager = find('GameManager'); // or however you reference it
    if (gameManager) {
        this._staminaManager = gameManager.getComponent(StaminaManager);
    }
    
    // ... rest of code
}
```

## ✅ Verification Steps

1. **Run the game**
2. **Reduce your health** (take damage from obstacles)
3. **Use some stamina** (jump, dash, etc.)
4. **Collect a flag**
5. **Check console** for restoration logs
6. **Watch health/stamina bars** - should increase immediately

## 💡 Quick Test

Add this to PlayerController for testing:

```typescript
// In onKeyDown, add test key
if (event.keyCode === KeyCode.KEY_T) {
    // Test restoration
    const buffManager = this.node.getComponent(FlagBuffManager);
    if (buffManager) {
        buffManager.applyFlagBuff(FlagLevel.LEVEL5);
        console.log('TEST: Applied Lv5 flag buff');
    }
}
```

Press T key to test if restoration works without collecting a flag.

## 🎯 Expected Console Output

**Complete successful collection:**
```
PlayerController: Collided with Flag
PlayerController: Hit a Flag!
Flag: onPlayerCollision called. IsCollected: false
>>>>>> Flag Collected via CharacterController!
Flag: Collecting Level 3 flag...
Flag: FlagBuffManager found, applying buff...
FlagBuffManager: Applying instant restoration...
FlagBuffManager: Health to restore: 40
FlagBuffManager: Stamina to restore: 50
FlagBuffManager: Actor found. HP before: 60
FlagBuffManager: ✅ Restored 40 HP (60 → 100)
FlagBuffManager: StaminaManager found. Stamina before: 45.0
FlagBuffManager: ✅ Restored 50.0 Stamina (45.0 → 95.0)
FlagBuffManager: Applied Level 3 buff for 15s
=== Flag Buff Details ===
Health Restore: +40 HP
Stamina Restore: +50 Energy
Score Multiplier: 2.0x
...
FlagManager: Notified ScoreManager about Level 3 flag collection
ScoreManager: Flag Level 3 collected! +400 points
```

If you don't see the restoration logs, the issue is likely that **FlagBuffManager is not on the player node**. Add it and try again!
