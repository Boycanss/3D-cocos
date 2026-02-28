import { _decorator, Camera, CCFloat, Component, Node, Sprite, UIOpacity, UITransform, Vec3, view } from 'cc';
import { FlagManager } from '../GameManager/FlagManager';
const { ccclass, property } = _decorator;

@ccclass('FlagIndicator')
export class FlagIndicator extends Component {
    @property(Node)
    playerNode: Node = null;

    @property(Camera)
    mainCamera: Camera = null;

    @property(FlagManager)
    flagManager: FlagManager = null;

    @property(Node)
    arrowNode: Node = null; // The arrow sprite/image node

    @property(CCFloat)
    edgeMargin: number = 50; // Distance from screen edge

    @property(CCFloat)
    fadeDistance: number = 20; // Distance at which arrow starts fading

    @property(CCFloat)
    hideDistance: number = 10; // Distance at which arrow completely hides

    @property(CCFloat)
    arrowScale: number = 1.0; // Base scale of the arrow

    @property(CCFloat)
    pulseSpeed: number = 2.0; // Speed of pulsing animation

    @property(CCFloat)
    pulseAmount: number = 0.2; // Amount of scale change during pulse

    private _uiTransform: UITransform = null;
    private _arrowSprite: Sprite = null;
    private _arrowOpacity: UIOpacity = null;
    private _pulseTimer: number = 0;
    private _screenHalfWidth: number = 0;
    private _screenHalfHeight: number = 0;

    start() {
        // Get UI transform for screen space calculations
        this._uiTransform = this.node.getComponent(UITransform);
        
        if (this.arrowNode) {
            this._arrowSprite = this.arrowNode.getComponent(Sprite);
            this._arrowOpacity = this.arrowNode.getComponent(UIOpacity);
            
            // Add UIOpacity if not present
            if (!this._arrowOpacity) {
                this._arrowOpacity = this.arrowNode.addComponent(UIOpacity);
            }
        }

        // Get screen dimensions
        const visibleSize = view.getVisibleSize();
        this._screenHalfWidth = visibleSize.width / 2;
        this._screenHalfHeight = visibleSize.height / 2;

        // Initially hide arrow
        if (this.arrowNode) {
            this.arrowNode.active = false;
        }
    }

    update(deltaTime: number) {
        if (!this.playerNode || !this.mainCamera || !this.flagManager || !this.arrowNode) {
            return;
        }
        

        // Get current flag
        const currentFlag = this.flagManager.getCurrentFlag();
        
        if (!currentFlag || !currentFlag.isValid) {
            // No flag exists, hide arrow
            this.arrowNode.active = false;
            return;
        }

        // Get positions
        const playerPos = this.playerNode.getWorldPosition();
        const flagPos = currentFlag.getWorldPosition();

        // Calculate distance to flag
        const distance = Vec3.distance(playerPos, flagPos);

        // Hide arrow if too close
        if (distance < this.hideDistance) {
            this.arrowNode.active = false;
            return;
        }

        // Convert flag world position to screen position
        const flagScreenPos = new Vec3();
        this.mainCamera.convertToUINode(flagPos, this.node, flagScreenPos);

        // Check if flag is on screen
        const isOnScreen = this.isPositionOnScreen(flagScreenPos);

        if (isOnScreen) {
            // Flag is on screen, hide arrow
            this.arrowNode.active = false;
        } else {
            // Flag is off screen, show and position arrow
            this.arrowNode.active = true;
            this.updateArrowPosition(flagScreenPos, distance, deltaTime);
        }
    }

    /**
     * Check if a position is within the screen bounds
     */
    private isPositionOnScreen(screenPos: Vec3): boolean {
        const margin = this.edgeMargin + 50; // Extra margin for detection
        return screenPos.x > -this._screenHalfWidth + margin &&
               screenPos.x < this._screenHalfWidth - margin &&
               screenPos.y > -this._screenHalfHeight + margin &&
               screenPos.y < this._screenHalfHeight - margin;
    }

    /**
     * Update arrow position and rotation to point at flag
     */
    private updateArrowPosition(flagScreenPos: Vec3, distance: number, deltaTime: number): void {
        // Clamp position to screen edges
        const clampedPos = this.clampToScreenEdge(flagScreenPos);

        // Set arrow position
        this.arrowNode.setPosition(clampedPos);

        // Calculate rotation to point at flag
        const angle = Math.atan2(flagScreenPos.y - clampedPos.y, flagScreenPos.x - clampedPos.x);
        const degrees = angle * (180 / Math.PI);
        
        // Rotate arrow to point at flag (assuming arrow points right by default)
        this.arrowNode.setRotationFromEuler(0, 0, degrees);

        // Update opacity based on distance
        this.updateArrowOpacity(distance);

        // Update pulsing animation
        this.updatePulseAnimation(deltaTime);
    }

    /**
     * Clamp position to screen edges with margin
     */
    private clampToScreenEdge(pos: Vec3): Vec3 {
        const clampedPos = new Vec3(pos);

        // Clamp X
        if (clampedPos.x < -this._screenHalfWidth + this.edgeMargin) {
            clampedPos.x = -this._screenHalfWidth + this.edgeMargin;
        } else if (clampedPos.x > this._screenHalfWidth - this.edgeMargin) {
            clampedPos.x = this._screenHalfWidth - this.edgeMargin;
        }

        // Clamp Y
        if (clampedPos.y < -this._screenHalfHeight + this.edgeMargin) {
            clampedPos.y = -this._screenHalfHeight + this.edgeMargin;
        } else if (clampedPos.y > this._screenHalfHeight - this.edgeMargin) {
            clampedPos.y = this._screenHalfHeight - this.edgeMargin;
        }

        return clampedPos;
    }

    /**
     * Update arrow opacity based on distance to flag
     */
    private updateArrowOpacity(distance: number): void {
        if (!this._arrowOpacity) return;

        if (distance <= this.hideDistance) {
            this._arrowOpacity.opacity = 0;
        } else if (distance <= this.fadeDistance) {
            // Fade in as distance increases from hideDistance to fadeDistance
            const fadeRange = this.fadeDistance - this.hideDistance;
            const fadeProgress = (distance - this.hideDistance) / fadeRange;
            this._arrowOpacity.opacity = Math.floor(fadeProgress * 255);
        } else {
            this._arrowOpacity.opacity = 255;
        }
    }

    /**
     * Update pulsing animation for the arrow
     */
    private updatePulseAnimation(deltaTime: number): void {
        this._pulseTimer += deltaTime * this.pulseSpeed;
        
        // Calculate pulse scale using sine wave
        const pulseScale = 1 + Math.sin(this._pulseTimer) * this.pulseAmount;
        const finalScale = this.arrowScale * pulseScale;
        
        this.arrowNode.setScale(finalScale, finalScale, 1);
    }

    /**
     * Manually show/hide the indicator
     */
    public setVisible(visible: boolean): void {
        if (this.arrowNode) {
            this.arrowNode.active = visible;
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
