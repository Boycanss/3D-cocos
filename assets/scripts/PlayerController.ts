import { _decorator, animation, CapsuleCharacterController, CCBoolean, CCFloat, CharacterController, Component, easing, Enum, EventKeyboard, Input, input, KeyCode, log, math, Node, NodeSpace, RigidBody, Tween, tween, Vec3 } from 'cc';
import { VaultDetector } from './VaultDetector';
const { ccclass, property } = _decorator;

enum MovementState {
    IDLE,
    WALKING,
    RUNNING,
    VAULTING,
    TURNING
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    private movementState:MovementState;
    public currentState:MovementState;

    @property(animation.AnimationController)
    Animation: animation.AnimationController;
    
    @property(CapsuleCharacterController)
    charController: CapsuleCharacterController;
    
    @property(CCFloat)
    maxSpeed: number = 5;

    @property(CCFloat)
    jumpheight: number = 1;

    acceleration: number = .5;
    currentSpeed: number = 1;
    turnRate: number = 250;
    verticalVelocity: number = 0;

    _moveDir = new Vec3(0,0,0);
    movementDirection = new Vec3();

    rigidb: RigidBody;
    isVaulting: boolean = false;

    VaultTween:Tween = new Tween();


    protected onLoad(): void {
        this.SetState(MovementState.IDLE);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard){

        //walk - run
        if (event.keyCode === KeyCode.KEY_W) {
            this._moveDir.z = 1;
            this.SetState(MovementState.RUNNING);
        }

        if (event.keyCode === KeyCode.KEY_S) this._moveDir.z = -1;

        //turn
        if (event.keyCode === KeyCode.KEY_A) {
            this.Animation.setValue('isTurning', true);
            this._moveDir.x = 1;
        }
        
        if (event.keyCode === KeyCode.KEY_D) {
            this.Animation.setValue('isTurning', true);
            this._moveDir.x = -1;
        }
        
        if(this.charController.isGrounded){
            //jump
            if (event.keyCode === KeyCode.SPACE){
                this.Jump();
            }
    
            if (event.keyCode === KeyCode.KEY_F) {
                this.Vault();
            }
        }
    }

    onKeyUp(event: EventKeyboard){
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.KEY_S) {
            this._moveDir.z = 0;
            this.SetState(MovementState.IDLE);
        }
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.KEY_D) {
            this._moveDir.x = 0;
            this.Animation.setValue('isTurning', false);
        }
    }

    SetState(newState:MovementState){
        this.currentState = newState;

        switch (this.currentState) {
            case MovementState.IDLE:
                this.Animation.setValue('isRunning', false);
                break;
            case MovementState.WALKING:
                
                break;
            case MovementState.RUNNING:
                this.Animation.setValue('isRunning', true);
                break;
            case MovementState.VAULTING:
            
                break;
            default:
                break;
        }
    }

    start() {
        this.rigidb = this.node.getComponent(RigidBody);
    }

    update(deltaTime: number) {
        this.HandleMovement(deltaTime);
        if(this.currentState == MovementState.VAULTING){
            this.VaultOver();
        }
    }

    
    HandleMovement(deltaTime : number){
        this.movementDirection.set(
            0,
            this.verticalVelocity,
            0
        );

        this.ApplyGravity(deltaTime);
        
        this.Run(deltaTime);
        this.Turn(deltaTime);
        
        if(this.movementDirection.lengthSqr() > 0){
            this.charController.move(this.movementDirection.multiplyScalar(deltaTime));
        }
    }

    Vault(){
        const obstacle = this.node.getComponent(VaultDetector).hitResult;
        if(!obstacle) return;

        this.SetState(MovementState.VAULTING);
        // this.Animation.setValue('Vault', true);
        const pos = this.node.position;
        const finishPos = new Vec3(pos.x, obstacle.node.position.y, obstacle.node.position.z);
        const destination = pos.clone();
        Vec3.add(destination, this.node.forward, finishPos);
        Vec3.add(destination, this.node.up, finishPos);
        console.log(destination);
        
        tween()
        .target(this.node)
        .delay(.2)
        .to(.3, {worldPosition: destination})
        .call(()=>{
            console.log(">>>>> VAULT");
            this.SetState(MovementState.IDLE);
        })
        .start();
    }

    VaultOver(){
    }

    Jump(){
        this.Animation.setValue('Jump', true);
        this.verticalVelocity = 8.5* (this.currentSpeed/this.maxSpeed);
    }
    
    Turn(deltaTime:number){
        if(!this.charController.isGrounded) return;
        this.node.setRotationFromEuler(0, this.node.eulerAngles.y+(this.turnRate*deltaTime*this._moveDir.x), 0);
    }

    Run(deltaTime:number){
        this.currentSpeed = this.currentState == MovementState.RUNNING ? math.lerp(this.currentSpeed, this.maxSpeed, deltaTime*1.5) : 0;
         this.Animation.setValue('currentSpeed', this.currentSpeed/this.maxSpeed);
        const fw = this.node.forward.clone().multiplyScalar(-this.currentSpeed);
        Vec3.add(this.movementDirection, this.movementDirection, fw);
    }

    ApplyGravity(deltaTime:number){
        if(this.charController.isGrounded == false)
        {
            this.verticalVelocity -= .5;
        }else{
             if(this.verticalVelocity < 0) this.verticalVelocity = -.5;
        }
    }
}


