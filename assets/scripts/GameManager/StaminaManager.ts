import { _decorator, Component, Node } from 'cc';
import { MovementState } from '../Define/Define';
const { ccclass, property } = _decorator;

@ccclass('StaminaManager')
export class StaminaManager extends Component {

    @property(Node)
    playerNode: Node = null;

    start() {
        
    }
    
    update(deltaTime: number) {
        
    }

    getPlayerState():MovementState{
        if(this.playerNode == null) return;
        return this.playerNode.getComponent('PlayerController').currentState;
    }

}


