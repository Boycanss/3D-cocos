import { _decorator, animation, CapsuleCharacterController, CCBoolean, CCFloat, CharacterController, CharacterControllerContact, Collider, Component, easing, Enum, EventKeyboard, Input, input, KeyCode, Layers, geometry, math, Node, NodeSpace, RigidBody, Tween, tween, Vec3 } from 'cc';
import { VaultDetector } from './VaultDetector';
import { Energy, MovementState, ObstacleType } from './Define/Define';
import { Box } from './Obstacle/Box';
import { Obstacle } from './Obstacle/Obstacle';
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
    staminaManager: StaminaManager;

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
    isWallRunning: boolean = false; // New flag for wall running

    VaultTween: Tween = new Tween();

    private _actor: Actor;
    private _timeSinceLastHit: number = 0;
    private _canTakeDamage: boolean = true;

    // Track which turn keys are pressed
    private _keyAPressed: boolean = false;
    private _keyDPressed: boolean = false;

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
                if (this.checkWallContact() && this.staminaManager.getStamina() >= Energy.RUN) {
                    this.isWallRunning = true;
                    this.verticalVelocity -= 0.1; // Reduce gravity to allow running on walls
                    this.staminaManager.reduceStamina(Energy.RUN);
                    this.Animation.setValue('isRunning', true);
                } else {
                    this.SetState(MovementState.IDLE);
                }
                break;
            default:
                break;
        }
    }

    start() {
        this.rigidb = this.node.getComponent(RigidBody);
        this._actor = this.node.getComponent(Actor);

        // Listen for character controller collision
        this.charController.on("onControllerTriggerEnter", this.onControllerColliderHit, this);

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

        if(this.isSliding){
            this.currentSpeed = math.lerp(this.currentSpeed, 2.0, deltaTime * this.acceleration); // Reduced max speed
            this.node.setScale(this.node.scale.x, this.slideHeight, this.node.scale.z); // Reduce height
            this.Run(deltaTime); // Call Run to calculate movement direction
        } else if (this.isWallRunning) {
            // Wall Run Logic
            this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
            // Reduce gravity to allow running on walls
            this.verticalVelocity -= .1; 
            this.Run(deltaTime);
        } else {
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
        if(this.currentState == MovementState.RUNNING || this.currentState == MovementState.WALL_RUNNING){
            this.currentSpeed = math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * this.acceleration);
        } else {
            this.currentSpeed = 0;
        }
        // this.currentSpeed = this.currentState == MovementState.RUNNING ? math.lerp(this.currentSpeed, this.maxSpeed, deltaTime * 1.5) : 0;
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

    private checkWallContact(): boolean {
        const rayDown = new geometry.Ray();
        rayDown.origin.copy(this.node.worldPosition);
        rayDown.direction.set(0, -1, 0);

        const rayLeft = new geometry.Ray();
        rayLeft.origin.copy(this.node.worldPosition);
        rayLeft.direction.set(-1, 0, 0);

        const rayRight = new geometry.Ray();
        rayRight.origin.copy(this.node.worldPosition);
        rayRight.direction.set(1, 0, 0);

        const hitDown = PhysicsSystem.instance.raycastClosest(rayDown);
        const hitLeft = PhysicsSystem.instance.raycastClosest(rayLeft);
        const hitRight = PhysicsSystem.instance.raycastClosest(rayRight);

        return hitDown && hitLeft && hitRight;
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.charController.off('onControllerTriggerEnter', this.onControllerColliderHit, this);
    }
}
