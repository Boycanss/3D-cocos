import { _decorator, Component, Node, CCInteger, CCFloat, ProgressBar, find } from 'cc';
import { Stats } from './Utils/Stats';
const { ccclass, property } = _decorator;

@ccclass('Actor')
export class Actor extends Component {
    @property({ type: CCInteger })
    maxHp: number = 100;

    @property({ type: CCInteger })
    currentHp: number = 100;

    @property({ type: CCFloat, tooltip: 'HP per second when regenerating' })
    regenRate: number = 5.0;

    @property({ type: CCFloat, tooltip: 'Seconds after taking damage before regen starts' })
    regenDelay: number = 3.0;

    @property({ tooltip: 'Enable automatic HP regeneration' })
    autoRegen: boolean = true;

    @property(Node)
    healthBarNode: Node;

    isDead: boolean = false;

    private _timeSinceDamage: number = 0;
    private _regenActive: boolean = false;
    private _healthBar: ProgressBar;
    private _statsDisplay: Stats = null;

    start() {
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
        this._initHealthBar();

        // Find Stats display in the scene
        const statsNode = find('UI/Stats');
        if (statsNode) {
            this._statsDisplay = statsNode.getComponent(Stats);
            if (this._statsDisplay) {
                // console.log('Actor: Stats display found successfully');
            } else {
                console.error('Actor: Stats node found but no Stats component!');
            }
        } else {
            console.error('Actor: Stats node not found at Canvas/Stats');
        }
    }

    private _initHealthBar() {
        if (this.healthBarNode) {
            this._healthBar = this.healthBarNode.getComponent(ProgressBar);
            if (this._healthBar) {
                this._updateHealthBar();
            }
        }
    }

    private _updateHealthBar() {
        if (this._healthBar) {
            this._healthBar.progress = this.currentHp / this.maxHp;
        }
    }

    update(deltaTime: number) {
        this.regenHealth(deltaTime);
    }

    regenHealth(deltaTime: number) {
        if (this.isDead) return;

        // Handle automatic regeneration
        if (this.autoRegen && this.currentHp < this.maxHp) {
            this._timeSinceDamage += deltaTime;
            if (!this._regenActive && this._timeSinceDamage >= this.regenDelay) {
                this._regenActive = true;
            }

            if (this._regenActive) {
                this.currentHp += this.regenRate * deltaTime;
                if (this.currentHp >= this.maxHp) {
                    this.currentHp = this.maxHp;
                    this._regenActive = false;
                }
                this._updateHealthBar();
            }
        }
    }

    takeDamage(amount: number) {
        if (this.isDead) return;
        // console.log(">>> TAKE DAMAGE: "+ amount);
        
        const dmg = Math.max(0, amount);
        this.currentHp -= dmg;
        this._updateHealthBar();

        // Show stat display for damage
        // console.log(`Actor: takeDamage called, dmg=${dmg}, _statsDisplay=${this._statsDisplay ? 'found' : 'null'}`);
        if (this._statsDisplay && dmg > 0) {
            // console.log(`Actor: Calling displayStatChange for health: -${dmg}`);
            this._statsDisplay.displayStatChange('health', -dmg);
        } else if (!this._statsDisplay) {
            // console.error('Actor: _statsDisplay is null! Cannot show health damage.');
        }

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this._onDeath();
        } else {
            this._timeSinceDamage = 0;
            this._regenActive = false;
        }
    }

    heal(amount: number, showDisplay: boolean = false) {
        if (this.isDead) return;
        const healAmt = Math.max(0, amount);
        this.currentHp += healAmt;
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
        this._updateHealthBar();

        // Show stat display for healing if requested
        if (showDisplay && this._statsDisplay && healAmt > 0) {
            // console.log(`Actor: Showing health heal: +${healAmt}`);
            this._statsDisplay.displayStatChange('health', healAmt);
        }
    }

    revive(hp?: number) {
        this.isDead = false;
        this.currentHp = typeof hp === 'number' ? Math.min(hp, this.maxHp) : this.maxHp;
        this._timeSinceDamage = 0;
        this._regenActive = false;
        this._updateHealthBar();
    }

    private _onDeath() {
        if (this.isDead) return;
        this.isDead = true;
        this.node.emit('actor-dead', this);
    }
}

