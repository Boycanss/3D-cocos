import { _decorator, Component, sys } from 'cc';
import { CrazyGamesManager } from './Utils/CrazyGamesManager';
const { ccclass, property } = _decorator;

@ccclass('BestRunManager')
export class BestRunManager extends Component {
    private bestDistance: number = 0;
    private currentDistance: number = 0;
    private bestTime: number = 0;
    
    onLoad() {
        this.loadBestDistance();
        this.bestTime = this.loadBestTime();
        this.syncWithCrazyGames();
    }

    private async syncWithCrazyGames(): Promise<void> {
        const crazyGames = CrazyGamesManager.instance;
        if (!crazyGames) return;

        const bestScore = this.loadBestScore();
        const merged = await crazyGames.syncExistingLocalData(this.bestTime, this.bestDistance, bestScore);

        this.bestTime = merged.bestTime;
        this.bestDistance = merged.bestDistance;
        this.saveBestTime(this.bestTime);
        this.saveBestDistance();
        this.saveBestScore(merged.bestScore);
    }
    
    public updateDistance(distance: number) {
        this.currentDistance = distance;
        if (distance > this.bestDistance) {
            this.bestDistance = distance;
            this.saveBestDistance();
            // console.log(`🎉 New best distance: ${this.bestDistance.toFixed(1)}m`);
        }
    }
    
    public getCurrentDistance(): number {
        return this.currentDistance;
    }
    
    public getBestDistance(): number {
        return this.bestDistance;
    }
    
    public resetCurrentDistance() {
        this.currentDistance = 0;
    }
    
    private saveBestDistance() {
        try {
            sys.localStorage.setItem('bestParkourDistance', this.bestDistance.toString());
        } catch (e) {
            console.error('Failed to save best distance:', e);
        }
        this.syncSaveData();
    }
    
    private loadBestDistance() {
        try {
            const saved = sys.localStorage.getItem('bestParkourDistance');
            if (saved) {
                this.bestDistance = parseFloat(saved);
            }
        } catch (e) {
            console.error('Failed to load best distance:', e);
        }
    }

    // Methods for Time tracking
    public saveBestTime(time: number) {
        this.bestTime = time;
        try {
            sys.localStorage.setItem('bestParkourTime', time.toString());
        } catch (e) {
            console.error('Failed to save best time:', e);
        }
        this.syncSaveData();
    }
    
    public loadBestTime(): number {
        try {
            const saved = sys.localStorage.getItem('bestParkourTime');
            if (saved) {
                return parseFloat(saved);
            }
        } catch (e) {
            console.error('Failed to load best time:', e);
        }
        return 0;
    }
    
    public getBestTime(): number {
        return this.bestTime;
    }

    public loadBestScore(): number {
        try {
            const saved = sys.localStorage.getItem('bestParkourScore');
            return saved ? parseInt(saved) : 0;
        } catch (e) {
            console.error('Failed to load best score:', e);
            return 0;
        }
    }

    public saveBestScore(score: number): void {
        try {
            sys.localStorage.setItem('bestParkourScore', score.toString());
        } catch (e) {
            console.error('Failed to save best score:', e);
        }
        this.syncSaveData();
    }

    private syncSaveData(): void {
        CrazyGamesManager.instance?.saveGameData({
            bestTime: this.bestTime,
            bestDistance: this.bestDistance,
            bestScore: this.loadBestScore(),
            updatedAt: Date.now(),
        });
    }
}