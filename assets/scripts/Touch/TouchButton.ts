import { _decorator, Component, Node, EventTouch, Input, Sprite, Color, tween, Vec3, CCFloat, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum TouchButtonType {
    JUMP = "Jump",
    VAULT = "Vault", 
    DASH = "Dash",
    SLIDE = "Slide"
}

// Register the enum with Cocos Creator
Enum(TouchButtonType);

@ccclass('TouchButton')
export class TouchButton extends Component {
    @property({ type: Enum(TouchButtonType) })
    buttonType: TouchButtonType = TouchButtonType.JUMP;

    @property({ type: Node, tooltip: "Visual feedback node (optional)" })
    visualFeedback: Node = null;

    @property({ type: CCFloat, tooltip: "Scale when pressed" })
    pressedScale: number = 0.9;

    @property({ type: CCFloat, tooltip: "Animation duration" })
    animationDuration: number = 0.1;

    @property({ type: Color, tooltip: "Color when pressed" })
    pressedColor: Color = new Color(200, 200, 200, 255);

    private _originalScale: Vec3 = new Vec3();
    private _originalColor: Color = new Color();
    private _isPressed: boolean = false;
    private _touchId: number = -1;
    private _sprite: Sprite = null;

    // Event callbacks
    private _onPressCallback: () => void = null;
    private _onReleaseCallback: () => void = null;

    protected onLoad(): void {
        this._originalScale = this.node.scale.clone();
        this._sprite = this.node.getComponent(Sprite);
        
        if (this._sprite) {
            this._originalColor = this._sprite.color.clone();
        }

        // Enable touch events
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch): void {
        if (this._isPressed) return; // Already pressed

        this._touchId = event.getID();
        this._isPressed = true;

        // Visual feedback
        this.showPressedState();

        // Trigger callback
        if (this._onPressCallback) {
            this._onPressCallback();
        }

        // Emit event for external listeners
        this.node.emit('button-pressed', this.buttonType);
    }

    private onTouchEnd(event: EventTouch): void {
        if (!this._isPressed || event.getID() !== this._touchId) return;

        this._isPressed = false;
        this._touchId = -1;

        // Visual feedback
        this.showReleasedState();

        // Trigger callback
        if (this._onReleaseCallback) {
            this._onReleaseCallback();
        }

        // Emit event for external listeners
        this.node.emit('button-released', this.buttonType);
    }

    private showPressedState(): void {
        // Scale animation
        tween(this.node)
            .to(this.animationDuration, { scale: this._originalScale.clone().multiplyScalar(this.pressedScale) })
            .start();

        // Color change
        if (this._sprite) {
            tween(this._sprite)
                .to(this.animationDuration, { color: this.pressedColor })
                .start();
        }

        // Visual feedback node
        if (this.visualFeedback) {
            this.visualFeedback.active = true;
        }
    }

    private showReleasedState(): void {
        // Scale animation
        tween(this.node)
            .to(this.animationDuration, { scale: this._originalScale })
            .start();

        // Color change
        if (this._sprite) {
            tween(this._sprite)
                .to(this.animationDuration, { color: this._originalColor })
                .start();
        }

        // Visual feedback node
        if (this.visualFeedback) {
            this.visualFeedback.active = false;
        }
    }

    /**
     * Set callback for button press
     */
    public setOnPressCallback(callback: () => void): void {
        this._onPressCallback = callback;
    }

    /**
     * Set callback for button release
     */
    public setOnReleaseCallback(callback: () => void): void {
        this._onReleaseCallback = callback;
    }

    /**
     * Check if button is currently pressed
     */
    public isPressed(): boolean {
        return this._isPressed;
    }

    /**
     * Get button type
     */
    public getButtonType(): TouchButtonType {
        return this.buttonType;
    }

    /**
     * Programmatically trigger button press (for testing)
     */
    public simulatePress(): void {
        if (this._isPressed) return;
        
        this._isPressed = true;
        this.showPressedState();
        
        if (this._onPressCallback) {
            this._onPressCallback();
        }
        
        this.node.emit('button-pressed', this.buttonType);
    }

    /**
     * Programmatically trigger button release (for testing)
     */
    public simulateRelease(): void {
        if (!this._isPressed) return;
        
        this._isPressed = false;
        this.showReleasedState();
        
        if (this._onReleaseCallback) {
            this._onReleaseCallback();
        }
        
        this.node.emit('button-released', this.buttonType);
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}