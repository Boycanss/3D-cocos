import { _decorator, Component, Node, CCInteger, CCFloat, ProgressBar } from 'cc';
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

    start() {
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
        this._initHealthBar();
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
        console.log(">>> TAKE DAMAGE: "+ amount);
        
        const dmg = Math.max(0, amount);
        this.currentHp -= dmg;
        this._updateHealthBar();
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this._onDeath();
        } else {
            this._timeSinceDamage = 0;
            this._regenActive = false;
        }
    }

    heal(amount: number) {
        if (this.isDead) return;
        const healAmt = Math.max(0, amount);
        this.currentHp += healAmt;
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
        this._updateHealthBar();
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

