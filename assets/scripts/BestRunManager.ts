import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BestRunManager')
export class BestRunManager extends Component {
    private bestDistance: number = 0;
    private currentDistance: number = 0;
    
    onLoad() {
        this.loadBestDistance();
    }
    
    public updateDistance(distance: number) {
        this.currentDistance = distance;
        if (distance > this.bestDistance) {
            this.bestDistance = distance;
            this.saveBestDistance();
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
}