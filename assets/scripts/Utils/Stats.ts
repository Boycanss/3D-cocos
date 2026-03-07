import { _decorator, Component, Camera, Vec3, Node, UITransform, Label, Sprite, SpriteFrame, Color, tween, UIOpacity, Prefab, instantiate } from 'cc';
import { StatDisplayColor } from '../Define/Define';
import { StaminaManager } from '../GameManager/StaminaManager';
import { Actor } from '../Actor';
const { ccclass, property } = _decorator;

@ccclass('Stats')
export class Stats extends Component {

    @property(Camera)
    camera: Camera = null!;

    @property(Node)
    target: Node = null!;

    @property({ tooltip: 'Height offset above target (world units)' })
    headOffset: number = 2;

    // === Prefab Reference ===
    @property({ type: Prefab, tooltip: 'Stats prefab to instantiate for each stat change' })
    statsPrefab: Prefab = null;

    // === Stat Display Settings ===
    @property({ type: SpriteFrame, tooltip: 'Health icon sprite' })
    healthIcon: SpriteFrame = null;

    @property({ type: SpriteFrame, tooltip: 'Stamina/Energy icon sprite' })
    staminaIcon: SpriteFrame = null;

    @property({ tooltip: 'Duration the display stays visible (seconds)' })
    displayDuration: number = 2.0;

    @property({ tooltip: 'How far up the display floats' })
    floatDistance: number = 50;

    @property({ tooltip: 'Vertical spacing between stacked displays' })
    stackSpacing: number = 30;

    @property({ tooltip: 'Minimum stat change to display' })
    minChangeThreshold: number = 1;

    private _parentTransform: UITransform = null;
    private _activeDisplays: Node[] = [];
    private _previousHealth: number = 0;
    private _previousStamina: number = 0;

    start() {
        if (this.node.parent) {
            this._parentTransform = this.node.parent.getComponent(UITransform);
        }

        if (!this.statsPrefab) {
            console.error('Stats: Stats prefab not assigned!');
        }

        this._initializeTracking();
    }

    update(deltaTime: number) {
        this._updatePosition();
    }

    /**
     * Initialize stat tracking
     */
    private _initializeTracking(): void {
        if (!this.target) {
            console.warn('Stats: Target node not assigned!');
            return;
        }

        // Get initial values using string component names to avoid circular imports
        const actor = this.target.getComponent(Actor);
        if (actor) {
            this._previousHealth = actor.currentHp;
        }

        const staminaManager = this.target.getComponent(StaminaManager);
        if (staminaManager) {
            this._previousStamina = staminaManager.stamina;
        }
    }

    /**
     * Update position to follow target
     */
    private _updatePosition(): void {
        if (!this.target || !this.camera || !this._parentTransform) return;

        // Get target's world position with offset
        const worldPos = this.target.getWorldPosition();
        worldPos.y += this.headOffset;

        // Convert world position to screen position (in pixels, origin at bottom-left)
        const screenPos = this.camera.worldToScreen(worldPos);

        // Get parent's size and anchor for proper conversion
        const parentSize = this._parentTransform.contentSize;
        const parentAnchor = this._parentTransform.anchorPoint;

        // Convert screen coordinates to UI coordinates
        // Screen origin is bottom-left (0, 0)
        // UI origin depends on parent's anchor point
        const uiX = screenPos.x - (parentSize.width * parentAnchor.x);
        const uiY = screenPos.y - (parentSize.height * parentAnchor.y);
        const randOffsetX = Math.random() * 110 + 170; // Random offset for variation
        const randOffsetY = Math.random() * 200 + 250; // Random offset for variation

        this.node.setPosition(uiX + randOffsetX, uiY + randOffsetY, 0); // offset x 175 and y 250
    }

    /**
     * Show a stat change display
     * @param statType 'health' or 'stamina'
     * @param change The amount changed (positive or negative)
     */
    public showStatChange(statType: 'health' | 'stamina', change: number): void {
        // console.log(`Stats: showStatChange called - type: ${statType}, change: ${change}`);
        
        if (Math.abs(change) < this.minChangeThreshold) {
            // console.log(`Stats: Change ${change} below threshold ${this.minChangeThreshold}, skipping`);
            return;
        }

        const displayNode = this._createStatDisplay(statType, change);
        if (displayNode) {
            // console.log(`Stats: Display node created successfully`);
            this._activeDisplays.push(displayNode);
            this._repositionDisplays();
            this._animateDisplay(displayNode);
        } else {
            console.error('Stats: Failed to create display node');
        }
    }

    /**
     * Create a stat display from prefab
     */
    private _createStatDisplay(statType: 'health' | 'stamina', change: number): Node | null {
        if (!this.statsPrefab) {
            console.error('Stats: Stats prefab not assigned!');
            return null;
        }

        // console.log(`Stats: Instantiating prefab for ${statType} change: ${change}`);

        // Instantiate the prefab
        const displayNode = instantiate(this.statsPrefab);
        displayNode.name = `StatChange_${statType}_${change}`;
        displayNode.setParent(this.node.parent); // Add to same parent as Stats node
        displayNode.setPosition(this.node.position.clone());

        // console.log(`Stats: Display node parent: ${this.node.parent?.name}, position: ${this.node.position}`);

        // Find Icon and Value children in the instantiated prefab
        const iconNode = displayNode.getChildByName('Icon');
        const valueNode = displayNode.getChildByName('Value');

        // Update icon sprite
        if (iconNode) {
            const iconSprite = iconNode.getComponent(Sprite);
            if (iconSprite) {
                iconSprite.spriteFrame = statType === 'health' ? this.healthIcon : this.staminaIcon;
            }

            // Ensure UIOpacity exists
            let iconOpacity = iconNode.getComponent(UIOpacity);
            if (!iconOpacity) {
                iconOpacity = iconNode.addComponent(UIOpacity);
            }
            iconOpacity.opacity = 255;
        }

        // Update value label
        if (valueNode) {
            const label = valueNode.getComponent(Label);
            if (label) {
                label.string = change > 0 ? `+${Math.floor(change)}` : `${Math.floor(change)}`;

                // Set color based on increase/decrease
                const color = change > 0
                    ? new Color(StatDisplayColor.INCREASE_R, StatDisplayColor.INCREASE_G, StatDisplayColor.INCREASE_B, 255)
                    : new Color(StatDisplayColor.DECREASE_R, StatDisplayColor.DECREASE_G, StatDisplayColor.DECREASE_B, 255);
                label.color = color;
            }

            // Ensure UIOpacity exists
            let valueOpacity = valueNode.getComponent(UIOpacity);
            if (!valueOpacity) {
                valueOpacity = valueNode.addComponent(UIOpacity);
            }
            valueOpacity.opacity = 255;
        }

        displayNode.active = true;
        return displayNode;
    }

    /**
     * Reposition all active displays (bottom-up stacking)
     */
    private _repositionDisplays(): void {
        for (let i = 0; i < this._activeDisplays.length; i++) {
            const display = this._activeDisplays[i];
            if (display && display.isValid) {
                const yOffset = i * this.stackSpacing;
                display.setPosition(0, yOffset, 0);
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
        const valueOpacity = displayNode.getChildByName('Value')?.getComponent(UIOpacity);

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

        if (valueOpacity) {
            tween(valueOpacity)
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
