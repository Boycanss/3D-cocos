import { _decorator, Component, Node, Prefab, instantiate, Vec3, CCFloat } from 'cc';
import { AtomicBomb } from './AtomicBomb';
import { SoundManager } from '../Utils/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('AtomicBombManager')
export class AtomicBombManager extends Component {
    @property(Prefab)
    atomicBombPrefab: Prefab;

    @property(Node)
    mainCharacter: Node;

    @property(CCFloat)
    spawnHeight: number = 15; // Higher spawn point than missiles

    private bombCount: number = 0;

    /**
     * Spawn a single atomic bomb above the MainCharacter
     * The bomb will fall straight down to the player's current position
     */
    spawnAtomicBomb(speedMultiplier: number = 1): void {
        if (!this.atomicBombPrefab) {
            console.error('AtomicBomb prefab not assigned to AtomicBombManager');
            return;
        }

        if (!this.mainCharacter) {
            console.error('MainCharacter not assigned to AtomicBombManager');
            return;
        }

        const bomb = instantiate(this.atomicBombPrefab);
        const mainCharPos = this.mainCharacter.getWorldPosition();
        
        // Spawn directly above the player with slight random offset
        const randomX = mainCharPos.x + (Math.random() * 4 - 2); // Small random offset
        const randomZ = mainCharPos.z + (Math.random() * 4 - 2);
        
        bomb.setWorldPosition(new Vec3(randomX, this.spawnHeight, randomZ));
        
        // Get AtomicBomb component and apply speed multiplier
        const atomicBombComponent = bomb.getComponent(AtomicBomb);
        if (atomicBombComponent) {
            atomicBombComponent.speed *= speedMultiplier;
            console.log(`💣 AtomicBomb component found, speed set to: ${atomicBombComponent.speed}`);
        } else {
            console.warn(`⚠️ AtomicBomb component NOT found on prefab!`);
        }
        
        // Add to scene root (not as child of GameManager)
        const sceneRoot = this.node.parent;
        if (sceneRoot) {
            sceneRoot.addChild(bomb);
            console.log(`💣 Bomb added to scene root`);
        } else {
            this.node.addChild(bomb);
            console.log(`💣 Bomb added to GameManager (no scene root found)`);
        }
        
        this.bombCount++;
        
        // Play spawn sound
        SoundManager.instance?.playMissileLaunch(bomb); // Reuse missile launch sound or create new one
        
        console.log(`💣 Atomic bomb spawned at (${randomX.toFixed(2)}, ${this.spawnHeight}, ${randomZ.toFixed(2)})! Total: ${this.bombCount}`);
    }

    /**
     * Spawn multiple atomic bombs
     */
    spawnAtomicBombs(count: number, speedMultiplier: number = 1): void {
        console.log(`🎯 spawnAtomicBombs called with count=${count}, speed=${speedMultiplier}`);
        for (let i = 0; i < count; i++) {
            console.log(`🎯 Spawning bomb ${i + 1}/${count}`);
            this.spawnAtomicBomb(speedMultiplier);
        }
    }

    /**
     * Clear all atomic bombs
     */
    clearAtomicBombs(): void {
        this.node.children.forEach(child => {
            if (child.getComponent(AtomicBomb)) {
                child.destroy();
            }
        });
        this.bombCount = 0;
    }

    /**
     * Get current bomb count
     */
    getBombCount(): number {
        return this.bombCount;
    }
}
