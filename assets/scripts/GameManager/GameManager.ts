import { _decorator, CCFloat, Component, Label, Node, Prefab } from 'cc';
import { StaminaManager } from './StaminaManager';
import { ObstacleManager } from './ObstacleManager';
import { MovementState } from '../Define/Define';
import { Actor } from '../Actor';
import { GameLevel, GameLevelState } from '../Define/Define';
import { MissileManager } from '../Obstacle/MissileManager';
import { PlayerController } from '../PlayerController';
import { BestRunManager } from '../BestRunManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(CCFloat)
    energyForObstacle: number;

    @property(Node)
    playerNode: Node;

    @property(Node)
    playerState: Node;
    
    @property(Node)
    timeDisplay: Node; // New property for time display

    @property(Node)
    bestRunDisplay: Node; // New property for best run display

    staminaManager: StaminaManager;
    obstacleManager: ObstacleManager;
    bestRunManager: BestRunManager;

    currentTotalStamina: number;
    previousTotalStamina: number = 0;
    currentPlayerState: MovementState;
    
    // Game timer properties
    private gameTime: number = 0;
    private isTimerRunning: boolean = false;
    private startTime: number = 0; // To track when the game started
    
    // Difficulty system properties
    private difficultyLevel: GameLevel = GameLevel.LEVEL1;
    private lastDifficultyUpdate: number = 0;
    private difficultyIncreaseInterval: number = 30; // Increase difficulty every 30 seconds

    protected onLoad(): void {
        this.staminaManager = this.getComponent(StaminaManager);
        this.obstacleManager = this.getComponent(ObstacleManager);
        this.bestRunManager = this.getComponent(BestRunManager);
    }

    start() {
        this.resetTimer();
        this.isTimerRunning = true;
        this.startTime = Date.now(); // Record start time

        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                actor.node.on('actor-dead', this._onActorDead, this);
            }
        }
        
        // Load best run display on start
        this.loadBestRun();
    }

    private _onActorDead(actor: Actor) {
        console.log('GameManager: actor-dead received', actor);
        this._onGameOver();
    }

    private _onGameOver() {
        console.log('Game Over');
        this.isTimerRunning = false;
        this.node.emit('game-over');
        this.saveBestRun(); // Save best run on game over
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
        // Update game timer
        if (this.isTimerRunning) {
            this.gameTime += deltaTime;
            
            // Check for difficulty level increase
            this.updateDifficulty();
        }
        
        this.currentPlayerState = this.playerNode.getComponent(PlayerController).getState();
        this.playerState.getComponent(Label).string = this.currentPlayerState.toString();
        if(this.currentPlayerState != MovementState.IDLE) this.checkStateforObstacle();
        
        // Update time display
        if (this.timeDisplay) {
            const timeLabel = this.timeDisplay.getComponent(Label);
            if (timeLabel) {
                const minutes = Math.floor(this.gameTime / 60);
                const seconds = Math.floor(this.gameTime % 60);
                const milliseconds = Math.floor((this.gameTime % 1) * 100);
                timeLabel.string = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
            }
        }
    }

    checkStateforObstacle(): boolean {
        this.currentTotalStamina = this.staminaManager.getTotalUsedStamina();
        
        const previousThreshold = Math.floor(this.previousTotalStamina / this.energyForObstacle);
        const currentThreshold = Math.floor(this.currentTotalStamina / this.energyForObstacle);
        this.previousTotalStamina = currentTotalStamina;
        
        if(currentThreshold > previousThreshold) {
            // Get level-specific obstacle configuration
            const levelState = GameLevelState[this.difficultyLevel];
            const obstaclesToSpawn = levelState.boxSpawnAmount || 3;
            
            // Apply difficulty scaling to obstacle spawning
            this.obstacleManager.spawnObstacles(obstaclesToSpawn);
            
            // Spawn missiles based on level state
            const missilesToSpawn = levelState.missileAmount || 0;
            if (missilesToSpawn > 0) {
                // Assuming there's a missile manager component on the game manager node
                const missileManager = this.node.getComponent(MissileManager);
                if (missileManager) {
                    // Pass missile speed to spawnMissiles method
                    const missileSpeed = levelState.missileSpeed || 1;
                    missileManager.spawnMissiles(missilesToSpawn, missileSpeed);
                }
            }
            return true;
        } else {
            return false;
        }   
    }

    // Timer methods
    public startTimer() {
        this.isTimerRunning = true;
    }
    
    public pauseTimer() {
        this.isTimerRunning = false;
    }
    
    public resetTimer() {
        this.gameTime = 0;
        this.difficultyLevel = GameLevel.LEVEL1;
        this.lastDifficultyUpdate = 0;
        this.isTimerRunning = false;
        if (this.timeDisplay) {
            const timeLabel = this.timeDisplay.getComponent(Label);
            if (timeLabel) {
                timeLabel.string = '00:00.00';
            }
        }
    }
    
    public getGameTime(): number {
        return this.gameTime;
    }
    
    public isTimerActive(): boolean {
        return this.isTimerRunning;
    }
    
    // Additional timer methods
    public getFormattedTime(): string {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const milliseconds = Math.floor((this.gameTime % 1) * 100);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    // Difficulty system methods
    private updateDifficulty() {
        const timeSinceLastUpdate = this.gameTime - this.lastDifficultyUpdate;
        
        if (timeSinceLastUpdate >= this.difficultyIncreaseInterval) {
            // Increment difficulty level using the enum
            if (this.difficultyLevel < GameLevel.LEVEL5) {
                this.difficultyLevel++;
            }
            this.lastDifficultyUpdate = this.gameTime;
            
            console.log(`Difficulty increased to level ${this.difficultyLevel}`);
            
            // Optional: Update other game parameters based on difficulty
            // For example, increase obstacle speed or reduce spawn intervals
        }
    }
    
    public getDifficultyLevel(): GameLevel {
        return this.difficultyLevel;
    }

    // Best Run Methods
    private loadBestRun() {
        if (this.bestRunDisplay) {
            const label = this.bestRunDisplay.getComponent(Label);
            if (label) {
                const bestTime = this.bestRunManager.getBestTime();
                label.string = `Best Time: ${this.formatTime(bestTime)}`;
            }
        }
    }

    private saveBestRun() {
        const totalTime = this.getGameTime();
        this.bestRunManager.saveBestTime(totalTime);
        this.loadBestRun(); // Update display immediately
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}
