import { _decorator, Component, Collider, ICollisionEvent, Node } from 'cc';
import { Actor } from '../Actor';
const { ccclass, property } = _decorator;

@ccclass('ObstacleCollision')
export class ObstacleCollision extends Component {
    @property({ type: Number })
    damage: number = 10;

    private _lastHitTime: number = 0;
    private _hitCooldown: number = 0.5; // Prevent multiple hits in quick succession

    start() {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
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
                console.log(`Obstacle hit ${otherNode.name} for ${this.damage} damage`);
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
