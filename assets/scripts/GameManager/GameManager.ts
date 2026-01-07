import { _decorator, CCFloat, Component, Label, Node } from 'cc';
import { StaminaManager } from './StaminaManager';
import { MovementState } from '../Define/Define';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(CCFloat)
    energyForObstacle: number;

    @property(Node)
    playerNode: Node;

    @property(Node)
    playerState: Node;

    staminaManager: StaminaManager;

    currentTotalStamina: number;
    currentPlayerState: MovementState;

    protected onLoad(): void {
        this.staminaManager = this.getComponent(StaminaManager);
    }

    start() {

    }

    update(deltaTime: number) {
        this.checkStateforObstacle();
        // console.log(this.checkStateforObstacle());
        
    }

    checkStateforObstacle(): boolean {
        this.currentPlayerState = this.playerNode.getComponent('PlayerController').getState();
        this.playerState.getComponent(Label).string = this.currentPlayerState.toString();
        if(this.currentPlayerState == MovementState.IDLE) return;
        
        this.currentTotalStamina = this.staminaManager.getTotalUsedStamina();
        if(this.currentTotalStamina%this.energyForObstacle == 0){
            return true;
        } else {
            return false;
        }   
    }

}


