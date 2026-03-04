import { _decorator, CCFloat, Component, Label, Node } from 'cc';
import { MovementState, ScoreValues } from '../Define/Define';
import { PlayerController } from '../PlayerController';
import { FlagBuffManager } from '../Collectible/FlagBuffManager';
import { Actor } from '../Actor';
const { ccclass, property } = _decorator;

@ccclass('ScoreManager')
export class ScoreManager extends Component {
    @property(Node)
    playerNode: Node = null;

    @property(Label)
    scoreLabel: Label = null;

    @property(Label)
    multiplierLabel: Label = null;

    @property(Label)
    comboLabel: Label = null;

    @property(CCFloat)
    idleThreshold: number = 3.0; // Seconds before idle penalty kicks in

    @property(CCFloat)
    speedBonusThreshold: number = 0.8; // 80% of max speed for bonus

    private _currentScore: number = 0;
    private _comboCount: number = 0;
    private _comboMultiplier: number = 1.0;
    private _idleTimer: number = 0;
    private _previousState: MovementState = MovementState.IDLE;
    private _previousHP: number = 100;
    private _hasTakenDamage: boolean = false;

    // Track actions for combo
    private _lastActionTime: number = 0;
    private _comboResetDelay: number = 2.0; // Seconds before combo resets

    start() {
        if (this.playerNode) {
            const actor = this.playerNode.getComponent(Actor);
            if (actor) {
                this._previousHP = actor.currentHp;
            }
        }

        this.updateScoreDisplay();
    }

    update(deltaTime: number) {
        if (!this.playerNode) return;

        const playerController = this.playerNode.getComponent(PlayerController);
        const actor = this.playerNode.getComponent(Actor);
        const flagBuffManager = this.playerNode.getComponent(FlagBuffManager);

        if (!playerController) return;

        const currentState = playerController.getState();
        const currentSpeed = playerController.currentSpeed;
        const maxSpeed = playerController.maxSpeed;

        // Award continuous points based on state
        this.awardContinuousPoints(currentState, deltaTime);

        // Check for state changes (single actions)
        this.checkStateChanges(currentState, playerController);

        // Check for damage taken
        if (actor) {
            this.checkDamageTaken(actor);
        }

        // Apply flag buff multiplier
        if (flagBuffManager && flagBuffManager.hasActiveBuff()) {
            // Flag multiplier is already applied in awardPoints()
        }

        // Apply speed bonus
        if (currentSpeed / maxSpeed >= this.speedBonusThreshold && currentState !== MovementState.IDLE) {
            // Speed bonus applied in awardContinuousPoints
        }

        // Check for idle penalty
        this.checkIdlePenalty(currentState, deltaTime);

        // Update combo timer
        this.updateComboTimer(deltaTime);

        // Update previous state
        this._previousState = currentState;

        // Update display
        this.updateScoreDisplay();
    }

    /**
     * Award continuous points based on current state
     */
    private awardContinuousPoints(state: MovementState, deltaTime: number): void {
        let points = 0;

        switch (state) {
            case MovementState.IDLE:
                points = ScoreValues.SURVIVAL * deltaTime;
                break;
            case MovementState.RUNNING:
                points = ScoreValues.RUNNING * deltaTime;
                break;
            case MovementState.WALL_RUNNING:
                points = ScoreValues.WALL_RUNNING * deltaTime;
                this.addCombo(); // Wall running adds to combo
                break;
            default:
                points = ScoreValues.SURVIVAL * deltaTime;
                break;
        }

        // Apply speed bonus
        const playerController = this.playerNode.getComponent(PlayerController);
        if (playerController && state !== MovementState.IDLE) {
            const speedRatio = playerController.currentSpeed / playerController.maxSpeed;
            if (speedRatio >= this.speedBonusThreshold) {
                points *= 1.1; // 10% speed bonus
            }
        }

        this.awardPoints(points);
    }

    /**
     * Check for state changes and award single-action points
     */
    private checkStateChanges(currentState: MovementState, playerController: PlayerController): void {
        // Detect state transitions
        if (currentState !== this._previousState) {
            switch (currentState) {
                case MovementState.JUMPING:
                    this.awardPoints(ScoreValues.JUMP);
                    this.addCombo();
                    break;
                case MovementState.SLIDING:
                    this.awardPoints(ScoreValues.SLIDE);
                    this.addCombo();
                    break;
                case MovementState.VAULTING:
                    this.awardPoints(ScoreValues.VAULT);
                    this.addCombo();
                    break;
                case MovementState.DASHING:
                    this.awardPoints(ScoreValues.DASH);
                    this.addCombo();
                    break;
            }
        }
    }

    /**
     * Check if player took damage
     */
    private checkDamageTaken(actor: Actor): void {
        if (actor.currentHp < this._previousHP) {
            const damageTaken = this._previousHP - actor.currentHp;
            this.awardPoints(ScoreValues.DAMAGE_TAKEN);
            this.resetCombo();
            this._hasTakenDamage = true;
            // console.log(`ScoreManager: Damage taken (${damageTaken}), penalty applied`);
        }
        this._previousHP = actor.currentHp;
    }

    /**
     * Check for idle penalty
     */
    private checkIdlePenalty(state: MovementState, deltaTime: number): void {
        if (state === MovementState.IDLE) {
            this._idleTimer += deltaTime;
            if (this._idleTimer >= this.idleThreshold) {
                this.awardPoints(ScoreValues.IDLE_PENALTY * deltaTime);
            }
        } else {
            this._idleTimer = 0;
        }
    }

    /**
     * Award points with multipliers applied
     */
    public awardPoints(basePoints: number): void {
        if (basePoints === 0) return;

        let finalPoints = basePoints;

        // Apply combo multiplier
        if (basePoints > 0) {
            finalPoints *= this._comboMultiplier;
        }

        // Apply flag buff multiplier
        const flagBuffManager = this.playerNode?.getComponent(FlagBuffManager);
        if (flagBuffManager && basePoints > 0) {
            const flagMultiplier = flagBuffManager.getScoreMultiplier();
            finalPoints *= flagMultiplier;
        }

        this._currentScore += finalPoints;

        // Prevent negative score
        if (this._currentScore < 0) {
            this._currentScore = 0;
        }
    }

    /**
     * Award points for flag collection
     */
    public awardFlagPoints(flagLevel: number): void {
        let points = 0;
        switch (flagLevel) {
            case 1: points = ScoreValues.FLAG_LEVEL_1; break;
            case 2: points = ScoreValues.FLAG_LEVEL_2; break;
            case 3: points = ScoreValues.FLAG_LEVEL_3; break;
            case 4: points = ScoreValues.FLAG_LEVEL_4; break;
            case 5: points = ScoreValues.FLAG_LEVEL_5; break;
        }

        this.awardPoints(points);
        this.addCombo();
        // console.log(`ScoreManager: Flag Level ${flagLevel} collected! +${points} points`);
    }

    /**
     * Add to combo counter
     */
    private addCombo(): void {
        this._comboCount++;
        this._lastActionTime = 0;

        // Update combo multiplier
        if (this._comboCount >= 10) {
            this._comboMultiplier = 2.0;
        } else if (this._comboCount >= 5) {
            this._comboMultiplier = 1.5;
        } else if (this._comboCount >= 3) {
            this._comboMultiplier = 1.2;
        } else {
            this._comboMultiplier = 1.0;
        }
    }

    /**
     * Reset combo counter
     */
    private resetCombo(): void {
        if (this._comboCount > 0) {
            // console.log(`ScoreManager: Combo broken! (${this._comboCount} actions)`);
        }
        this._comboCount = 0;
        this._comboMultiplier = 1.0;
    }

    /**
     * Update combo timer (resets if no action for too long)
     */
    private updateComboTimer(deltaTime: number): void {
        if (this._comboCount > 0) {
            this._lastActionTime += deltaTime;
            if (this._lastActionTime >= this._comboResetDelay) {
                this.resetCombo();
            }
        }
    }

    /**
     * Update score display
     */
    private updateScoreDisplay(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `${Math.floor(this._currentScore)}`;
        }

        if (this.multiplierLabel) {
            const flagBuffManager = this.playerNode?.getComponent(FlagBuffManager);
            const flagMultiplier = flagBuffManager?.getScoreMultiplier() || 1.0;
            const totalMultiplier = this._comboMultiplier * flagMultiplier;
            
            if (totalMultiplier > 1.0) {
                this.multiplierLabel.string = `x${totalMultiplier.toFixed(1)}`;
                this.multiplierLabel.node.active = true;
            } else {
                this.multiplierLabel.node.active = false;
            }
        }

        if (this.comboLabel) {
            if (this._comboCount >= 3) {
                this.comboLabel.string = `Combo: ${this._comboCount}`;
                this.comboLabel.node.active = true;
            } else {
                this.comboLabel.node.active = false;
            }
        }
    }

    /**
     * Get current score
     */
    public getScore(): number {
        return Math.floor(this._currentScore);
    }

    /**
     * Get final score with perfect run bonus
     */
    public getFinalScore(): number {
        let finalScore = this._currentScore;

        // Perfect run bonus (no damage taken)
        if (!this._hasTakenDamage) {
            finalScore *= 1.5;
            console.log('ScoreManager: Perfect Run Bonus! x1.5');
        }

        return Math.floor(finalScore);
    }

    /**
     * Reset score
     */
    public resetScore(): void {
        this._currentScore = 0;
        this._comboCount = 0;
        this._comboMultiplier = 1.0;
        this._hasTakenDamage = false;
        this._idleTimer = 0;
        this.updateScoreDisplay();
    }

    /**
     * Get score rank
     */
    public getScoreRank(): string {
        const score = this.getFinalScore();
        
        if (score >= 5001) return 'SS';
        if (score >= 3501) return 'S';
        if (score >= 2001) return 'A';
        if (score >= 1001) return 'B';
        if (score >= 501) return 'C';
        return 'D';
    }
}
