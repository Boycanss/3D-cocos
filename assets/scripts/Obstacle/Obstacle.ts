import { _decorator, BoxCollider, CCFloat, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {

    boxCollider: BoxCollider;

    @property(CCFloat)
    damage: number = 10;

    start() {
        this.boxCollider = this.getComponent(BoxCollider);
    }

    update(deltaTime: number) {
        
    }
}

