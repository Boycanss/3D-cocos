import { _decorator, Component, Node, Button, Label, Sprite, tween, Vec3, UIOpacity, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartScreenUI')
export class StartScreenUI extends Component {
    
    @property({ type: Button, tooltip: "Main play button" })
    playButton: Button = null;
    
    @property({ type: Node, tooltip: "Game logo/title" })
    gameLogo: Node = null;
    
    @property({ type: Label, tooltip: "Instruction text for player" })
    instructionLabel: Label = null;
    
    @property({ type: Node, tooltip: "Best time display" })
    bestTimeDisplay: Node = null;
    
    @property({ type: Node, tooltip: "Container for all start screen elements" })
    startScreenContainer: Node = null;
    
    // Animation settings
    @property({ tooltip: "Logo pulse animation scale" })
    logoPulseScale: number = 1.1;
    
    @property({ tooltip: "Logo pulse duration" })
    logoPulseDuration: number = 2.0;
    
    @property({ tooltip: "Button hover scale" })
    buttonHoverScale: number = 1.05;
    
    @property({ tooltip: "UI fade duration" })
    fadeDuration: number = 0.3;
    
    private _isVisible: boolean = true;
    private _logoTween: any = null;
    private _originalLogoScale: Vec3 = new Vec3();
    private _originalButtonScale: Vec3 = new Vec3();

    protected onLoad(): void {
        // Store original scales
        if (this.gameLogo) {
            this._originalLogoScale = this.gameLogo.scale.clone();
        }
        
        if (this.playButton) {
            this._originalButtonScale = this.playButton.node.scale.clone();
            this.setupButtonAnimations();
        }
        
        // Setup instruction text
        this.updateInstructionText("Drag the character to your desired starting position");
    }

    start(): void {
        // Start logo animation
        this.startLogoAnimation();
    }

    private setupButtonAnimations(): void {
        if (!this.playButton) return;
        
        // Button hover effects
        this.playButton.node.on(Node.EventType.MOUSE_ENTER, () => {
            tween(this.playButton.node)
                .to(0.1, { scale: this._originalButtonScale.clone().multiplyScalar(this.buttonHoverScale) })
                .start();
        });
        
        this.playButton.node.on(Node.EventType.MOUSE_LEAVE, () => {
            tween(this.playButton.node)
                .to(0.1, { scale: this._originalButtonScale })
                .start();
        });
        
        // Button press effect
        this.playButton.node.on(Node.EventType.TOUCH_START, () => {
            tween(this.playButton.node)
                .to(0.05, { scale: this._originalButtonScale.clone().multiplyScalar(0.95) })
                .start();
        });
        
        this.playButton.node.on(Node.EventType.TOUCH_END, () => {
            tween(this.playButton.node)
                .to(0.1, { scale: this._originalButtonScale })
                .start();
        });
    }

    private startLogoAnimation(): void {
        if (!this.gameLogo) return;
        
        // Stop any existing animation
        this.stopLogoAnimation();
        
        // Pulsing animation
        this._logoTween = tween(this.gameLogo)
            .to(this.logoPulseDuration / 2, { 
                scale: this._originalLogoScale.clone().multiplyScalar(this.logoPulseScale) 
            })
            .to(this.logoPulseDuration / 2, { 
                scale: this._originalLogoScale 
            })
            .union()
            .repeatForever()
            .start();
    }

    private stopLogoAnimation(): void {
        if (this._logoTween) {
            this._logoTween.stop();
            this._logoTween = null;
        }
        
        if (this.gameLogo) {
            this.gameLogo.setScale(this._originalLogoScale);
        }
    }

    /**
     * Show/hide the entire start screen
     */
    public setVisible(visible: boolean, animated: boolean = true): void {
        if (this._isVisible === visible) return;
        
        this._isVisible = visible;
        
        if (!this.startScreenContainer) return;
        
        if (animated) {
            const targetOpacity = visible ? 255 : 0;
            const uiOpacity = this.startScreenContainer.getComponent(UIOpacity) || 
                             this.startScreenContainer.addComponent(UIOpacity);
            
            tween(uiOpacity)
                .to(this.fadeDuration, { opacity: targetOpacity })
                .call(() => {
                    if (!visible) {
                        this.startScreenContainer.active = false;
                    }
                })
                .start();
                
            if (visible) {
                this.startScreenContainer.active = true;
            }
        } else {
            this.startScreenContainer.active = visible;
        }
        
        // Control logo animation
        if (visible) {
            this.startLogoAnimation();
        } else {
            this.stopLogoAnimation();
        }
    }

    /**
     * Show/hide specific UI elements during drag
     */
    public setDragMode(isDragging: boolean): void {
        const elementsToHide = [this.playButton?.node, this.gameLogo];
        
        elementsToHide.forEach(element => {
            if (element) {
                if (isDragging) {
                    // Fade out
                    const uiOpacity = element.getComponent(UIOpacity) || element.addComponent(UIOpacity);
                    tween(uiOpacity)
                        .to(0.2, { opacity: 0 })
                        .call(() => element.active = false)
                        .start();
                } else {
                    // Fade in
                    element.active = true;
                    const uiOpacity = element.getComponent(UIOpacity) || element.addComponent(UIOpacity);
                    uiOpacity.opacity = 0;
                    tween(uiOpacity)
                        .to(0.2, { opacity: 255 })
                        .start();
                }
            }
        });
        
        // Update instruction text
        if (isDragging) {
            this.updateInstructionText("Release to place character", new Color(0, 0, 0));
        } else {
            this.updateInstructionText("Drag the character to your desired starting position");
        }
    }

    /**
     * Update instruction text
     */
    public updateInstructionText(text: string, color?: Color): void {
        if (!this.instructionLabel) return;
        
        this.instructionLabel.string = text;
        
        if (color) {
            this.instructionLabel.color = color;
        } else {
            this.instructionLabel.color = new Color(0, 0, 0);
        }
        
        // Animate text change
        const uiOpacity = this.instructionLabel.node.getComponent(UIOpacity) || 
                         this.instructionLabel.node.addComponent(UIOpacity);
        
        tween(uiOpacity)
            .to(0.1, { opacity: 0 })
            .call(() => {
                this.instructionLabel.string = text;
                if (color) this.instructionLabel.color = color;
            })
            .to(0.1, { opacity: 255 })
            .start();
    }

    /**
     * Show placement feedback
     */
    public showPlacementFeedback(isValid: boolean): void {
        if (isValid) {
            this.updateInstructionText("✓ Good position! Press PLAY to start", new Color(0, 255, 0));
        } else {
            this.updateInstructionText("✗ Can't place here - too close to obstacles", new Color(255, 0, 0));
        }
    }

    /**
     * Update best time display
     */
    public updateBestTime(timeString: string): void {
        if (!this.bestTimeDisplay) return;
        
        const label = this.bestTimeDisplay.getComponent(Label);
        if (label) {
            label.string = `Best Time: ${timeString}`;
        }
    }

    /**
     * Animate play button press
     */
    public animatePlayButtonPress(): void {
        if (!this.playButton) return;
        
        // Scale down and fade out
        tween(this.playButton.node)
            .to(0.1, { scale: this._originalButtonScale.clone().multiplyScalar(0.8) })
            .to(0.2, { scale: this._originalButtonScale.clone().multiplyScalar(1.2) })
            .call(() => {
                // Button press effect complete
                this.node.emit('play-button-pressed');
            })
            .start();
    }

    /**
     * Reset all UI elements to default state
     */
    public resetToDefault(): void {
        // Reset button scale
        if (this.playButton) {
            this.playButton.node.setScale(this._originalButtonScale);
        }
        
        // Reset logo
        if (this.gameLogo) {
            this.gameLogo.setScale(this._originalLogoScale);
        }
        
        // Reset instruction text
        this.updateInstructionText("Drag the character to your desired starting position");
        
        // Restart logo animation
        this.startLogoAnimation();
    }

    protected onDestroy(): void {
        this.stopLogoAnimation();
    }
}