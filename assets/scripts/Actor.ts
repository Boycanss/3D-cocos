import { _decorator, Component, Node, CCInteger, CCFloat } from 'cc';
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

    isDead: boolean = false;

    private _timeSinceDamage: number = 0;
    private _regenActive: boolean = false;

    start() {
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
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
            }
        }
    }

    takeDamage(amount: number) {
        if (this.isDead) return;
        const dmg = Math.max(0, amount);
        this.currentHp -= dmg;
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
    }

    revive(hp?: number) {
        this.isDead = false;
        this.currentHp = typeof hp === 'number' ? Math.min(hp, this.maxHp) : this.maxHp;
        this._timeSinceDamage = 0;
        this._regenActive = false;
    }

    private _onDeath() {
        if (this.isDead) return;
        this.isDead = true;
        this.node.emit('actor-dead', this);
    }
}


