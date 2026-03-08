import { _decorator, CCFloat, Component, Label, Node, Prefab, Vec3 } from 'cc';
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
    levelDisplay: Node;

    // Removed bestRunDisplay - now handled by StartScreenUI

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
    
    // Distance tracking
    private lastPlayerPosition: Vec3 = new Vec3();
    private totalDistance: number = 0;
    private hasStartedTracking: boolean = false;
    
    private difficultyLevel: GameLevel = GameLevel.LEVEL1;
    private lastDifficultyUpdate: number = 0;
    private difficultyIncreaseInterval: number = 30;
    
    // Auto-missile system
    private lastAutoMissileTime: number = 0;
    private currentAutoMissileInterval: number = 15; // Start with Level 1 interval

    protected onLoad(): void {
        this.staminaManager = this.getComponent(StaminaManager);
        this.obstacleManager = this.getComponent(ObstacleManager);
        this.bestRunManager = this.getComponent(BestRunManager);
        this.survivalZoneManager = this.getComponent(SurvivalZoneManager);
    }

    start() {
        this.resetTimer();
        // Don't start timer automatically - let GameFlowManager control this
        this.isTimerRunning = false;
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

        // Best run display now handled by StartScreenUI
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
            this.updateAutoMissiles();
            this.updateDistanceTracking();
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

        // Update level display
        if (this.levelDisplay) {
            const levelLabel = this.levelDisplay.getComponent(Label);
            if (levelLabel) {
                levelLabel.string = `Level: ${this.difficultyLevel}`;
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
        this.initializeDistanceTracking();
    }
    
    public pauseTimer() {
        this.isTimerRunning = false;
    }
    
    public resetTimer() {
        this.gameTime = 0;
        this.difficultyLevel = GameLevel.LEVEL1;
        this.lastDifficultyUpdate = 0;
        this.difficultyIncreaseInterval = 30; // Reset to initial interval
        
        // Reset auto-missile system
        this.lastAutoMissileTime = 0;
        this.currentAutoMissileInterval = 15; // Reset to Level 1 interval
        
        // Reset distance tracking
        this.totalDistance = 0;
        this.hasStartedTracking = false;
        this.bestRunManager.resetCurrentDistance();
        
        this.isTimerRunning = false;
        if (this.timeDisplay) {
            const timeLabel = this.timeDisplay.getComponent(Label);
            if (timeLabel) {
                timeLabel.string = '00:00.00';
            }
        }
        
        // Reset level display
        if (this.levelDisplay) {
            const levelLabel = this.levelDisplay.getComponent(Label);
            if (levelLabel) {
                levelLabel.string = 'Level: 1';
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
            if (this.difficultyLevel < GameLevel.LEVEL6) {
                this.difficultyLevel++;
                this.lastDifficultyUpdate = this.gameTime;
                
                // Update interval for next level - progressively longer survival requirements
                this.difficultyIncreaseInterval = this.getDifficultyInterval(this.difficultyLevel);
                
                // Update auto-missile interval for new difficulty level
                const levelState = GameLevelState[this.difficultyLevel];
                this.currentAutoMissileInterval = levelState.autoMissileInterval || 15;
                
                // console.log(`Difficulty increased to level ${this.difficultyLevel}, next interval: ${this.difficultyIncreaseInterval}s, auto-missile interval: ${this.currentAutoMissileInterval}s`);
            }
        }
    }

    private updateAutoMissiles() {
        const timeSinceLastAutoMissile = this.gameTime - this.lastAutoMissileTime;
        
        if (timeSinceLastAutoMissile >= this.currentAutoMissileInterval) {
            this.spawnAutoMissiles();
            this.lastAutoMissileTime = this.gameTime;
        }
    }

    private spawnAutoMissiles() {
        const levelState = GameLevelState[this.difficultyLevel];
        const missileCount = levelState.autoMissileCount || 1;
        const missileSpeed = levelState.autoMissileSpeed || 1.0;
        
        const missileManager = this.node.getComponent(MissileManager);
        if (missileManager) {
            missileManager.spawnMissiles(missileCount, missileSpeed);
            // console.log(`Auto-spawned ${missileCount} missiles at speed ${missileSpeed} (Level ${this.difficultyLevel})`);
        }
    }

    private getDifficultyInterval(level: GameLevel): number {
        switch (level) {
            case GameLevel.LEVEL1: return 30;  // 30s to reach Level 2
            case GameLevel.LEVEL2: return 45;  // 45s to reach Level 3 (75s total)
            case GameLevel.LEVEL3: return 60;  // 60s to reach Level 4 (135s total)
            case GameLevel.LEVEL4: return 75;  // 75s to reach Level 5 (210s total)
            case GameLevel.LEVEL5: return 90;  // 90s to reach Level 6 (300s total)
            case GameLevel.LEVEL6: return 120; // Stay at Level 6 (ultimate endurance test)
            default: return 30;
        }
    }
    
    public getDifficultyLevel(): GameLevel {
        return this.difficultyLevel;
    }

    private saveBestRun() {
        const totalTime = this.getGameTime();
        this.bestRunManager.saveBestTime(totalTime);
        // Best run display now handled by StartScreenUI
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    /**
     * Initialize distance tracking when game starts
     */
    private initializeDistanceTracking(): void {
        if (this.playerNode) {
            this.lastPlayerPosition = this.playerNode.worldPosition.clone();
            this.totalDistance = 0;
            this.hasStartedTracking = true;
            console.log("📏 Distance tracking initialized");
        }
    }

    /**
     * Update distance tracking based on player movement
     */
    private updateDistanceTracking(): void {
        if (!this.hasStartedTracking || !this.playerNode) return;

        const currentPosition = this.playerNode.worldPosition.clone();
        
        // Calculate distance moved since last frame (only X and Z, ignore Y for jumping)
        const lastPos2D = new Vec3(this.lastPlayerPosition.x, 0, this.lastPlayerPosition.z);
        const currentPos2D = new Vec3(currentPosition.x, 0, currentPosition.z);
        const distanceMoved = Vec3.distance(lastPos2D, currentPos2D);
        
        // Only count significant movement to avoid jitter
        if (distanceMoved > 0.01) {
            this.totalDistance += distanceMoved;
            
            // Update BestRunManager with current distance
            this.bestRunManager.updateDistance(this.totalDistance);
            
            // Update last position
            this.lastPlayerPosition = currentPosition.clone();
        }
    }

    /**
     * Get total distance traveled this run
     */
    public getTotalDistance(): number {
        return this.totalDistance;
    }
}