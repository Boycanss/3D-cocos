import { _decorator, CCFloat, Collider, Component, ITriggerEvent, Node, tween, Vec3 } from 'cc';
import { FlagLevel, FlagBenefits } from '../Define/Define';
import { PlayerController } from '../PlayerController';
import { FlagBuffManager } from './FlagBuffManager';
import { ScoreManager } from '../GameManager/ScoreManager';
const { ccclass, property } = _decorator;

@ccclass('Flag')
export class Flag extends Component {
    @property(CCFloat)
    rotationSpeed: number = 90; // Degrees per second

    @property(CCFloat)
    bobHeight: number = 0.3; // How much the flag bobs up and down

    @property(CCFloat)
    bobSpeed: number = 2.0; // Speed of bobbing animation

    @property(Node)
    visualNode: Node = null; // The visual mesh/sprite of the flag

    private _flagLevel: FlagLevel = FlagLevel.LEVEL1;
    private _initialY: number = 0;
    private _bobTimer: number = 0;
    private _isCollected: boolean = false;
    private _parentLowBox: Node = null; // Reference to the LowBox this flag is on

    start() {
        this._initialY = this.node.position.y;
        
        // Setup trigger collider
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            console.log(`Flag: Collider found and listener attached. IsTrigger: ${collider.isTrigger}`);
        } else {
            console.warn('Flag: No Collider component found on flag node!');
        }

        // Listen for player collision event (from CharacterController)
        this.node.on('player-collision', this.onPlayerCollision, this);

        // Start floating animation
        this.startFloatingAnimation();
    }

    update(deltaTime: number) {
        if (this._isCollected) return;

        // Rotate flag
        const currentRotation = this.node.eulerAngles;
        this.node.setRotationFromEuler(
            currentRotation.x,
            currentRotation.y + this.rotationSpeed * deltaTime,
            currentRotation.z
        );

        // Bob up and down
        this._bobTimer += deltaTime * this.bobSpeed;
        const bobOffset = Math.sin(this._bobTimer) * this.bobHeight;
        const pos = this.node.position;
        this.node.setPosition(pos.x, this._initialY + bobOffset, pos.z);
    }

    /**
     * Set the flag level and apply visual changes
     */
    public setFlagLevel(level: FlagLevel): void {
        this._flagLevel = level;
        this.applyVisualForLevel(level);
    }

    /**
     * Get the current flag level
     */
    public getFlagLevel(): FlagLevel {
        return this._flagLevel;
    }

    /**
     * Set the parent LowBox node
     */
    public setParentLowBox(lowBox: Node): void {
        this._parentLowBox = lowBox;
    }

    /**
     * Get the parent LowBox node
     */
    public getParentLowBox(): Node {
        return this._parentLowBox;
    }

    /**
     * Apply visual changes based on flag level (color, scale, effects)
     */
    private applyVisualForLevel(level: FlagLevel): void {
        if (!this.visualNode) return;

        // Scale increases with level
        const baseScale = 1.0;
        const scaleMultiplier = 1 + (level - 1) * 0.15; // +15% per level
        this.visualNode.setScale(baseScale * scaleMultiplier, baseScale * scaleMultiplier, baseScale * scaleMultiplier);

        // You can add color changes, particle effects, etc. here based on level
        // Example: Different materials or colors for different levels
    }

    /**
     * Start floating/pulsing animation
     */
    private startFloatingAnimation(): void {
        if (!this.visualNode) return;

        const originalScale = this.visualNode.scale.clone();
        const pulseScale = originalScale.clone().multiplyScalar(1.1);

        tween(this.visualNode)
            .to(0.8, { scale: pulseScale }, { easing: 'sineInOut' })
            .to(0.8, { scale: originalScale }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }

    /**
     * Handle collision from CharacterController (via event)
     */
    private onPlayerCollision(player: PlayerController): void {
        console.log(`Flag: onPlayerCollision called. IsCollected: ${this._isCollected}`);
        
        if (this._isCollected) return;
        
        if (player) {
            console.log(">>>>>> Flag Collected via CharacterController!");
            this.collectFlag(player);
        }
    }

    /**
     * Handle collision with player (fallback for regular colliders)
     */
    private onTriggerEnter(event: ITriggerEvent): void {
        console.log(`Flag: onTriggerEnter called. IsCollected: ${this._isCollected}`);
        
        if (this._isCollected) return;

        const otherNode = event.otherCollider.node;
        console.log(`Flag: Collided with node: ${otherNode.name}`);
        
        // Check if the colliding node is the player or has PlayerController
        let player = otherNode.getComponent(PlayerController);
        
        // If not found, check parent node (in case CharacterController is on parent)
        if (!player && otherNode.parent) {
            player = otherNode.parent.getComponent(PlayerController);
            console.log(`Flag: Checking parent node: ${otherNode.parent.name}`);
        }
        
        if (player) {
            console.log(">>>>>> Flag Collected via Trigger!");
            this.collectFlag(player);
        } else {
            console.log(`Flag: No PlayerController found on ${otherNode.name} or its parent`);
        }
    }

    /**
     * Collect the flag and apply benefits to player
     */
    private collectFlag(player: PlayerController): void {
        this._isCollected = true;

        // Get buff manager from player
        const buffManager = player.node.getComponent(FlagBuffManager);
        if (buffManager) {
            buffManager.applyFlagBuff(this._flagLevel);
        }

        // Notify ScoreManager about flag collection (ScoreManager is on GameManager, not player)
        // Emit event that GameManager/ScoreManager can listen to
        this.node.emit('flag-collected', this.node, this._flagLevel);

        // Play collection animation
        this.playCollectionAnimation();

        console.log(`Flag Level ${this._flagLevel} collected!`);
    }

    /**
     * Play collection animation (popping effect)
     */
    private playCollectionAnimation(): void {
        // Stop the floating animation
        if (this.visualNode) {
            tween(this.visualNode).stop();
        }

        const originalScale = this.node.scale.clone();
        const popScale = originalScale.clone().multiplyScalar(1.4);  // Pop out
        const shrinkScale = originalScale.clone().multiplyScalar(0);  // Shrink to nothing
        
        // Popping animation: quick burst out, then shrink away
        tween(this.node)
            .to(0.12, { scale: popScale }, { easing: 'backOut' })  // Quick pop burst
            .to(0.18, { scale: shrinkScale }, { easing: 'quadIn' })  // Shrink and disappear
            .start();

        // Disable collider to prevent multiple collections
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.enabled = false;
        }
    }

    protected onDestroy(): void {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.off('onTriggerEnter', this.onTriggerEnter, this);
        }
        this.node.off('player-collision', this.onPlayerCollision, this);
    }
}
