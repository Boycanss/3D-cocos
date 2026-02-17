import { _decorator, Component, find, math, Node, SphereCollider, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Missile')
export class Missile extends Component {
    // @property(Node)
    MC:Node;

    @property(Number)
    turnRate: number = 3;

    @property(Number)
    speed: number = 10;

    collider: SphereCollider;

    protected onLoad(): void {
        this.collider = this.getComponent(SphereCollider);
        if (this.collider) {
            this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
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
            this.node.destroy();
        }
    }

    update(deltaTime: number) {
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
