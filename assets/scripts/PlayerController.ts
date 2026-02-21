import { _decorator, animation, CapsuleCharacterController, CCBoolean, CCFloat, CharacterController, CharacterControllerContact, Collider, Component, easing, Enum, EventKeyboard, Input, input, KeyCode, Layers, geometry, math, Node, NodeSpace, PhysicsSystem, RigidBody, Tween, tween, Vec3 } from 'cc';
import { VaultDetector } from './VaultDetector';
import { Energy, MovementState, ObstacleType } from './Define/Define';
import { Box } from './Obstacle/Box';
import { GhostEffect } from './Utils/GhostEffect';
import { Actor } from './Actor';
import { StaminaManager } from './GameManager/StaminaManager';
import { ObstacleCollision } from './Obstacle/ObstacleCollision';
import { Missile } from './Obstacle/Missile';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    private movementState: MovementState;
    public currentState: MovementState;

    @property(animation.AnimationController)
    Animation: animation.AnimationController;

    @property(CapsuleCharacterController)
    charController: CapsuleCharacterController;

    @property(StaminaManager)
    staminaManager: StaminaManager = null;

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
    slideHeight: number = 0.5; // New property for slide height

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
    isSliding: boolean = false; // New flag for sliding

    VaultTween: Tween = new Tween();

    private _actor: Actor;
    private _timeSinceLastHit: number = 0;
    private _canTakeDamage: boolean = true;

    // Track which turn keys are pressed
    private _keyAPressed: boolean = false;
    private _keyDPressed: boolean = false;

    // Wall run lean tracking
    private _wallSide: number = 0; // -1 = left wall, 1 = right wall, 0 = no wall
    private _currentLeanAngle: number = 0;
    private _wallNormal: Vec3 = new Vec3(); // Surface normal of the detected wall
    private _wallRunLockedY: number = 0;    // Y rotation locked once at wall-run start
    private _wallRunLockedSide: number = 0; // Wall side locked once at wall-run start

    protected onLoad(): void {
        this.SetState(MovementState.IDLE);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {

        if(this.currentState == MovementState.VAULTING || this.isSliding) return;
        //walk - run
        if (event.keyCode === KeyCode.KEY_W) {
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
                this.StartSlide();
            }
        } else {
            // Allow dash while jumping
            if (event.keyCode === KeyCode.KEY_E) {
                this.Dash();
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
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

        // End slide when key is released
        if (event.keyCode === KeyCode.KEY_S && this.isSliding) {
            this.EndSlide();
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
    
    SetState(newState: MovementState) {
        this.currentState = newState;
        
        switch (this.currentState) {
            case MovementState.IDLE:
                this._moveDir.z = 0;
                this.Animation.setValue('isRunning', false);
                break;
            case MovementState.WALKING:

                break;
            case MovementState.RUNNING:
                this._moveDir.z = 1;
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
                this.Animation.setValue('Slide', true);
                break;
            case MovementState.WALL_RUNNING:
                console.log("wall running");
                this.Animation.setValue('isRunning', true);
                // Lock wall side and Y rotation once at wall-run start
                this._wallRunLockedSide = this._wallSide;
                this._wallRunLockedY = this.computeWallParallelY();
                console.log(`[WallRun] LOCKED side=${this._wallRunLockedSide} Y=${this._wallRunLockedY.toFixed(1)}`);
                this.node.setRotationFromEuler(0, this._wallRunLockedY, this._currentLeanAngle);
                break;
            default:
                break;
        }
    }

    start() {
        this.rigidb = this.node.getComponent(RigidBody);
        this._actor = this.node.getComponent(Actor);

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
        // console.log("collided" + contact.collider.node.name);
        
        if (!this._canTakeDamage || this.currentState === MovementState.VAULTING || this.isSliding) return;

        const hitNode = contact.collider.node;
        
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
        // Damage cooldown timer
        if (!this._canTakeDamage) {
            this._timeSinceLastHit += deltaTime;
            // console.log(">>>> "+this._timeSinceLastHit);
            
            if (this._timeSinceLastHit >= this.damageCooldown) {
                this._canTakeDamage = true;
            }
        }

        // Dash cooldown timer
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime;
        }

        if(this.staminaManager.getStamina() <= 0 && (this.currentState == MovementState.RUNNING || this.currentState == MovementState.WALL_RUNNING)){
            this.SetState(MovementState.IDLE);
        }
        if (this.currentState != MovementState.VAULTING && !this.isDashing) this.HandleMovement(deltaTime);
    }


    HandleMovement(deltaTime: number) {
        this.movementDirection.set(0, this.verticalVelocity, 0);
        this.ApplyGravity(deltaTime);

        // Check for wall running conditions (airborne + wall contact + stamina + moving forward)
        // Only enter wall-run once — do NOT call SetState(WALL_RUNNING) every frame
        if (this.currentState === MovementState.JUMPING && !this.charController.isGrounded) {
            if (this.checkWallContact() && this.staminaManager.getStamina() >= Energy.RUN && this.currentSpeed > 0) {
                console.log(">>> wallrunning");
                this.SetState(MovementState.WALL_RUNNING);
            }
        }

        // Exit wall running if conditions no longer met
        // Use locked side to check wall contact so _wallSide flip doesn't cause false exits
        if (this.currentState === MovementState.WALL_RUNNING) {
            if (!this.checkWallContactOnSide(this._wallRunLockedSide) || this.staminaManager.getStamina() < Energy.RUN || this.charController.isGrounded) {
                console.log(">>> not wallrunning");
                this.SetState(MovementState.JUMPING);
            }
        }

        if(this.isSliding){
            this.currentSpeed = math.lerp(this.currentSpeed, 2.0, deltaTime * this.acceleration); // Reduced max speed
            this.node.setScale(this.node.scale.x, this.slideHeight, this.node.scale.z); // Reduce height
            this.Run(deltaTime); // Call Run to calculate movement direction
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
        // console.log(destination);
        this.staminaManager.reduceStamina(Energy.VAULT);
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
        this.SetState(MovementState.JUMPING);
        this.Animation.setValue('Jump', true);
        this.staminaManager.reduceStamina(Energy.JUMP);
        this.verticalVelocity = 8.5 * (this.currentSpeed / this.maxSpeed);
    }

    Turn(deltaTime: number) {
        if (!this.charController.isGrounded || this.isSliding) return;
        this.node.setRotationFromEuler(0, this.node.eulerAngles.y + (this.turnRate * deltaTime * this._moveDir.x), 0);
    }

    Run(deltaTime: number) {
        if(this.currentState == MovementState.RUNNING || this.currentState == MovementState.WALL_RUNNING || this.currentState == MovementState.JUMPING){
            this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
        } 
        // else if (this.currentState == MovementState.JUMPING) {
        //     // Maintain current speed during jump for forward momentum
        //     // Speed decays slightly if not running
        //     this.currentSpeed = math.lerp(this.currentSpeed, 0, deltaTime * 0.8);
        // } 
        else {
            this.currentSpeed = 0;
        }
        this.Animation.setValue('currentSpeed', this.currentSpeed / this.maxSpeed);
        const fw = this.node.forward.clone().multiplyScalar(-this.currentSpeed);
        Vec3.add(this.movementDirection, this.movementDirection, fw);
    }

    ApplyGravity(deltaTime: number) {
        if (this.currentState == MovementState.VAULTING || this.isSliding) return;
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
        if (this.isDashing || this.dashCooldownTimer > 0 || this.currentState === MovementState.VAULTING || this.isSliding) return;
        
        if (this.staminaManager.getStamina() < Energy.DASH) return;
        
        this.isDashing = true;
        this.staminaManager.reduceStamina(Energy.DASH);
        this.dashCooldownTimer = this.dashCooldown;
        
        // Store current position
        const startPos = this.node.worldPosition.clone();
        
        // Calculate dash direction (forward)
        const dashDirection = this.node.forward.clone();
        dashDirection.y = 0;
        dashDirection.normalize();
        
        // Calculate end position
        const endPos = startPos.clone();
        Vec3.scaleAndAdd(endPos, startPos, dashDirection, -this.dashDistance);
        
        // Perform dash movement
        tween()
            .target(this.node)
            .to(0.1, { worldPosition: endPos })
            .call(() => {
                this.isDashing = false;
            })
            .start();

        this.callGhostEffect(2);
    }

    callGhostEffect(count: number = 1) {
        const ghostEffect = this.node.getComponent(GhostEffect);
        if (ghostEffect) {
            ghostEffect.create3DGhost(count);
        }
    }

    StartSlide() {
        if (this.charController.isGrounded) {
            // this.SetState(MovementState.SLIDING);
            this.staminaManager.reduceStamina(Energy.SLIDE);
            this.Animation.setValue('Slide', true);
        }
    }

    EndSlide() {
        this.SetState(MovementState.IDLE);
        this.node.setScale(this.node.scale.x, 1.0, this.node.scale.z); // Reset height
        this.Animation.setValue('Slide', false);
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
        return PhysicsSystem.instance.raycastClosest(ray, 1, checkDistance);
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
        const rightNormal = hitRight
            ? PhysicsSystem.instance.raycastClosestResult.hitNormal.clone()
            : null;

        // Check left side
        const rayLeft = new geometry.Ray();
        const leftCheckPoint = new Vec3();
        Vec3.scaleAndAdd(leftCheckPoint, playerPos, playerRight, -checkDistance);
        geometry.Ray.fromPoints(rayLeft, playerPos, leftCheckPoint);
        const hitLeft = PhysicsSystem.instance.raycastClosest(rayLeft, 1, checkDistance);
        const leftNormal = hitLeft
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
     * Called once when wall-run starts. Uses the wall normal to derive the run direction:
     *   - cross(wallNormal, worldUp) gives a tangent along the wall surface
     *   - _wallSide determines which of the two tangent directions to use
     *   - Left wall  (_wallSide = -1): character runs toward +X world → Y ≈ 0
     *   - Right wall (_wallSide =  1): character runs toward -X world → Y ≈ 180
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

        // Use the locked side (captured at wall-run entry) to determine run direction.
        // _wallSide = -1 means wall is on the LEFT  → character runs in +runDir
        // _wallSide =  1 means wall is on the RIGHT → character runs in -runDir
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
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.charController.off('onControllerTriggerEnter', this.onControllerColliderHit, this);
    }
}