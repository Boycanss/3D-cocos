import { _decorator, Component, Node, Camera, Vec3, Button, input, Input, EventTouch, find, Label, geometry, tween, easing } from 'cc';
import { CameraController } from '../CameraController';
import { PlayerController } from '../PlayerController';
import { GameManager } from './GameManager';
import { PlatformUtils, Energy } from '../Define/Define';
import { GameOverUI } from '../UI/GameOverUI';
import { ScoreManager } from './ScoreManager';
import { ObstacleManager } from './ObstacleManager';
import { MissileManager } from '../Obstacle/MissileManager';
import { FlagManager } from './FlagManager';
import { Actor } from '../Actor';
import { StaminaManager } from './StaminaManager';
import { StartScreenUI } from '../UI/StartScreenUI';
import { BestRunManager } from '../BestRunManager';
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

    @property({ type: GameOverUI, tooltip: "Game Over UI component" })
    gameOverUI: GameOverUI = null;

    @property({ type: StartScreenUI, tooltip: "Start Screen UI component" })
    startScreenUI: StartScreenUI = null;

    @property(Node)
    playgroundNode:Node
    
    private _isGameStarted: boolean = false;
    private _isDragging: boolean = false;
    private _playerController: PlayerController = null;
    private _gameManager: GameManager = null;
    private _scoreManager: ScoreManager = null;
    private _bestRunManager: BestRunManager = null;
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
        this._scoreManager = this.node.getComponent(ScoreManager);
        this._bestRunManager = this.node.getComponent(BestRunManager);
        
        // Setup play button
        if (this.playButton) {
            this.playButton.node.on(Button.EventType.CLICK, this.startGame, this);
        }
        
        // Setup game over event - now show Game Over UI instead of direct reset
        if (this._gameManager) {
            this._gameManager.node.on('game-over', this.onGameOver, this);
        }
        
        // Setup Game Over UI restart event
        if (this.gameOverUI) {
            this.gameOverUI.node.on('game-restart', this.onGameRestart, this);
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

        // 8. Load and display best run stats
        this.loadAndDisplayBestRunStats();
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
    }

    private constrainToPlayground(position: Vec3): Vec3 {
        if (!this.playgroundNode) {
            // console.log("🎮 No playground node - no constraints");
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
        
        // // Debug boundary info
        // if (!Vec3.equals(position, constrainedPos, 0.1)) {
        //     // // console.log("🎮 Position constrained!");
        //     // // console.log("   - Boundaries: X[", minX.toFixed(1), "to", maxX.toFixed(1), "] Z[", minZ.toFixed(1), "to", maxZ.toFixed(1), "]");
        //     // // console.log("   - Original:", position);
        //     // // console.log("   - Constrained:", constrainedPos);
        // }
        
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
        
        // 2. Animate camera transition to gameplay settings
        if (this.gameplayCamera) {
            this.animateCameraToGameplay();
        }
        
        // 3. Camera follow will be enabled after transition completes
        
        // 4. Show gameplay UI
        if (this.gameplayUIContainer) {
            this.gameplayUIContainer.active = true;
            
        }
        
        // 5. Enable player controller
        if (this._playerController) {
            this._playerController.enabled = true;
            
        }
        
        // 6. Start game timer
        if (this._gameManager) {
            this._gameManager.startTimer();
            
        }

        // 7. Start flag spawning
        if (this._gameManager) {
            const flagManager = this._gameManager.getComponent(FlagManager);
            if (flagManager) {
                flagManager.startFlagSpawning();
                
            }
        }
        
        // // console.log("🎮 ✅ GAME STARTED SUCCESSFULLY!");
    }

    /**
     * Handle game over - show Game Over UI
     */
    private onGameOver(): void {
        // // console.log("🎮 💀 GAME OVER");
        
        // Save current run stats and check for new records
        this.saveCurrentRunStats();
        
        // Show Game Over UI with score
        if (this.gameOverUI && this._scoreManager) {
            this.gameOverUI.showGameOver(this._scoreManager);
        } else {
            console.warn("GameOverUI or ScoreManager not found - falling back to direct restart");
            this.resetToStartScreen();
        }
    }

    /**
     * Save current run statistics and check for new records
     */
    private saveCurrentRunStats(): void {
        if (!this._gameManager || !this._scoreManager || !this._bestRunManager) return;

        // Get current run stats
        const currentTime = this._gameManager.getGameTime();
        const currentScore = this._scoreManager.getFinalScore();
        const currentDistance = this._bestRunManager.getCurrentDistance();

        // Check and save new records
        let newRecords: string[] = [];

        // Check best time
        const previousBestTime = this._bestRunManager.getBestTime();
        if (currentTime > previousBestTime) {
            this._bestRunManager.saveBestTime(currentTime);
            newRecords.push('time');
            // console.log(`🎉 NEW BEST TIME: ${currentTime}s (previous: ${previousBestTime}s)`);
        }

        // Check best distance (handled by BestRunManager.updateDistance)
        const previousBestDistance = this._bestRunManager.getBestDistance();
        if (currentDistance > previousBestDistance) {
            newRecords.push('distance');
            // console.log(`🎉 NEW BEST DISTANCE: ${currentDistance}m (previous: ${previousBestDistance}m)`);
        }

        // Check best score (handled by GameOverUI, but we can track it here too)
        const previousBestScore = this.gameOverUI ? this.gameOverUI.loadBestScore() : 0;
        if (currentScore > previousBestScore) {
            newRecords.push('score');
            // console.log(`🎉 NEW HIGH SCORE: ${currentScore} (previous: ${previousBestScore})`);
        }

        // Store new records for celebration on next start screen
        if (newRecords.length > 0) {
            this.scheduleNewRecordCelebration(newRecords);
        }

        // console.log(`📊 Run Complete - Time: ${currentTime}s, Score: ${currentScore}, Distance: ${currentDistance}m`);
    }

    /**
     * Schedule celebration for new records on next start screen
     */
    private scheduleNewRecordCelebration(newRecords: string[]): void {
        // We'll show celebration when returning to start screen
        // For now, just log it - you could store this in localStorage for persistence
        console.log(`🎉 New Records Achieved: ${newRecords.join(', ')}`);
    }

    /**
     * Handle game restart from Game Over UI
     */
    private onGameRestart(): void {
        // // console.log("🎮 🔄 RESTARTING GAME FROM GAME OVER UI");
        this.resetToStartScreen();
    }

    /**
     * Load and display best run statistics on start screen
     */
    private loadAndDisplayBestRunStats(): void {
        if (!this.startScreenUI) return;

        // Get best run data
        let bestTime = 0;
        let bestScore = 0;
        let bestDistance = 0;

        // Load best time from BestRunManager
        if (this._bestRunManager) {
            bestTime = this._bestRunManager.getBestTime();
            bestDistance = this._bestRunManager.getBestDistance();
        }

        // Load best score from GameOverUI (it handles score persistence)
        if (this.gameOverUI) {
            bestScore = this.gameOverUI.loadBestScore();
        }

        // Update the start screen UI with best run stats
        this.startScreenUI.updateBestRunStats(bestTime, bestScore, bestDistance);

        console.log(`📊 Best Run Stats Loaded - Time: ${bestTime}s, Score: ${bestScore}, Distance: ${bestDistance}m`);
    }

    private resetToStartScreen(): void {
        // // console.log("🎮 🔄 RESETTING TO START SCREEN");
        this._isGameStarted = false;
        
        // Hide Game Over UI if it's showing
        if (this.gameOverUI) {
            this.gameOverUI.hidePopup();
        }
        
        // Reset all game systems
        this.resetAllGameSystems();
        
        this.initializeStartScreen();
        
        // Refresh best run stats (in case they were updated)
        this.loadAndDisplayBestRunStats();
    }

    /**
     * Reset all game systems to initial state
     */
    private resetAllGameSystems(): void {
        // // console.log("🔄 Resetting all game systems...");

        // 1. Reset GameManager (timer, difficulty, etc.)
        if (this._gameManager) {
            this._gameManager.resetTimer();
            
        }

        // 2. Reset ScoreManager
        if (this._scoreManager) {
            this._scoreManager.resetScore();
            
        }

        // 3. Reset Player Health
        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                actor.resetActor();
                
            }

            // 4. Reset Player Stamina
            const staminaManager = this.playerNode.getComponent(StaminaManager) || 
                                 this._gameManager?.getComponent(StaminaManager);
            if (staminaManager) {
                // Reset stamina to full and clear used stamina
                staminaManager.stamina = Energy.STAMINA; // Use defined constant
                staminaManager.totalUsedStamina = 0;
                
            }
        }

        // 5. Clear all obstacles
        if (this._gameManager) {
            const obstacleManager = this._gameManager.getComponent(ObstacleManager);
            if (obstacleManager) {
                obstacleManager.clearObstacles();
                
            }

            // 6. Clear all missiles
            const missileManager = this._gameManager.getComponent(MissileManager);
            if (missileManager) {
                missileManager.clearMissiles();
                
            }

            // 7. Reset flag manager
            const flagManager = this._gameManager.getComponent(FlagManager);
            if (flagManager) {
                flagManager.resetFlagManager();
                
            }
        }

        // // console.log("🎮 ✅ All game systems reset successfully!");
    }

    private saveCameraState(): void {
        if (!this.gameplayCamera) return;
        
        this._savedCameraPosition = this.gameplayCamera.node.worldPosition.clone();
        this._savedCameraRotation = this.gameplayCamera.node.eulerAngles.clone();
        this._savedCameraOrthoHeight = this.gameplayCamera.orthoHeight;
        
        // // console.log("🎮 Camera state saved:", {
        //     position: this._savedCameraPosition,
        //     rotation: this._savedCameraRotation,
        //     orthoHeight: this._savedCameraOrthoHeight
        // });
    }

    private disableCameraFollow(): void {
        if (this.cameraController) {
            this.cameraController.enabled = false;
            // console.log("🎮 Camera follow disabled");
        }
    }

    private enableCameraFollow(): void {
        if (this.cameraController) {
            this.cameraController.enabled = true;
            // console.log("🎮 Camera follow enabled");
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
        
        // console.log("🎮 Camera zoomed out for start screen - ortho height:", this.gameplayCamera.orthoHeight);
    }

    private animateCameraToGameplay(): void {
        if (!this.gameplayCamera) return;
        
        // console.log("🎮 🎬 Starting camera transition animation...");
        
        // Get current camera state (start screen)
        const startPosition = this.gameplayCamera.node.worldPosition.clone();
        const startRotation = this.gameplayCamera.node.eulerAngles.clone();
        const startOrthoHeight = this.gameplayCamera.orthoHeight;
        
        // Calculate target position using the camera controller's offset
        const playerPos = this.playerNode.worldPosition.clone();
        let targetPosition: Vec3;
        
        if (this.cameraController && this.cameraController.offset) {
            // Use the camera controller's offset for accurate positioning
            targetPosition = new Vec3();
            Vec3.add(targetPosition, playerPos, this.cameraController.offset);
            // console.log("🎬 Using CameraController offset:", this.cameraController.offset);
        } else {
            // Fallback to default offset if no camera controller
            targetPosition = new Vec3(
                playerPos.x + 5,  // Slightly behind player
                playerPos.y + 8,  // Above player
                playerPos.z + 8   // Back from player
            );
            // console.log("🎬 Using fallback offset");
        }
        
        // Target rotation and ortho height for gameplay
        const targetRotation = this.gameplayCameraRotation.clone();
        const targetOrthoHeight = this.gameplayCameraOrthoHeight;
        
        // console.log("🎬 Animation targets:");
        // console.log("   - Position:", startPosition, "→", targetPosition);
        // console.log("   - Rotation:", startRotation, "→", targetRotation);
        // console.log("   - Ortho Height:", startOrthoHeight, "→", targetOrthoHeight);
        
        // Create smooth transition animation
        const transitionDuration = 2.0; // 2 seconds for smooth transition
        
        // Animate position
        tween(this.gameplayCamera.node)
            .to(transitionDuration, { 
                worldPosition: targetPosition 
            }, { 
                easing: easing.sineInOut 
            })
            .start();
        
        // Animate rotation using a custom object
        const rotationData = { 
            x: startRotation.x, 
            y: startRotation.y, 
            z: startRotation.z 
        };
        
        tween(rotationData)
            .to(transitionDuration, { 
                x: targetRotation.x, 
                y: targetRotation.y, 
                z: targetRotation.z 
            }, { 
                easing: easing.sineInOut,
                onUpdate: () => {
                    // Apply rotation during animation
                    this.gameplayCamera.node.setRotationFromEuler(rotationData.x, rotationData.y, rotationData.z);
                }
            })
            .start();
        
        // Animate ortho height
        const orthoTarget = { orthoHeight: targetOrthoHeight };
        tween(this.gameplayCamera)
            .to(transitionDuration, orthoTarget, { 
                easing: easing.sineInOut 
            })
            .call(() => {
                // console.log("🎬 ✅ Camera transition completed!");
                // Enable camera follow after transition completes
                if (this.cameraController) {
                    this.cameraController.enabled = true;
                    
                }
            })
            .start();
    }

    private restoreCameraForGameplay(): void {
        if (!this.gameplayCamera) return;
        
        // Restore saved camera settings
        this.gameplayCamera.node.setRotationFromEuler(this.gameplayCameraRotation.x, this.gameplayCameraRotation.y, this.gameplayCameraRotation.z);
        this.gameplayCamera.orthoHeight = this.gameplayCameraOrthoHeight;
        
        // Position will be handled by camera controller when enabled
        // console.log("🎮 Camera restored for gameplay - ortho height:", this.gameplayCamera.orthoHeight);
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
        
        // Clean up Game Over UI events
        if (this.gameOverUI) {
            this.gameOverUI.node.off('game-restart', this.onGameRestart, this);
        }
        
        // Clean up GameManager events
        if (this._gameManager) {
            this._gameManager.node.off('game-over', this.onGameOver, this);
        }
    }
}