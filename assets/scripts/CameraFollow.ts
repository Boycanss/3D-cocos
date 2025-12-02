import { _decorator, CCFloat, Component, Node, Vec3, VERSION } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    @property(Node)
    target:Node;

    @property(CCFloat)
    moveSpeed:number;

    @property(Vec3)
    offset: Vec3 = new Vec3(0, 0, 0);

    targetPosition = new Vec3();
    currentPosition = new Vec3();
    desiredPosition = new Vec3();

    start() {

    }

    update(deltaTime: number) {
        if(!this.target) return;

        this.target.getWorldPosition(this.targetPosition);
        Vec3.add(this.desiredPosition, this.targetPosition, this.offset);

        this.node.getWorldPosition(this.currentPosition);

        Vec3.lerp(
            this.currentPosition,
            this.currentPosition,
            this.desiredPosition,
            this.moveSpeed*deltaTime
        );

        this.node.setWorldPosition(this.currentPosition);

    }
}


