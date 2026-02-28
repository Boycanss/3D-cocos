import { _decorator, Component, Node } from 'cc';
import { FlagLevel, FlagBenefits } from '../Define/Define';
import { PlayerController } from '../PlayerController';
import { StaminaManager } from '../GameManager/StaminaManager';
import { Actor } from '../Actor';
const { ccclass, property } = _decorator;

interface ActiveBuff {
    level: FlagLevel;
    benefits: FlagBenefits;
    duration: number;
    remainingTime: number;
}

@ccclass('FlagBuffManager')
export class FlagBuffManager extends Component {
    private _activeBuff: ActiveBuff | null = null;
    private _playerController: PlayerController = null;
    private _staminaManager: StaminaManager = null;
    private _actor: Actor = null;

    // Store original values to restore after buff expires
    private _originalMaxSpeed: number = 0;
    private _originalDashCooldown: number = 0;
    private _originalStaminaRegenRate: number = 0;

    // Current multipliers
    private _currentScoreMultiplier: number = 1.0;
    private _currentSpeedMultiplier: number = 1.0;
    private _currentStaminaReduction: number = 0;
    private _currentRegenBoost: number = 0;
    private _currentDashCooldownReduction: number = 0;
    private _isInvincible: boolean = false;

    start() {
        this._playerController = this.node.getComponent(PlayerController);
        this._staminaManager = this.node.getComponent(StaminaManager);
        this._actor = this.node.getComponent(Actor);

        // Store original values
        if (this._playerController) {
            this._originalMaxSpeed = this._playerController.maxSpeed;
            this._originalDashCooldown = this._playerController.dashCooldown;
        }
        if (this._staminaManager) {
            this._originalStaminaRegenRate = this._staminaManager.staminaRegenRate;
        }

        // Listen for damage events to apply invincibility
        if (this._actor) {
            const originalTakeDamage = this._actor.takeDamage.bind(this._actor);
            this._actor.takeDamage = (amount: number) => {
                if (this._isInvincible) {
                    console.log('FlagBuffManager: Damage blocked by invincibility!');
                    return;
                }
                originalTakeDamage(amount);
            };
        }
    }

    update(deltaTime: number) {
        if (this._activeBuff) {
            this._activeBuff.remainingTime -= deltaTime;

            if (this._activeBuff.remainingTime <= 0) {
                this.removeBuff();
            }
        }
    }

    /**
     * Apply a flag buff to the player
     */
    public applyFlagBuff(level: FlagLevel): void {
        // Remove existing buff if any
        if (this._activeBuff) {
            this.removeBuff();
        }

        // Get benefits for this flag level
        const benefits = this.getFlagBenefits(level);

        // Create new buff
        this._activeBuff = {
            level: level,
            benefits: benefits,
            duration: benefits.duration,
            remainingTime: benefits.duration
        };

        // Apply buff effects
        this.applyBuffEffects(benefits);

        console.log(`FlagBuffManager: Applied Level ${level} buff for ${benefits.duration}s`);
        this.logBuffDetails(benefits);
    }

    /**
     * Get benefits for a specific flag level
     */
    private getFlagBenefits(level: FlagLevel): FlagBenefits {
        switch (level) {
            case FlagLevel.LEVEL1:
                return {
                    scoreMultiplier: 1.0,
                    speedBoost: 0.05,
                    staminaReduction: 0,
                    regenBoost: 0,
                    dashCooldownReduction: 0,
                    invincibilityDuration: 0,
                    duration: 10
                };
            case FlagLevel.LEVEL2:
                return {
                    scoreMultiplier: 1.5,
                    speedBoost: 0.10,
                    staminaReduction: 0.10,
                    regenBoost: 0,
                    dashCooldownReduction: 0,
                    invincibilityDuration: 0,
                    duration: 12
                };
            case FlagLevel.LEVEL3:
                return {
                    scoreMultiplier: 2.0,
                    speedBoost: 0.15,
                    staminaReduction: 0.20,
                    regenBoost: 0.25,
                    dashCooldownReduction: 0,
                    invincibilityDuration: 0,
                    duration: 15
                };
            case FlagLevel.LEVEL4:
                return {
                    scoreMultiplier: 2.5,
                    speedBoost: 0.20,
                    staminaReduction: 0.30,
                    regenBoost: 0.50,
                    dashCooldownReduction: 0.25,
                    invincibilityDuration: 0,
                    duration: 18
                };
            case FlagLevel.LEVEL5:
                return {
                    scoreMultiplier: 3.0,
                    speedBoost: 0.25,
                    staminaReduction: 0.40,
                    regenBoost: 0.75,
                    dashCooldownReduction: 0.50,
                    invincibilityDuration: 2.0,
                    duration: 20
                };
            default:
                return {
                    scoreMultiplier: 1.0,
                    speedBoost: 0,
                    staminaReduction: 0,
                    regenBoost: 0,
                    dashCooldownReduction: 0,
                    invincibilityDuration: 0,
                    duration: 10
                };
        }
    }

    /**
     * Apply buff effects to player stats
     */
    private applyBuffEffects(benefits: FlagBenefits): void {
        // Apply score multiplier
        this._currentScoreMultiplier = benefits.scoreMultiplier;

        // Apply speed boost
        if (this._playerController && benefits.speedBoost > 0) {
            this._currentSpeedMultiplier = 1 + benefits.speedBoost;
            this._playerController.maxSpeed = this._originalMaxSpeed * this._currentSpeedMultiplier;
        }

        // Apply stamina reduction (handled in getStaminaCostMultiplier)
        this._currentStaminaReduction = benefits.staminaReduction;

        // Apply regen boost
        if (this._staminaManager && benefits.regenBoost > 0) {
            this._currentRegenBoost = benefits.regenBoost;
            this._staminaManager.staminaRegenRate = this._originalStaminaRegenRate * (1 + benefits.regenBoost);
        }

        // Apply dash cooldown reduction
        if (this._playerController && benefits.dashCooldownReduction > 0) {
            this._currentDashCooldownReduction = benefits.dashCooldownReduction;
            this._playerController.dashCooldown = this._originalDashCooldown * (1 - benefits.dashCooldownReduction);
        }

        // Apply invincibility
        if (benefits.invincibilityDuration > 0) {
            this._isInvincible = true;
            this.scheduleOnce(() => {
                this._isInvincible = false;
                console.log('FlagBuffManager: Invincibility expired');
            }, benefits.invincibilityDuration);
        }
    }

    /**
     * Remove active buff and restore original stats
     */
    private removeBuff(): void {
        if (!this._activeBuff) return;

        console.log(`FlagBuffManager: Buff expired (Level ${this._activeBuff.level})`);

        // Restore original values
        if (this._playerController) {
            this._playerController.maxSpeed = this._originalMaxSpeed;
            this._playerController.dashCooldown = this._originalDashCooldown;
        }
        if (this._staminaManager) {
            this._staminaManager.staminaRegenRate = this._originalStaminaRegenRate;
        }

        // Reset multipliers
        this._currentScoreMultiplier = 1.0;
        this._currentSpeedMultiplier = 1.0;
        this._currentStaminaReduction = 0;
        this._currentRegenBoost = 0;
        this._currentDashCooldownReduction = 0;
        this._isInvincible = false;

        this._activeBuff = null;
    }

    /**
     * Get current score multiplier (for scoring system)
     */
    public getScoreMultiplier(): number {
        return this._currentScoreMultiplier;
    }

    /**
     * Get stamina cost multiplier (1.0 = normal, 0.7 = 30% reduction)
     */
    public getStaminaCostMultiplier(): number {
        return 1.0 - this._currentStaminaReduction;
    }

    /**
     * Check if player is currently invincible
     */
    public isInvincible(): boolean {
        return this._isInvincible;
    }

    /**
     * Get remaining buff time
     */
    public getRemainingBuffTime(): number {
        return this._activeBuff ? this._activeBuff.remainingTime : 0;
    }

    /**
     * Get active buff level (0 if no buff)
     */
    public getActiveBuffLevel(): FlagLevel | null {
        return this._activeBuff ? this._activeBuff.level : null;
    }

    /**
     * Check if a buff is currently active
     */
    public hasActiveBuff(): boolean {
        return this._activeBuff !== null;
    }

    /**
     * Log buff details for debugging
     */
    private logBuffDetails(benefits: FlagBenefits): void {
        console.log('=== Flag Buff Details ===');
        console.log(`Score Multiplier: ${benefits.scoreMultiplier}x`);
        console.log(`Speed Boost: +${(benefits.speedBoost * 100).toFixed(0)}%`);
        console.log(`Stamina Reduction: -${(benefits.staminaReduction * 100).toFixed(0)}%`);
        console.log(`Regen Boost: +${(benefits.regenBoost * 100).toFixed(0)}%`);
        console.log(`Dash Cooldown Reduction: -${(benefits.dashCooldownReduction * 100).toFixed(0)}%`);
        if (benefits.invincibilityDuration > 0) {
            console.log(`Invincibility: ${benefits.invincibilityDuration}s`);
        }
        console.log(`Duration: ${benefits.duration}s`);
        console.log('========================');
    }
}
