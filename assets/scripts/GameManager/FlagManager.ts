import { _decorator, CCFloat, CCInteger, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Flag } from '../Collectible/Flag';
import { FlagLevel, GameLevel, ObstacleType } from '../Define/Define';
import { Box } from '../Obstacle/Box';
import { GameManager } from './GameManager';
import { ScoreManager } from './ScoreManager';
const { ccclass, property } = _decorator;

@ccclass('FlagManager')
export class FlagManager extends Component {
    @property(Prefab)
    flagPrefab: Prefab = null;

    @property(Node)
    playerNode: Node = null;

    @property(Node)
    platformsParentNode: Node = null; // Reference to platforms parent node that contains all platform children

    @property(CCFloat)
    flagHeightOffset: number = 2.0; // Height above the LowBox

    @property(CCFloat)
    spawnInterval: number = 15.0; // Seconds between flag spawns

    @property(CCInteger)
    minLowBoxesRequired: number = 3; // Minimum LowBoxes needed before spawning flags

    private _spawnTimer: number = 0;
    private _currentFlag: Node = null; // Track the current active flag
    private _lowBoxNodes: Node[] = []; // Array to store all LowBox nodes
    private _flagWeights: Map<FlagLevel, number> = new Map();
    private _previousLowBox: Node = null; // Track the previous LowBox to avoid spawning on same box

    protected onLoad(): void {
        // Set spawn weights for each flag level (higher = more common)
        this._flagWeights.set(FlagLevel.LEVEL1, 40); // 40% chance
        this._flagWeights.set(FlagLevel.LEVEL2, 30); // 30% chance
        this._flagWeights.set(FlagLevel.LEVEL3, 15); // 15% chance
        this._flagWeights.set(FlagLevel.LEVEL4, 10); // 10% chance
        this._flagWeights.set(FlagLevel.LEVEL5, 5);  // 5% chance
    }

    start() {
        // Clear any existing flags on start
        this._currentFlag = null;
        
        // Spawn initial flag after a short delay
        this.scheduleOnce(() => {
            this.spawnFlag();
        }, 5.0);

        // Debug: Check if we can get GameManager
        const gameManager = this.node.getComponent(GameManager);
        if (gameManager) {
            console.log(`FlagManager: GameManager found. Current difficulty: ${gameManager.getDifficultyLevel()}`);
        } else {
            console.warn('FlagManager: GameManager component not found on same node!');
        }
    }

    update(deltaTime: number) {
        // Update LowBox array (scan for new obstacles)
        this.updateLowBoxArray();

        // Clean up destroyed LowBoxes
        this._lowBoxNodes = this._lowBoxNodes.filter(box => box && box.isValid);

        // Check if current flag is still valid
        if (this._currentFlag && !this._currentFlag.isValid) {
            console.log('FlagManager: Current flag destroyed, clearing reference');
            this._currentFlag = null;
        }

        // Only spawn a new flag if:
        // 1. No current flag exists (was collected or destroyed)
        // 2. Enough LowBoxes are available
        if (!this._currentFlag && this._lowBoxNodes.length >= this.minLowBoxesRequired) {
            this._spawnTimer += deltaTime;
            
            if (this._spawnTimer >= this.spawnInterval) {
                console.log(`FlagManager: Timer reached ${this.spawnInterval}s, attempting to spawn flag...`);
                this.spawnFlag();
                this._spawnTimer = 0;
            }
        } else if (this._currentFlag) {
            // Reset timer while flag exists to prevent accumulation
            this._spawnTimer = 0;
        }
    }

    /**
     * Update the array of available LowBox nodes
     */
    private updateLowBoxArray(): void {
        if (!this.platformsParentNode) return;

        // Clear and rebuild the array
        this._lowBoxNodes = [];

        // Search through all platform children for LowBoxes
        for (let i = 0; i < this.platformsParentNode.children.length; i++) {
            const platform = this.platformsParentNode.children[i];
            this.findLowBoxes(platform);
        }
    }

    /**
     * Recursively find all LowBox nodes in the scene
     */
    private findLowBoxes(node: Node): void {
        // Check if this node is a LowBox
        const box = node.getComponent(Box);
        if (box && box.boxType === ObstacleType.LOWBOX) {
            // Check if this LowBox already has a flag on it
            if (!this.hasFlag(node)) {
                this._lowBoxNodes.push(node);
            }
        }

        // Check children
        for (let i = 0; i < node.children.length; i++) {
            this.findLowBoxes(node.children[i]);
        }
    }

    /**
     * Check if a LowBox already has a flag on it
     */
    private hasFlag(lowBoxNode: Node): boolean {
        if (!this._currentFlag || !this._currentFlag.isValid) return false;
        
        const flagComponent = this._currentFlag.getComponent(Flag);
        if (flagComponent && flagComponent.getParentLowBox() === lowBoxNode) {
            return true;
        }
        
        return false;
    }

    /**
     * Spawn a flag on top of a LowBox based on flag level
     */
    public spawnFlag(): void {
        // CRITICAL: Prevent spawning if a flag already exists
        if (this._currentFlag && this._currentFlag.isValid) {
            console.warn('FlagManager: Cannot spawn - a flag already exists!');
            return;
        }

        if (!this.flagPrefab || !this.playerNode) {
            console.warn('FlagManager: Missing flagPrefab or playerNode');
            return;
        }

        if (this._lowBoxNodes.length === 0) {
            console.warn('FlagManager: No available LowBoxes to spawn flag on');
            return;
        }

        // Need at least 2 boxes to ensure different spawn location
        if (this._lowBoxNodes.length < 2 && this._previousLowBox) {
            console.warn('FlagManager: Not enough LowBoxes to spawn on different location');
            // If only 1 box available, allow spawning on same box
        }

        // Determine flag level based on current difficulty level
        const flagLevel = this.getFlagLevelFromDifficulty();

        // Select LowBox based on flag level (higher level = farther box)
        // Make sure it's different from previous one
        const selectedLowBox = this.selectLowBoxByLevel(flagLevel);
        
        if (!selectedLowBox) {
            console.warn('FlagManager: Could not find suitable LowBox for flag');
            return;
        }

        // Get LowBox position
        const lowBoxPos = selectedLowBox.getWorldPosition();
        
        // Calculate flag spawn position (on top of the LowBox)
        const spawnPos = new Vec3(
            lowBoxPos.x,
            lowBoxPos.y + this.flagHeightOffset,
            lowBoxPos.z
        );

        // Instantiate flag
        const flagNode = instantiate(this.flagPrefab);
        flagNode.setWorldPosition(spawnPos);

        // Configure flag component
        const flagComponent = flagNode.getComponent(Flag);
        if (flagComponent) {
            flagComponent.setFlagLevel(flagLevel);
            flagComponent.setParentLowBox(selectedLowBox);
            flagComponent.node.on('flag-collected', this.onFlagCollected, this);
        }

        // Add to scene and track as current flag
        this.node.addChild(flagNode);
        this._currentFlag = flagNode;
        
        // Remember this LowBox for next spawn
        this._previousLowBox = selectedLowBox;

        const distance = Vec3.distance(this.playerNode.getWorldPosition(), lowBoxPos);
        console.log(`FlagManager: Spawned Level ${flagLevel} flag on LowBox "${selectedLowBox.name}" at distance ${distance.toFixed(1)}m`);
    }

    /**
     * Select a LowBox based on flag level
     * Higher level = farther box from player
     * Ensures the selected box is different from the previous one
     */
    private selectLowBoxByLevel(level: FlagLevel): Node | null {
        if (this._lowBoxNodes.length === 0) return null;

        const playerPos = this.playerNode.getWorldPosition();

        // Filter out the previous LowBox to ensure different spawn location
        let availableBoxes = this._lowBoxNodes;
        if (this._previousLowBox && this._lowBoxNodes.length > 1) {
            availableBoxes = this._lowBoxNodes.filter(box => box !== this._previousLowBox);
            console.log(`FlagManager: Filtered out previous box. Available: ${availableBoxes.length}/${this._lowBoxNodes.length}`);
        }

        if (availableBoxes.length === 0) {
            console.warn('FlagManager: No available boxes after filtering previous one');
            availableBoxes = this._lowBoxNodes; // Fallback to all boxes
        }

        // Calculate distances for available LowBoxes
        const boxesWithDistance = availableBoxes.map(box => ({
            node: box,
            distance: Vec3.distance(playerPos, box.getWorldPosition())
        }));

        // Sort by distance (farthest first)
        boxesWithDistance.sort((a, b) => b.distance - a.distance);

        // Select box based on level with MORE VARIATION
        const totalBoxes = boxesWithDistance.length;
        
        let startIndex: number;
        let endIndex: number;

        switch (level) {
            case FlagLevel.LEVEL1:
                // Closest 30% of boxes (increased from 20% for more variety)
                const closestSegment = Math.max(2, Math.floor(totalBoxes * 0.3));
                startIndex = Math.max(0, totalBoxes - closestSegment);
                endIndex = totalBoxes;
                break;
            case FlagLevel.LEVEL2:
                // 30-60% from farthest (wider range)
                const lv2Segment = Math.max(2, Math.floor(totalBoxes * 0.3));
                startIndex = Math.max(0, totalBoxes - lv2Segment * 2);
                endIndex = Math.max(0, totalBoxes - lv2Segment);
                break;
            case FlagLevel.LEVEL3:
                // Middle 40% (40-60% range, wider)
                const lv3Start = Math.max(0, Math.floor(totalBoxes * 0.4));
                const lv3End = Math.min(totalBoxes, Math.floor(totalBoxes * 0.6));
                startIndex = lv3Start;
                endIndex = lv3End;
                break;
            case FlagLevel.LEVEL4:
                // Far 40% (20-60% from farthest, much wider)
                const lv4End = Math.min(totalBoxes, Math.floor(totalBoxes * 0.6));
                const lv4Start = Math.max(0, Math.floor(totalBoxes * 0.2));
                startIndex = lv4Start;
                endIndex = lv4End;
                break;
            case FlagLevel.LEVEL5:
                // Farthest 50% of boxes (increased from 20% for MUCH more variety)
                const lv5Segment = Math.max(3, Math.floor(totalBoxes * 0.5));
                startIndex = 0;
                endIndex = Math.min(lv5Segment, totalBoxes);
                break;
            default:
                startIndex = 0;
                endIndex = totalBoxes;
        }

        // Ensure valid range
        if (startIndex >= endIndex) {
            endIndex = startIndex + 1;
        }
        endIndex = Math.min(endIndex, totalBoxes);

        console.log(`FlagManager: Level ${level} selection range: ${startIndex}-${endIndex} (${endIndex - startIndex} boxes available)`);

        // Randomly select from the range
        const selectedIndex = startIndex + Math.floor(Math.random() * (endIndex - startIndex));
        const selectedBox = boxesWithDistance[selectedIndex].node;
        
        console.log(`FlagManager: Selected box at index ${selectedIndex}, distance ${boxesWithDistance[selectedIndex].distance.toFixed(1)}m`);
        
        return selectedBox;
    }

    /**
     * Get flag level based on current game difficulty
     */
    private getFlagLevelFromDifficulty(): FlagLevel {
        // Get GameManager from the same node (FlagManager should be on GameManager node)
        const gameManager = this.node.getComponent(GameManager);
        
        if (!gameManager) {
            console.warn('FlagManager: GameManager component not found on same node, using Level 1');
            return FlagLevel.LEVEL1;
        }

        const difficultyLevel = gameManager.getDifficultyLevel();
        console.log(`FlagManager: Current difficulty is ${difficultyLevel}, spawning flag level ${difficultyLevel}`);
        
        // Map GameLevel to FlagLevel (they have the same values)
        switch (difficultyLevel) {
            case GameLevel.LEVEL1: return FlagLevel.LEVEL1;
            case GameLevel.LEVEL2: return FlagLevel.LEVEL2;
            case GameLevel.LEVEL3: return FlagLevel.LEVEL3;
            case GameLevel.LEVEL4: return FlagLevel.LEVEL4;
            case GameLevel.LEVEL5: return FlagLevel.LEVEL5;
            default: 
                console.warn(`FlagManager: Unknown difficulty level ${difficultyLevel}, defaulting to Level 1`);
                return FlagLevel.LEVEL1;
        }
    }

    /**
     * Get a random flag level based on weighted probabilities (legacy - not used)
     */
    private getRandomFlagLevel(): FlagLevel {
        const totalWeight = Array.from(this._flagWeights.values()).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const [level, weight] of this._flagWeights.entries()) {
            random -= weight;
            if (random <= 0) {
                return level;
            }
        }

        return FlagLevel.LEVEL1; // Fallback
    }

    /**
     * Handle flag collection event
     */
    private onFlagCollected(flagNode: Node, flagLevel: number): void {
        // Clear current flag reference
        if (this._currentFlag === flagNode) {
            this._currentFlag = null;
        }

        // Notify ScoreManager
        const scoreManager = this.node.getComponent(ScoreManager);
        if (scoreManager) {
            scoreManager.awardFlagPoints(flagLevel);
            console.log(`FlagManager: Notified ScoreManager about Level ${flagLevel} flag collection`);
        } else {
            console.warn('FlagManager: ScoreManager not found on GameManager node');
        }

        // Destroy flag node after a short delay (for animation)
        this.scheduleOnce(() => {
            if (flagNode && flagNode.isValid) {
                flagNode.destroy();
            }
        }, 0.5);

        console.log('FlagManager: Flag collected! Next flag will spawn after interval.');
    }

    /**
     * Manually trigger flag spawn at specific level (useful for testing)
     */
    public spawnFlagAtLevel(level: FlagLevel): void {
        if (!this.flagPrefab || !this.playerNode) return;

        if (this._lowBoxNodes.length === 0) {
            console.warn('FlagManager: No available LowBoxes for manual spawn');
            return;
        }

        const selectedLowBox = this.selectLowBoxByLevel(level);
        if (!selectedLowBox) return;

        const lowBoxPos = selectedLowBox.getWorldPosition();
        const spawnPos = new Vec3(
            lowBoxPos.x,
            lowBoxPos.y + this.flagHeightOffset,
            lowBoxPos.z
        );

        const flagNode = instantiate(this.flagPrefab);
        flagNode.setWorldPosition(spawnPos);

        const flagComponent = flagNode.getComponent(Flag);
        if (flagComponent) {
            flagComponent.setFlagLevel(level);
            flagComponent.setParentLowBox(selectedLowBox);
            flagComponent.node.on('flag-collected', this.onFlagCollected, this);
        }

        this.node.addChild(flagNode);
        this._currentFlag = flagNode;
    }

    /**
     * Clear the current flag
     */
    public clearCurrentFlag(): void {
        if (this._currentFlag && this._currentFlag.isValid) {
            this._currentFlag.destroy();
        }
        this._currentFlag = null;
    }

    /**
     * Check if a flag is currently active
     */
    public hasActiveFlag(): boolean {
        return this._currentFlag !== null && this._currentFlag.isValid;
    }

    /**
     * Get the current active flag node
     */
    public getCurrentFlag(): Node | null {
        return this._currentFlag;
    }

    /**
     * Get count of available LowBoxes
     */
    public getAvailableLowBoxCount(): number {
        return this._lowBoxNodes.length;
    }

    /**
     * Force update LowBox array (useful after spawning new obstacles)
     */
    public refreshLowBoxArray(): void {
        this.updateLowBoxArray();
    }

    protected onDestroy(): void {
        this.clearCurrentFlag();
    }
}
