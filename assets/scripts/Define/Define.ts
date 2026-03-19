export enum ObstacleType {
    LOWBOX = 'LowBox',
    HIGHBOX = 'HighBox',
    SLIDEBOX = 'SlideBox',
}

// Floating Stat Display Colors
export enum StatDisplayColor {
    // Light blue for increases (health/stamina gain)
    INCREASE_R = 100,
    INCREASE_G = 200,
    INCREASE_B = 255,
    
    // Red for decreases (damage/stamina loss)
    DECREASE_R = 255,
    DECREASE_G = 80,
    DECREASE_B = 80,
}

// Energy/Stamina costs - Fine-tuned for balanced gameplay
export enum Energy{
    STAMINA = 100,          
    RUN = 1.5,              
    JUMP = 8,               
    VAULT = 4,              
    DASH = 12,              
    SLIDE = 4,              
    WALL_RUN = 2.5,         
    
    // Stamina regeneration
    STAMINA_REGEN_RATE = 1.5  
}

// Health system constants
export enum Health {
    MAX_HP = 100,           // Maximum health points
    REGEN_RATE = 5.0,       // HP per second when regenerating
    REGEN_DELAY = 3.0       // Seconds after damage before regen starts
}

// Physics constants for movement
export enum Physics {
    JUMP_VELOCITY_BASE = 8.5,       // Base jump velocity multiplier
    JUMP_VELOCITY_MIN = 6.0,        // Minimum jump velocity
    GRAVITY = 0.5,                  // Gravity force
    SLIDE_DOWNWARD_VELOCITY = -0.5, // Downward velocity during slide
    WALL_RUN_VELOCITY = 0,          // Vertical velocity during wall run
    GROUNDED_VELOCITY = -0.5        // Velocity when grounded
}

// Damage system constants
export enum Damage {
    OBSTACLE_DAMAGE = 10,           // Standard obstacle damage
    MISSILE_DAMAGE = 25,            // Missile damage
    ATOMIC_BOMB_DAMAGE = 50,        // Atomic bomb damage
    SURVIVAL_ZONE_DAMAGE = 15       // Survival zone damage per second
}

// Timing constants
export enum Timing {
    FLAG_SPAWN_INTERVAL = 15.0,     // Seconds between flag spawns
    FLAG_INITIAL_DELAY = 5.0,       // Initial delay before first flag spawn
    DAMAGE_COOLDOWN = 0.05,         // Seconds between damage hits
    COMBO_RESET_DELAY = 2.0,        // Seconds before combo resets
    IDLE_THRESHOLD = 3.0            // Seconds before idle penalty
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
    WALL_RUNNING = "WallRunning",
    TRIPPING = "Tripping"
}

// Platform Detection
export enum PlatformType {
    DESKTOP = "Desktop",
    MOBILE = "Mobile",
    WEB = "Web"
}

export class PlatformUtils {
    private static _currentPlatform: PlatformType | null = null;

    public static getCurrentPlatform(): PlatformType {
        if (this._currentPlatform !== null) {
            return this._currentPlatform;
        }

        // Check if running on mobile
        if (typeof window !== 'undefined' && window.navigator) {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            
            if (isMobile) {
                this._currentPlatform = PlatformType.MOBILE;
                return this._currentPlatform;
            }
        }

        // Check for touch support
        if (typeof window !== 'undefined' && 'ontouchstart' in window) {
            this._currentPlatform = PlatformType.MOBILE;
            return this._currentPlatform;
        }

        // Default to desktop
        this._currentPlatform = PlatformType.DESKTOP;
        return this._currentPlatform;
    }

    public static isMobile(): boolean {
        return this.getCurrentPlatform() === PlatformType.MOBILE;
    }

    public static isDesktop(): boolean {
        return this.getCurrentPlatform() === PlatformType.DESKTOP;
    }
}

interface LevelState {
    boxSpawnAmount?: number;
    missileAmount?: number;
    missileSpeed?: number;
    autoMissileInterval?: number;  // Time between auto-deployed missiles (seconds)
    autoMissileSpeed?: number;     // Speed of auto-deployed missiles
    autoMissileCount?: number;     // Number of missiles per auto-deployment
    atomicBombAmount?: number;     // Number of atomic bombs to spawn
    atomicBombInterval?: number;   // Time between atomic bomb spawns (seconds)
    atomicBombSpeed?: number;      // Speed multiplier for atomic bombs
}

export enum GameLevel {
    LEVEL1 = 1,
    LEVEL2 = 2,
    LEVEL3 = 3,
    LEVEL4 = 4,
    LEVEL5 = 5,
    LEVEL6 = 6,
}

// Difficulty progression - Fine-tuned for gradual challenge increase
export const GameLevelState: Record<GameLevel, LevelState> = {
    [GameLevel.LEVEL1]: {
        boxSpawnAmount: 2,      // Easy start - few obstacles
        missileAmount: 0,       // No missiles - learn mechanics
        autoMissileInterval: 15, // Auto missile every 15 seconds
        autoMissileSpeed: 0.8,  // Slow auto missiles
        autoMissileCount: 1     // Single missile
    },
    [GameLevel.LEVEL2]: {
        boxSpawnAmount: 3,      // More obstacles
        missileAmount: 1,       // Introduce missiles (reduced from 0)
        missileSpeed: 1.0,      // Slow missiles to learn dodging
        autoMissileInterval: 12, // More frequent auto missiles
        autoMissileSpeed: 1.0,  // Slightly faster auto missiles
        autoMissileCount: 1     // Single missile
    },
    [GameLevel.LEVEL3]: {
        boxSpawnAmount: 4,      // Moderate obstacles
        missileAmount: 2,       // More missiles (increased from 1)
        missileSpeed: 1.5,      // Faster missiles
        autoMissileInterval: 10, // Even more frequent
        autoMissileSpeed: 1.3,  // Faster auto missiles
        autoMissileCount: 1     // Single missile
    },
    [GameLevel.LEVEL4]: {
        boxSpawnAmount: 5,      // Many obstacles
        missileAmount: 3,       // Multiple missiles
        missileSpeed: 2.0,      // Fast missiles
        autoMissileInterval: 8,  // High frequency
        autoMissileSpeed: 1.6,  // Fast auto missiles
        autoMissileCount: 2     // Double missiles
    },
    [GameLevel.LEVEL5]: {
        boxSpawnAmount: 6,      // Maximum obstacles
        missileAmount: 4,       // Many missiles (reduced from 5 for balance)
        missileSpeed: 2.5,      // Very fast missiles (reduced from 3)
        autoMissileInterval: 6,  // Very frequent
        autoMissileSpeed: 2.0,  // Very fast auto missiles
        autoMissileCount: 2     // Double missiles
    },
    [GameLevel.LEVEL6]: {
        boxSpawnAmount: 7,      // Expert level obstacle density
        missileAmount: 5,       // Maximum missiles for expert players
        missileSpeed: 3.0,      // Fastest missiles - requires mastery
        autoMissileInterval: 4,  // Extremely frequent - constant pressure
        autoMissileSpeed: 2.5,  // Extremely fast auto missiles
        autoMissileCount: 3     // Triple missile barrage
    }
};

// Flag System
export enum FlagLevel {
    LEVEL1 = 1,
    LEVEL2 = 2,
    LEVEL3 = 3,
    LEVEL4 = 4,
    LEVEL5 = 5,
    LEVEL6 = 6
}

export interface FlagBenefits {
    scoreMultiplier: number;        // Score multiplier (1.0 = normal, 2.0 = double)
    speedBoost: number;             // Speed boost percentage (0.1 = 10% faster)
    staminaReduction: number;       // Stamina cost reduction (0.2 = 20% less stamina used)
    regenBoost: number;             // Stamina regen boost (0.5 = 50% faster regen)
    dashCooldownReduction: number;  // Dash cooldown reduction (0.25 = 25% faster cooldown)
    invincibilityDuration: number;  // Seconds of invincibility (0 = none)
    duration: number;               // How long the buff lasts in seconds
    healthRestore: number;          // Instant health restoration on collection
    staminaRestore: number;         // Instant stamina restoration on collection
}

// Flag Restoration Values - Instant rewards on collection
export enum FlagRestoration {
    HEALTH_LEVEL_1 = 2,    
    HEALTH_LEVEL_2 = 5,    
    HEALTH_LEVEL_3 = 15,    
    HEALTH_LEVEL_4 = 30,    
    HEALTH_LEVEL_5 = 50,   
    HEALTH_LEVEL_6 = 75,   // Expert level - maximum health restoration
    
    STAMINA_LEVEL_1 = 10,   
    STAMINA_LEVEL_2 = 15,   
    STAMINA_LEVEL_3 = 22,   
    STAMINA_LEVEL_4 = 35,   
    STAMINA_LEVEL_5 = 55,  
    STAMINA_LEVEL_6 = 80,  // Expert level - maximum stamina restoration
}

// Scoring System - Fine-tuned for rewarding skilled play
export enum ScoreValues {
    // Continuous Actions (per second) - Passive income
    SURVIVAL = 1,           
    RUNNING = 3,            
    WALL_RUNNING = 8,       
    
    // Single Actions - Parkour moves
    JUMP = 5,               
    SLIDE = 10,             
    DASH = 12,              
    VAULT = 15,             
    
    // Flag Collection - Major rewards scale with difficulty
    FLAG_LEVEL_1 = 100,     
    FLAG_LEVEL_2 = 200,     
    FLAG_LEVEL_3 = 400,     
    FLAG_LEVEL_4 = 700,     
    FLAG_LEVEL_5 = 1000,
    FLAG_LEVEL_6 = 1500,    // Expert level - maximum score reward    
    
    // Penalties - Balanced to hurt but not devastate
    DAMAGE_TAKEN = -25,     
    OBSTACLE_HIT = -20,    
    MISSILE_HIT = -40,      
    SURVIVAL_ZONE_HIT = -60,
    IDLE_PENALTY = -3,      
}
