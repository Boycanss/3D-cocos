import { _decorator, Component, Enum, Node } from 'cc';
import { ObstacleType } from '../Define/Define';
const { ccclass, property } = _decorator;

const ObstacleTypeEnum = Enum(ObstacleType);
@ccclass('Box')
export class Box extends Component {
    @property({type: ObstacleTypeEnum})
    boxType: ObstacleType;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


