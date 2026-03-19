import { _decorator, CCFloat, Component, Label, Node, Prefab, Vec3, screen } from 'cc';
import { StaminaManager } from './StaminaManager';
import { CrazyGamesManager } from '../Utils/CrazyGamesManager';
import { ObstacleManager } from './ObstacleManager';
import { MovementState, ObstacleType, PlatformUtils } from '../Define/Define';
import { Actor } from '../Actor';
import { GameLevel, GameLevelState } from '../Define/Define';
import { MissileManager } from '../Obstacle/MissileManager';
import { AtomicBombManager } from '../Obstacle/AtomicBombManager';
import { PlayerController } from '../PlayerController';
import { BestRunManager } from '../BestRunManager';
import { SurvivalZoneManager } from './SurvivalZoneManager';
import { Box } from '../Obstacle/Box';
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

    @property(Node)
    LowBoxes: Node;

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
    
    // Auto-atomic bomb system (Level 7+)
    private lastAutoAtomicBombTime: number = 0;
    private currentAutoAtomicBombInterval: number = 8; // Level 7 interval
    
    private _isMobile: boolean;

    protected onLoad(): void {
        this._isMobile = PlatformUtils.isMobile();
        if(this._isMobile){
            screen.requestFullScreen();
        }
        this.staminaManager = this.getComponent(StaminaManager);
        this.obstacleManager = this.getComponent(ObstacleManager);
        this.bestRunManager = this.getComponent(BestRunManager);
        this.survivalZoneManager = this.getComponent(SurvivalZoneManager);
    }

    start() {
        CrazyGamesManager.instance?.notifyLoadingFinished();
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
        CrazyGamesManager.instance?.notifyGameplayStop();
        CrazyGamesManager.instance?.happytime();
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
            // this.updateAutoAtomicBombs();
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
        CrazyGamesManager.instance?.notifyGameplayStart();
    }
    
    public pauseTimer() {
        this.isTimerRunning = false;
        CrazyGamesManager.instance?.notifyGameplayStop();
    }
    
    public resetTimer() {
        this.gameTime = 0;
        this.difficultyLevel = GameLevel.LEVEL1;
        this.lastDifficultyUpdate = 0;
        this.difficultyIncreaseInterval = 30; // Reset to initial interval
        
        // Reset auto-missile system
        this.lastAutoMissileTime = 0;
        this.currentAutoMissileInterval = 15; // Reset to Level 1 interval
        
        // Reset auto-atomic bomb system
        this.lastAutoAtomicBombTime = 0;
        this.currentAutoAtomicBombInterval = 8; // Reset to Level 7 interval
        
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
        this.resetLowBoxScaleSize();
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

    private reduceLowBoxScaleSize(){
        this.LowBoxes.children.forEach((box: Node)=>{
            const boxScript = box.getComponent(Box);
            if(boxScript.boxType != null && boxScript.boxType == ObstacleType.LOWBOX){
                box.setScale(box.scale.x - (boxScript.getInitScaleSize().x*0.15), box.scale.y, box.scale.z - (boxScript.getInitScaleSize().z*0.15))
            }
        })
    }

    private resetLowBoxScaleSize(){
        this.LowBoxes.children.forEach((box: Node)=>{
            const boxScript = box.getComponent(Box);
            if(boxScript.boxType != null && boxScript.boxType == ObstacleType.LOWBOX){
                boxScript.resetScaleSize();
            }
        })
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
                
                // // Update auto-atomic bomb interval for Level 7+
                // if (this.difficultyLevel >= GameLevel.LEVEL7) {
                //     this.currentAutoAtomicBombInterval = levelState.atomicBombInterval || 8;
                // }
                if(this.difficultyLevel >= GameLevel.LEVEL3){
                    this.reduceLowBoxScaleSize();
                }
                
                console.log(`🎮 Difficulty increased to level ${this.difficultyLevel}, next interval: ${this.difficultyIncreaseInterval}s`);
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

    // private updateAutoAtomicBombs() {
    //     // Only spawn atomic bombs at Level 7+
    //     if (this.difficultyLevel < GameLevel.LEVEL7) return;
        
    //     const timeSinceLastAutoAtomicBomb = this.gameTime - this.lastAutoAtomicBombTime;
        
    //     if (timeSinceLastAutoAtomicBomb >= this.currentAutoAtomicBombInterval) {
    //         this.spawnAutoAtomicBombs();
    //         this.lastAutoAtomicBombTime = this.gameTime;
    //     }
    // }

    private spawnAutoAtomicBombs() {
        const levelState = GameLevelState[this.difficultyLevel];
        const bombCount = levelState.atomicBombAmount || 1;
        const bombSpeed = levelState.atomicBombSpeed || 1.0;
        
        const atomicBombManager = this.node.getComponent(AtomicBombManager);
        if (atomicBombManager) {
            atomicBombManager.spawnAtomicBombs(bombCount, bombSpeed);
            console.log(`💣 Auto-spawned ${bombCount} atomic bombs at speed ${bombSpeed} (Level ${this.difficultyLevel})`);
        }
    }

    private getDifficultyInterval(level: GameLevel): number {
        switch (level) {
            case GameLevel.LEVEL1: return 30;  // 30s to reach Level 2
            case GameLevel.LEVEL2: return 45;  // 45s to reach Level 3 (75s total)
            case GameLevel.LEVEL3: return 60;  // 60s to reach Level 4 (135s total)
            case GameLevel.LEVEL4: return 75;  // 75s to reach Level 5 (210s total)
            case GameLevel.LEVEL5: return 90;  // 90s to reach Level 6 (300s total)
            case GameLevel.LEVEL6: return 120; // 120s to reach Level 7 (420s total)
            // case GameLevel.LEVEL7: return 120; // Stay at Level 7 (ultimate endurance test with atomic bombs)
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