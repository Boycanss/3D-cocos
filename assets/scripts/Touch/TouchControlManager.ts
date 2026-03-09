import { _decorator, Component, Node } from 'cc';
import { VirtualJoystick, JoystickData } from './VirtualJoystick';
import { TouchButton, TouchButtonType } from './TouchButton';
import { PlatformUtils } from '../Define/Define';
const { ccclass, property } = _decorator;

export interface TouchInputData {
    // Movement
    horizontal: number;     // -1 to 1 (left/right)
    vertical: number;       // -1 to 1 (forward/backward)
    isMoving: boolean;      // Whether movement input is active
    
    // Actions
    jumpPressed: boolean;
    vaultPressed: boolean;
    dashPressed: boolean;
    slidePressed: boolean;
    
    // Action states (for continuous actions)
    jumpHeld: boolean;
    vaultHeld: boolean;
    dashHeld: boolean;
    slideHeld: boolean;
}

@ccclass('TouchControlManager')
export class TouchControlManager extends Component {
    @property({ type: Node, tooltip: "Container for all touch controls" })
    touchControlsContainer: Node = null;

    @property({ type: VirtualJoystick, tooltip: "Virtual joystick for movement" })
    virtualJoystick: VirtualJoystick = null;

    @property({ type: TouchButton, tooltip: "Jump button" })
    jumpButton: TouchButton = null;

    @property({ type: TouchButton, tooltip: "Vault button" })
    vaultButton: TouchButton = null;

    @property({ type: TouchButton, tooltip: "Dash button" })
    dashButton: TouchButton = null;

    @property({ type: TouchButton, tooltip: "Slide button" })
    slideButton: TouchButton = null;

    private _inputData: TouchInputData = {
        horizontal: 0,
        vertical: 0,
        isMoving: false,
        jumpPressed: false,
        vaultPressed: false,
        dashPressed: false,
        slidePressed: false,
        jumpHeld: false,
        vaultHeld: false,
        dashHeld: false,
        slideHeld: false
    };

    private _previousInputData: TouchInputData = { ...this._inputData };

    // One-frame press latches to avoid missing taps due to update order
    private _pendingJumpPressed: boolean = false;
    private _pendingVaultPressed: boolean = false;
    private _pendingDashPressed: boolean = false;
    private _pendingSlidePressed: boolean = false;

    protected onLoad(): void {
        // Show/hide touch controls based on platform
        this.updateControlsVisibility();
        
        // Setup button event listeners
        this.setupButtonListeners();
    }

    private updateControlsVisibility(): void {
        if (!this.touchControlsContainer) return;

        const isMobile = PlatformUtils.isMobile();
        this.touchControlsContainer.active = isMobile;
        
        console.log(`Touch controls ${isMobile ? 'enabled' : 'disabled'} - Platform: ${PlatformUtils.getCurrentPlatform()}`);
    }

    private setupButtonListeners(): void {
        // Jump button
        if (this.jumpButton) {
            this.jumpButton.node.on('button-pressed', () => {
                this._pendingJumpPressed = true;
                this._inputData.jumpHeld = true;
            });
            
            this.jumpButton.node.on('button-released', () => {
                this._inputData.jumpHeld = false;
            });
        }

        // Vault button
        if (this.vaultButton) {
            this.vaultButton.node.on('button-pressed', () => {
                this._pendingVaultPressed = true;
                this._inputData.vaultHeld = true;
            });
            
            this.vaultButton.node.on('button-released', () => {
                this._inputData.vaultHeld = false;
            });
        }

        // Dash button
        if (this.dashButton) {
            this.dashButton.node.on('button-pressed', () => {
                this._pendingDashPressed = true;
                this._inputData.dashHeld = true;
            });
            
            this.dashButton.node.on('button-released', () => {
                this._inputData.dashHeld = false;
            });
        }

        // Slide button
        if (this.slideButton) {
            this.slideButton.node.on('button-pressed', () => {
                this._pendingSlidePressed = true;
                this._inputData.slideHeld = true;
            });
            
            this.slideButton.node.on('button-released', () => {
                this._inputData.slideHeld = false;
            });
        }
    }

    protected update(deltaTime: number): void {
        // Store previous frame data
        this._previousInputData = { ...this._inputData };

        // Consume one-frame press latches first
        this._inputData.jumpPressed = this._pendingJumpPressed;
        this._inputData.vaultPressed = this._pendingVaultPressed;
        this._inputData.dashPressed = this._pendingDashPressed;
        this._inputData.slidePressed = this._pendingSlidePressed;

        // Clear pending latches after consumption
        this._pendingJumpPressed = false;
        this._pendingVaultPressed = false;
        this._pendingDashPressed = false;
        this._pendingSlidePressed = false;

        // Update movement input from joystick
        if (this.virtualJoystick) {
            const joystickData = this.virtualJoystick.getJoystickData();
            this._inputData.horizontal = joystickData.direction.x * joystickData.magnitude;
            this._inputData.vertical = joystickData.direction.y * joystickData.magnitude;
            this._inputData.isMoving = joystickData.isActive && joystickData.magnitude > 0;
        }
    }

    /**
     * Get current touch input data
     */
    public getInputData(): TouchInputData {
        return { ...this._inputData };
    }

    /**
     * Check if a button was just pressed this frame
     */
    public wasButtonPressed(buttonType: TouchButtonType): boolean {
        switch (buttonType) {
            case TouchButtonType.JUMP:
                return this._inputData.jumpPressed && !this._previousInputData.jumpPressed;
            case TouchButtonType.VAULT:
                return this._inputData.vaultPressed && !this._previousInputData.vaultPressed;
            case TouchButtonType.DASH:
                return this._inputData.dashPressed && !this._previousInputData.dashPressed;
            case TouchButtonType.SLIDE:
                return this._inputData.slidePressed && !this._previousInputData.slidePressed;
            default:
                return false;
        }
    }

    /**
     * Check if a button is currently held down
     */
    public isButtonHeld(buttonType: TouchButtonType): boolean {
        switch (buttonType) {
            case TouchButtonType.JUMP:
                return this._inputData.jumpHeld;
            case TouchButtonType.VAULT:
                return this._inputData.vaultHeld;
            case TouchButtonType.DASH:
                return this._inputData.dashHeld;
            case TouchButtonType.SLIDE:
                return this._inputData.slideHeld;
            default:
                return false;
        }
    }

    /**
     * Get horizontal movement input (-1 to 1)
     */
    public getHorizontalInput(): number {
        return this._inputData.horizontal;
    }

    /**
     * Get vertical movement input (-1 to 1)
     */
    public getVerticalInput(): number {
        return this._inputData.vertical;
    }

    /**
     * Check if player is providing movement input
     */
    public isMovementActive(): boolean {
        return this._inputData.isMoving;
    }

    /**
     * Force show/hide touch controls (for testing)
     */
    public setControlsVisible(visible: boolean): void {
        if (this.touchControlsContainer) {
            this.touchControlsContainer.active = visible;
        }
    }

    /**
     * Check if touch controls are currently active
     */
    public areControlsActive(): boolean {
        return this.touchControlsContainer ? this.touchControlsContainer.active : false;
    }
}