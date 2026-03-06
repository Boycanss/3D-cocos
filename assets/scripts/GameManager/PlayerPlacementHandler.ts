import { _decorator, Component, Node, Vec3, PhysicsSystem, geometry, Collider, MeshRenderer, Material, Color, Sprite, SpriteFrame, UITransform, Canvas } from 'cc';
import { Box } from '../Obstacle/Box';
import { ObstacleType } from '../Define/Define';
const { ccclass, property } = _decorator;

@ccclass('PlayerPlacementHandler')
export class PlayerPlacementHandler extends Component {
    
    @property({ type: Node, tooltip: "Player node to handle placement for" })
    playerNode: Node = null;
    
    @property({ type: Node, tooltip: "Playground bounds node" })
    playgroundNode: Node = null;
    
    @property({ type: Node, tooltip: "Visual indicator for placement validity (optional)" })
    placementIndicator: Node = null;
    
    @property({ tooltip: "Radius for collision checking around player" })
    validationRadius: number = 1.0;
    
    @property({ tooltip: "Color for valid placement indicator" })
    validColor: Color = new Color(0, 255, 0, 100);
    
    @property({ tooltip: "Color for invalid placement indicator" })
    invalidColor: Color = new Color(255, 0, 0, 100);
    
    @property({ tooltip: "Height offset for ground detection" })
    groundCheckHeight: number = 2.0;
    
    private _isValidPlacement: boolean = true;
    private _indicatorSprite: Sprite = null;
    private _originalIndicatorColor: Color = new Color();

    protected onLoad(): void {
        if (this.placementIndicator) {
            this._indicatorSprite = this.placementIndicator.getComponent(Sprite);
            if (this._indicatorSprite) {
                this._originalIndicatorColor = this._indicatorSprite.color.clone();
            }
        }
    }

    /**
     * Check if the given position is valid for player placement
     */
    public isValidPlacement(position: Vec3): boolean {
        // Check playground bounds
        if (!this.isWithinPlaygroundBounds(position)) {
            return false;
        }
        
        // Check for obstacle collisions
        if (this.wouldCollideWithObstacles(position)) {
            return false;
        }
        
        // Check if there's ground beneath
        if (!this.hasGroundBeneath(position)) {
            return false;
        }
        
        return true;
    }

    /**
     * Update visual feedback for placement validity
     */
    public updatePlacementFeedback(position: Vec3): void {
        this._isValidPlacement = this.isValidPlacement(position);
        
        if (this.placementIndicator) {
            // Position indicator at player location
            this.placementIndicator.setWorldPosition(new Vec3(position.x, position.y + 0.1, position.z));
            
            // Update color based on validity
            if (this._indicatorSprite) {
                const targetColor = this._isValidPlacement ? this.validColor : this.invalidColor;
                this._indicatorSprite.color = targetColor;
            }
            
            // Show indicator
            this.placementIndicator.active = true;
        }
    }

    /**
     * Clear placement feedback
     */
    public clearPlacementFeedback(): void {
        if (this.placementIndicator) {
            this.placementIndicator.active = false;
            
            if (this._indicatorSprite) {
                this._indicatorSprite.color = this._originalIndicatorColor;
            }
        }
    }

    /**
     * Get the current placement validity
     */
    public getPlacementValidity(): boolean {
        return this._isValidPlacement;
    }

    /**
     * Constrain position to playground bounds
     */
    public constrainToPlayground(position: Vec3): Vec3 {
        if (!this.playgroundNode) return position;
        
        const playgroundPos = this.playgroundNode.worldPosition;
        const playgroundScale = this.playgroundNode.worldScale;
        
        // Get playground bounds (adjust these values based on your playground setup)
        const halfWidth = playgroundScale.x * 10; // Adjust multiplier as needed
        const halfDepth = playgroundScale.z * 10; // Adjust multiplier as needed
        
        const constrainedPos = position.clone();
        constrainedPos.x = Math.max(
            playgroundPos.x - halfWidth,
            Math.min(playgroundPos.x + halfWidth, position.x)
        );
        constrainedPos.z = Math.max(
            playgroundPos.z - halfDepth,
            Math.min(playgroundPos.z + halfDepth, position.z)
        );
        
        return constrainedPos;
    }

    private isWithinPlaygroundBounds(position: Vec3): boolean {
        if (!this.playgroundNode) return true; // No bounds checking if no playground defined
        
        const constrainedPos = this.constrainToPlayground(position);
        return Vec3.equals(position, constrainedPos, 0.1); // Small tolerance
    }

    private wouldCollideWithObstacles(position: Vec3): boolean {
        // Check multiple points around the player position
        const checkPositions = [
            position, // Center
            new Vec3(position.x + this.validationRadius, position.y, position.z), // Right
            new Vec3(position.x - this.validationRadius, position.y, position.z), // Left
            new Vec3(position.x, position.y, position.z + this.validationRadius), // Forward
            new Vec3(position.x, position.y, position.z - this.validationRadius), // Backward
            // Diagonal checks
            new Vec3(position.x + this.validationRadius * 0.7, position.y, position.z + this.validationRadius * 0.7),
            new Vec3(position.x - this.validationRadius * 0.7, position.y, position.z + this.validationRadius * 0.7),
            new Vec3(position.x + this.validationRadius * 0.7, position.y, position.z - this.validationRadius * 0.7),
            new Vec3(position.x - this.validationRadius * 0.7, position.y, position.z - this.validationRadius * 0.7)
        ];
        
        const ray = new geometry.Ray();
        
        for (const checkPos of checkPositions) {
            // Raycast from above to below to check for obstacles
            const startPos = new Vec3(checkPos.x, checkPos.y + this.groundCheckHeight, checkPos.z);
            const endPos = new Vec3(checkPos.x, checkPos.y - this.groundCheckHeight, checkPos.z);
            
            geometry.Ray.fromPoints(ray, startPos, endPos);
            
            if (PhysicsSystem.instance.raycastClosest(ray, 1, this.groundCheckHeight * 2)) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                const hitNode = result.collider?.node;
                
                if (hitNode) {
                    const box = hitNode.getComponent(Box);
                    if (box && (box.boxType === ObstacleType.LOWBOX || box.boxType === ObstacleType.HIGHBOX)) {
                        // Check if the hit point is at player level (would cause collision)
                        const hitY = result.hitPoint.y;
                        const playerY = position.y;
                        
                        // If obstacle is at or above player level, it's a collision
                        if (hitY >= playerY - 0.5) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }

    private hasGroundBeneath(position: Vec3): boolean {
        // Raycast downward to ensure there's ground
        const ray = new geometry.Ray();
        const startPos = new Vec3(position.x, position.y + 1, position.z);
        const endPos = new Vec3(position.x, position.y - 10, position.z);
        
        geometry.Ray.fromPoints(ray, startPos, endPos);
        
        if (PhysicsSystem.instance.raycastClosest(ray, 1, 11)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            const hitNode = result.collider?.node;
            
            if (hitNode) {
                // Check if it's ground (not an obstacle)
                const box = hitNode.getComponent(Box);
                if (!box) {
                    // No Box component means it's likely ground
                    return true;
                }
                
                // If it's a slide box, it could be considered ground
                if (box.boxType === ObstacleType.SLIDEBOX) {
                    return true;
                }
            }
        }
        
        // If no ground found, assume it's valid (might be over a platform)
        return true;
    }

    /**
     * Get a safe starting position within the playground
     */
    public getSafeStartingPosition(): Vec3 {
        if (!this.playgroundNode) {
            return new Vec3(0, 0, 0);
        }
        
        const playgroundPos = this.playgroundNode.worldPosition;
        const attempts = 20; // Try multiple positions
        
        for (let i = 0; i < attempts; i++) {
            // Generate random position within playground bounds
            const randomX = playgroundPos.x + (Math.random() - 0.5) * 10;
            const randomZ = playgroundPos.z + (Math.random() - 0.5) * 10;
            const testPos = new Vec3(randomX, playgroundPos.y, randomZ);
            
            if (this.isValidPlacement(testPos)) {
                return testPos;
            }
        }
        
        // Fallback to playground center
        return playgroundPos.clone();
    }
}