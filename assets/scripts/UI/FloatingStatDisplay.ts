import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Vec3, tween, UIOpacity, Camera, Color, Canvas, UITransform, Widget } from 'cc';
import { StatDisplayColor } from '../Define/Define';
const { ccclass, property } = _decorator;

/**
 * Displays floating stat changes (health/stamina) above the player's head
 * Uses manual lookAt() for billboard behavior (Billboard component is for particles only)
 */
@ccclass('FloatingStatDisplay')
export class FloatingStatDisplay extends Component {
    // === References ===
    @property({ type: Node, tooltip: 'The player node to follow' })
    playerNode: Node = null;

    @property({ type: Camera, tooltip: 'Main camera for billboard effect' })
    mainCamera: Camera = null;

    @property({ type: SpriteFrame, tooltip: 'Health icon sprite' })
    healthIcon: SpriteFrame = null;

    @property({ type: SpriteFrame, tooltip: 'Stamina icon sprite' })
    staminaIcon: SpriteFrame = null;

    // === Display Settings ===
    @property({ tooltip: 'Duration the display stays visible (seconds)' })
    displayDuration: number = 2.0;

    @property({ tooltip: 'Scale of the icon' })
    iconScale: number = 0.5;

    @property({ tooltip: 'Scale of the text in world space' })
    textScale: number = 0.015;

    @property({ tooltip: 'Font size for the label' })
    fontSize: number = 72;

    // === Position Settings ===
    @property({ tooltip: 'Height offset above player head' })
    headOffset: number = 2.5;

    @property({ tooltip: 'Enable billboard effect (always face camera)' })
    enableBillboard: boolean = true;

    @property({ tooltip: 'Minimum stat change to display' })
    minChangeThreshold: number = 1;

    // === Animation Settings ===
    @property({ tooltip: 'How far up the display floats' })
    floatDistance: number = 1.5;

    @property({ tooltip: 'Vertical spacing between stacked displays' })
    stackSpacing: number = 0.5;

    // Private variables
    private _activeDisplays: Node[] = [];
    private _previousHealth: number = 0;
    private _previousStamina: number = 0;

    start() {
        this._initializeTracking();
    }

    update(deltaTime: number) {
        this._trackStatChanges();
        this._updatePosition();
        this._updateBillboard();
    }

    /**
     * Update billboard effect - make displays face camera
     */
    private _updateBillboard(): void {
        if (!this.enableBillboard || !this.mainCamera) return;

        const cameraPos = this.mainCamera.node.worldPosition;
        
        // Make each active display face the camera
        for (const display of this._activeDisplays) {
            if (display && display.isValid) {
                display.lookAt(cameraPos);
            }
        }
    }

    /**
     * Initialize stat tracking
     */
    private _initializeTracking(): void {
        if (!this.playerNode) {
            console.warn('FloatingStatDisplay: Player node not assigned!');
            return;
        }

        // Get initial values
        const actor = this.playerNode.getComponent('Actor');
        if (actor) {
            this._previousHealth = actor.currentHp;
        }

        const staminaManager = this.playerNode.getComponent('StaminaManager');
        if (staminaManager) {
            this._previousStamina = staminaManager.stamina;
        }
    }

    /**
     * Track health and stamina changes
     */
    private _trackStatChanges(): void {
        if (!this.playerNode) return;

        // Check health changes
        const actor = this.playerNode.getComponent('Actor');
        if (actor) {
            const healthChange = actor.currentHp - this._previousHealth;
            if (Math.abs(healthChange) >= this.minChangeThreshold) {
                this.showStatChange('health', healthChange);
                this._previousHealth = actor.currentHp;
            }
        }

        // Check stamina changes
        const staminaManager = this.playerNode.getComponent('StaminaManager');
        if (staminaManager) {
            const staminaChange = staminaManager.stamina - this._previousStamina;
            if (Math.abs(staminaChange) >= this.minChangeThreshold) {
                this.showStatChange('stamina', staminaChange);
                this._previousStamina = staminaManager.stamina;
            }
        }
    }

    /**
     * Update display position to follow player
     */
    private _updatePosition(): void {
        if (!this.playerNode) return;

        const playerPos = this.playerNode.getWorldPosition();
        const displayPos = new Vec3(
            playerPos.x,
            playerPos.y + this.headOffset,
            playerPos.z
        );
        
        // Update parent node position
        this.node.setWorldPosition(displayPos);
        
        // Update each active display's world position (for Canvas nodes)
        for (const display of this._activeDisplays) {
            if (display && display.isValid) {
                const localPos = display.position.clone();
                const worldPos = new Vec3(
                    displayPos.x,
                    displayPos.y + localPos.y,
                    displayPos.z
                );
                display.setWorldPosition(worldPos);
            }
        }
    }

    /**
     * Show a stat change display
     * @param statType 'health' or 'stamina'
     * @param change The amount changed (positive or negative)
     */
    public showStatChange(statType: 'health' | 'stamina', change: number): void {
        if (Math.abs(change) < this.minChangeThreshold) return;

        const displayNode = this._createDisplayNode(statType, change);
        this._activeDisplays.push(displayNode);
        this._repositionDisplays();
        this._animateDisplay(displayNode);
    }

    /**
     * Create a display node for stat change
     */
    private _createDisplayNode(statType: 'health' | 'stamina', change: number): Node {
        // Create root node with Canvas for world-space rendering
        const root = new Node(`StatChange_${statType}_${change}`);
        root.setParent(this.node);
        
        // Set initial world position at player's head
        if (this.playerNode) {
            const playerPos = this.playerNode.getWorldPosition();
            root.setWorldPosition(new Vec3(
                playerPos.x,
                playerPos.y + this.headOffset,
                playerPos.z
            ));
        }

        // Add Canvas component for world-space UI rendering (automatically adds UITransform)
        const canvas = root.addComponent(Canvas);
        canvas.cameraComponent = this.mainCamera;

        // Get the UITransform that Canvas automatically created
        const rootTransform = root.getComponent(UITransform);
        rootTransform.setContentSize(200, 100);

        // Create icon node
        const iconNode = new Node('Icon');
        iconNode.setParent(root);
        iconNode.setPosition(-50, 0, 0);
        iconNode.setScale(this.iconScale, this.iconScale, this.iconScale);

        const iconTransform = iconNode.addComponent(UITransform);
        iconTransform.setContentSize(64, 64);

        const iconSprite = iconNode.addComponent(Sprite);
        iconSprite.spriteFrame = statType === 'health' ? this.healthIcon : this.staminaIcon;

        const iconOpacity = iconNode.addComponent(UIOpacity);
        iconOpacity.opacity = 255;

        // Create text node
        const textNode = new Node('Text');
        textNode.setParent(root);
        textNode.setPosition(30, 0, 0);

        const textTransform = textNode.addComponent(UITransform);
        textTransform.setContentSize(150, 100);

        const label = textNode.addComponent(Label);
        label.string = change > 0 ? `+${Math.floor(change)}` : `${Math.floor(change)}`;
        label.fontSize = this.fontSize;
        label.lineHeight = this.fontSize;

        // Set color based on increase/decrease
        const color = change > 0
            ? new Color(StatDisplayColor.INCREASE_R, StatDisplayColor.INCREASE_G, StatDisplayColor.INCREASE_B, 255)
            : new Color(StatDisplayColor.DECREASE_R, StatDisplayColor.DECREASE_G, StatDisplayColor.DECREASE_B, 255);
        label.color = color;

        const textOpacity = textNode.addComponent(UIOpacity);
        textOpacity.opacity = 255;

        return root;
    }

    /**
     * Reposition all active displays (bottom-up stacking)
     */
    private _repositionDisplays(): void {
        if (!this.playerNode) return;
        
        const playerPos = this.playerNode.getWorldPosition();
        const baseY = playerPos.y + this.headOffset;
        
        for (let i = 0; i < this._activeDisplays.length; i++) {
            const display = this._activeDisplays[i];
            if (display && display.isValid) {
                const yOffset = i * this.stackSpacing;
                // Store local Y offset for animation
                display.setPosition(0, yOffset, 0);
                
                // Set world position
                const worldPos = new Vec3(
                    playerPos.x,
                    baseY + yOffset,
                    playerPos.z
                );
                display.setWorldPosition(worldPos);
            }
        }
    }

    /**
     * Animate a display node (float up, pop-in, fade out)
     */
    private _animateDisplay(displayNode: Node): void {
        const startPos = displayNode.position.clone();
        const endPos = new Vec3(startPos.x, startPos.y + this.floatDistance, startPos.z);

        // Get opacity components
        const iconOpacity = displayNode.getChildByName('Icon')?.getComponent(UIOpacity);
        const textOpacity = displayNode.getChildByName('Text')?.getComponent(UIOpacity);

        // Pop-in scale animation
        displayNode.setScale(0, 0, 0);
        tween(displayNode)
            .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();

        // Float up animation
        tween(displayNode)
            .to(this.displayDuration, { position: endPos }, { easing: 'sineOut' })
            .start();

        // Fade out animation (starts halfway through)
        const fadeDelay = this.displayDuration * 0.5;
        const fadeDuration = this.displayDuration * 0.5;

        if (iconOpacity) {
            tween(iconOpacity)
                .delay(fadeDelay)
                .to(fadeDuration, { opacity: 0 }, { easing: 'sineIn' })
                .start();
        }

        if (textOpacity) {
            tween(textOpacity)
                .delay(fadeDelay)
                .to(fadeDuration, { opacity: 0 }, { easing: 'sineIn' })
                .call(() => {
                    this._removeDisplay(displayNode);
                })
                .start();
        }
    }

    /**
     * Remove a display from active list and destroy it
     */
    private _removeDisplay(displayNode: Node): void {
        const index = this._activeDisplays.indexOf(displayNode);
        if (index > -1) {
            this._activeDisplays.splice(index, 1);
            this._repositionDisplays();
        }

        if (displayNode && displayNode.isValid) {
            displayNode.destroy();
        }
    }

    /**
     * Manually trigger a stat change display (for external use)
     */
    public displayStatChange(statType: 'health' | 'stamina', change: number): void {
        this.showStatChange(statType, change);
    }
}
