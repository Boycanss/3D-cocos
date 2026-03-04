# Mobile Touch Control System

This system provides comprehensive touch controls for mobile devices while maintaining full compatibility with desktop keyboard controls.

## Components

### 1. PlatformUtils (Define.ts)
- **Platform Detection**: Automatically detects if running on mobile or desktop
- **API**: `PlatformUtils.isMobile()`, `PlatformUtils.isDesktop()`

### 2. VirtualJoystick
- **Purpose**: Handles movement input (forward/backward, left/right turning)
- **Features**: 
  - Configurable dead zone and max radius
  - Visual feedback with handle movement
  - Normalized direction and magnitude output
- **Setup**: Attach to a UI node with joystick base and handle child nodes

### 3. TouchButton
- **Purpose**: Handles action buttons (Jump, Vault, Dash, Slide)
- **Features**:
  - Visual feedback (scale, color changes)
  - Press/release event handling
  - Configurable animation duration and effects
- **Setup**: Attach to UI button nodes, set button type in inspector

### 4. TouchControlManager
- **Purpose**: Central manager for all touch controls
- **Features**:
  - Automatic show/hide based on platform
  - Unified input data collection
  - Event coordination between components
- **Setup**: Attach to a manager node, assign all touch control references

### 5. PlayerControllerUnified
- **Purpose**: Unified player controller supporting both keyboard and touch input
- **Features**:
  - Automatic input method detection
  - Identical behavior across platforms
  - Seamless switching between input methods
- **Setup**: Replace existing PlayerController with this component

## Setup Instructions

### 1. UI Setup
Create a Canvas with the following structure:
```
TouchControls (Container)
├── VirtualJoystick
│   ├── JoystickBase (Sprite)
│   └── JoystickHandle (Sprite)
├── JumpButton (Button + TouchButton)
├── VaultButton (Button + TouchButton)
├── DashButton (Button + TouchButton)
└── SlideButton (Button + TouchButton)
```

### 2. Component Assignment
1. Add `TouchControlManager` to TouchControls container
2. Add `VirtualJoystick` to joystick node
3. Add `TouchButton` to each action button
4. Set button types in TouchButton components
5. Assign all references in TouchControlManager

### 3. Player Setup
1. Replace `PlayerController` with `PlayerControllerUnified`
2. Assign `TouchControlManager` reference
3. Keep all existing property assignments

### 4. Testing
- **Desktop**: Keyboard controls work as before
- **Mobile**: Touch controls automatically appear and function
- **Web**: Automatically detects touch capability

## Input Mapping

### Movement (Virtual Joystick)
- **Forward**: Joystick up → W key equivalent
- **Backward**: Joystick down → S key equivalent  
- **Turn Left**: Joystick left → A key equivalent
- **Turn Right**: Joystick right → D key equivalent

### Actions (Touch Buttons)
- **Jump Button** → Space key equivalent
- **Vault Button** → F key equivalent
- **Dash Button** → E key equivalent
- **Slide Button** → S key equivalent

## Platform Detection Logic
1. Checks user agent for mobile device strings
2. Checks for touch event support
3. Defaults to desktop if neither detected
4. Touch controls only show on mobile platforms

## Customization

### Visual Styling
- Modify button sprites and colors in TouchButton
- Adjust joystick base/handle sprites in VirtualJoystick
- Configure animation durations and effects

### Input Sensitivity
- Adjust joystick dead zone and max radius
- Modify button press/release thresholds
- Configure input smoothing in PlayerController

### Layout
- Position touch controls for optimal thumb reach
- Scale controls based on screen size
- Add visual indicators for button states

## Performance Considerations
- Touch controls only active on mobile platforms
- Minimal overhead on desktop (controls hidden)
- Efficient event handling with proper cleanup
- Optimized input polling in update loops