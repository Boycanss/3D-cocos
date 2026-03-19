import { _decorator, Component, Node, Enum } from 'cc';
import { GameLevel } from '../Define/Define';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ActivateInLevel')
export class ActivateInLevel extends Component {

    @property(GameManager)
    gameMgr: GameManager = null!;

    @property({type: Enum(GameLevel)})
    currentLevel: GameLevel = GameLevel.LEVEL1;
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


