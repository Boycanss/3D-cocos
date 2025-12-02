import { _decorator, CCFloat, Color, Component, geometry, Line, MeshRenderer, Node, PhysicsSystem, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VaultDetector')
export class VaultDetector extends Component {

    private _ray:geometry.Ray = new geometry.Ray();
    
    @property(CCFloat)
    vaultDistance:number;

    public hitResult;
    
    start() {
    }
    
    checkObstacleAhead()
    // : Node | null 
    {
        const origin = this.node.position;
        var fw:Vec3 = new Vec3(0,0,0);
        const fis = PhysicsSystem.instance;
        Vec3.scaleAndAdd(fw, origin, this.node.forward, -1);
        const {Ray} = geometry;
        Ray.fromPoints(this._ray, origin, fw);

        if(fis.raycastClosest(this._ray, 0xffffffff, this.vaultDistance)){
            return fis.raycastClosestResult.collider;
        }
        
    }

    update(deltaTime: number) {
        this.hitResult = this.checkObstacleAhead();
    }
}


