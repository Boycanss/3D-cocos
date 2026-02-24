import { _decorator, Component, Node, tween, Vec3, UIOpacity, MeshRenderer, Color, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Blow')
export class Blow extends Component {
    start() {
        this.playExplosionEffect();
    }

    private playExplosionEffect(): void {
        const originalScale = this.node.scale.clone();
        
        // Setup opacity component
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }
        opacity.opacity = 255;
        
        // Get mesh renderer for color animation
        const meshRenderer = this.node.getComponent(MeshRenderer);
        let originalColor: Color = null;
        if (meshRenderer && meshRenderer.material) {
            originalColor = meshRenderer.material.getProperty('mainColor') as Color || Color.WHITE.clone();
        }
        
        tween(this.node)
            .parallel(
                // Scale up rapidly (explosion expansion)
                tween().to(0.3, { 
                    scale: new Vec3(
                        originalScale.x * 3, 
                        originalScale.y * 3, 
                        originalScale.z * 3
                    ) 
                }, { easing: 'quadOut' }),
                
                // Fade out and color shift simultaneously
                tween().to(0.3, {}, {
                    onUpdate: (target: Node, ratio: number) => {
                        if (opacity && opacity.isValid) {
                            opacity.opacity = 255 * (1 - ratio);
                        }
                        
                        // Color transition: original -> bright orange -> white -> fade
                        if (meshRenderer && meshRenderer.material && originalColor) {
                            let color: Color;
                            if (ratio < 0.3) {
                                // Flash to bright orange (0-30%)
                                const t = ratio / 0.3;
                                color = new Color(
                                    255,
                                    math.lerp(originalColor.g, 150, t),
                                    math.lerp(originalColor.b, 0, t),
                                    255
                                );
                            } else if (ratio < 0.6) {
                                // Transition to white (30-60%)
                                const t = (ratio - 0.3) / 0.3;
                                color = new Color(
                                    255,
                                    math.lerp(150, 255, t),
                                    math.lerp(0, 255, t),
                                    255
                                );
                            } else {
                                // Stay white and fade (60-100%)
                                color = Color.WHITE.clone();
                            }
                            meshRenderer.material.setProperty('mainColor', color);
                        }
                    }
                })
            )
            .call(() => {
                if (this.node && this.node.isValid) {
                    this.node.destroy();
                }
            })
            .start();
    }
}
