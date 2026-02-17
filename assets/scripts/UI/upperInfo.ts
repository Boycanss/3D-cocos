import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('upperInfo')
export class upperInfo extends Component {
    @property(Node)
    CameraNode: Node = null;

    start() {

    }

    update(deltaTime: number) {
        this.node.lookAt(this.CameraNode.worldPosition);
    }
}


