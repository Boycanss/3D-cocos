# StatChange Prefab - Complete Creation Guide

## 🎯 Step-by-Step Prefab Creation

### Step 1: Create Root Node

1. **In Cocos Creator Hierarchy**, right-click → **Create** → **Create Empty Node**
2. **Rename** to `StatChangePrefab`
3. **Add UITransform** component (should be added automatically)
4. **Set UITransform properties:**
   - Width: 100
   - Height: 40
   - Anchor: (0.5, 0.5)

### Step 2: Create Icon Child Node

1. **Right-click StatChangePrefab** → **Create** → **Create Empty Node**
2. **Rename** to `Icon`
3. **Add Sprite component:**
   - Click "Add Component" → Search "Sprite" → Add
4. **Set Icon properties:**
   - **Position:** X: -30, Y: 0, Z: 0
   - **UITransform:**
     - Width: 32
     - Height: 32
     - Anchor: (0.5, 0.5)
   - **Sprite:**
     - Type: Simple
     - SpriteFrame: (leave empty, will be set at runtime)

### Step 3: Create Value Child Node

1. **Right-click StatChangePrefab** → **Create** → **2D Object** → **Label**
2. **Rename** to `Value`
3. **Set Value properties:**
   - **Position:** X: 10, Y: 0, Z: 0
   - **UITransform:**
     - Width: 60
     - Height: 40
     - Anchor: (0, 0.5)
   - **Label:**
     - String: "+50" (placeholder)
     - Font Size: 24
     - Color: White (255, 255, 255, 255)
     - Horizontal Align: Left
     - Vertical Align: Center
     - Overflow: Clamp

### Step 4: Optional - Add StatChangeDisplay Component

1. **Select StatChangePrefab** root node
2. **Add Component** → Search "StatChangeDisplay" → Add
3. This is just a marker component (optional)

### Step 5: Save as Prefab

1. **Drag StatChangePrefab** from Hierarchy to Assets folder
2. **Save** in a prefabs folder (e.g., `assets/prefabs/UI/`)
3. **Delete** the instance from the scene (keep only the prefab)

## 📐 Final Prefab Structure

```
StatChangePrefab (UITransform: 100x40)
│
├─ Icon (Sprite)
│  ├─ Position: (-30, 0, 0)
│  ├─ UITransform: 32x32
│  ├─ Anchor: (0.5, 0.5)
│  └─ Sprite Component
│     ├─ Type: Simple
│     └─ SpriteFrame: (empty)
│
└─ Value (Label)
   ├─ Position: (10, 0, 0)
   ├─ UITransform: 60x40
   ├─ Anchor: (0, 0.5)
   └─ Label Component
      ├─ String: "+50"
      ├─ Font Size: 24
      ├─ Color: White
      ├─ Horizontal Align: Left
      └─ Vertical Align: Center
```

## 🎨 Visual Layout

```
┌──────────────────────┐
│                      │
│  [Icon]  +50        │  ← Icon on left, value on right
│   32x32              │
│                      │
└──────────────────────┘
     100 pixels wide
```

## 🔧 Alternative: Create Programmatically

If you prefer to create the prefab in code, here's a helper script:

```typescript
import { _decorator, Component, instantiate, Label, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StatChangePrefabCreator')
export class StatChangePrefabCreator extends Component {
    
    /**
     * Call this once to create the prefab structure
     */
    public createStatChangePrefab(): Node {
        // Create root node
        const root = new Node('StatChangePrefab');
        const rootTransform = root.addComponent(UITransform);
        rootTransform.setContentSize(100, 40);
        rootTransform.setAnchorPoint(0.5, 0.5);

        // Create Icon node
        const iconNode = new Node('Icon');
        const iconTransform = iconNode.addComponent(UITransform);
        iconTransform.setContentSize(32, 32);
        iconTransform.setAnchorPoint(0.5, 0.5);
        iconNode.addComponent(Sprite);
        iconNode.setPosition(-30, 0, 0);
        iconNode.setParent(root);

        // Create Value node
        const valueNode = new Node('Value');
        const valueTransform = valueNode.addComponent(UITransform);
        valueTransform.setContentSize(60, 40);
        valueTransform.setAnchorPoint(0, 0.5);
        const label = valueNode.addComponent(Label);
        label.string = '+50';
        label.fontSize = 24;
        label.horizontalAlign = Label.HorizontalAlign.LEFT;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.overflow = Label.Overflow.CLAMP;
        valueNode.setPosition(10, 0, 0);
        valueNode.setParent(root);

        return root;
    }
}
```

## ✅ Verification Checklist

After creating the prefab, verify:

- [ ] Root node named "StatChangePrefab"
- [ ] Has UITransform (100x40)
- [ ] Has child node named "Icon"
- [ ] Icon has Sprite component
- [ ] Icon position is (-30, 0, 0)
- [ ] Icon size is 32x32
- [ ] Has child node named "Value"
- [ ] Value has Label component
- [ ] Value position is (10, 0, 0)
- [ ] Label font size is 24
- [ ] Label horizontal align is LEFT
- [ ] Saved as prefab in assets

## 🎮 Testing

### In upperInfo Component

1. **Assign the prefab** to `statChangePrefab` property
2. **Assign icons** to HealthIcon and EnergyIcon
3. **Run the game**
4. **Take damage** or **collect a flag**
5. **Should see floating text** above player!

### Expected Result

**When collecting Lv3 flag:**
```
[Icon: ❤️] +40  ← Light blue, floating up
[Icon: ⚡] +50  ← Light blue, floating up
```

**When taking damage:**
```
[Icon: ❤️] -20  ← Red, floating up
```

## 🎨 Customization Tips

### Larger Text
```
Label Font Size: 32 (instead of 24)
```

### Different Layout
```
Icon Position: (0, 10, 0)  ← Icon on top
Value Position: (0, -10, 0) ← Value below
```

### Add Background
```
Add a Sprite component to root node
Set a semi-transparent background
```

### Add Outline
```
Add LabelOutline component to Value node
Set outline color and width
```

## 📝 Quick Copy-Paste Values

**Root Node (StatChangePrefab):**
- Type: Empty Node
- UITransform: 100x40
- Anchor: 0.5, 0.5

**Icon Node:**
- Type: Empty Node
- Position: -30, 0, 0
- UITransform: 32x32
- Anchor: 0.5, 0.5
- Component: Sprite

**Value Node:**
- Type: Label
- Position: 10, 0, 0
- UITransform: 60x40
- Anchor: 0, 0.5
- Font Size: 24
- Align: Left, Center
- String: "+50"

That's it! Create these three nodes, save as prefab, and assign to upperInfo component! 🎨✨
