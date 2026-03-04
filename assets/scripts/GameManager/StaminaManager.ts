import { _decorator, CCFloat, Component, Node, ProgressBar, find } from 'cc';
import { Energy, MovementState } from '../Define/Define';
import { Stats } from '../Utils/Stats';
const { ccclass, property } = _decorator;

@ccclass('StaminaManager')
export class StaminaManager extends Component {

    @property(Node)
    playerNode: Node = null;

    @property(Node)
    staminaBar: Node = null;

    @property({ type: Stats, tooltip: 'Stats display component (auto-finds if not assigned)' })
    statsDisplay: Stats = null;

    stamina: number;
    totalUsedStamina: number = 0;
    staminaRegenRate: number;

    private _getPlayerState: () => MovementState = null;

    protected onLoad(): void {
        this.stamina = Energy.STAMINA;
        this.staminaRegenRate = Energy.STAMINA_REGEN_RATE;
    }

    start() {
        // Auto-find Stats display if not assigned
        if (!this.statsDisplay) {
            const statsNode = find('Canvas/Stats');
            if (statsNode) {
                this.statsDisplay = statsNode.getComponent(Stats);
                if (this.statsDisplay) {
                    console.log('StaminaManager: Auto-found Stats display');
                }
            } else {
                console.warn('StaminaManager: Stats node not found at Canvas/Stats');
            }
        }
    }

    /** Called by PlayerController to register state getter, avoiding circular import */
    public registerPlayerStateGetter(getter: () => MovementState): void {
        this._getPlayerState = getter;
    }

    update(deltaTime: number) {
        if (this._getPlayerState) {
            this.updateStaminaBar(this._getPlayerState(), deltaTime);
        }
    }

    updateStaminaBar(state: MovementState, deltaTime: number) {
        switch (state) {
            case MovementState.IDLE:
                if (this.stamina < Energy.STAMINA) {
                    this.increseStamina(this.staminaRegenRate * deltaTime);
                }
                break;
            case MovementState.RUNNING:
                this.reduceStamina(Energy.RUN * deltaTime);
                break;
            case MovementState.DASHING:
                this.reduceStamina(Energy.DASH * deltaTime);
                break;
            case MovementState.WALL_RUNNING:
                // Stamina drain handled in HandleWallRun; pause regen here
                break;
        }
        let scaleX = this.stamina / Energy.STAMINA;
        this.staminaBar.getComponent(ProgressBar).progress = scaleX;
    }

    reduceStamina(amount: number, showDisplay: boolean = false) {
        if (this.stamina - amount < 0) {
            this.stamina = 0;
        } else {
            this.stamina -= amount;
            this.totalUsedStamina += amount;

            // Show stat display if requested (for significant actions only)
            if (showDisplay) {
                if (this.statsDisplay) {
                    // console.log(`StaminaManager: Showing stat change: -${amount}`);
                    this.statsDisplay.displayStatChange('stamina', -amount);
                } else {
                    // console.warn('StaminaManager: statsDisplay is null, cannot show stat change');
                }
            }
        }
    }

    public getTotalUsedStamina(): number {
        return this.totalUsedStamina;
    }

    increseStamina(amount: number) {
        if (this.stamina + amount > Energy.STAMINA) {
            this.stamina = Energy.STAMINA;
        } else {
            this.stamina += amount;
        }
    }

    getStamina(): number {
        return this.stamina;
    }
}
