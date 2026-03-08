import { _decorator, Component, Node, Vec3, tween, math, MeshRenderer, Material, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DustParticle')
export class DustParticle extends Component {
    
    private _meshRenderer: MeshRenderer = null;
    private _material: Material = null;
    private _isAnimating: boolean = false;

    protected onLoad(): void {
        // Get MeshRenderer component for material-based opacity control
        this._meshRenderer = this.node.getComponent(MeshRenderer);
        if (!this._meshRenderer) {
            console.warn('DustParticle: No MeshRenderer found on dust particle!');
            return;
        }

        // Ensure material starts fully opaque (255 alpha)
        this.setOpacity(255); // Material alpha uses 0-255 range like GhostEffect
    }

    /**
     * Animate dust particle with outward movement and fade
     */
    public animateParticle(direction: Vec3, lifetime: number, maxScale: number = 0.2, moveDistance: number = -1): void {
        if (this._isAnimating) return;
        this._isAnimating = true;

        // Store original position and scale
        const startPos = this.node.position.clone();
        const startScale = new Vec3(0.1, 0.1, 0.1); // Start smaller for more dramatic growth
        const endScale = new Vec3(maxScale, maxScale, maxScale);
        
        // Calculate end position (move outward)
        const actualDistance = moveDistance > 0 ? moveDistance : math.randomRange(0.5, 1.5);
        const endPos = startPos.clone().add(direction.clone().multiplyScalar(actualDistance));
        
        // Set initial state
        this.node.setScale(startScale);
        this.setOpacity(255); // Material alpha uses 0-255 range

        // Cartoon-style animation sequence with more dramatic timing
        const scaleUpDuration = lifetime * 0.15; // Quick pop-in
        const moveDuration = lifetime * 0.85;    // Most time moving
        const fadeDuration = lifetime * 0.5;     // Longer fade for big particles

        // 1. Dramatic scale up with bounce
        tween(this.node)
            .to(scaleUpDuration, { scale: endScale }, { easing: 'backOut' }) // Bouncy cartoon effect
            .start();

        // 2. Move outward with cartoon physics
        tween(this.node)
            .delay(scaleUpDuration * 0.3) // Start moving early
            .to(moveDuration, { position: endPos }, { 
                easing: maxScale > 1.0 ? 'quadOut' : 'quadInOut' // Big particles slower, small faster
            })
            .start();

        // 3. Fade out (starts after 30% of lifetime - earlier fade start)
        const fadeDelay = lifetime * 0.3;
        const fadeTarget = { alpha: 255 };
        tween(fadeTarget)
            .delay(fadeDelay)
            .to(fadeDuration, { alpha: 0 }, { 
                easing: 'quadInOut', // Smoother fade curve
                onUpdate: () => {
                    this.setOpacity(fadeTarget.alpha);
                }
            })
            .call(() => {
                // Destroy particle after animation
                this.destroyParticle();
            })
            .start();
    }

    /**
     * Set particle opacity using material alpha channel (same approach as GhostEffect)
     */
    private setOpacity(alpha: number): void {
        if (!this._meshRenderer) return;

        // Clamp alpha to 0-255 range (same as GhostEffect)
        alpha = Math.max(0, Math.min(255, alpha));

        // Use the same approach as GhostEffect - get material instance and set mainColor
        const materialCount = this._meshRenderer.materials.length;
        for (let i = 0; i < materialCount; i++) {
            const matInstance = this._meshRenderer.getMaterialInstance(i);
            if (matInstance) {
                matInstance.setProperty("mainColor", new Color(255, 255, 255, alpha));
            }
        }
    }

    /**
     * Destroy the particle
     */
    private destroyParticle(): void {
        this._isAnimating = false;
        if (this.node && this.node.isValid) {
            this.node.destroy();
        }
    }

    /**
     * Quick burst animation for dash effects
     */
    public animateBurst(direction: Vec3): void {
        this.animateParticle(direction, 0.8, math.randomRange(0.55, 1));
    }

    /**
     * Faster trail animation for slide/wall run with quicker fade
     */
    public animateTrail(direction: Vec3): void {
        this.animateParticle(direction, 0.9, math.randomRange(0.25, 0.8)); // Shorter lifetime, smaller scale
    }
}