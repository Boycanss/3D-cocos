import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BestRunManager')
export class BestRunManager extends Component {
    private bestDistance: number = 0;
    private currentDistance: number = 0;
    private bestTime: number = 0;
    
    onLoad() {
        this.loadBestDistance();
        this.bestTime = this.loadBestTime(); // Store the loaded value
        // console.log(`📊 BestRunManager loaded - Time: ${this.bestTime}s, Distance: ${this.bestDistance}m`);
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
        this.bestTime = time; // Update current best time
        try {
            sys.localStorage.setItem('bestParkourTime', time.toString());
            // console.log(`💾 Saved new best time: ${time.toFixed(1)}s`);
        } catch (e) {
            console.error('Failed to save best time:', e);
        }
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
}