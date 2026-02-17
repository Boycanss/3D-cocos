export enum ObstacleType {
    LOWBOX = 'LowBox',
    HIGHBOX = 'HighBox' 
}

export enum Energy{
    STAMINA = 10000000,
    RUN = 2,
    JUMP = 10,
    VAULT = 5,
    DASH = 10,
    SLIDE = 3
}

export enum MovementState {
    IDLE = "Idle",
    WALKING = "Walking",
    RUNNING = "Running",
    VAULTING = "Vaulting",
    TURNING = "Turning",
    JUMPING = "Jumping",
    SLIDING = "Sliding"
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
