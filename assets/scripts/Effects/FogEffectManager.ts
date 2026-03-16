import { _decorator, Component, Node, Prefab, instantiate, Vec3, math, MeshRenderer, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FogEffectManager')
export class FogEffectManager extends Component {
    
    @property({ type: Prefab, tooltip: "Fog sphere prefab (3D sphere with semi-transparent material)" })
    fogSpherePrefab: Prefab = null;

    @property({ tooltip: "Number of fog spheres to spawn" })
    fogSphereCount: number = 30;

    @property({ tooltip: "Radius around player where fog spheres are positioned" })
    fogRadius: number = 8;

    @property({ tooltip: "Fog effect duration in seconds" })
    fogDuration: number = 4;

    @property({ tooltip: "Fog fade-in duration in seconds" })
    fogFadeInDuration: number = 0.5;

    @property({ tooltip: "Fog fade-out duration in seconds" })
    fogFadeOutDuration: number = 1.5;

    @property({ tooltip: "Fog sphere opacity (0-255)" })
    fogOpacity: number = 180;

    @property({ tooltip: "Fog sphere color (RGB)" })
    fogColor: Color = new Color(100, 100, 120, 255);

    // Fog state tracking
    private _isFogActive: boolean = false;
    private _fogTimer: number = 0;
    private _fogFadeTimer: number = 0;
    private _fogSpheres: Node[] = [];
    private _targetOpacity: number = 0;
    private _currentOpacity: number = 0;

    protected onLoad(): void {
        if (!this.fogSpherePrefab) {
            console.warn('FogEffectManager: No fog sphere prefab assigned!');
        }
    }

    update(deltaTime: number): void {
        // Handle fog fade in/out
        if (this._isFogActive) {
            this._fogTimer += deltaTime;
            
            // Update fade timer
            this._fogFadeTimer += deltaTime;
            
            // Fade in phase
            if (this._fogFadeTimer <= this.fogFadeInDuration) {
                const fadeProgress = this._fogFadeTimer / this.fogFadeInDuration;
                this._currentOpacity = math.lerp(0, this.fogOpacity, fadeProgress);
                this.updateFogOpacity(this._currentOpacity);
            }
            // Fade out phase (starts near end of fog duration)
            else if (this._fogTimer >= this.fogDuration - this.fogFadeOutDuration) {
                const fadeOutStart = this.fogDuration - this.fogFadeOutDuration;
                const fadeOutProgress = (this._fogTimer - fadeOutStart) / this.fogFadeOutDuration;
                this._currentOpacity = math.lerp(this.fogOpacity, 0, fadeOutProgress);
                this.updateFogOpacity(this._currentOpacity);
            }
            // Full opacity phase
            else {
                this._currentOpacity = this.fogOpacity;
                this.updateFogOpacity(this._currentOpacity);
            }
            
            // Check if fog duration is complete
            if (this._fogTimer >= this.fogDuration) {
                this.stopFog();
            }
        }

        // Keep fog spheres positioned around player
        if (this._isFogActive && this._fogSpheres.length > 0) {
            this.updateFogSpherePositions();
        }
    }

    /**
     * Activate fog effect - called when atomic bomb hits
     */
    public activateFog(): void {
        if (this._isFogActive) return; // Already active
        
        console.log("🌫️ Fog effect activated!");
        
        this._isFogActive = true;
        this._fogTimer = 0;
        this._fogFadeTimer = 0;
        this._currentOpacity = 0;
        
        // Spawn fog spheres
        this.spawnFogSpheres();
    }

    /**
     * Deactivate fog effect
     */
    public stopFog(): void {
        if (!this._isFogActive) return;
        
        console.log("🌫️ Fog effect stopped!");
        
        this._isFogActive = false;
        this._fogTimer = 0;
        this._fogFadeTimer = 0;
        
        // Destroy all fog spheres
        this.destroyFogSpheres();
    }

    /**
     * Spawn fog spheres around the player
     */
    private spawnFogSpheres(): void {
        if (!this.fogSpherePrefab) {
            console.warn('FogEffectManager: Cannot spawn fog - no prefab assigned!');
            return;
        }

        // Clear any existing spheres first
        this.destroyFogSpheres();

        const playerPos = this.node.worldPosition;
        
        // Spawn spheres in a spherical distribution around player
        for (let i = 0; i < this.fogSphereCount; i++) {
            // Generate random position on sphere surface
            const theta = Math.random() * Math.PI * 2; // Random angle around Y axis
            const phi = Math.acos(2 * Math.random() - 1); // Random angle from top to bottom
            
            const x = this.fogRadius * Math.sin(phi) * Math.cos(theta);
            const y = this.fogRadius * Math.cos(phi);
            const z = this.fogRadius * Math.sin(phi) * Math.sin(theta);
            
            const fogNode = instantiate(this.fogSpherePrefab);
            const spawnPos = new Vec3(
                playerPos.x + x,
                playerPos.y + y,
                playerPos.z + z
            );
            
            fogNode.setWorldPosition(spawnPos);
            
            // Set initial opacity to 0 (will fade in)
            this.setFogSphereOpacity(fogNode, 0);
            
            // Add to scene
            this.node.parent.addChild(fogNode);
            this._fogSpheres.push(fogNode);
        }
        
        console.log(`🌫️ Spawned ${this.fogSphereCount} fog spheres`);
    }

    /**
     * Update fog sphere positions to follow player
     */
    private updateFogSpherePositions(): void {
        const playerPos = this.node.worldPosition;
        
        for (let i = 0; i < this._fogSpheres.length; i++) {
            const fogNode = this._fogSpheres[i];
            if (!fogNode || !fogNode.isValid) continue;
            
            // Get current position relative to player
            const currentPos = fogNode.worldPosition;
            const relativePos = new Vec3();
            Vec3.subtract(relativePos, currentPos, playerPos);
            
            // Maintain distance from player (normalize and scale to fogRadius)
            const distance = relativePos.length();
            if (distance > 0.01) {
                relativePos.normalize();
                relativePos.multiplyScalar(this.fogRadius);
            }
            
            // Update position to follow player
            const newPos = new Vec3();
            Vec3.add(newPos, playerPos, relativePos);
            fogNode.setWorldPosition(newPos);
        }
    }

    /**
     * Update opacity of all fog spheres
     */
    private updateFogOpacity(opacity: number): void {
        for (const fogNode of this._fogSpheres) {
            if (!fogNode || !fogNode.isValid) continue;
            this.setFogSphereOpacity(fogNode, opacity);
        }
    }

    /**
     * Set opacity of a single fog sphere
     */
    private setFogSphereOpacity(fogNode: Node, opacity: number): void {
        const meshRenderer = fogNode.getComponent(MeshRenderer);
        if (!meshRenderer) return;

        // Clamp opacity to 0-255 range
        opacity = Math.max(0, Math.min(255, opacity));

        // Update material color with new opacity
        const materialCount = meshRenderer.materials.length;
        for (let i = 0; i < materialCount; i++) {
            const matInstance = meshRenderer.getMaterialInstance(i);
            if (matInstance) {
                // Use fog color with updated opacity
                matInstance.setProperty("mainColor", new Color(
                    this.fogColor.r,
                    this.fogColor.g,
                    this.fogColor.b,
                    opacity
                ));
            }
        }
    }

    /**
     * Destroy all fog spheres
     */
    private destroyFogSpheres(): void {
        for (const fogNode of this._fogSpheres) {
            if (fogNode && fogNode.isValid) {
                fogNode.destroy();
            }
        }
        this._fogSpheres = [];
    }

    /**
     * Check if fog is currently active
     */
    public isFogActive(): boolean {
        return this._isFogActive;
    }

    /**
     * Get current fog opacity (0-255)
     */
    public getCurrentOpacity(): number {
        return this._currentOpacity;
    }

    /**
     * Clean up on destroy
     */
    protected onDestroy(): void {
        this.destroyFogSpheres();
    }
}
