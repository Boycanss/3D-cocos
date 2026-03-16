import { _decorator, Component, Node, Vec3, CCFloat, Color, ModelComponent } from 'cc';
import { FlagManager } from '../GameManager/FlagManager';
const { ccclass, property } = _decorator;

@ccclass('PointerIndicator')
export class PointerIndicator extends Component {
    @property(Node)
    playerNode: Node = null;

    @property(FlagManager)
    flagManager: FlagManager = null;

    @property(CCFloat)
    heightOffset: number = 0.5; // Height above ground where pointer is positioned

    @property(CCFloat)
    distanceFromPlayer: number = 2.0; // Distance from player center to position pointer

    @property(CCFloat)
    hideDistance: number = 10; // Distance at which pointer becomes transparent

    @property(CCFloat)
    fadeDistance: number = 20; // Distance at which pointer starts fading

    private _initialPointerScale: Vec3 = null;
    private _modelComponent: ModelComponent = null;

    start() {
        // Store initial scale for later use
        this._initialPointerScale = this.node.scale.clone();

        // Get the ModelComponent from the node
        this._modelComponent = this.node.children[0].getComponent(ModelComponent);
        if (!this._modelComponent) {
            console.warn('PointerIndicator: ModelComponent not found on pointer node');
        }
    }

    update(deltaTime: number) {
        if (!this.playerNode || !this.flagManager) {
            return;
        }

        // Get current flag
        const currentFlag = this.flagManager.getCurrentFlag();

        if (!currentFlag || !currentFlag.isValid) {
            // No flag exists, make pointer fully transparent
            this.setPointerAlpha(0);
            return;
        }

        // Get positions
        const playerPos = this.playerNode.getWorldPosition();
        const flagPos = currentFlag.getWorldPosition();

        // Calculate distance to flag
        const distance = Vec3.distance(playerPos, flagPos);

        // Update pointer transform and alpha
        this.updatePointerTransform(playerPos, flagPos, distance);
    }

    /**
     * Update pointer position and rotation to point at flag
     */
    private updatePointerTransform(playerPos: Vec3, flagPos: Vec3, distance: number): void {
        // Calculate direction from player to flag (horizontal plane only)
        const directionToFlag = new Vec3();
        Vec3.subtract(directionToFlag, flagPos, playerPos);
        directionToFlag.y = 0; // Ignore vertical component
        directionToFlag.normalize();

        // Position pointer at distance from player in the direction of the flag
        const pointerPos = new Vec3();
        Vec3.scaleAndAdd(pointerPos, playerPos, directionToFlag, this.distanceFromPlayer);
        pointerPos.y = this.heightOffset; // Set height above ground

        this.node.setWorldPosition(pointerPos);

        // Calculate rotation to point at flag
        // The pointer should rotate around Y axis to face the flag
        const angleToFlag = Math.atan2(directionToFlag.x, directionToFlag.z);
        const degreesToFlag = angleToFlag * (180 / Math.PI);

        // Set rotation (assuming pointer's default forward direction is along Z axis)
        this.node.setRotationFromEuler(0, degreesToFlag, 0);

        // Update alpha based on distance
        this.updatePointerAlpha(distance);
    }

    /**
     * Update pointer alpha based on distance to flag
     */
    private updatePointerAlpha(distance: number): void {
        if (distance <= this.hideDistance) {
            // Completely transparent
            this.setPointerAlpha(0);
        } else if (distance <= this.fadeDistance) {
            // Fade in as distance increases
            const fadeRange = this.fadeDistance - this.hideDistance;
            const fadeProgress = (distance - this.hideDistance) / fadeRange;
            
            // Alpha increases from 0 to 255 as distance increases
            const alpha = Math.floor(fadeProgress * 255);
            this.setPointerAlpha(alpha);
        } else {
            // Fully opaque
            this.setPointerAlpha(255);
        }
    }

    /**
     * Set pointer alpha value
     */
    private setPointerAlpha(alpha: number): void {
        if (!this._modelComponent) return;

        const material = this._modelComponent.material;
        if (!material) return;

        const color = material.getProperty('mainColor', 0) as Color;
        if (color) {
            color.a = Math.max(0, Math.min(255, alpha));
            material.setProperty('mainColor', color, 0);
        }
    }

    /**
     * Get current distance to flag
     */
    public getDistanceToFlag(): number {
        if (!this.playerNode || !this.flagManager) return -1;

        const currentFlag = this.flagManager.getCurrentFlag();
        if (!currentFlag || !currentFlag.isValid) return -1;

        const playerPos = this.playerNode.getWorldPosition();
        const flagPos = currentFlag.getWorldPosition();
        return Vec3.distance(playerPos, flagPos);
    }
}
