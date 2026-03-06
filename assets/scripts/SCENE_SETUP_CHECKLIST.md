# Scene Setup Checklist for Game Flow Manager

Based on your current scene structure, here's what you need to add:

## ✅ Already Set Up Correctly:
- Main Camera with CameraController
- MainCharacter (Player) with PlayerController
- UI Canvas with Gameplay_UI and StartScreen_UI containers
- PlayGround node for bounds
- GameManager with existing components

## 🔧 Components to Add:

### 1. GameFlowManager Component
**Add to:** GameManager node
**References to assign:**
- gameplayCamera: Main Camera
- cameraController: Main Camera's CameraController component
- playerNode: MainCharacter
- playgroundNode: PlayGround
- gameManager: GameManager's GameManager component
- gameplayUIContainer: Gameplay_UI node
- startScreenUI: StartScreen_UI's StartScreenUI component (add this first)
- placementHandler: GameManager's PlayerPlacementHandler component (add this first)

### 2. StartScreenUI Component
**Add to:** StartScreen_UI node
**References to assign:**
- playButton: PlayButton's Button component
- gameLogo: AYOLogo node
- instructionLabel: Instruction's Label component
- bestTimeDisplay: (create a new node for best time if needed)
- startScreenContainer: StartScreen_UI node (self-reference)

### 3. PlayerPlacementHandler Component
**Add to:** GameManager node (or create a new empty node)
**References to assign:**
- playerNode: MainCharacter
- playgroundNode: PlayGround
- placementIndicator: (optional - create a visual indicator node)

## 📋 Step-by-Step Setup:

### Step 1: Add StartScreenUI Component
1. Select StartScreen_UI node
2. Add Component → StartScreenUI
3. Assign references:
   - playButton: PlayButton
   - gameLogo: AYOLogo
   - instructionLabel: Instruction
   - startScreenContainer: StartScreen_UI (self)

### Step 2: Add PlayerPlacementHandler Component
1. Select GameManager node
2. Add Component → PlayerPlacementHandler
3. Assign references:
   - playerNode: MainCharacter
   - playgroundNode: PlayGround

### Step 3: Add GameFlowManager Component
1. Select GameManager node
2. Add Component → GameFlowManager
3. Assign all references as listed above

### Step 4: Configure Camera Settings
In GameFlowManager component:
- gameplayCameraRotation: (-35, -45, 0)
- gameplayCameraOrthoHeight: 5.1
- startScreenCameraRotation: (-45, -45, 0)
- startScreenCameraOrthoHeight: 15.0

### Step 5: Test the Setup
1. Play the scene
2. Should start in Start state with zoomed out camera
3. Try dragging the character
4. Press Play button to enter gameplay

## 🎯 Expected Behavior:

### Start State:
- Camera zoomed out showing full map
- StartScreen_UI visible (logo, play button, instruction)
- Gameplay_UI hidden
- Player can be dragged around
- PlayerController disabled

### Playing State:
- Camera follows player with gameplay settings
- Gameplay_UI visible
- StartScreen_UI hidden
- PlayerController enabled
- Game timer running

## 🔍 Troubleshooting:

### If player won't drag:
- Ensure MainCharacter has a Collider component
- Check that GameFlowManager is properly assigned

### If camera doesn't transition:
- Verify camera references in GameFlowManager
- Check camera settings values

### If UI doesn't show/hide:
- Verify UI container references
- Check StartScreenUI component setup

### If game doesn't start:
- Ensure PlayButton click event is connected
- Check GameManager reference in GameFlowManager

## 💡 Optional Enhancements:

### Visual Placement Indicator:
1. Create a new UI node under StartScreen_UI
2. Add Sprite component with a circle/ring sprite
3. Assign to PlayerPlacementHandler.placementIndicator
4. Will show green/red feedback during drag

### Best Time Display:
1. Create a Label node under StartScreen_UI
2. Assign to StartScreenUI.bestTimeDisplay
3. Will show best run time on start screen

Your scene structure is already well-organized for this system!