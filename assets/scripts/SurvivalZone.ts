import { _decorator, Component, Node, Vec3, Collider, CCFloat, find } from 'cc';
import { Actor } from './Actor';
import { Stats } from './Utils/Stats';
const { ccclass, property } = _decorator;

@ccclass('SurvivalZone')
export class SurvivalZone extends Component {
    @property(Node)
    playerNode: Node = null;

    @property(CCFloat)
    speed: number = 5;

    @property(CCFloat)
    damage: number = 10;

    private _statsDisplay: Stats = null;

    start() {
        // Ensure collider is active
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.enabled = true;
        }

        // Find Stats display in the scene
        const statsNode = find('Canvas/Stats');
        if (statsNode) {
            this._statsDisplay = statsNode.getComponent(Stats);
        }
    }

    update(deltaTime: number) {
        if (!this.playerNode) return;

        // Calculate direction towards player
        const direction = new Vec3();
        Vec3.subtract(direction, this.playerNode.position, this.node.position);
        const distance = Vec3.distance(this.node.position, this.playerNode.position);

        // Move towards player
        if (distance > 0.1) {
            direction.normalize();
            Vec3.scaleAndAdd(this.node.position, this.node.position, direction, this.speed * deltaTime);
        }
    }

    onTriggerEnter(other: Collider) {
        const actor = other.node.getComponent(Actor);
        if (actor) {
            actor.takeDamage(this.damage);

            // Show stat display for damage
            if (this._statsDisplay) {
                this._statsDisplay.displayStatChange('health', -this.damage);
            }
        }
    }
}
