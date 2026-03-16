import { _decorator, Component, Collider, ICollisionEvent, Node, CCFloat, find, Enum } from 'cc';
import { Actor } from '../Actor';
import { Damage } from '../Define/Define';
const { ccclass, property } = _decorator;

export enum ObsType{
    NormalObstacle = "NORMAL_OBSTACLE",
    SmallObstacle = "SMALL_OBSTACLE"
}

@ccclass('ObstacleCollision')
export class ObstacleCollision extends Component {
    @property(CCFloat)
    damage: number = Damage.OBSTACLE_DAMAGE;

    @property({type: Enum(ObsType)})
    obstacleType: ObsType = ObsType.NormalObstacle;

    private _lastHitTime: number = 0;
    private _hitCooldown: number = 0.5; // Prevent multiple hits in quick succession
    private _statsDisplay: Component = null;

    start() {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
        }

        // Find Stats display in the scene
        const statsNode = find('UI/Gameplay_UI/Stats');
        if (statsNode) {
            this._statsDisplay = statsNode.getComponent('Stats');
        }
    }

    private onTriggerEnter(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const actor = otherNode.getComponent(Actor);

        if (actor) {
            const currentTime = Date.now();
            // Prevent multiple hits within cooldown period
            if (currentTime - this._lastHitTime >= this._hitCooldown * 1000) {
                actor.takeDamage(this.damage);
                this._lastHitTime = currentTime;
                // console.log(`Obstacle hit ${otherNode.name} for ${this.damage} damage`);

                // Show stat display for damage
                if (this._statsDisplay) {
                    (this._statsDisplay as any).displayStatChange('health', -this.damage);
                }
            }
        }
    }

    protected onDestroy(): void {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.off('onTriggerEnter', this.onTriggerEnter, this);
        }
    }
}
