import { _decorator, CCFloat, Component, find, Node, SphereCollider, Vec3, Prefab, instantiate } from 'cc';
import { SoundManager } from '../Utils/SoundManager';
import { FogEffectManager } from '../Effects/FogEffectManager';
const { ccclass, property } = _decorator;

@ccclass('AtomicBomb')
export class AtomicBomb extends Component {
    
    MC: Node;

    @property(CCFloat)
    speed: number = 8;

    @property(CCFloat)
    maxLifeTime: number = 20; // Max lifetime in seconds to prevent orphaned bombs

    @property(Prefab)
    blowPrefab: Prefab = null;

    @property(CCFloat)
    damage: number = 50;

    collider: SphereCollider;
    private elapsedTime: number = 0;
    private isDestroying: boolean = false;
    private _targetPosition: Vec3 = new Vec3(); // Store target position at spawn time

    protected onLoad(): void {
        this.collider = this.getComponent(SphereCollider);
        if (this.collider) {
            this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        } else {
            console.warn(`AtomicBomb on ${this.node.name} has no SphereCollider`);
        }
    }

    start() {
        this.MC = find("MainCharacter");
        
        // Capture target position at spawn time (not chasing like missile)
        if (this.MC) {
            this._targetPosition = this.MC.worldPosition.clone();
        }
    }

    private onTriggerEnter(event): void {
        const otherNode = event.otherCollider.node;
        if (!!otherNode) {
            this.destroyBomb();
        }
    }

    public destroyBomb(): void {
        // Prevent multiple destroy calls
        if (this.isDestroying) return;
        this.isDestroying = true;

        SoundManager.instance?.playMissileImpact(this.node);

        // Instantiate blow effect at bomb position
        if (this.blowPrefab) {
            const blowNode = instantiate(this.blowPrefab);
            blowNode.setWorldPosition(this.node.getWorldPosition());
            blowNode.setWorldScale(this.node.getWorldScale());
            this.node.parent.addChild(blowNode);
        }

        // Trigger fog effect on the player
        if (this.MC) {
            const fogManager = this.MC.getComponent(FogEffectManager);
            if (fogManager) {
                fogManager.activateFog();
            }
        }

        // Disable collider to prevent re-triggering
        if (this.collider) {
            this.collider.enabled = false;
        }

        // Disable the component to stop update
        this.enabled = false;

        // Destroy the node
        this.node.destroy();
    }

    update(deltaTime: number) {
        // Safety timeout - destroy if exceeds max lifetime
        this.elapsedTime += deltaTime;
        if (this.elapsedTime > this.maxLifeTime) {
            console.warn(`AtomicBomb exceeded max lifetime (${this.maxLifeTime}s), destroying...`);
            this.destroyBomb();
            return;
        }

        // Move straight down toward the captured target position
        const directionToTarget = new Vec3();
        Vec3.subtract(directionToTarget, this._targetPosition, this.node.getWorldPosition());
        directionToTarget.normalize();

        // Move downward (negative Y) toward target position
        const movement = directionToTarget.clone().multiplyScalar(this.speed * deltaTime);
        const newPosition = this.node.getWorldPosition().add(movement);
        this.node.setWorldPosition(newPosition);

        // Optional: Rotate to face direction of movement
        this.node.forward = directionToTarget;
    }
}
