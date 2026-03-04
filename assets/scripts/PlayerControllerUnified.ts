import { _decorator, animation, CapsuleCharacterController, CCBoolean, CCFloat, CharacterController, CharacterControllerContact, Collider, Component, easing, Enum, EventKeyboard, Input, input, KeyCode, Layers, geometry, math, Node, NodeSpace, PhysicsSystem, RigidBody, Tween, tween, Vec3 } from 'cc';
import { VaultDetector } from './VaultDetector';
import { Energy, MovementState, ObstacleType, PlatformUtils } from './Define/Define';
import { Box } from './Obstacle/Box';
import { GhostEffect } from './Utils/GhostEffect';
import { Actor } from './Actor';
import { StaminaManager } from './GameManager/StaminaManager';
import { ObstacleCollision } from './Obstacle/ObstacleCollision';
import { Missile } from './Obstacle/Missile';
import { SlidingController } from './SlidingController';
import { TouchControlManager } from './Touch/TouchControlManager';
import { TouchButtonType } from './Touch/TouchButton';
const { ccclass, property } = _decorator;

@ccclass('PlayerControllerUnified')
export class PlayerControllerUnified extends Component {

    private movementState: MovementState;
    public currentState: MovementState;

    @property(animation.AnimationController)
    Animation: animation.AnimationController;

    @property(CapsuleCharacterController)
    charController: CapsuleCharacterController;

    @property(StaminaManager)
    staminaManager: StaminaManager = null;

    @property({ type: TouchControlManager, tooltip: "Touch control manager for mobile input" })
    touchControlManager: TouchControlManager = null;

    @property(CCFloat)
    maxSpeed: number = 5;

    @property(CCFloat)
    jumpheight: number = 1;

    @property(CCFloat)
    damageCooldown: number = .05;  // Seconds between damage hits

    @property(CCFloat)
    acceleration: number = 1.5;

    @property(CCFloat)
    dashDistance: number = 3;

    @property(CCFloat)
    dashCooldown: number = 1;

    @property(CCFloat)
    wallRunLeanAngle: number = 25; // Lean angle (degrees) when wall running

    @property(CCFloat)
    wallRunLeanSpeed: number = 8; // Speed of lean transition

    currentSpeed: number = 1;
    turnRate: number = 250;
    verticalVelocity: number = 0;

    _moveDir = new Vec3(0, 0, 0);
    movementDirection = new Vec3();

    rigidb: RigidBody;
    isVaulting: boolean = false;
    isDashing: boolean = false;
    dashCooldownTimer: number = 0;

    VaultTween: Tween = new Tween();

    private _actor: Actor;
    private _timeSinceLastHit: number = 0;
    private _canTakeDamage: boolean = true;
    private _slidingController: SlidingController;

    // Track which turn keys are pressed (keyboard)
    private _keyAPressed: boolean = false;
    private _keyDPressed: boolean = false;
    private _keyWPressed: boolean = false;

    // Wall run lean tracking
    private _wallSide: number = 0; // -1 = left wall, 1 = right wall, 0 = no wall
    private _currentLeanAngle: number = 0;
    private _wallNormal: Vec3 = new Vec3(); // Surface normal of the detected wall
    private _wallRunLockedY: number = 0;    // Y rotation locked once at wall-run start
    private _wallRunLockedSide: number = 0; // Wall side locked once at wall-run start

    // Input state tracking
    private _isMobile: boolean = false;

    protected onLoad(): void {
        this.SetState(MovementState.IDLE);
        
        // Detect platform
        this._isMobile = PlatformUtils.isMobile();
        console.log(`PlayerController initialized for ${this._isMobile ? 'Mobile' : 'Desktop'} platform`);

        // Setup input based on platform
        if (!this._isMobile) {
            // Desktop keyboard input
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        }
        // Mobile touch input is handled through TouchControlManager
    }

    onKeyDown(event: EventKeyboard) {
        if (this._isMobile) return; // Ignore keyboard on mobile

        if (this.currentState === MovementState.VAULTING) return;

        if (this._slidingController.isSliding) {
            if (event.keyCode === KeyCode.KEY_E) {
                this.Dash();
            }
            return;
        }
        //walk - run
        if (event.keyCode === KeyCode.KEY_W) {
            this._keyWPressed = true;
            this.SetState(MovementState.RUNNING);
        }

        //turn
        if (event.keyCode === KeyCode.KEY_A) {
            this._keyAPressed = true;
            this.updateTurnInput();
        }

        if (event.keyCode === KeyCode.KEY_D) {
            this._keyDPressed = true;
            this.updateTurnInput();
        }

        if (this.charController.isGrounded) {
            //jump
            if (event.keyCode === KeyCode.SPACE) {
                this.Jump();
            }

            if (event.keyCode === KeyCode.KEY_F) {
                this.VaultOver();
            }
            
            //dash
            if (event.keyCode === KeyCode.KEY_E) {
                this.Dash();
            }

            //slide
            if (event.keyCode === KeyCode.KEY_S) {
                this._slidingController.startSlide();
            }
        } else {
            // Allow dash while jumping
            if (event.keyCode === KeyCode.KEY_E) {
                this.Dash();
            }

            if (this.currentState === MovementState.WALL_RUNNING && event.keyCode === KeyCode.SPACE) {
                this.Jump();
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (this._isMobile) return; // Ignore keyboard on mobile

        if (event.keyCode === KeyCode.KEY_W) {
            this._keyWPressed = false;
            this.SetState(MovementState.IDLE);
        }
        if (event.keyCode === KeyCode.KEY_A) {
            this._keyAPressed = false;
            this.updateTurnInput();
        }
        if (event.keyCode === KeyCode.KEY_D) {
            this._keyDPressed = false;
            this.updateTurnInput();
        }
    }

    private updateTurnInput() {
        if (this._keyAPressed || this._keyDPressed) {
            this.Animation.setValue('isTurning', true);
            this._moveDir.x = this._keyAPressed ? 1 : -1;
        } else {
            this.Animation.setValue('isTurning', false);
            this._moveDir.x = 0;
        }
    }

    private handleTouchInput(): void {
        if (!this._isMobile || !this.touchControlManager) return;

        const inputData = this.touchControlManager.getInputData();

        // Handle movement input
        if (inputData.isMoving) {
            // Forward/backward movement (vertical input)
            if (inputData.vertical > 0.1) {
                if (this.currentState !== MovementState.RUNNING) {
                    this.SetState(MovementState.RUNNING);
                }
                this._moveDir.z = inputData.vertical;
            } else {
                if (this.currentState === MovementState.RUNNING) {
                    this.SetState(MovementState.IDLE);
                }
                this._moveDir.z = 0;
            }

            // Left/right turning (horizontal input)
            if (Math.abs(inputData.horizontal) > 0.1) {
                this.Animation.setValue('isTurning', true);
                this._moveDir.x = -inputData.horizontal; // Invert for correct direction
            } else {
                this.Animation.setValue('isTurning', false);
                this._moveDir.x = 0;
            }
        } else {
            // No movement input
            if (this.currentState === MovementState.RUNNING) {
                this.SetState(MovementState.IDLE);
            }
            this._moveDir.z = 0;
            this._moveDir.x = 0;
            this.Animation.setValue('isTurning', false);
        }

        // Handle action buttons
        if (this.currentState === MovementState.VAULTING) return;

        if (this._slidingController.isSliding) {
            if (inputData.dashPressed) {
                this.Dash();
            }
            return;
        }

        if (this.charController.isGrounded) {
            if (inputData.jumpPressed) {
                this.Jump();
            }

            if (inputData.vaultPressed) {
                this.VaultOver();
            }
            
            if (inputData.dashPressed) {
                this.Dash();
            }

            if (inputData.slidePressed) {
                this._slidingController.startSlide();
            }
        } else {
            // Allow dash while jumping
            if (inputData.dashPressed) {
                this.Dash();
            }

            if (this.currentState === MovementState.WALL_RUNNING && inputData.jumpPressed) {
                this.Jump();
            }
        }
    }
    
    SetState(newState: MovementState) {
        // Prevent re-setting the same state to avoid repeated initialization
        if (this.currentState === newState) return;
        
        this.currentState = newState;
        
        switch (this.currentState) {
            case MovementState.IDLE:
                if (!this._isMobile) {
                    this._moveDir.z = 0;
                }
                this.Animation.setValue('isRunning', false);
                break;
            case MovementState.WALKING:
                break;
            case MovementState.RUNNING:
                if (!this._isMobile) {
                    this._moveDir.z = 1;
                }
                this.Animation.setValue('isRunning', true);
                break;
            case MovementState.VAULTING:
                break;
            case MovementState.JUMPING:
                break;
            case MovementState.TURNING:
                break;
            case MovementState.SLIDING:
                this._moveDir.z = 0;
                this.Animation.setValue('isRunning', false);
                break;
            case MovementState.WALL_RUNNING:
                this.Animation.setValue('isRunning', true);
                // Lock wall side and Y rotation once at wall-run start
                this._wallRunLockedSide = this._wallSide;
                this._wallRunLockedY = this.computeWallParallelY();
                this.node.setRotationFromEuler(0, this._wallRunLockedY, this._currentLeanAngle);
                break;
            default:
                break;
        }
    }

    start() {
        this.rigidb = this.node.getComponent(RigidBody);
        this._actor = this.node.getComponent(Actor);
        this._slidingController = this.node.getComponent(SlidingController);

        // Register state getter with StaminaManager to avoid circular import
        if (this.staminaManager) {
            this.staminaManager.registerPlayerStateGetter(() => this.getState());
        }

        // Listen for character controller collision
        this.charController.on("onControllerTriggerEnter", this.onControllerColliderHit, this);

        // pemanasan duls
        this.callGhostEffect();
    }

    private onControllerColliderHit(contact: CharacterControllerContact) {
        console.log("PlayerController: Collided with " + contact.collider.node.name);
        
        const hitNode = contact.collider.node;
        
        // Check for Flag collision first
        const Flag = hitNode.getComponent('Flag');
        if (Flag) {
            console.log("PlayerController: Hit a Flag!");
            // Trigger the flag's collection through its own method
            hitNode.emit('player-collision', this);
            return;
        }
        
        // Handle obstacle damage
        if (!this._canTakeDamage || this.currentState === MovementState.VAULTING) return;
        
        const obstacle = hitNode.getComponent(ObstacleCollision);
        if (obstacle && this._actor) {
            this._actor.takeDamage(obstacle.damage);
            if(hitNode.getComponent(Missile)){
                hitNode.destroy();
            }
            this._canTakeDamage = false;
            this._timeSinceLastHit = 0;
        }
    }

    public getState():MovementState{
        return this.currentState;
    }

    update(deltaTime: number) {
        // Handle touch input if on mobile
        if (this._isMobile) {
            this.handleTouchInput();
        }

        // Damage cooldown timer
        if (!this._canTakeDamage) {
            this._timeSinceLastHit += deltaTime;
            
            if (this._timeSinceLastHit >= this.damageCooldown) {
                this._canTakeDamage = true;
            }
        }

        // Dash cooldown timer
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime;
        }

        // Update slide timer - ends slide when animation finishes
        this._slidingController.updateSlideTimer(deltaTime);

        if(this.staminaManager.getStamina() <= 0 && (this.currentState == MovementState.RUNNING || this.currentState == MovementState.WALL_RUNNING)){
            this.SetState(MovementState.IDLE);
        }
        if (this.currentState != MovementState.VAULTING && !this.isDashing) this.HandleMovement(deltaTime);
    }

    HandleMovement(deltaTime: number) {
        this.movementDirection.set(0, this.verticalVelocity, 0);
        this.ApplyGravity(deltaTime);

        // Check for wall running conditions (airborne + wall contact + stamina + moving forward)
        if (this.currentState === MovementState.JUMPING && !this.charController.isGrounded) {
            if (this.checkWallContact() && this.staminaManager.getStamina() >= Energy.RUN && this.currentSpeed > 0) {
                this.SetState(MovementState.WALL_RUNNING);
            }
        }

        // Exit wall running if conditions no longer met
        if (this.currentState === MovementState.WALL_RUNNING) {
            if (!this.checkWallContactOnSide(this._wallRunLockedSide) || this.staminaManager.getStamina() < Energy.RUN || this.charController.isGrounded) {
                this.SetState(MovementState.JUMPING);
            }
        }

        if(this._slidingController.isSliding){
            // During slide: maintain ground contact and forward momentum
            this.verticalVelocity = -0.5; // Strong downward velocity to keep grounded and low
            this.currentSpeed = this._slidingController.handleSlideMovement(this.movementDirection, this.currentSpeed, deltaTime);
            if (this.isDashing) {
                this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
            }
        } else if (this.currentState === MovementState.WALL_RUNNING) {
            // Wall Run Logic
            this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
            // Reduce gravity to allow running on walls
            this.verticalVelocity = 0; // Maintain consistent upward movement on wall
            this.staminaManager.reduceStamina(Energy.RUN * deltaTime); // Continuous stamina cost
            // Keep Y locked to wall-parallel direction set at wall-run start
            this.node.setRotationFromEuler(0, this._wallRunLockedY, this._currentLeanAngle);
            this.updateWallRunLean(deltaTime);
            this.Run(deltaTime);
        } else {
            this.resetWallRunLean(deltaTime);
            this.Run(deltaTime);
        }

        this.Turn(deltaTime);

        if (this.movementDirection.lengthSqr() > 0) {
            this.charController.move(this.movementDirection.multiplyScalar(deltaTime));
        }
    }

    LowVault(obstacle: Node) {
        this.Animation.setValue('Vault', true);
        const pos = this.node.worldPosition.clone()
        var destination = pos.clone();
        Vec3.scaleAndAdd(destination, pos, this.node.forward, -.75);
        destination.y = obstacle.position.y+.5;
        this.staminaManager.reduceStamina(Energy.VAULT, true); // Show stat display
        tween()
        .target(this.node)
        .delay(.25)
        .to(.5, { worldPosition: destination })
        .call(() => {
            this.SetState(MovementState.IDLE);
        })
        .start();
    }
    
    VaultOver() {
        const vaultDetector = this.node.getComponent(VaultDetector);
        vaultDetector.checkObstacleAhead();
        const obstacle:Node = vaultDetector.hitResult;
        if (!obstacle || this.currentState == MovementState.VAULTING) return;
        
        if(obstacle && obstacle.getComponent(Box).boxType == ObstacleType.LOWBOX){
            this.SetState(MovementState.IDLE);
            this.SetState(MovementState.VAULTING);
            this.LowVault(obstacle);
        }
    }

    Jump() {
        if(this.currentSpeed == 0) return;

        // Wall Run Jump Logic
        if (this.currentState === MovementState.WALL_RUNNING) {
            // Calculate jump direction: exactly perpendicular to the wall (90 degrees away)
            const normal = this._wallNormal.clone();
            normal.y = 0; // Ignore vertical component
            normal.normalize();

            // Jump direction is the wall normal (points away from wall surface)
            const jumpDir = normal.clone();
            jumpDir.normalize();

            // Rotate character to face jump direction
            const targetRotation = Math.atan2(jumpDir.x, jumpDir.z) * (180 / Math.PI);
            this.node.setRotationFromEuler(0, targetRotation, 0);

            this.SetState(MovementState.JUMPING);
            this.Animation.setValue('Jump', true);
            this.staminaManager.reduceStamina(Energy.JUMP, true); // Show stat display
            this.verticalVelocity = 8.5 * (this.currentSpeed / this.maxSpeed);
        } else {
            // Normal Jump Logic
            this.SetState(MovementState.JUMPING);
            this.Animation.setValue('Jump', true);
            this.staminaManager.reduceStamina(Energy.JUMP, true); // Show stat display
            this.verticalVelocity = 8.5 * (this.currentSpeed / this.maxSpeed);
        }
    }

    Turn(deltaTime: number) {
        if (!this.charController.isGrounded || this._slidingController.isSliding) return;
        this.node.setRotationFromEuler(0, this.node.eulerAngles.y + (this.turnRate * deltaTime * this._moveDir.x), 0);
    }

    Run(deltaTime: number) {
        if(this.currentState == MovementState.RUNNING || this.currentState == MovementState.WALL_RUNNING || this.currentState == MovementState.JUMPING){
            this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
        } else {
            this.currentSpeed = 0;
        }
        this.Animation.setValue('currentSpeed', this.currentSpeed / this.maxSpeed);
        const fw = this.node.forward.clone().multiplyScalar(-this.currentSpeed);
        Vec3.add(this.movementDirection, this.movementDirection, fw);
    }

    ApplyGravity(deltaTime: number) {
        if (this.currentState == MovementState.VAULTING || this._slidingController.isSliding) return;
        if (this.charController.isGrounded == false) {
            this.verticalVelocity -= .5;
        } else {
            if (this.verticalVelocity < 0) {
                this.verticalVelocity = -.5;
                if(this._moveDir.z != 0){
                    this.SetState(MovementState.RUNNING);
                }
            }
        }
    }

    Dash() {
        if (this.isDashing || this.dashCooldownTimer > 0 || this.currentState === MovementState.VAULTING) return;
        
        if (this.staminaManager.getStamina() < Energy.DASH) return;
        
        this.isDashing = true;
        this.staminaManager.reduceStamina(Energy.DASH, true); // Show stat display
        this.dashCooldownTimer = this.dashCooldown;
        
        // Calculate dash direction (forward)
        const dashDirection = this.node.forward.clone();
        dashDirection.y = 0;
        dashDirection.normalize();
        
        // Perform dash using CharacterController.move() with collision detection
        this.performDashWithCollision(dashDirection);

        if (this._slidingController.isSliding) {
            this._slidingController.extendSlide();
        }

        this.callGhostEffect(2);
    }

    private performDashWithCollision(direction: Vec3): void {
        const dashSpeed = this.dashDistance / 0.1; // Speed to cover dashDistance in 0.1 seconds
        const stepCount = 10; // Number of steps for smooth dash
        const stepDistance = this.dashDistance / stepCount;
        const stepDuration = 0.01; // 0.1 seconds / 10 steps
        
        let currentStep = 0;
        
        // Use schedule to perform dash in small steps with collision detection
        this.schedule(() => {
            if (currentStep >= stepCount) {
                this.isDashing = false;
                this.unschedule(this.dashStepCallback);
                return;
            }
            
            // Calculate movement for this step
            const moveVec = direction.clone().multiplyScalar(-stepDistance);
            
            // Check if path is clear using raycast
            const ray = new geometry.Ray();
            const startPos = this.node.worldPosition.clone();
            const endPos = startPos.clone().add(moveVec);
            geometry.Ray.fromPoints(ray, startPos, endPos);
            
            // Raycast to check for obstacles
            const hit = PhysicsSystem.instance.raycastClosest(ray, 1, stepDistance);
            
            if (hit && PhysicsSystem.instance.raycastClosestResult) {
                // Hit a wall - stop dash immediately
                this.isDashing = false;
                this.unschedule(this.dashStepCallback);
                return;
            }
            
            // Safe to move - use CharacterController for proper collision
            moveVec.y = 0; // Keep on same vertical level
            this.charController.move(moveVec);
            
            currentStep++;
        }, stepDuration, stepCount, 0, 'dashStepCallback');
    }
    
    private dashStepCallback() {
        // Named callback for schedule/unschedule
    }

    callGhostEffect(count: number = 1) {
        const ghostEffect = this.node.getComponent(GhostEffect);
        if (ghostEffect) {
            ghostEffect.create3DGhost(count);
        }
    }

    // Helper: return true if the collider's node has a Box component with HIGHBOX type
    private isHighBoxCollider(collider: Collider | null): boolean {
        if (!collider || !collider.node) return false;
        const box = collider.node.getComponent(Box);
        if (!box) return false;
        return box.boxType === ObstacleType.HIGHBOX;
    }

    /** Checks wall contact only on the locked side — used during wall-run to avoid side-flip */
    private checkWallContactOnSide(side: number): boolean {
        if (side === 0) return false;
        const checkDistance = 0.8;
        const playerPos = this.node.worldPosition;
        const playerRight = this.node.right.clone();
        const ray = new geometry.Ray();
        const checkPoint = new Vec3();
        // side 1 = right wall, side -1 = left wall
        Vec3.scaleAndAdd(checkPoint, playerPos, playerRight, side * checkDistance);
        geometry.Ray.fromPoints(ray, playerPos, checkPoint);

        // Raycast and accept only if the hit collider has Box component with HIGHBOX
        const hit = PhysicsSystem.instance.raycastClosest(ray, 1, checkDistance);
        if (hit && PhysicsSystem.instance.raycastClosestResult) {
            return this.isHighBoxCollider(PhysicsSystem.instance.raycastClosestResult.collider);
        }
        return false;
    }

    private checkWallContact(): boolean {
        const checkDistance = 0.8; // Distance to check for walls
        const playerPos = this.node.worldPosition;
        const playerRight = this.node.right.clone(); // Get right vector based on player orientation
        
        // Check right side — capture normal before next raycast overwrites the result
        const rayRight = new geometry.Ray();
        const rightCheckPoint = new Vec3();
        Vec3.scaleAndAdd(rightCheckPoint, playerPos, playerRight, checkDistance);
        geometry.Ray.fromPoints(rayRight, playerPos, rightCheckPoint);
        const hitRight = PhysicsSystem.instance.raycastClosest(rayRight, 1, checkDistance);
        const rightNormal = (hitRight && this.isHighBoxCollider(PhysicsSystem.instance.raycastClosestResult.collider))
            ? PhysicsSystem.instance.raycastClosestResult.hitNormal.clone()
            : null;

        // Check left side
        const rayLeft = new geometry.Ray();
        const leftCheckPoint = new Vec3();
        Vec3.scaleAndAdd(leftCheckPoint, playerPos, playerRight, -checkDistance);
        geometry.Ray.fromPoints(rayLeft, playerPos, leftCheckPoint);
        const hitLeft = PhysicsSystem.instance.raycastClosest(rayLeft, 1, checkDistance);
        const leftNormal = (hitLeft && this.isHighBoxCollider(PhysicsSystem.instance.raycastClosestResult.collider))
            ? PhysicsSystem.instance.raycastClosestResult.hitNormal.clone()
            : null;

        // Track wall side for leaning: right wall = lean right (+Z), left wall = lean left (-Z)
        if (rightNormal) {
            this._wallSide = 1;
            this._wallNormal.set(rightNormal);
        } else if (leftNormal) {
            this._wallSide = -1;
            this._wallNormal.set(leftNormal);
        } else {
            this._wallSide = 0;
            this._wallNormal.set(Vec3.ZERO);
        }
        
        // A wall is detected if there's a hit on either side
        return hitRight || hitLeft;
    }

    /**
     * Computes the Y euler angle that makes the character face parallel to the wall.
     */
    private computeWallParallelY(): number {
        if (this._wallSide === 0) return this.node.eulerAngles.y;

        const normal = this._wallNormal.clone();
        normal.y = 0;
        normal.normalize();

        // cross(normal, up) gives one tangent direction along the wall surface
        const runDir = new Vec3();
        Vec3.cross(runDir, normal, Vec3.UP);
        runDir.normalize();

        // Use the locked side to determine run direction
        if (this._wallSide === -1) {
            runDir.negative();
        }

        // Convert to Y euler: atan2(-x, -z) because Cocos forward is -Z
        return Math.atan2(-runDir.x, -runDir.z) * (180 / Math.PI);
    }

    private updateWallRunLean(deltaTime: number): void {
        const targetLean = this._wallSide * this.wallRunLeanAngle;
        this._currentLeanAngle = math.lerp(this._currentLeanAngle, targetLean, deltaTime * this.wallRunLeanSpeed);
        
        const yRotation = this.node.eulerAngles.y;
        this.node.setRotationFromEuler(0, yRotation, this._currentLeanAngle);
    }

    private resetWallRunLean(deltaTime: number): void {
        if (Math.abs(this._currentLeanAngle) < 0.5) {
            if (this._currentLeanAngle !== 0) {
                this._currentLeanAngle = 0;
                const yRotation = this.node.eulerAngles.y;
                this.node.setRotationFromEuler(0, yRotation, 0);
            }
            return;
        }
        
        this._currentLeanAngle = math.lerp(this._currentLeanAngle, 0, deltaTime * this.wallRunLeanSpeed);
        const yRotation = this.node.eulerAngles.y;
        this.node.setRotationFromEuler(0, yRotation, this._currentLeanAngle);
    }

    protected onDestroy(): void {
        if (!this._isMobile) {
            input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        }
        this.charController.off('onControllerTriggerEnter', this.onControllerColliderHit, this);
    }
}