import { _decorator, Component, Node, CCInteger, CCFloat, ProgressBar, find } from 'cc';
import { Health } from './Define/Define';
const { ccclass, property } = _decorator;

@ccclass('Actor')
export class Actor extends Component {
    @property({ type: CCInteger })
    maxHp: number = Health.MAX_HP;

    @property({ type: CCInteger })
    currentHp: number = Health.MAX_HP;

    @property({ type: CCFloat, tooltip: 'HP per second when regenerating' })
    regenRate: number = Health.REGEN_RATE;

    @property({ type: CCFloat, tooltip: 'Seconds after taking damage before regen starts' })
    regenDelay: number = Health.REGEN_DELAY;

    @property({ tooltip: 'Enable automatic HP regeneration' })
    autoRegen: boolean = true;

    @property(Node)
    healthBarNode: Node;

    isDead: boolean = false;

    private _timeSinceDamage: number = 0;
    private _regenActive: boolean = false;
    private _healthBar: ProgressBar;
    private _statsDisplay: Component = null;

    start() {
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
        this._initHealthBar();

        // Find Stats display in the scene - try multiple possible paths
        let statsNode = find('UI/Gameplay_UI/Stats');
        if (statsNode) {
            this._statsDisplay = statsNode.getComponent('Stats');
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
        console.log(`Actor: takeDamage called, dmg=${dmg}, _statsDisplay=${this._statsDisplay ? 'found' : 'null'}`);
        if (this._statsDisplay && dmg > 0) {
            console.log(`Actor: Calling displayStatChange for health: -${dmg}`);
            (this._statsDisplay as any).displayStatChange('health', -dmg);
        } else if (!this._statsDisplay) {
            console.error('Actor: _statsDisplay is null! Cannot show health damage.');
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
            (this._statsDisplay as any).displayStatChange('health', healAmt);
        }
    }

    revive(hp?: number) {
        this.isDead = false;
        this.currentHp = typeof hp === 'number' ? Math.min(hp, this.maxHp) : this.maxHp;
        this._timeSinceDamage = 0;
        this._regenActive = false;
        this._updateHealthBar();
    }

    private _findStatsRecursively(node: Node): void {
        // Check if this node has Stats component
        const stats = node.getComponent('Stats');
        if (stats) {
            console.log(`Actor: Found Stats component on node: ${node.name}, path: ${this._getNodePath(node)}`);
            this._statsDisplay = stats;
            return;
        }
        
        // Check children
        for (const child of node.children) {
            this._findStatsRecursively(child);
            if (this._statsDisplay) return; // Stop once found
        }
    }
    
    private _getNodePath(node: Node): string {
        const path: string[] = [];
        let current = node;
        while (current) {
            path.unshift(current.name);
            current = current.parent;
        }
        return path.join('/');
    }

    private _onDeath() {
        if (this.isDead) return;
        this.isDead = true;
        this.node.emit('actor-dead', this);
    }

    /**
     * Reset actor to initial state
     */
    resetActor(): void {
        this.isDead = false;
        this.currentHp = this.maxHp;
        this._timeSinceDamage = 0;
        this._regenActive = false;
        this._updateHealthBar();
        console.log("🏥 Actor reset to full health");
    }
}

