import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or icon identifier
    unlocked: boolean;
    progress: number;
    target: number;
}

@ccclass('AchievementManager')
export class AchievementManager extends Component {
    
    private achievements: Map<string, Achievement> = new Map();
    private newlyUnlocked: Achievement[] = [];

    protected onLoad(): void {
        this.initializeAchievements();
        this.loadAchievements();
    }

    /**
     * Initialize all available achievements
     */
    private initializeAchievements(): void {
        const achievementList: Achievement[] = [
            {
                id: 'perfect_run',
                name: 'Flawless',
                description: 'Complete a run without taking damage',
                icon: '🏆',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'wall_runner',
                name: 'Wall Walker',
                description: 'Wall run for 10 seconds total',
                icon: '🧗‍♂️',
                unlocked: false,
                progress: 0,
                target: 10
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Maintain max speed for 15 seconds',
                icon: '💨',
                unlocked: false,
                progress: 0,
                target: 15
            },
            {
                id: 'flag_hunter',
                name: 'Flag Hunter',
                description: 'Collect 10 flags in one run',
                icon: '🚩',
                unlocked: false,
                progress: 0,
                target: 10
            },
            {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Achieve a 15x combo multiplier',
                icon: '🔥',
                unlocked: false,
                progress: 0,
                target: 15
            },
            {
                id: 'distance_warrior',
                name: 'Marathon Runner',
                description: 'Run 500 meters in one session',
                icon: '🏃‍♂️',
                unlocked: false,
                progress: 0,
                target: 500
            },
            {
                id: 'high_scorer',
                name: 'High Scorer',
                description: 'Achieve a score of 2000+',
                icon: '⭐',
                unlocked: false,
                progress: 0,
                target: 2000
            },
            {
                id: 'elite_rank',
                name: 'Elite Performer',
                description: 'Achieve S or SS rank',
                icon: '👑',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'flag_master',
                name: 'Flag Master',
                description: 'Collect a Level 5+ flag',
                icon: '🎯',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'survivor',
                name: 'Survivor',
                description: 'Survive for 60 seconds',
                icon: '⏱️',
                unlocked: false,
                progress: 0,
                target: 60
            }
        ];

        // Add achievements to map
        achievementList.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    /**
     * Check and update achievement progress
     */
    public checkAchievements(runData: {
        isPerfectRun: boolean;
        wallRunTime: number;
        maxSpeedTime: number;
        flagsCollected: number;
        maxCombo: number;
        distance: number;
        score: number;
        rank: string;
        highestFlagLevel: number;
        survivalTime: number;
    }): Achievement[] {
        
        this.newlyUnlocked = [];

        // Perfect Run
        if (runData.isPerfectRun) {
            this.updateAchievement('perfect_run', 1);
        }

        // Wall Runner
        this.updateAchievement('wall_runner', runData.wallRunTime);

        // Speed Demon
        this.updateAchievement('speed_demon', runData.maxSpeedTime);

        // Flag Hunter
        this.updateAchievement('flag_hunter', runData.flagsCollected);

        // Combo Master
        this.updateAchievement('combo_master', runData.maxCombo);

        // Distance Warrior
        this.updateAchievement('distance_warrior', runData.distance);

        // High Scorer
        if (runData.score >= 2000) {
            this.updateAchievement('high_scorer', runData.score);
        }

        // Elite Rank
        if (runData.rank === 'S' || runData.rank === 'SS') {
            this.updateAchievement('elite_rank', 1);
        }

        // Flag Master
        if (runData.highestFlagLevel >= 5) {
            this.updateAchievement('flag_master', 1);
        }

        // Survivor
        this.updateAchievement('survivor', runData.survivalTime);

        // Save achievements
        this.saveAchievements();

        return this.newlyUnlocked;
    }

    /**
     * Update achievement progress
     */
    private updateAchievement(id: string, progress: number): void {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return;

        // Update progress (use max for cumulative achievements)
        achievement.progress = Math.max(achievement.progress, progress);

        // Check if unlocked
        if (achievement.progress >= achievement.target) {
            achievement.unlocked = true;
            this.newlyUnlocked.push(achievement);
            console.log(`🏆 Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
        }
    }

    /**
     * Get all achievements
     */
    public getAllAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }

    /**
     * Get unlocked achievements
     */
    public getUnlockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values()).filter(a => a.unlocked);
    }

    /**
     * Get achievement by ID
     */
    public getAchievement(id: string): Achievement | null {
        return this.achievements.get(id) || null;
    }

    /**
     * Get achievements for sharing (unlocked ones with nice formatting)
     */
    public getShareableAchievements(): string {
        const unlocked = this.getUnlockedAchievements();
        if (unlocked.length === 0) return "";

        const achievementText = unlocked
            .slice(0, 3) // Show max 3 achievements
            .map(a => `${a.icon} ${a.name}`)
            .join(' | ');

        return `Achievements: ${achievementText}`;
    }

    /**
     * Save achievements to local storage
     */
    private saveAchievements(): void {
        try {
            const achievementData = Array.from(this.achievements.values());
            sys.localStorage.setItem('parkourAchievements', JSON.stringify(achievementData));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    /**
     * Load achievements from local storage
     */
    private loadAchievements(): void {
        try {
            const saved = sys.localStorage.getItem('parkourAchievements');
            if (saved) {
                const achievementData: Achievement[] = JSON.parse(saved);
                achievementData.forEach(data => {
                    const achievement = this.achievements.get(data.id);
                    if (achievement) {
                        achievement.unlocked = data.unlocked;
                        achievement.progress = data.progress;
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    /**
     * Reset all achievements (for testing)
     */
    public resetAchievements(): void {
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            achievement.progress = 0;
        });
        this.saveAchievements();
    }
}