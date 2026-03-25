import { _decorator, Component, Node, Prefab, instantiate, Vec3, math } from 'cc';
import { DustParticle } from './DustParticle';
const { ccclass, property } = _decorator;

@ccclass('DustEffectManager')
export class DustEffectManager extends Component {
    
    @property({ type: Prefab, tooltip: "Dust particle prefab (3D sphere with transparent material)" })
    dustParticlePrefab: Prefab = null;

    @property({ tooltip: "Height offset for dust spawn (at player's feet)" })
    footOffset: number = 0.1;

    @property({ tooltip: "Enable dust effects" })
    enableDustEffects: boolean = true;

    // Trail effect state
    private _isTrailActive: boolean = false;
    private _trailTimer: number = 0;
    private _trailInterval: number = 0.12; // Less frequent to reduce load

    protected onLoad(): void {
        if (!this.dustParticlePrefab) {
            console.warn('DustEffectManager: No dust particle prefab assigned!');
        }
    }

    update(deltaTime: number): void {
        // Handle continuous trail effects (slide/wall run)
        if (this._isTrailActive && this.enableDustEffects) {
            this._trailTimer += deltaTime;
            if (this._trailTimer >= this._trailInterval) {
                this.spawnTrailParticle();
                this._trailTimer = 0;
            }
        }
    }

    /**
     * Spawn dust burst effect (for dash) - called like GhostEffect
     */
    public createDustBurst(particleCount: number = 10): void {
        if (!this.enableDustEffects || !this.dustParticlePrefab) return;

        // console.log(`💨 Spawning dust burst with ${particleCount} particles`);

        for (let i = 0; i < particleCount; i++) {
            this.spawnDustParticle('burst');
        }
    }

    /**
     * Start continuous dust trail (for slide/wall run) - called like GhostEffect
     */
    public createDustTrail(): void {
        if (!this.enableDustEffects) return;
        
        // Stop any existing trail first to prevent overlapping
        this.stopDustTrail();
        
        this._isTrailActive = true;
        this._trailTimer = 0;
        // console.log("💨 Dust trail started");
    }

    /**
     * Stop continuous dust trail - called like GhostEffect
     */
    public stopDustTrail(): void {
        this._isTrailActive = false;
        this._trailTimer = 0; // Reset timer to prevent immediate spawn on restart
        // console.log("💨 Dust trail stopped");
    }

    /**
     * Spawn a single trail particle
     */
    private spawnTrailParticle(): void {
        this.spawnDustParticle('trail');
    }

    public setTrailActive(active: boolean){
        this._isTrailActive = active;
    }

    /**
     * Spawn a single dust particle (simplified, no pooling)
     */
    private spawnDustParticle(type: 'burst' | 'trail'): void {
        if (!this.dustParticlePrefab) return;

        // Get player foot position
        const playerPos = this.node.worldPosition.clone();
        const footPos = new Vec3(playerPos.x, playerPos.y + this.footOffset, playerPos.z);

        // Add slight random offset for natural look
        const randomOffset = new Vec3(
            math.randomRange(-0.3, 0.3),
            0,
            math.randomRange(-0.3, 0.3)
        );
        footPos.add(randomOffset);

        // Create dust particle
        const dustNode = instantiate(this.dustParticlePrefab);
        dustNode.setWorldPosition(footPos);

        // Add to scene
        this.node.parent.addChild(dustNode);

        // Get dust particle component and animate
        const dustParticle = dustNode.getComponent(DustParticle);
        if (dustParticle) {
            // Calculate random direction (outward from player)
            const direction = this.getRandomDirection(type);
            
            if (type === 'burst') {
                dustParticle.animateBurst(direction);
            } else {
                dustParticle.animateTrail(direction);
            }
        } else {
            console.warn('DustEffectManager: DustParticle component not found on prefab!');
            dustNode.destroy();
        }
    }

    /**
     * Get random direction based on effect type
     */
    private getRandomDirection(type: 'burst' | 'trail'): Vec3 {
        if (type === 'burst') {
            // Burst: 360-degree random direction
            const angle = math.randomRange(0, Math.PI * 2);
            return new Vec3(
                Math.cos(angle),
                math.randomRange(0.1, 0.3), // Slight upward movement
                Math.sin(angle)
            ).normalize();
        } else {
            // Trail: More backward direction (opposite to movement)
            const playerForward = this.node.forward.clone();
            playerForward.y = 0;
            playerForward.normalize();
            
            // Mostly backward with some random spread
            const backwardDir = playerForward.clone().negative();
            const randomSpread = new Vec3(
                math.randomRange(-0.5, 0.5),
                math.randomRange(0, 0.2),
                math.randomRange(-0.5, 0.5)
            );
            
            return backwardDir.add(randomSpread).normalize();
        }
    }

    /**
     * Spawn dust effect at specific position (for custom effects)
     */
    public spawnDustAtPosition(worldPos: Vec3, particleCount: number = 5): void {
        if (!this.enableDustEffects || !this.dustParticlePrefab) return;

        for (let i = 0; i < particleCount; i++) {
            const dustNode = instantiate(this.dustParticlePrefab);
            
            // Add slight random offset
            const randomOffset = new Vec3(
                math.randomRange(-0.2, 0.2),
                0,
                math.randomRange(-0.2, 0.2)
            );
            dustNode.setWorldPosition(worldPos.clone().add(randomOffset));
            
            this.node.addChild(dustNode);

            const dustParticle = dustNode.getComponent(DustParticle);
            if (dustParticle) {
                const direction = this.getRandomDirection('burst');
                dustParticle.animateBurst(direction);
            }
        }
    }

    /**
     * Enable/disable dust effects
     */
    public setDustEffectsEnabled(enabled: boolean): void {
        this.enableDustEffects = enabled;
        if (!enabled) {
            this.stopDustTrail();
        }
    }

    /**
     * Clean up any active effects
     */
    public clearAllDustEffects(): void {
        this.stopDustTrail();
        
        // Destroy all dust particles
        const dustParticles = this.node.children.filter(child => 
            child.getComponent(DustParticle) !== null
        );
        
        dustParticles.forEach(particle => {
            particle.destroy();
        });
        
        // console.log(`💨 Cleared ${dustParticles.length} dust particles`);
    }
}