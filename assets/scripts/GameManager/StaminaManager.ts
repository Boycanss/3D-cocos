import { _decorator, Component, Node, ProgressBar } from 'cc';
import { Energy, MovementState } from '../Define/Define';
import { PlayerController } from '../PlayerController';
const { ccclass, property } = _decorator;

@ccclass('StaminaManager')
export class StaminaManager extends Component {

    @property(Node)
    playerNode: Node = null;

    @property(Node)
    staminaBar: Node = null;

    stamina: number;
    totalUsedStamina: number = 0;

    @property(Number)
    staminaRegenRate: number = 0.5;
    

    protected onLoad(): void {
        this.stamina = Energy.STAMINA;
    }

    start() {
        
    }
    
    update(deltaTime: number) {
        if(this.playerNode != null){
            this.updateStaminaBar(this.playerNode.getComponent(PlayerController).getState(), deltaTime);
        }
    }

    updateStaminaBar(state:MovementState, deltaTime:number){
        switch(state){
            case MovementState.IDLE:
                if(this.stamina < Energy.STAMINA){
                    this.increseStamina(this.staminaRegenRate*deltaTime);
                }
                break;
            case MovementState.RUNNING:
                this.reduceStamina(Energy.RUN*deltaTime);
                break;
            case MovementState.DASHING:
                this.reduceStamina(Energy.DASH*deltaTime);
                break;
            case MovementState.WALL_RUNNING:
                // Stamina drain handled in HandleWallRun; pause regen here
                break;
        }
        let scaleX = this.stamina / Energy.STAMINA;
        this.staminaBar.getComponent(ProgressBar).progress = scaleX;
    }

    reduceStamina(amount:number){
        if(this.stamina - amount < 0){
            this.stamina = 0;
        } else {
            this.stamina -= amount;
            this.totalUsedStamina += amount;
        }
    }

    public getTotalUsedStamina():number{
        return this.totalUsedStamina;
    }

    increseStamina(amount:number){
        if(this.stamina + amount > Energy.STAMINA){
            this.stamina = Energy.STAMINA;
        } else {
            this.stamina += amount;
        }
    }

    getStamina():number{
        return this.stamina;
    }
}
