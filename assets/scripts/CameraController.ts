import { _decorator, CCFloat, Component, Node, Vec3, PhysicsSystem, geometry, PhysicsRayResult } from 'cc';
const { ccclass, property } = _decorator;
import { Occludable } from './Occludable';

@ccclass('CameraController')
export class CameraController extends Component {

    @property(Node)
    target:Node;

    @property(CCFloat)
    moveSpeed:number;

    @property(Vec3)
    offset: Vec3 = new Vec3(0, 0, 0);

    targetPosition = new Vec3();
    currentPosition = new Vec3();
    desiredPosition = new Vec3();
    
    private _ray: geometry.Ray = new geometry.Ray();
    private _hiddenNodes: Set<Node> = new Set();
    private _restoreTimers: Map<Node, number> = new Map();
    private _currentHits: Set<Node> = new Set();
    private _previousHits: Set<Node> = new Set();
    private _hitFrameCounter: Map<Node, number> = new Map();
    private _restoreDelay: number = 0.25;
    private _hitConfirmationFrames: number = 2; // Require hit to persist for 2 frames

    start() {

    }

    update(deltaTime: number) {
        if(!this.target) return;

        this.target.getWorldPosition(this.targetPosition);
        Vec3.add(this.desiredPosition, this.targetPosition, this.offset);

        this.node.getWorldPosition(this.currentPosition);

        Vec3.lerp(
            this.currentPosition,
            this.currentPosition,
            this.desiredPosition,
            this.moveSpeed*deltaTime
        );

        this.node.setWorldPosition(this.currentPosition);
        
        // 1. FRESH RAYCAST
        this._currentHits.clear();
        
        const physicsSystem = PhysicsSystem.instance;
        const cameraPosition = this.node.worldPosition;
        const targetPosition = this.target.worldPosition;
        
        // Create ray from camera to target
        geometry.Ray.fromPoints(this._ray, cameraPosition, targetPosition);
        const rayDistance = Vec3.distance(cameraPosition, targetPosition);
        
        // Iteratively raycast to find all buildings hit by the ray
        let currentRay = this._ray;
        let currentDistance = rayDistance;
        let hitOffset = 0;
        const hitResult = new geometry.Ray();
        
        while (currentDistance > 0.01) {
            if (physicsSystem.raycastClosest(currentRay, 1, currentDistance)) {
                const result = physicsSystem.raycastClosestResult;
                const hitNode = result.collider.node;
                
                // Add to current hits
                this._currentHits.add(hitNode);
                
                // Create new ray starting from the hit point, moving forward
                const hitDistance = result.distance;
                const rayDir = new Vec3();
                Vec3.subtract(rayDir, targetPosition, cameraPosition);
                Vec3.normalize(rayDir, rayDir);
                
                const nextOrigin = new Vec3();
                Vec3.scaleAndAdd(nextOrigin, cameraPosition, rayDir, hitOffset + hitDistance + 0.01);
                
                hitOffset += hitDistance + 0.01;
                currentDistance = rayDistance - hitOffset;
                
                // Update ray for next iteration
                geometry.Ray.fromPoints(currentRay, nextOrigin, targetPosition);
            } else {
                // No more hits
                break;
            }
        }
        
        // 2. UPDATE HIT CONFIRMATION COUNTERS
        for (const node of this._currentHits) {
            const frameCount = (this._hitFrameCounter.get(node) || 0) + 1;
            this._hitFrameCounter.set(node, frameCount);
            
            // Only hide when hit is confirmed (persisted for N frames)
            if (frameCount >= this._hitConfirmationFrames && !this._hiddenNodes.has(node)) {
                // Try to use Occludable component if available, otherwise set active directly
                const occludable = node.getComponent(Occludable);
                if (occludable) {
                    occludable.setOccluded(true);
                } 
                else if (node.active) {
                    node.active = false;
                }
                this._hiddenNodes.add(node);
                
                // Cancel any pending restore
                if (this._restoreTimers.has(node)) {
                    this._restoreTimers.delete(node);
                }
            }
        }
        
        // 3. CLEAR COUNTERS FOR NODES NO LONGER HIT
        for (const [node, count] of this._hitFrameCounter.entries()) {
            if (!this._currentHits.has(node)) {
                this._hitFrameCounter.delete(node);
            }
        }
        
        // 4. HANDLE RESTORE (DELAYED)
        for (const node of this._hiddenNodes) {
            // If node is not currently hit
            if (!this._currentHits.has(node)) {
                // If no restore timer yet, start one
                if (!this._restoreTimers.has(node)) {
                    this._restoreTimers.set(node, this._restoreDelay);
                } else {
                    // Update existing timer
                    const timer = this._restoreTimers.get(node)! - deltaTime;
                    this._restoreTimers.set(node, timer);
                    
                    // If timer finished, restore node
                    if (timer <= 0) {
                        const occludable = node.getComponent(Occludable);
                        if (occludable) {
                            occludable.setOccluded(false);
                        } 
                        else if (!node.active) {
                            node.active = true;
                        }
                        this._restoreTimers.delete(node);
                        this._hiddenNodes.delete(node);
                    }
                }
            } else {
                // Reset timer if hit again
                if (this._restoreTimers.has(node)) {
                    this._restoreTimers.delete(node);
                }
            }
        }
    }
}
