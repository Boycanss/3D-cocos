import { _decorator, Component, Node, instantiate, Vec3, Sprite, tween, Color, MeshRenderer, SkinnedMeshRenderer, CCFloat, Material, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GhostEffect')
export class GhostEffect extends Component {

    @property(Node)
    nodeComponent: Node = null;

    @property(Node)
    spawnPoint: Node = null; // Optional spawn point for ghost, defaults to node's position

    @property(Material)
    ghostMaterial: Material = null;

    @property(CCFloat)
    ghostOffset: number = 0.5; // Distance behind the node

    @property(CCFloat)
    ghostDuration: number = 0.3; // How long the ghost lasts

    @property(CCFloat)
    ghostAlpha: number = 0.4; // Transparency (0-1)

    @property(CCFloat)
    multiGhostInterval: number = 0.05; // Interval between multiple ghosts (seconds)

    start() {

    }

    createAfterImage(node: Node) {
        const ghost = instantiate(node);
        ghost.setPosition(node.position);
        ghost.setScale(node.scale);
        ghost.getComponent(Sprite)!.color = new Color(255, 255, 255, 80);

        node.parent!.addChild(ghost);

        tween(ghost)
            .to(0.2, { scale: new Vec3(0.9, 0.9, 1) })
            .call(() => ghost.destroy())
            .start();
    }

    /**
     * Create multiple ghost effects over time
     * @param count Number of ghosts to spawn (default: 1)
     */
    create3DGhost(count: number = 1) {
        if (!this.nodeComponent || count <= 0) return;

        // Spawn first ghost immediately
        this.spawnSingleGhost();

        // Spawn remaining ghosts with interval
        for (let i = 1; i < count; i++) {
            this.scheduleOnce(() => {
                this.spawnSingleGhost();
            }, i * this.multiGhostInterval);
        }
    }

    private spawnSingleGhost(): void {
        if (!this.nodeComponent) return;

        const ghost = instantiate(this.nodeComponent);
        
        // Position ghost behind the node (in the back)
        const backOffset = this.nodeComponent.forward.clone().multiplyScalar(this.ghostOffset);
        const ghostPos = this.nodeComponent.worldPosition.clone().add(backOffset);
        ghost.setWorldPosition(ghostPos);
        ghost.setWorldRotation(this.nodeComponent.worldRotation);
        ghost.setWorldScale(this.nodeComponent.worldScale);

        // Add to scene
        director.getScene().addChild(ghost);

        // Remove all scripts from ghost to prevent behavior duplication
        ghost.components.forEach(comp => {
            if (!(comp instanceof MeshRenderer) && !(comp instanceof SkinnedMeshRenderer)) {
                comp.destroy();
            }
        });

        // Cache all renderers once instead of traversing recursively each frame
        const allRenderers = this.collectAllRenderers(ghost);
        
        // Apply ghost material to all cached renderers
        for (const renderer of allRenderers) {
            renderer.shadowCastingMode = 0;
            const materialCount = renderer.materials.length;
            for (let i = 0; i < materialCount; i++) {
                if (this.ghostMaterial) {
                    renderer.setMaterialInstance(this.ghostMaterial, i);
                } else {
                    const matInstance = renderer.getMaterialInstance(i);
                    if (matInstance) {
                        matInstance.setProperty("mainColor", new Color(255, 255, 255, this.ghostAlpha * 255));
                    }
                }
            }
        }

        // Fade out and destroy
        const startAlpha = this.ghostAlpha * 255;
        tween({ alpha: startAlpha })
            .to(this.ghostDuration, { alpha: 0 }, {
                onUpdate: (target: { alpha: number }) => {
                    this.updateGhostAlphaOptimized(allRenderers, target.alpha);
                }
            })
            .call(() => ghost.destroy())
            .start();
    }

    private collectAllRenderers(node: Node): Array<MeshRenderer | SkinnedMeshRenderer> {
        const renderers: Array<MeshRenderer | SkinnedMeshRenderer> = [];
        
        // Collect from this node
        const meshRenderers = node.getComponents(MeshRenderer);
        const skinnedRenderers = node.getComponents(SkinnedMeshRenderer);
        renderers.push(...meshRenderers, ...skinnedRenderers);
        
        // Collect from children (non-recursive helper using queue)
        const queue = [...node.children];
        while (queue.length > 0) {
            const child = queue.shift()!;
            const childMesh = child.getComponents(MeshRenderer);
            const childSkinned = child.getComponents(SkinnedMeshRenderer);
            renderers.push(...childMesh, ...childSkinned);
            queue.push(...child.children);
        }
        
        return renderers;
    }

    private updateGhostAlphaOptimized(renderers: Array<MeshRenderer | SkinnedMeshRenderer>, alpha: number): void {
        for (const renderer of renderers) {
            const materialCount = renderer.materials.length;
            for (let i = 0; i < materialCount; i++) {
                const matInstance = renderer.getMaterialInstance(i);
                if (matInstance) {
                    matInstance.setProperty("mainColor", new Color(255, 255, 255, alpha));
                }
            }
        }
    }

    update(deltaTime: number) {
        
    }
}
