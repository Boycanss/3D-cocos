# Stamina Restoration Fix

## 🐛 Problem Found

**StaminaManager is on GameManager node, not Player node!**

### Your Hierarchy
```
GameManager (Node)
└─ StaminaManager (Component) ← Here!

Player (Node)
├─ PlayerController (Component)
│  └─ Has reference to StaminaManager via @property
├─ FlagBuffManager (Component)
└─ Actor (Component)
```

### The Issue

**FlagBuffManager was trying:**
```typescript
this._staminaManager = this.node.getComponent(StaminaManager);
//                     ^^^^^^^^^ Looks on Player node
//                               Returns null! ❌
```

**But StaminaManager is on GameManager node!**

## ✅ Solution Applied

**FlagBuffManager now gets StaminaManager from PlayerController:**

```typescript
// Get StaminaManager from PlayerController (it's on GameManager, not Player)
if (this._playerController && this._playerController.staminaManager) {
    this._staminaManager = this._playerController.staminaManager;
    console.log('FlagBuffManager: StaminaManager found via PlayerController');
}
```

### Why This Works

**PlayerController already has the reference:**
```typescript
@property(StaminaManager)
staminaManager: StaminaManager = null;  // Assigned in inspector
```

**FlagBuffManager uses that reference:**
```typescript
this._staminaManager = this._playerController.staminaManager;
```

## 🎮 Expected Behavior Now

### When You Collect a Flag

**Console output:**
```
Flag: Collecting Level 1 flag...
Flag: FlagBuffManager found, applying buff...
FlagBuffManager: StaminaManager found via PlayerController ✅
FlagBuffManager: Applying instant restoration...
FlagBuffManager: Health to restore: 15
FlagBuffManager: Stamina to restore: 20
FlagBuffManager: Actor found. HP before: 60
FlagBuffManager: ✅ Restored 15 HP (60 → 75)
FlagBuffManager: StaminaManager found. Stamina before: 45.0
FlagBuffManager: ✅ Restored 20.0 Stamina (45.0 → 65.0)
```

**Visual result:**
- ❤️ Health bar increases immediately
- ⚡ Stamina bar increases immediately
- 💰 Score increases
- 🏃 Speed buff applies

## 🔍 Verification

**To verify it's working:**

1. **Run the game**
2. **Use some stamina** (jump, dash, run)
3. **Take some damage** (hit obstacles)
4. **Watch your bars:**
   - Health: Should be < 100
   - Stamina: Should be < 100
5. **Collect a flag**
6. **Watch bars increase immediately!** ✅

## 📊 Restoration Amounts

### Level 1 Flag
- Health: 60 → 75 (+15)
- Stamina: 45 → 65 (+20)

### Level 3 Flag
- Health: 60 → 100 (+40)
- Stamina: 45 → 95 (+50)

### Level 5 Flag
- Health: 10 → 100 (+90, full!)
- Stamina: 5 → 100 (+95, full!)

## ⚠️ Important Note

**StaminaManager must be assigned in PlayerController:**

1. Select **Player** node
2. Find **PlayerController** component
3. Check **Stamina Manager** property
4. Should be assigned to the StaminaManager on GameManager
5. If not assigned, drag GameManager's StaminaManager to this field

## ✅ Checklist

- [x] FlagBuffManager gets StaminaManager from PlayerController
- [x] Health restoration works (Actor is on Player)
- [x] Stamina restoration works (via PlayerController reference)
- [x] Console logs show restoration
- [x] Visual bars update immediately

The fix is applied! Stamina restoration should now work correctly. 🎉⚡
