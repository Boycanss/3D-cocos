import { _decorator, Component, Node, Camera, Vec2, Vec3, Button, Label, Sprite, Color, tween, UIOpacity, find, EventTouch, Input, input, PhysicsSystem, geometry, Collider, CapsuleCharacterController } from 'cc';
import { CameraController } from '../CameraController';
import { CrazyGamesManager } from '../Utils/CrazyGamesManager';
import { PlayerController } from '../PlayerController';
import { GameManager } from './GameManager';
import { TouchControlManager } from '../Touch/TouchControlManager';
import { Box } from '../Obstacle/Box';
import { ObstacleType, PlatformUtils } from '../Define/Define';
import { PlayerPlacementHandler } from './PlayerPlacementHandler';
import { StartScreenUI } from '../UI/StartScreenUI';
const { ccclass, property } = _decorator;

export enum GameState {
    START = "Start",
    PLAYING = "Playing",
    GAME_OVER = "GameOver"
}

@ccclass('GameFlowManager')
export class GameFlowManager extends Component {
    
    // === Core References ===
    @property({ type: Camera, tooltip: "Main gameplay camera" })
    gameplayCamera: Camera = null;
    
    @property({ type: CameraController, tooltip: "Camera controller component" })
    cameraController: CameraController = null;
    
    @property({ type: Node, tooltip: "Player character node" })
    playerNode: Node = null;
    
    @property({ type: Node, tooltip: "Playground bounds (where player can be placed)" })
    playgroundNode: Node = null;
    
    @property({ type: GameManager, tooltip: "Main game manager" })
    gameManager: GameManager = null;
    
    // === UI References ===
    @property({ type: Node, tooltip: "Container for all gameplay UI elements" })
    gameplayUIContainer: Node = null;
    
    @property({ type: StartScreenUI, tooltip: "Start screen UI manager" })
    startScreenUI: StartScreenUI = null;
    
    @property({ type: PlayerPlacementHandler, tooltip: "Player placement handler" })
    placementHandler: PlayerPlacementHandler = null;
    
    // === Camera Settings ===
    @property({ tooltip: "Gameplay camera rotation" })
    gameplayCameraRotation: Vec3 = new Vec3(-35, -45, 0);
    
    @property({ tooltip: "Gameplay camera ortho height" })
    gameplayCameraOrthoHeight: number = 5.1;
    
    @property({ tooltip: "Start screen camera ortho height (zoomed out)" })
    startScreenCameraOrthoHeight: number = 15.0;
    
    @property({ tooltip: "Start screen camera rotation" })
    startScreenCameraRotation: Vec3 = new Vec3(-45, -45, 0);
    
    // === Transition Settings ===
    @property({ tooltip: "Camera transition duration" })
    cameraTransitionDuration: number = 1.0;
    
    @property({ tooltip: "UI transition duration" })
    uiTransitionDuration: number = 0.5;
    
    // === Private State ===
    private _currentState: GameState = GameState.START;
    private _isDraggingPlayer: boolean = false;
    private _playerController: PlayerController = null;
    private _touchControlManager: TouchControlManager = null;
    private _originalPlayerPosition: Vec3 = new Vec3();
    private _dragOffset: Vec3 = new Vec3();
    private _isValidPlacement: boolean = true;
    private _isMobile: boolean = false;
    private _isTransitioning: boolean = false;
    
    // === Saved Camera State ===
    private _savedCameraPosition: Vec3 = new Vec3();
    private _savedCameraRotation: Vec3 = new Vec3();
    private _savedCameraOrthoHeight: number = 5.1;

    protected onLoad(): void {
        console.log("🎮 GameFlowManager onLoad started");
        
        // Detect platform
        this._isMobile = PlatformUtils.isMobile();
        console.log("🎮 Platform detected:", this._isMobile ? "Mobile" : "Desktop");
        
        // Get player controller reference
        if (this.playerNode) {
            this._playerController = this.playerNode.getComponent(PlayerController);
            this._touchControlManager = this._playerController?.touchControlManager;
            console.log("🎮 Player controller found:", !!this._playerController);
        }
        
        // Setup placement handler
        if (this.placementHandler) {
            this.placementHandler.playerNode = this.playerNode;
            this.placementHandler.playgroundNode = this.playgroundNode;
            console.log("🎮 Placement handler configured");
        }
        
        // Setup UI event listeners
        this.setupUIEventListeners();
        
        // Setup player drag and drop
        this.setupPlayerDragAndDrop();
        
        // Initialize in start state
        this.setState(GameState.START);
    }

    start(): void {
        // Save original player position or find a safe one
        if (this.playerNode) {
            if (this.placementHandler) {
                // Try to find a safe starting position
                const safePosition = this.placementHandler.getSafeStartingPosition();
                this.playerNode.setWorldPosition(safePosition);
                this._originalPlayerPosition = safePosition.clone();
            } else {
                this._originalPlayerPosition = this.playerNode.worldPosition.clone();
            }
        }
        
        // Initialize start screen UI
        if (this.startScreenUI) {
            this.startScreenUI.updateInstructionText("Drag the character to your desired starting position");
        }
    }

    private setupUIEventListeners(): void {
        // Start screen UI events
        if (this.startScreenUI) {
            this.startScreenUI.node.on('play-button-pressed', this.onPlayButtonClicked, this);
            
            // Setup play button click if it exists
            if (this.startScreenUI.playButton) {
                this.startScreenUI.playButton.node.on(Button.EventType.CLICK, this.onPlayButtonClicked, this);
            }
        }
        
        // Game manager events
        if (this.gameManager) {
            this.gameManager.node.on('game-over', this.onGameOver, this);
        }
    }

    private setupPlayerDragAndDrop(): void {
        if (!this.playerNode) return;
        
        // Enable input events globally to detect clicks anywhere
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        // Also enable mouse events for desktop
        if (!this._isMobile) {
            input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
        
        console.log("🎮 Player drag and drop setup complete");
    }

    private onPlayerTouchStart(event: EventTouch): void {
        if (this._currentState !== GameState.START || this._isTransitioning) return;
        
        this.startPlayerDrag(event.getLocation());
    }

    private onPlayerTouchMove(event: EventTouch): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        
        // Calculate new position
        const touchWorldPos = this.screenToWorldPosition(event.getLocation());
        const newPosition = new Vec3();
        Vec3.add(newPosition, touchWorldPos, this._dragOffset);
        
        this.updatePlayerPosition(newPosition);
    }

    private onPlayerTouchEnd(event: EventTouch): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        
        this.endPlayerDrag();
    }

    // === Input Event Handlers ===
    private onTouchStart(event: EventTouch): void {
        console.log("🎮 Touch start detected, state:", this._currentState, "transitioning:", this._isTransitioning);
        
        if (this._currentState !== GameState.START || this._isTransitioning) return;
        
        if (this.isPlayerClicked(event.getLocation())) {
            this.startPlayerDrag(event.getLocation());
        }
    }

    private onTouchMove(event: EventTouch): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        
        const newPosition = new Vec3();
        const touchWorldPos = this.screenToWorldPosition(event.getLocation());
        Vec3.add(newPosition, touchWorldPos, this._dragOffset);
        this.updatePlayerPosition(newPosition);
    }

    private onTouchEnd(event: EventTouch): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        this.endPlayerDrag();
    }

    private onMouseDown(event: any): void {
        if (this._currentState !== GameState.START || this._isTransitioning) return;
        
        if (this.isPlayerClicked(event.getLocation())) {
            this.startPlayerDrag(event.getLocation());
        }
    }

    private onMouseMove(event: any): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        
        const newPosition = new Vec3();
        const mouseWorldPos = this.screenToWorldPosition(event.getLocation());
        Vec3.add(newPosition, mouseWorldPos, this._dragOffset);
        this.updatePlayerPosition(newPosition);
    }

    private onMouseUp(event: any): void {
        if (!this._isDraggingPlayer || this._currentState !== GameState.START) return;
        this.endPlayerDrag();
    }

    private toScreenVec3(screenPosition: Vec2 | Vec3): Vec3 {
        return screenPosition instanceof Vec3
            ? screenPosition
            : new Vec3(screenPosition.x, screenPosition.y, 0);
    }

    private isPlayerClicked(screenPosition: Vec2 | Vec3): boolean {
        // Simple distance-based detection since we don't have a regular collider on player
        const worldPos = this.screenToWorldPosition(this.toScreenVec3(screenPosition));
        const playerPos = this.playerNode.worldPosition;
        const distance = Vec3.distance(worldPos, playerPos);
        
        // If click is within 2 units of player, consider it a player click
        const clickRadius = 2.0;
        const isPlayerClick = distance <= clickRadius;
        
        if (isPlayerClick) {
            console.log("🎮 Player clicked for drag (distance:", distance.toFixed(2), ")");
        }
        
        return isPlayerClick;
    }

    private isChildOfPlayer(node: Node): boolean {
        if (!node || !this.playerNode) return false;
        
        let current = node.parent;
        while (current) {
            if (current === this.playerNode) return true;
            current = current.parent;
        }
        return false;
    }

    // === Unified Drag Methods ===
    private startPlayerDrag(screenPosition: Vec2 | Vec3): void {
        this._isDraggingPlayer = true;
        
        // Calculate drag offset
        const worldPos = this.screenToWorldPosition(this.toScreenVec3(screenPosition));
        const playerPos = this.playerNode.worldPosition;
        Vec3.subtract(this._dragOffset, playerPos, worldPos);
        
        // Update UI for drag mode
        if (this.startScreenUI) {
            this.startScreenUI.setDragMode(true);
        }
        
        console.log("🎮 Started dragging player");
    }

    private updatePlayerPosition(newPosition: Vec3): void {
        if (!this.placementHandler) return;
        
        // Constrain to playground bounds
        const constrainedPosition = this.placementHandler.constrainToPlayground(newPosition);
        
        // Validate placement
        this._isValidPlacement = this.placementHandler.isValidPlacement(constrainedPosition);
        
        // Update player position
        this.playerNode.setWorldPosition(constrainedPosition);
        
        // Update visual feedback
        this.placementHandler.updatePlacementFeedback(constrainedPosition);
        
        // Update UI feedback
        if (this.startScreenUI) {
            this.startScreenUI.showPlacementFeedback(this._isValidPlacement);
        }
    }

    private endPlayerDrag(): void {
        this._isDraggingPlayer = false;
        
        // If placement is invalid, return to original position
        if (!this._isValidPlacement) {
            this.playerNode.setWorldPosition(this._originalPlayerPosition);
            console.log("❌ Invalid placement - returned to original position");
        } else {
            // Update original position to new valid position
            this._originalPlayerPosition = this.playerNode.worldPosition.clone();
            console.log("✅ Player placed at new position");
        }
        
        // Clear visual feedback
        if (this.placementHandler) {
            this.placementHandler.clearPlacementFeedback();
        }
        
        // Update UI for normal mode
        if (this.startScreenUI) {
            this.startScreenUI.setDragMode(false);
        }
    }

    private screenToWorldPosition(screenPos: Vec2 | Vec3): Vec3 {
        if (!this.gameplayCamera) return new Vec3();

        const position = this.toScreenVec3(screenPos);
        
        // For orthographic camera, we need to project to a specific plane
        // Project to the ground plane (Y = 0)
        const ray = new geometry.Ray();
        this.gameplayCamera.screenPointToRay(position.x, position.y, ray);
        
        // Calculate intersection with ground plane (Y = 0)
        const groundY = 0;
        const t = (groundY - ray.o.y) / ray.d.y;
        
        const worldPos = new Vec3();
        Vec3.scaleAndAdd(worldPos, ray.o, ray.d, t);
        
        return worldPos;
    }



    private onPlayButtonClicked(): void {
        if (this._currentState !== GameState.START || this._isTransitioning) return;
        
        // Check if current placement is valid
        if (this.placementHandler && !this.placementHandler.isValidPlacement(this.playerNode.worldPosition)) {
            console.log("❌ Cannot start - invalid player placement");
            if (this.startScreenUI) {
                this.startScreenUI.updateInstructionText("Move to a valid position first!", new Color(255, 0, 0));
            }
            return;
        }
        
        console.log("🎮 Play button clicked - Starting game");
        this.setState(GameState.PLAYING);
    }

    private onGameOver(): void {
        console.log("🎮 Game over - Returning to start state");
        CrazyGamesManager.instance?.requestMidgameAd(() => {
            this.setState(GameState.START);
        });
    }

    private setState(newState: GameState): void {
        if (this._currentState === newState) return;
        
        console.log(`🎮 State change: ${this._currentState} → ${newState}`);
        this._currentState = newState;
        
        switch (newState) {
            case GameState.START:
                this.enterStartState();
                break;
            case GameState.PLAYING:
                this.enterPlayingState();
                break;
            case GameState.GAME_OVER:
                this.enterGameOverState();
                break;
        }
    }

    private enterStartState(): void {
        this._isTransitioning = true;
        
        // 1. Disable player controller immediately
        if (this._playerController) {
            this._playerController.enabled = false;
        }
        
        // 2. Reset game manager
        if (this.gameManager) {
            this.gameManager.resetTimer();
        }
        
        // 3. Disable camera follow and save current camera state
        this.disableCameraFollow();
        
        // 4. Animate camera to start screen configuration
        this.animateCameraToStartScreen(() => {
            // 5. Show start screen UI after camera transition
            this.setStartUIVisibility(true);
            
            // 6. Hide gameplay UI
            this.setGameplayUIActive(false);
            
            this._isTransitioning = false;
            console.log("🎮 Entered START state");
        });
    }

    private enterPlayingState(): void {
        this._isTransitioning = true;
        
        // 1. Hide start screen UI immediately
        this.setStartUIVisibility(false);
        
        // 2. Animate camera to gameplay configuration
        this.animateCameraToGameplay(() => {
            // 3. Enable camera follow after transition
            this.enableCameraFollow();
            
            // 4. Show and enable gameplay UI
            this.setGameplayUIActive(true);
            
            // 5. Enable player controller
            if (this._playerController) {
                this._playerController.enabled = true;
            }
            
            // 6. Start game timer
            if (this.gameManager) {
                this.gameManager.startTimer();
            }
            
            this._isTransitioning = false;
            console.log("🎮 Entered PLAYING state");
        });
    }

    private enterGameOverState(): void {
        // For instant replay, we go directly back to start state
        // But we could add a brief game over screen here if needed
        this.setState(GameState.START);
    }

    private setGameplayUIActive(active: boolean): void {
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = active;
            
            // Also enable/disable touch controls
            if (this._touchControlManager) {
                this._touchControlManager.setControlsVisible(active);
            }
        }
    }

    private setStartUIVisibility(visible: boolean): void {
        if (this.startScreenUI) {
            this.startScreenUI.setVisible(visible, true);
        }
    }

    private disableCameraFollow(): void {
        if (this.cameraController) {
            // Save current camera state
            this._savedCameraPosition = this.gameplayCamera.node.worldPosition.clone();
            this._savedCameraRotation = this.gameplayCamera.node.eulerAngles.clone();
            this._savedCameraOrthoHeight = this.gameplayCamera.orthoHeight;
            
            // Disable camera controller
            this.cameraController.enabled = false;
        }
    }

    private enableCameraFollow(): void {
        if (this.cameraController) {
            this.cameraController.enabled = true;
        }
    }

    private animateCameraToStartScreen(onComplete?: () => void): void {
        if (!this.gameplayCamera) {
            if (onComplete) onComplete();
            return;
        }
        
        // Calculate target position to show the playground area
        let targetPosition = new Vec3(0, 10, 5);
        if (this.playgroundNode) {
            const playgroundPos = this.playgroundNode.worldPosition;
            targetPosition = new Vec3(
                playgroundPos.x,
                playgroundPos.y + 10,
                playgroundPos.z + 5
            );
        }
        
        // Animate camera position, rotation, and ortho height
        const cameraNode = this.gameplayCamera.node;
        const startRotation = cameraNode.eulerAngles.clone();
        const startOrthoHeight = this.gameplayCamera.orthoHeight;
        
        tween(cameraNode)
            .to(this.cameraTransitionDuration, { 
                worldPosition: targetPosition,
                eulerAngles: this.startScreenCameraRotation 
            })
            .start();
            
        tween(this.gameplayCamera)
            .to(this.cameraTransitionDuration, { 
                orthoHeight: this.startScreenCameraOrthoHeight 
            })
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }

    private animateCameraToGameplay(onComplete?: () => void): void {
        if (!this.gameplayCamera) {
            if (onComplete) onComplete();
            return;
        }
        
        // Calculate target position based on player position
        let targetPosition = this.playerNode.worldPosition.clone();
        if (this.cameraController && this.cameraController.offset) {
            Vec3.add(targetPosition, targetPosition, this.cameraController.offset);
        }
        
        // Animate camera back to gameplay settings
        const cameraNode = this.gameplayCamera.node;
        
        tween(cameraNode)
            .to(this.cameraTransitionDuration, { 
                worldPosition: targetPosition,
                eulerAngles: this.gameplayCameraRotation 
            })
            .start();
            
        tween(this.gameplayCamera)
            .to(this.cameraTransitionDuration, { 
                orthoHeight: this.gameplayCameraOrthoHeight 
            })
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }

    // === Public API ===
    public getCurrentState(): GameState {
        return this._currentState;
    }

    public isInStartState(): boolean {
        return this._currentState === GameState.START;
    }

    public isInPlayingState(): boolean {
        return this._currentState === GameState.PLAYING;
    }

    public forceStartState(): void {
        this.setState(GameState.START);
    }

    protected onDestroy(): void {
        // Clean up event listeners
        if (this.startScreenUI) {
            this.startScreenUI.node.off('play-button-pressed', this.onPlayButtonClicked, this);
            if (this.startScreenUI.playButton) {
                this.startScreenUI.playButton.node.off(Button.EventType.CLICK, this.onPlayButtonClicked, this);
            }
        }
        
        if (this.gameManager) {
            this.gameManager.node.off('game-over', this.onGameOver, this);
        }
        
        // Clean up global input events
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        if (!this._isMobile) {
            input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }
}