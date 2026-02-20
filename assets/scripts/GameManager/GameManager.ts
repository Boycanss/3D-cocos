import { _decorator, CCFloat, Component, Label, Node, Prefab } from 'cc';
import { StaminaManager } from './StaminaManager';
import { ObstacleManager } from './ObstacleManager';
import { MovementState } from '../Define/Define';
import { Actor } from '../Actor';
import { GameLevel, GameLevelState } from '../Define/Define';
import { MissileManager } from '../Obstacle/MissileManager';
import { PlayerController } from '../PlayerController';
import { BestRunManager } from '../BestRunManager';
import { SurvivalZoneManager } from './SurvivalZoneManager';
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
    timeDisplay: Node;

    @property(Node)
    bestRunDisplay: Node;

    @property(SurvivalZoneManager)
    survivalZoneManager: SurvivalZoneManager = null;

    staminaManager: StaminaManager;
    obstacleManager: ObstacleManager;
    bestRunManager: BestRunManager;

    currentTotalStamina: number;
    previousTotalStamina: number = 0;
    currentPlayerState: MovementState;
    
    private gameTime: number = 0;
    private isTimerRunning: boolean = false;
    private startTime: number = 0;
    
    private difficultyLevel: GameLevel = GameLevel.LEVEL1;
    private lastDifficultyUpdate: number = 0;
    private difficultyIncreaseInterval: number = 30;

    protected onLoad(): void {
        this.staminaManager = this.getComponent(StaminaManager);
        this.obstacleManager = this.getComponent(ObstacleManager);
        this.bestRunManager = this.getComponent(BestRunManager);
        this.survivalZoneManager = this.getComponent(SurvivalZoneManager);
    }

    start() {
        this.resetTimer();
        this.isTimerRunning = true;
        this.startTime = Date.now();

        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                actor.node.on('actor-dead', this._onActorDead, this);
            }
        }

        // Panggil spawnZones dari SurvivalZoneManager
        if (this.survivalZoneManager) {
            this.survivalZoneManager.spawnZones();
        }

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
        this.saveBestRun();
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
        if (this.isTimerRunning) {
            this.gameTime += deltaTime;
            this.updateDifficulty();
        }
        
        this.currentPlayerState = this.playerNode.getComponent(PlayerController).getState();
        this.playerState.getComponent(Label).string = this.currentPlayerState.toString();
        if(this.currentPlayerState != MovementState.IDLE) this.checkStateforObstacle();
        
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
        this.previousTotalStamina = this.currentTotalStamina;
        
        if(currentThreshold > previousThreshold) {
            const levelState = GameLevelState[this.difficultyLevel];
            const obstaclesToSpawn = levelState.boxSpawnAmount || 3;
            
            this.obstacleManager.spawnObstacles(obstaclesToSpawn);
            
            const missilesToSpawn = levelState.missileAmount || 0;
            if (missilesToSpawn > 0) {
                const missileManager = this.node.getComponent(MissileManager);
                if (missileManager) {
                    const missileSpeed = levelState.missileSpeed || 1;
                    missileManager.spawnMissiles(missilesToSpawn, missileSpeed);
                }
            }
            return true;
        } else {
            return false;
        }   
    }

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
    
    public getFormattedTime(): string {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const milliseconds = Math.floor((this.gameTime % 1) * 100);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    private updateDifficulty() {
        const timeSinceLastUpdate = this.gameTime - this.lastDifficultyUpdate;
        
        if (timeSinceLastUpdate >= this.difficultyIncreaseInterval) {
            if (this.difficultyLevel < GameLevel.LEVEL5) {
                this.difficultyLevel++;
            }
            this.lastDifficultyUpdate = this.gameTime;
            
            console.log(`Difficulty increased to level ${this.difficultyLevel}`);
        }
    }
    
    public getDifficultyLevel(): GameLevel {
        return this.difficultyLevel;
    }

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
        this.loadBestRun();
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}
