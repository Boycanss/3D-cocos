import { _decorator, CCFloat, Component, Node, Prefab, instantiate, Vec3, Collider } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ObstacleManager')
export class ObstacleManager extends Component {
    @property(Prefab)
    obstaclePrefab: Prefab;

    @property(Prefab)
    smallObstaclePrefab: Prefab;  // Small obstacle (small box) prefab

    @property(CCFloat)
    obstacleSpawnRadius: number = 10;  // Radius for spawning obstacles

    @property(CCFloat)
    obstacleCheckRadius: number = 2;  // Radius to check for existing obstacles

    @property(CCFloat)
    smallObstacleCheckRadius: number = 1.5;  // Smaller radius for small obstacles

    @property(Node)
    playerNode: Node;

    @property(Node)
    planeNode: Node;  // Reference to the plane/ground node

    @property(CCFloat)
    planeBoundaryPadding: number = 1;  // Padding from plane edges

    planeBounds: { minX: number; maxX: number; minZ: number; maxZ: number };

    protected onLoad(): void {
        this.calculatePlaneBounds();
    }

    private calculatePlaneBounds(): void {
        if (!this.planeNode) {
            console.warn('PlaneNode not assigned in ObstacleManager');
            return;
        }

        const planePos = this.planeNode.getWorldPosition();
        const planeScale = this.planeNode.getScale();

        // Assuming plane is 10x10 by default in Cocos Creator
        // Adjust these values based on your actual plane size
        const planeWidth = 10 * planeScale.x;
        const planeHeight = 10 * planeScale.z;

        this.planeBounds = {
            minX: planePos.x - (planeWidth / 2) + this.planeBoundaryPadding,
            maxX: planePos.x + (planeWidth / 2) - this.planeBoundaryPadding,
            minZ: planePos.z - (planeHeight / 2) + this.planeBoundaryPadding,
            maxZ: planePos.z + (planeHeight / 2) - this.planeBoundaryPadding
        };
    }

    private isWithinPlaneBounds(position: Vec3): boolean {
        if (!this.planeBounds) return true; // If no bounds set, allow spawning

        return position.x >= this.planeBounds.minX &&
               position.x <= this.planeBounds.maxX &&
               position.z >= this.planeBounds.minZ &&
               position.z <= this.planeBounds.maxZ;
    }

    private isPositionClear(position: Vec3, checkRadius: number = this.obstacleCheckRadius): boolean {
        // Check all children in the scene for obstacles
        const checkNode = (node: Node): boolean => {
            const collider = node.getComponent(Collider);
            if (collider && node !== this.playerNode) {
                const nodePos = node.getWorldPosition();
                const distance = Vec3.distance(position, nodePos);
                if (distance < checkRadius) {
                    return false; // Position is occupied
                }
            }
            
            // Check children recursively
            for (let i = 0; i < node.children.length; i++) {
                if (!checkNode(node.children[i])) {
                    return false;
                }
            }
            return true;
        };
        
        return checkNode(this.node.parent || this.node);
    }

    spawnObstacles(count: number): void {
        if (!this.obstaclePrefab) {
            console.warn('Obstacle prefab not assigned in ObstacleManager');
            return;
        }

        if (!this.playerNode) {
            console.warn('Player node not assigned in ObstacleManager');
            return;
        }

        // Calculate small obstacle count based on difficulty level
        const smallObstacleCount = this.calculateSmallObstacleCount(count);
        const largeObstacleCount = count - smallObstacleCount;

        // Spawn large obstacles
        this.spawnObstacleType(largeObstacleCount, this.obstaclePrefab, this.obstacleCheckRadius);

        // Spawn small obstacles if prefab is available
        if (this.smallObstaclePrefab && smallObstacleCount > 0) {
            this.spawnObstacleType(smallObstacleCount, this.smallObstaclePrefab, this.smallObstacleCheckRadius);
        }
    }

    /**
     * Calculate how many small obstacles should spawn based on difficulty
     */
    private calculateSmallObstacleCount(totalCount: number): number {
        const gameManager = this.node.getComponent(GameManager);
        if (!gameManager) return 0;

        const difficultyLevel = gameManager.getDifficultyLevel();

        // Small obstacles only appear in higher difficulties
        // Level 1-4: No small obstacles
        // Level 5: 30% small obstacles (interesting variation)
        // Level 6: 40% small obstacles (expert challenge)
        switch (difficultyLevel) {
            case 1:
            case 2:
                return 0;
            case 3:
                return Math.floor(totalCount * 0.1);
            case 4:
                return Math.floor(totalCount * 0.3);
            case 5:
                return Math.floor(totalCount * 0.4);
            case 6:
                return Math.floor(totalCount * 0.5);
            default:
                return 0;
        }
    }

    /**
     * Spawn obstacles of a specific type
     */
    private spawnObstacleType(count: number, prefab: Prefab, checkRadius: number): void {
        if (!prefab || count <= 0) return;

        const playerPos = this.playerNode.getWorldPosition();
        let spawnedCount = 0;
        let attempts = 0;
        const maxAttempts = count * 10; // Prevent infinite loops

        while (spawnedCount < count && attempts < maxAttempts) {
            attempts++;

            // Random angle and radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (this.obstacleSpawnRadius - 2) + 2;

            // Calculate random position
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const spawnPos = new Vec3(
                playerPos.x + offsetX,
                0,
                playerPos.z + offsetZ
            );

            // Check if position is clear and within plane bounds
            if (this.isPositionClear(spawnPos, checkRadius) && this.isWithinPlaneBounds(spawnPos)) {
                // Create obstacle instance
                const obstacle = instantiate(prefab);
                obstacle.setWorldPosition(spawnPos);

                // Add to scene
                this.node.addChild(obstacle);
                spawnedCount++;
            }
        }
    }

    /**
     * Clear all spawned obstacles
     */
    clearObstacles(): void {
        // Destroy all child obstacles
        const childrenToDestroy = [...this.node.children];
        childrenToDestroy.forEach(child => {
            child.destroy();
        });
        console.log(`🧹 Cleared ${childrenToDestroy.length} obstacles`);
    }
}
