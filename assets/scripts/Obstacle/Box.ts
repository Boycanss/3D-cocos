import { _decorator, Component, Enum, Node, Vec3 } from 'cc';
import { ObstacleType } from '../Define/Define';
const { ccclass, property } = _decorator;

const ObstacleTypeEnum = Enum(ObstacleType);
@ccclass('Box')
export class Box extends Component {
    @property({type: ObstacleTypeEnum})
    boxType: ObstacleType;

    private initScaleSize: Vec3;

    onEnable() {
        this.initScaleSize = this.node.scale.clone();
    }

    public resetScaleSize(){
        this.node.setScale(this.initScaleSize);
    }

    public getInitScaleSize(){
        return this.initScaleSize;
    }

    update(deltaTime: number) {
        
    }
}


