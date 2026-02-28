export enum ObstacleType {
    LOWBOX = 'LowBox',
    HIGHBOX = 'HighBox',
    SLIDEBOX = 'SlideBox',
}

export enum Energy{
    STAMINA = 10000000,
    RUN = 2,
    JUMP = 10,
    VAULT = 5,
    DASH = 10,
    SLIDE = 3,
    WALL_RUN = 3
}

export enum MovementState {
    IDLE = "Idle",
    WALKING = "Walking",
    RUNNING = "Running",
    VAULTING = "Vaulting",
    TURNING = "Turning",
    JUMPING = "Jumping",
    SLIDING = "Sliding",
    DASHING = "Dashing",
    WALL_RUNNING = "WallRunning"
}

interface LevelState {
    boxSpawnAmount?: number;
    missileAmount?: number;
    missileSpeed?: number;
}

export enum GameLevel {
    LEVEL1 = 1,
    LEVEL2 = 2,
    LEVEL3 = 3,
    LEVEL4 = 4,
    LEVEL5 = 5
}

export const GameLevelState: Record<GameLevel, LevelState> = {
    [GameLevel.LEVEL1]: {boxSpawnAmount: 2, missileAmount: 0 },
    [GameLevel.LEVEL2]: {boxSpawnAmount: 3, missileAmount: 0 },
    [GameLevel.LEVEL3]: {boxSpawnAmount: 4, missileAmount: 1 },
    [GameLevel.LEVEL4]: {boxSpawnAmount: 5, missileAmount: 3, missileSpeed: 2 },
    [GameLevel.LEVEL5]: {boxSpawnAmount: 6, missileAmount: 5, missileSpeed: 3 },
};

// Flag System
export enum FlagLevel {
    LEVEL1 = 1,
    LEVEL2 = 2,
    LEVEL3 = 3,
    LEVEL4 = 4,
    LEVEL5 = 5
}

export interface FlagBenefits {
    scoreMultiplier: number;
    speedBoost: number;
    staminaReduction: number;
    regenBoost: number;
    dashCooldownReduction: number;
    invincibilityDuration: number;
    duration: number;
}

// Scoring System
export enum ScoreValues {
    // Continuous Actions (per second)
    SURVIVAL = 1,
    RUNNING = 2,
    WALL_RUNNING = 5,
    
    // Single Actions
    JUMP = 3,
    SLIDE = 7,
    DASH = 8,
    VAULT = 10,
    
    // Flag Collection
    FLAG_LEVEL_1 = 50,
    FLAG_LEVEL_2 = 100,
    FLAG_LEVEL_3 = 200,
    FLAG_LEVEL_4 = 350,
    FLAG_LEVEL_5 = 500,
    
    // Penalties
    DAMAGE_TAKEN = -20,
    OBSTACLE_HIT = -15,
    MISSILE_HIT = -30,
    SURVIVAL_ZONE_HIT = -50,
    IDLE_PENALTY = -5,  // per second after idle threshold
}
