import { _decorator, BoxCollider, CCFloat, Component, Node } from 'cc';
import { Damage } from '../Define/Define';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {

    boxCollider: BoxCollider;

    @property(CCFloat)
    damage: number = Damage.OBSTACLE_DAMAGE;

    start() {
        this.boxCollider = this.getComponent(BoxCollider);
    }

    update(deltaTime: number) {
        
    }
}

