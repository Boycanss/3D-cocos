# Simple Game Over UI Setup Guide

## 🎯 Overview

A clean, simple Game Over popup with just the essentials:
- **GAME OVER text**
- **Current Score**
- **Best Score** (automatically saved)
- **Replay Button** (triggers game restart)

## 📋 Setup Steps

### Step 1: Create Simple UI Structure

Create this UI hierarchy under your Canvas:

```
Canvas
└─ GameOverUI (Node)
   ├─ BackgroundOverlay (Sprite) - Dark overlay (not animated)
   ├─ PopupContent (Node) - Main content (animated from top)
   │  ├─ Panel (Sprite) - Main popup panel
   │  ├─ GameOverTitle (Label) - "GAME OVER"
   │  ├─ CurrentScore (Label) - "Score: 1,234"
   │  └─ BestScore (Label) - "Best: 2,456"
   └─ ReplayButton (Button) - "PLAY AGAIN" (animated from bottom)
```

### Step 2: Add Component

1. **Select GameOverUI root node**
2. **Add Component** → Search "GameOverUI" → Add
3. **Assign properties** in the inspector:
   - **Background Overlay**: The dark overlay sprite (not animated)
   - **Popup Content**: The main content node (animated from top)
   - **Game Over Title**: The "GAME OVER" label
   - **Current Score Label**: Shows current run score
   - **Best Score Label**: Shows best score ever
   - **Replay Button**: The play again button (animated from bottom)

### Step 3: Integrate with Game Flow

In your game flow manager, when the game ends:

```typescript
// Example integration
const gameOverUI = this.node.getComponent(GameOverUI);
const scoreManager = this.gameManager.getComponent(ScoreManager);

// Show game over popup
gameOverUI.showGameOver(scoreManager);

// Listen for restart event
gameOverUI.node.on('game-restart', () => {
    // Reset game and return to start screen
    this.restartGame();
});
```

## 🎨 UI Styling Recommendations

### Colors
- **Background**: Semi-transparent black (0, 0, 0, 180)
- **Panel**: Dark gray with border (40, 40, 40, 255)
- **Title**: White or red for "GAME OVER"
- **Scores**: White text

### Fonts
- **Title**: Large, bold font (48-60px)
- **Scores**: Medium font (32-40px)
- **Button**: Medium, bold font (28-32px)

### Layout
- **Popup Size**: ~300x400 pixels
- **Padding**: 20-30px around content
- **Spacing**: 15-20px between elements
- **Button Size**: 150x50 pixels

## 🎮 Features

### Automatic Best Score Tracking
- Saves best score to local storage
- Automatically updates when beaten
- Persists between game sessions

### Specific Animations
- **Background Overlay**: Appears instantly (no animation)
- **Popup Content**: Slides down from top with bounce effect
- **Replay Button**: Slides up from bottom with delay

### Simple Integration
- Just pass the ScoreManager
- Emits 'game-restart' event when replay is clicked
- Clean, minimal API

## 🔧 Usage Example

```typescript
// When player dies/game ends
private onGameOver(): void {
    const gameOverUI = this.node.getComponent(GameOverUI);
    const scoreManager = this.gameManager.getComponent(ScoreManager);
    
    // Show the popup
    gameOverUI.showGameOver(scoreManager);
}

// Listen for restart
protected onLoad(): void {
    const gameOverUI = this.node.getComponent(GameOverUI);
    gameOverUI.node.on('game-restart', this.onRestart, this);
}

private onRestart(): void {
    // Reset your game state
    this.resetGame();
    this.showStartScreen();
}
```

That's it! Simple and clean. 🎮