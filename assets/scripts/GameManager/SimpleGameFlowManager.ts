import { _decorator, Component, Node, Camera, Vec3, Button, input, Input, EventTouch, find, Label, geometry } from 'cc';
import { CameraController } from '../CameraController';
import { PlayerController } from '../PlayerController';
import { GameManager } from './GameManager';
import { PlatformUtils } from '../Define/Define';
const { ccclass, property } = _decorator;

@ccclass('SimpleGameFlowManager')
export class SimpleGameFlowManager extends Component {
    
    @property({ type: Camera, tooltip: "Main gameplay camera" })
    gameplayCamera: Camera = null;
    
    @property({ type: CameraController, tooltip: "Camera controller component" })
    cameraController: CameraController = null;
    
    @property({ type: Node, tooltip: "Player character node" })
    playerNode: Node = null;
    
    @property({ type: Node, tooltip: "Gameplay UI container" })
    gameplayUIContainer: Node = null;
    
    @property({ type: Node, tooltip: "Start screen UI container" })
    startScreenUIContainer: Node = null;
    
    @property({ type: Button, tooltip: "Play button" })
    playButton: Button = null;

    @property(Node)
    playgroundNode:Node
    
    private _isGameStarted: boolean = false;
    private _isDragging: boolean = false;
    private _playerController: PlayerController = null;
    private _gameManager: GameManager = null;
    private _touchControlManager: any = null;
    private _savedCameraPosition: Vec3 = null;
    private _savedCameraRotation: Vec3 = null;
    private _savedCameraOrthoHeight: number = 0;
    private startScreenCameraOrthoHeight: number = 25;
    private gameplayCameraRotation: Vec3 = new Vec3(-35, -45, 0);
    private gameplayCameraOrthoHeight: number = 5.1;

    protected onLoad(): void {
        // Get components
        if (this.playerNode) {
            this._playerController = this.playerNode.getComponent(PlayerController);
        }
        this._gameManager = this.node.getComponent(GameManager);
        
        // Setup play button
        if (this.playButton) {
            this.playButton.node.on(Button.EventType.CLICK, this.startGame, this);
        }
        
        // Setup game over event
        if (this._gameManager) {
            this._gameManager.node.on('game-over', this.resetToStartScreen, this);
        }
        
        // Setup player drag
        this.setupPlayerDrag();
    }

    start(): void {
        this.initializeStartScreen();
    }

    private initializeStartScreen(): void {
        this.playerNode.children[1].active = true;
        // 1. Hide gameplay UI
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = false;

        }
        
        // 2. Show start screen UI
        if (this.startScreenUIContainer) {
            this.startScreenUIContainer.active = true;

        }
        
        // 3. Disable camera follow
        if (this.cameraController) {
            this.cameraController.enabled = false;

        }
        
        // 4. Zoom out camera to show entire map
        if (this.gameplayCamera) {
            // Calculate proper zoom based on playground size
            const playgroundScale = this.playgroundNode ? this.playgroundNode.worldScale : new Vec3(7, 1, 7);
            // Calculate the area we need to show
            const mapWidth = playgroundScale.x * 10; // Full playground width
            const mapDepth = playgroundScale.z * 10; // Full playground depth
            
            // Set ortho height to show the entire area with padding
            const requiredHeight = Math.max(mapWidth, mapDepth) * 0.6; // Show full area
            this.gameplayCamera.orthoHeight = Math.max(requiredHeight, 25); // Minimum 25 for safety
            
            // Position camera directly above the playground center
            const playgroundPos = this.playgroundNode ? this.playgroundNode.worldPosition : new Vec3(0, 0, 0);
            this.gameplayCamera.node.setWorldPosition(playgroundPos.x, 40, playgroundPos.z);
            
            // Look straight down for start screen
            this.gameplayCamera.node.setRotationFromEuler(-90, 0, 0);
        }
        
        // 5. Disable player controller
        if (this._playerController) {
            this._playerController.enabled = false;
           
        }
        
        // 6. Stop game timer
        if (this._gameManager) {
            this._gameManager.resetTimer();
           
        }
        
        // 7. Update instruction text
        const instructionLabel = find('UI/StartScreen_UI/Instruction');
        if (instructionLabel) {
            const label = instructionLabel.getComponent(Label);
            if (label) {
                label.string = "CLICK ANYWHERE TO MOVE THE CHARACTER, THEN PRESS PLAY";
            }
        }
    }

    private setupPlayerDrag(): void {
        // Simple approach - listen for input anywhere and check if it's near player
        input.on(Input.EventType.TOUCH_START, this.onInputStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onInputMove, this);
        input.on(Input.EventType.TOUCH_END, this.onInputEnd, this);
        
        input.on(Input.EventType.MOUSE_DOWN, this.onInputStart, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onInputMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onInputEnd, this);
        
        
    }

    private onInputStart(event: any): void {
        if (this._isGameStarted) return;
        
        const inputPos = event.getLocation();
        
        
        // For now, let's make ANY click start dragging (easier for testing)
        // Later we can add the near-player check back
        this._isDragging = true;
        this.hideUIForDrag();
        
        // Move player to click position immediately
        this.movePlayerToScreenPosition(inputPos);
        
        
    }

    private onInputMove(event: any): void {
        if (!this._isDragging || this._isGameStarted) return;
        
        const inputPos = event.getLocation();
        this.movePlayerToScreenPosition(inputPos);
    }

    private onInputEnd(event: any): void {
        if (!this._isDragging) return;
        
        this._isDragging = false;
        this.showUIAfterDrag();

    }

    private isClickNearPlayer(screenPos: Vec3): boolean {
        // Convert both to world coordinates for accurate comparison
        const clickWorldPos = this.screenToWorldPosition(screenPos);
        const playerWorldPos = this.playerNode.worldPosition;
        
        // Check distance in world space
        const distance = Vec3.distance(clickWorldPos, playerWorldPos);
        const clickRadius = 5.0; // world units - larger radius for easier clicking
        
        const isNear = distance <= clickRadius;
        
        return isNear;
    }

    private movePlayerToScreenPosition(screenPos: Vec3): void {
        // Convert screen position to world position
        const worldPos = this.screenToWorldPosition(screenPos);
        
        // Keep player at ground level
        worldPos.y = 0.22;
        
        // Constrain to playground boundaries
        const constrainedPos = this.constrainToPlayground(worldPos);
        
        // Move player to constrained position
        this.playerNode.setWorldPosition(constrainedPos);
        
        console.log("🎮 Player moved:");
        console.log("   - Requested:", worldPos);
        console.log("   - Constrained:", constrainedPos);
        console.log("   - Was constrained:", !Vec3.equals(worldPos, constrainedPos, 0.1));
    }

    private constrainToPlayground(position: Vec3): Vec3 {
        if (!this.playgroundNode) {
            console.log("🎮 No playground node - no constraints");
            return position;
        }
        
        const playgroundPos = this.playgroundNode.worldPosition;
        const playgroundScale = this.playgroundNode.worldScale;
        
        // Calculate playground boundaries
        // Your playground scale is (6.925, 1, 7.061) so:
        const halfWidth = playgroundScale.x * 5;  // Half width of playground
        const halfDepth = playgroundScale.z * 5;  // Half depth of playground
        
        const minX = playgroundPos.x - halfWidth;
        const maxX = playgroundPos.x + halfWidth;
        const minZ = playgroundPos.z - halfDepth;
        const maxZ = playgroundPos.z + halfDepth;
        
        // Constrain position within boundaries
        const constrainedPos = position.clone();
        constrainedPos.x = Math.max(minX, Math.min(maxX, position.x));
        constrainedPos.z = Math.max(minZ, Math.min(maxZ, position.z));
        constrainedPos.y = 0.22; // Keep at ground level
        
        // Debug boundary info
        if (!Vec3.equals(position, constrainedPos, 0.1)) {
            console.log("🎮 Position constrained!");
            console.log("   - Boundaries: X[", minX.toFixed(1), "to", maxX.toFixed(1), "] Z[", minZ.toFixed(1), "to", maxZ.toFixed(1), "]");
            console.log("   - Original:", position);
            console.log("   - Constrained:", constrainedPos);
        }
        
        return constrainedPos;
    }

    private hideUIForDrag(): void {
        const playBtn = find('UI/StartScreen_UI/PlayButton');
        if (playBtn) playBtn.active = false;
    }

    private showUIAfterDrag(): void {
        const playBtn = find('UI/StartScreen_UI/PlayButton');
        if (playBtn) playBtn.active = true;
    }

    private screenToWorldPosition(screenPos: Vec3): Vec3 {
        // Use camera ray casting for accurate conversion
        const ray = new geometry.Ray();
        this.gameplayCamera.screenPointToRay(screenPos.x, screenPos.y, ray);
        
        // Intersect ray with ground plane (Y = 0.22)
        const groundY = 0.22;
        const t = (groundY - ray.o.y) / ray.d.y;
        
        // Calculate intersection point
        const worldPos = new Vec3();
        Vec3.scaleAndAdd(worldPos, ray.o, ray.d, t);
        return worldPos;
    }

    private hideGameplayUI(): void {
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = false;
            
        }
        
        // Also disable touch controls
        if (this._touchControlManager) {
            this._touchControlManager.setControlsVisible(false);
            
        }
    }

    private showGameplayUI(): void {
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = true;
            
        }
        
        // Enable touch controls for mobile
        if (this._touchControlManager && PlatformUtils.isMobile()) {
            this._touchControlManager.setControlsVisible(true);
            
        }
    }

    private showStartScreenUI(): void {
        if (this.startScreenUIContainer) {
            this.startScreenUIContainer.active = true;
            
        }
    }

    private hideStartScreenUI(): void {
        if (this.startScreenUIContainer) {
            this.startScreenUIContainer.active = false;
            
        }
    }

    private setDragUIVisibility(isDragging: boolean): void {
        // Hide/show play button and logo during drag
        const playButtonNode = this.playButton?.node;
        const logoNode = find('UI/StartScreen_UI/AYOLogo'); // Find logo node
        
        if (playButtonNode) {
            playButtonNode.active = !isDragging;
        }
        if (logoNode) {
            logoNode.active = !isDragging;
        }
        
        
    }

    private startGame(): void {
        if (this._isGameStarted) return;
        
        this._isGameStarted = true;
        this.playerNode.children[1].active = false;
        // 1. Hide start screen UI
        if (this.startScreenUIContainer) {
            this.startScreenUIContainer.active = false;
           
        }
        
        // 2. Restore camera to gameplay settings
        if (this.gameplayCamera) {
            this.gameplayCamera.node.setRotationFromEuler(-35, -45, 0);
            this.gameplayCamera.orthoHeight = 5.1;
           
        }
        
        // 3. Enable camera follow
        if (this.cameraController) {
            this.cameraController.enabled = true;
           
        }
        
        // 4. Show gameplay UI
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = true;
            console.log("✅ Gameplay UI shown");
        }
        
        // 5. Enable player controller
        if (this._playerController) {
            this._playerController.enabled = true;
            console.log("✅ Player controller enabled");
        }
        
        // 6. Start game timer
        if (this._gameManager) {
            this._gameManager.startTimer();
            console.log("✅ Game timer started");
        }
        
        console.log("🎮 ✅ GAME STARTED SUCCESSFULLY!");
    }

    private resetToStartScreen(): void {
        console.log("🎮 🔄 RESETTING TO START SCREEN");
        this._isGameStarted = false;
        this.initializeStartScreen();
    }

    private saveCameraState(): void {
        if (!this.gameplayCamera) return;
        
        this._savedCameraPosition = this.gameplayCamera.node.worldPosition.clone();
        this._savedCameraRotation = this.gameplayCamera.node.eulerAngles.clone();
        this._savedCameraOrthoHeight = this.gameplayCamera.orthoHeight;
        
        console.log("🎮 Camera state saved:", {
            position: this._savedCameraPosition,
            rotation: this._savedCameraRotation,
            orthoHeight: this._savedCameraOrthoHeight
        });
    }

    private disableCameraFollow(): void {
        if (this.cameraController) {
            this.cameraController.enabled = false;
            console.log("🎮 Camera follow disabled");
        }
    }

    private enableCameraFollow(): void {
        if (this.cameraController) {
            this.cameraController.enabled = true;
            console.log("🎮 Camera follow enabled");
        }
    }

    private setCameraForStartScreen(): void {
        if (!this.gameplayCamera) return;
        
        // Zoom out to show all map
        this.gameplayCamera.orthoHeight = this.startScreenCameraOrthoHeight;
        
        // Position camera to show playground area
        if (this.playgroundNode) {
            const playgroundPos = this.playgroundNode.worldPosition;
            const playgroundScale = this.playgroundNode.worldScale;
            
            // Position camera above and back to show the entire playground
            const cameraPos = new Vec3(
                playgroundPos.x,
                playgroundPos.y + 15, // Higher up
                playgroundPos.z + (playgroundScale.z * 3) // Back from playground
            );
            this.gameplayCamera.node.setWorldPosition(cameraPos);
            
            // Angle camera to look down at playground
            this.gameplayCamera.node.setRotationFromEuler(-45, 0, 0);
        }
        
        console.log("🎮 Camera zoomed out for start screen - ortho height:", this.gameplayCamera.orthoHeight);
    }

    private restoreCameraForGameplay(): void {
        if (!this.gameplayCamera) return;
        
        // Restore saved camera settings
        this.gameplayCamera.node.setRotationFromEuler(this.gameplayCameraRotation.x, this.gameplayCameraRotation.y, this.gameplayCameraRotation.z);
        this.gameplayCamera.orthoHeight = this.gameplayCameraOrthoHeight;
        
        // Position will be handled by camera controller when enabled
        console.log("🎮 Camera restored for gameplay - ortho height:", this.gameplayCamera.orthoHeight);
    }

    // Public API
    public resetGame(): void {
        this.resetToStartScreen();
    }

    protected onDestroy(): void {
        // Clean up input events
        input.off(Input.EventType.TOUCH_START, this.onInputStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onInputMove, this);
        input.off(Input.EventType.TOUCH_END, this.onInputEnd, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onInputStart, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onInputMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onInputEnd, this);
        
        // Clean up UI events
        if (this.playButton) {
            this.playButton.node.off(Button.EventType.CLICK, this.startGame, this);
        }
    }
}