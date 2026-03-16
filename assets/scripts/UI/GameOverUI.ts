import { _decorator, Component, Node, Label, Button, tween, Vec3, sys } from 'cc';
import { ScoreManager } from '../GameManager/ScoreManager';
import { BestRunManager } from '../BestRunManager';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    
    @property({ type: Node, tooltip: "Background overlay (not animated)" })
    backgroundOverlay: Node = null;

    @property({ type: Node, tooltip: "Main popup content (animated from top)" })
    popupContent: Node = null;

    @property({ type: Label, tooltip: "Game Over title text" })
    gameOverTitle: Label = null;

    @property({ type: Label, tooltip: "Current run score" })
    currentScoreLabel: Label = null;

    @property({ type: Label, tooltip: "Best run score" })
    bestScoreLabel: Label = null;

    @property({ type: Button, tooltip: "Replay button (animated from bottom)" })
    replayButton: Button = null;

    // Simple data
    private _currentScore: number = 0;
    private _bestScore: number = 0;

    protected onLoad(): void {
        // Hide overlay initially
        if (this.backgroundOverlay && this.popupContent) {
            this.backgroundOverlay.active = false;
            this.popupContent.active = false;
        }

        // Setup button listener
        if (this.replayButton) {
            this.replayButton.node.on(Button.EventType.CLICK, this.onReplayClicked, this);
        }
    }

    /**
     * Show the game over popup with score
     */
    public showGameOver(scoreManager: ScoreManager): void {
        // Get current score
        this._currentScore = scoreManager.getFinalScore();

        // Load and check best score
        this._bestScore = this.loadBestScore();
        
        if (this._currentScore > this._bestScore) {
            this.saveBestScore(this._currentScore);
            this._bestScore = this._currentScore;
        }

        // Update UI
        this.updateGameOverUI();

        // Show popup with animation
        this.showPopupWithAnimation();
    }

    /**
     * Update UI elements
     */
    private updateGameOverUI(): void {
        // Game Over title
        if (this.gameOverTitle) {
            this.gameOverTitle.string = "GAME OVER";
        }

        // Current score
        if (this.currentScoreLabel) {
            this.currentScoreLabel.string = `Score: ${this._currentScore.toLocaleString()}`;
        }

        // Best score
        if (this.bestScoreLabel) {
            this.bestScoreLabel.string = `Best: ${this._bestScore.toLocaleString()}`;
        }
    }



    /**
     * Show popup with specific animations
     */
    private showPopupWithAnimation(): void {
        // 1. Show background overlay immediately (no animation)
        if (this.backgroundOverlay) {
            this.backgroundOverlay.active = true;
            this.popupContent.active = true;
        }

        // 2. Animate popup content from top
        if (this.popupContent) {
            // Store original position
            const originalPos = this.popupContent.position.clone();
            
            // Start from above screen
            const startPos = originalPos.clone();
            startPos.y += 800; // Start 800 pixels above
            this.popupContent.setPosition(startPos);
            
            // Animate to original position
            tween(this.popupContent)
                .to(0.5, { position: originalPos }, { easing: 'backOut' })
                .start();
        }

        // 3. Animate replay button from bottom (with delay)
        if (this.replayButton) {
            // Store original position
            const originalPos = this.replayButton.node.position.clone();
            
            // Start from below screen
            const startPos = originalPos.clone();
            startPos.y -= 600; // Start 600 pixels below
            this.replayButton.node.setPosition(startPos);
            
            // Animate to original position with delay
            tween(this.replayButton.node)
                .delay(0.3) // Wait for popup content to settle
                .to(0.4, { position: originalPos }, { easing: 'backOut' })
                .start();
        }
    }



    /**
     * Handle replay button click
     */
    private onReplayClicked(): void {
        console.log("🎮 Replay button clicked");
        
        // Hide popup
        this.hidePopup();

        // Emit event to restart game
        this.node.emit('game-restart');
    }



    /**
     * Hide popup
     */
    public hidePopup(): void {
        // if (this.backgroundOverlay) {
            this.backgroundOverlay.active = false;
            this.popupContent.active = false;
        // }
    }

    /**
     * Save best score to local storage
     */
    private saveBestScore(score: number): void {
        const bestRunManager = this.node.scene?.getComponentInChildren(BestRunManager);
        if (bestRunManager) {
            bestRunManager.saveBestScore(score);
            return;
        }

        try {
            sys.localStorage.setItem('bestParkourScore', score.toString());
        } catch (e) {
            console.error('Failed to save best score:', e);
        }
    }

    /**
     * Load best score from local storage
     */
    public loadBestScore(): number {
        const bestRunManager = this.node.scene?.getComponentInChildren(BestRunManager);
        if (bestRunManager) {
            return bestRunManager.loadBestScore();
        }

        try {
            const saved = sys.localStorage.getItem('bestParkourScore');
            if (saved) {
                return parseInt(saved);
            }
        } catch (e) {
            console.error('Failed to load best score:', e);
        }
        return 0;
    }

    protected onDestroy(): void {
        if (this.replayButton) {
            this.replayButton.node.off(Button.EventType.CLICK, this.onReplayClicked, this);
        }
    }
}