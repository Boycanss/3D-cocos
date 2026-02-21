import { _decorator, Component, Node, Prefab, instantiate, Vec3, Button, CCFloat } from 'cc';
import { Missile } from './Missile';
const { ccclass, property } = _decorator;

@ccclass('MissileManager')
export class MissileManager extends Component {
    @property(Prefab)
    missilePrefab: Prefab;

    @property(Node)
    mainCharacter: Node;

    @property(CCFloat)
    spawnHeight: number = 5;

    private missileCount: number = 0;

    /**
     * Spawn a single missile at a random position near the MainCharacter
     */
    spawnMissile(speedMultiplier: number): void {
        if (!this.missilePrefab) {
            console.error('Missile prefab not assigned to MissileManager');
            return;
        }

        if (!this.mainCharacter) {
            console.error('MainCharacter not assigned to MissileManager');
            return;
        }

        const missile = instantiate(this.missilePrefab);
        const mainCharPos = this.mainCharacter.getWorldPosition();
        const randomX = mainCharPos.x + (Math.random() * 20 - 10);
        const randomZ = mainCharPos.z + (Math.random() * 20 - 10);
        const randomRotationX = 20 + Math.random() * (145 - 20);
        
        missile.setWorldPosition(new Vec3(randomX, this.spawnHeight, randomZ));
        missile.setRotationFromEuler(-randomRotationX, 0, 0);
        missile.getComponent(Missile).MultiplySpeed(speedMultiplier);
        this.node.addChild(missile);
        this.missileCount++;
    }

    /**
     * Spawn multiple missiles with optional speed parameter
     */
    spawnMissiles(count: number, speedMultiplier: number = 1): void {
        for (let i = 0; i < count; i++) {
            this.spawnMissile(speedMultiplier);
        }
    }

    /**
     * Clear all missiles
     */
    clearMissiles(): void {
        this.node.children.forEach(child => {
            child.destroy();
        });
        this.missileCount = 0;
    }

    /**
     * Get current missile count
     */
    getMissileCount(): number {
        return this.missileCount;
    }
}
