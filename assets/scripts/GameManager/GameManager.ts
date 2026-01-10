import { _decorator, CCFloat, Component, Label, Node, Prefab, instantiate, Vec3 } from 'cc';
import { StaminaManager } from './StaminaManager';
import { MovementState } from '../Define/Define';
import { Actor } from '../Actor';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(CCFloat)
    energyForObstacle: number;

    @property(Node)
    playerNode: Node;

    @property(Node)
    playerState: Node;

    @property(Prefab)
    obstaclePrefab: Prefab;

    @property(CCFloat)
    obstacleSpawnRadius: number = 10;  // Radius for spawning obstacles

    staminaManager: StaminaManager;

    currentTotalStamina: number;
    previousTotalStamina: number = 0;
    currentPlayerState: MovementState;

    protected onLoad(): void {
        this.staminaManager = this.getComponent(StaminaManager);
    }

    start() {

        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                actor.node.on('actor-dead', this._onActorDead, this);
            }
        }
    }

    private _onActorDead(actor: Actor) {
        console.log('GameManager: actor-dead received', actor);
        this._onGameOver();
    }

    private _onGameOver() {
        console.log('Game Over');
        this.node.emit('game-over');
    }

    onDestroy() {
        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                actor.node.off('actor-dead', this._onActorDead, this);
            }
        }
    }

    update(deltaTime: number) {
        this.currentPlayerState = this.playerNode.getComponent('PlayerController').getState();
        this.playerState.getComponent(Label).string = this.currentPlayerState.toString();
        if(this.currentPlayerState != MovementState.IDLE) this.checkStateforObstacle();
    }

    checkStateforObstacle(): boolean {
        this.currentTotalStamina = this.staminaManager.getTotalUsedStamina();
        
        const previousThreshold = Math.floor(this.previousTotalStamina / this.energyForObstacle);
        const currentThreshold = Math.floor(this.currentTotalStamina / this.energyForObstacle);
        this.previousTotalStamina = this.currentTotalStamina;
        
        if(currentThreshold > previousThreshold) {
            this.spawnObstacles(3);
            return true;
        } else {
            return false;
        }   
    }

    spawnObstacles(count: number): void {
        if (!this.obstaclePrefab) return;

        const playerPos = this.playerNode.getWorldPosition();
        const spawnedObstacles: Node[] = [];

        for (let i = 0; i < count; i++) {
            // Random angle and radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (this.obstacleSpawnRadius - 2) + 2; // Avoid spawning too close  

            // Calculate random position
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;

            // Create obstacle instance
            const obstacle = instantiate(this.obstaclePrefab);
            obstacle.setWorldPosition(new Vec3(
                playerPos.x + offsetX,
                0,
                playerPos.z + offsetZ
            ));

            // Add to scene
            this.node.addChild(obstacle);
            spawnedObstacles.push(obstacle);
            console.log(`Obstacle ${i + 1} spawned at (${playerPos.x + offsetX}, 0, ${playerPos.z + offsetZ})`);
        }

        // Validate obstacles after a short delay to allow collisions to register
        this.scheduleOnce(() => {
            this._validateSpawnedObstacles(spawnedObstacles);
        }, 0.1);
    }

    private _validateSpawnedObstacles(obstacles: Node[]): void {
        for (const obstacle of obstacles) {
            if (!obstacle.isValid) continue;
            
            const obstacleComp = obstacle.getComponent('Obstacle');
            if (obstacleComp) {
                // Remove if it collided with another obstacle and not with plane
                if (obstacleComp.hasCollidedWithObstacle() && !obstacleComp.isEligible()) {
                    obstacle.destroy();
                    console.log('Obstacle destroyed: collided with another obstacle');
                }
            }
        }
    }

}


