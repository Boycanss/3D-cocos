import { _decorator, CCFloat, Component, find, math, Node, SphereCollider, Vec3, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Missile')
export class Missile extends Component {
    // @property(Node)
    MC:Node;

    @property(CCFloat)
    turnRate: number = 3;

    @property(CCFloat)
    speed: number = 10;

    @property(CCFloat)
    maxLifeTime: number = 15; // Max lifetime in seconds to prevent orphaned missiles

    collider: SphereCollider;
    private elapsedTime: number = 0;
    private isDestroying: boolean = false;

    protected onLoad(): void {
        this.collider = this.getComponent(SphereCollider);
        if (this.collider) {
            this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        } else {
            console.warn(`Missile on ${this.node.name} has no SphereCollider`);
        }
    }

    start() {
        this.MC = find("MainCharacter");
    }

    MultiplySpeed(multiplier: number) {
        this.speed *= multiplier;
        this.turnRate *= multiplier/1.5; // Optionally increase turn rate as well for more challenge at higher speeds
    }

    private onTriggerEnter(event): void {
        const otherNode = event.otherCollider.node;
        if(!!otherNode){
            this.destroyMissile();
        }
    }

    private destroyMissile(): void {
        // Prevent multiple destroy calls
        if (this.isDestroying) return;
        this.isDestroying = true;

        // Disable all particle systems on this node and children immediately
        this.disableAllParticles(this.node);
        
        // Disable collider to prevent re-triggering
        if (this.collider) {
            this.collider.enabled = false;
        }

        // Disable the component to stop update
        this.enabled = false;

        // Destroy the node (this is deferred but particles are now disabled)
        this.node.destroy();
    }

    private disableAllParticles(node: Node): void {
        // Disable particle systems on this node
        const particles = node.getComponents(ParticleSystem);
        particles.forEach(particle => {
            particle.stop();
            particle.enabledInHierarchy && (particle.enabled = false);
        });

        // Recursively disable on all children
        node.children.forEach(child => {
            this.disableAllParticles(child);
        });
    }

    update(deltaTime: number) {
        // Safety timeout - destroy if exceeds max lifetime
        this.elapsedTime += deltaTime;
        if (this.elapsedTime > this.maxLifeTime) {
            console.warn(`Missile exceeded max lifetime (${this.maxLifeTime}s), destroying...`);
            this.destroyMissile();
            return;
        }

        if (!this.MC) return;

        // Calculate direction toward target
        const directionToTarget = new Vec3();
        Vec3.subtract(directionToTarget, this.MC.getWorldPosition(), this.node.getWorldPosition());
        directionToTarget.normalize();

        // Smoothly rotate toward target (with turn rate limiting for dodgeability)
        const currentForward = this.node.forward.clone();
        Vec3.lerp(currentForward, currentForward, directionToTarget, this.turnRate * deltaTime);
        currentForward.normalize();

        // Update node rotation to face the interpolated direction
        this.node.forward = currentForward;

        // Move forward in the missile's current direction
        const speed = this.speed + math.randomRange(0, 1.5); // Add slight speed variation
        const movement = currentForward.clone().multiplyScalar(speed * deltaTime);
        const newPosition = this.node.getWorldPosition().add(movement);
        this.node.setWorldPosition(newPosition);
    }
}
