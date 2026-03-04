import { _decorator, Component, Node, Vec2, Vec3, UITransform, EventTouch, input, Input, math, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

export interface JoystickData {
    direction: Vec2;        // Normalized direction (-1 to 1 on both axes)
    magnitude: number;      // Distance from center (0 to 1)
    isActive: boolean;      // Whether joystick is being touched
}

@ccclass('VirtualJoystick')
export class VirtualJoystick extends Component {
    @property(Node)
    joystickBase: Node = null;

    @property(Node)
    joystickHandle: Node = null;

    @property({ type: CCFloat, tooltip: "Maximum distance the handle can move from center" })
    maxRadius: number = 100;

    @property({ type: CCFloat, tooltip: "Dead zone radius where input is ignored" })
    deadZone: number = 10;

    private _basePosition: Vec3 = new Vec3();
    private _currentDirection: Vec2 = new Vec2();
    private _currentMagnitude: number = 0;
    private _isActive: boolean = false;
    private _touchId: number = -1;

    protected onLoad(): void {
        if (this.joystickBase) {
            this._basePosition = this.joystickBase.position.clone();
        }

        // Enable touch events
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch): void {
        if (this._isActive) return; // Already handling a touch

        this._touchId = event.getID();
        this._isActive = true;

        // Get touch position in node space
        const touchPos = this.getTouchPosition(event);
        this.updateJoystick(touchPos);
    }

    private onTouchMove(event: EventTouch): void {
        if (!this._isActive || event.getID() !== this._touchId) return;

        const touchPos = this.getTouchPosition(event);
        this.updateJoystick(touchPos);
    }

    private onTouchEnd(event: EventTouch): void {
        if (!this._isActive || event.getID() !== this._touchId) return;

        this._isActive = false;
        this._touchId = -1;
        this._currentDirection.set(0, 0);
        this._currentMagnitude = 0;

        // Reset handle position
        if (this.joystickHandle) {
            this.joystickHandle.setPosition(this._basePosition);
        }
    }

    private getTouchPosition(event: EventTouch): Vec2 {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return new Vec2();

        const touchLocation = event.getUILocation();
        const nodePos = new Vec3();
        uiTransform.convertToNodeSpaceAR(new Vec3(touchLocation.x, touchLocation.y, 0), nodePos);
        
        return new Vec2(nodePos.x, nodePos.y);
    }

    private updateJoystick(touchPos: Vec2): void {
        // Calculate offset from base position
        const offset = new Vec2(
            touchPos.x - this._basePosition.x,
            touchPos.y - this._basePosition.y
        );

        const distance = offset.length();

        // Apply dead zone
        if (distance < this.deadZone) {
            this._currentDirection.set(0, 0);
            this._currentMagnitude = 0;
            if (this.joystickHandle) {
                this.joystickHandle.setPosition(this._basePosition);
            }
            return;
        }

        // Calculate direction and magnitude
        this._currentDirection = offset.clone().normalize();
        this._currentMagnitude = math.clamp01(distance / this.maxRadius);

        // Update handle position (clamped to max radius)
        if (this.joystickHandle) {
            const clampedDistance = Math.min(distance, this.maxRadius);
            const handlePos = this._currentDirection.clone().multiplyScalar(clampedDistance);
            this.joystickHandle.setPosition(
                this._basePosition.x + handlePos.x,
                this._basePosition.y + handlePos.y,
                this._basePosition.z
            );
        }
    }

    /**
     * Get current joystick data
     */
    public getJoystickData(): JoystickData {
        return {
            direction: this._currentDirection.clone(),
            magnitude: this._currentMagnitude,
            isActive: this._isActive
        };
    }

    /**
     * Get horizontal input (-1 to 1)
     */
    public getHorizontal(): number {
        return this._currentDirection.x * this._currentMagnitude;
    }

    /**
     * Get vertical input (-1 to 1)
     */
    public getVertical(): number {
        return this._currentDirection.y * this._currentMagnitude;
    }

    /**
     * Check if joystick is being used
     */
    public isPressed(): boolean {
        return this._isActive && this._currentMagnitude > 0;
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}