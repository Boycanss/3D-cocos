export enum ObstacleType {
    LOWBOX = 'LowBox',
    HIGHBOX = 'HighBox' 
}

export enum Energy{
    STAMINA = 100,
    RUN = 2,
    JUMP = 5,
    VAULT = 10
}

export enum MovementState {
    IDLE = "Idle",
    WALKING = "Walking",
    RUNNING = "Running",
    VAULTING = "Vaulting",
    TURNING = "Turning",
    JUMPING = "Jumping"
}