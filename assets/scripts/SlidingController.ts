import { _decorator, animation, CapsuleCharacterController, CCFloat, Component, geometry, math, PhysicsSystem, Vec3, Node, tween } from 'cc';
import { Energy, MovementState, ObstacleType } from './Define/Define';
import { StaminaManager } from './GameManager/StaminaManager';
import { PlayerController } from './PlayerController';
import { Box } from './Obstacle/Box';
const { ccclass, property } = _decorator;

@ccclass('SlidingController')
export class SlidingController extends Component {

    @property(Node)
    headNode: Node = null;

    @property(CCFloat)
    slideSpeed: number = 2.0; // Max speed maintained during slide

    @property(CCFloat)
    slideAcceleration: number = 1.5; // How fast speed ramps during slide

    @property(CCFloat)
    slideDuration: number = 0.6; // Duration of slide animation in seconds

    @property(CCFloat)
    rayDistance: number = 1.5; // Distance of ray from head to check for SLIDEBOX

    @property(CCFloat)
    offsetY: number = 0.1;

    @property(CCFloat)
    miniDashDistance: number = 1.5; // Distance for mini dash boost

    @property(CCFloat)
    miniDashDuration: number = 0.15; // Duration of mini dash
    
    // Callback so PlayerController can react to slide state changes
    public onSlideStart: (() => void) | null = null;
    public onSlideEnd: (() => void) | null = null;

    public isSliding: boolean = false;

    private _playerController: PlayerController;
    private _slideStartTime: number = 0;
    private _slideDuration: number = 0;
    private _disabledColliders: Array<{collider: any, box: Box}> = [];
    private _isMiniDashing: boolean = false;

    start() {
        // Get references from PlayerController on the same node
        this._playerController = this.node.getComponent(PlayerController);
    }

    /**
     * Attempts to start a slide. Only allowed when grounded and not already sliding.
     * Uses ray to detect and disable SLIDEBOX colliders.
     */
    public startSlide(): void {
        if (this.isSliding || !this._playerController.charController.isGrounded || this._playerController.currentSpeed == 0) return;

        this.isSliding = true;
        this._slideStartTime = 0;
        this._playerController.staminaManager.reduceStamina(Energy.SLIDE, true); // Show stat display
        this._playerController.Animation.setValue('Slide', true);

        // Use the configured slide duration
        this._slideDuration = this.slideDuration;

        // Cast ray from head position to detect SLIDEBOX colliders
        this.detectAndDisableSlideBoxes();

        // console.log(`[Slide Start] Duration: ${this._slideDuration}s, Disabled colliders: ${this._disabledColliders.length}`);

        if (this.onSlideStart) this.onSlideStart();
    }

    /**
     * Ends the slide and re-enables all disabled colliders.
     */
    public endSlide(): void {
        if (!this.isSliding) return;

        this.isSliding = false;
        this._playerController.Animation.setValue('Slide', false);

        // Re-enable all disabled colliders
        this.reEnableSlideBoxes();

        if (this.onSlideEnd) this.onSlideEnd();
    }

    /**
     * Cast ray from head position to detect and disable SLIDEBOX colliders
     */
    private detectAndDisableSlideBoxes(): void {
        const charController = this._playerController.charController;
        const capsuleHeight = charController.height;
        
        // Get head position (top of capsule) in WORLD space
        let headPos: Vec3;
        if (this.headNode) {
            headPos = this.headNode.worldPosition.clone();
        } else {
            headPos = this.node.worldPosition.clone();
        }
        headPos.y += (capsuleHeight / 2) + this.offsetY;
        
        // Create ray pointing forward (Cocos forward vector is -Z)
        const forwardDir = this.node.forward.clone().multiplyScalar(-1);
        forwardDir.normalize();
        const rayEnd = new Vec3();
        Vec3.scaleAndAdd(rayEnd, headPos, forwardDir, this.rayDistance);
        
        const ray = new geometry.Ray();
        geometry.Ray.fromPoints(ray, headPos, rayEnd);
        
        // console.log(`[Slide] Ray from (${headPos.x.toFixed(2)}, ${headPos.y.toFixed(2)}, ${headPos.z.toFixed(2)}) to (${rayEnd.x.toFixed(2)}, ${rayEnd.y.toFixed(2)}, ${rayEnd.z.toFixed(2)})`);
        
        // Raycast to find SLIDEBOX colliders
        const fis = PhysicsSystem.instance;
        if (fis.raycastClosest(ray, 1, this.rayDistance)) {
            const result = fis.raycastClosestResult;
            const collider = result.collider;
            
            if (collider && collider.node) {
                const box = collider.node.getComponent(Box);
                // console.log(`[Slide] Hit: ${collider.node.name}, Box: ${box ? 'yes' : 'no'}, Type: ${box ? box.boxType : 'N/A'}`);
                
                if (box && box.boxType === ObstacleType.SLIDEBOX) {
                    this.miniDash();
                    collider.enabled = false;
                    this._disabledColliders.push({ collider, box });
                    // console.log(`[Slide] Disabled SLIDEBOX: ${collider.node.name}`);
                }
            }
        } else {
            // console.log(`[Slide] No colliders hit by ray`);
        }
    }

    /**
     * Performs a mini dash boost while sliding - shorter and less powerful than regular dash
     */
    private miniDash(): void {
        if (this._isMiniDashing) return;
        
        this._isMiniDashing = true;
        
        // Store current position
        const startPos = this.node.worldPosition.clone();
        
        // Calculate dash direction (forward)
        const dashDirection = this.node.forward.clone();
        dashDirection.y = 0;
        dashDirection.normalize();
        
        // Calculate end position
        const endPos = startPos.clone();
        Vec3.scaleAndAdd(endPos, startPos, dashDirection, -this.miniDashDistance);
        
        // Perform mini dash movement
        tween(this.node)
            .to(this.miniDashDuration, { worldPosition: endPos })
            .call(() => {
                this._isMiniDashing = false;
            })
            .start();
        
        console.log(`[Slide] Mini dash boost!`);
    }

    /**
     * Re-enable all disabled SLIDEBOX colliders
     */
    private reEnableSlideBoxes(): void {
        for (const item of this._disabledColliders) {
            if (item.collider) {
                item.collider.enabled = true;
                // console.log(`[Slide] Re-enabled SLIDEBOX: ${item.collider.node.name}`);
            }
        }
        this._disabledColliders = [];
    }

    /**
     * Update slide timer and check if animation has finished
     */
    public updateSlideTimer(deltaTime: number): void {
        if (!this.isSliding) return;
        
        this._slideStartTime += deltaTime;
        
        // End slide when animation duration is reached
        if (this._slideStartTime >= this._slideDuration) {
            this.endSlide();
        }
    }

    /**
     * Extends the slide duration (used when chaining dash while sliding)
     */
    public extendSlide(extraDuration: number = 0.2): void {
        if (!this.isSliding) return;
        this._slideDuration += extraDuration;
    }

    /**
     * Called every frame from PlayerController.HandleMovement while isSliding is true.
     * Applies forward momentum and speed interpolation.
     * @param movementDirection - the movement vector being built this frame (modified in place)
     * @param currentSpeed - current player speed (passed by reference via wrapper)
     * @param deltaTime
     * @returns updated currentSpeed
     */
    public handleSlideMovement(
        movementDirection: Vec3,
        currentSpeed: number,
        deltaTime: number
    ): number {
        // Maintain slide speed with slight deceleration
        currentSpeed = math.lerp(currentSpeed, this.slideSpeed, deltaTime * this.slideAcceleration);

        // Push forward using the node's forward direction
        const fw = this.node.forward.clone().multiplyScalar(-currentSpeed);
        Vec3.add(movementDirection, movementDirection, fw);

        return currentSpeed;
    }


}
