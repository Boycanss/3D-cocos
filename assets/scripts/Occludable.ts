import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Occludable')
export class Occludable extends Component {
    private _originalActiveState: boolean = true;
    private _isOccluded: boolean = false;

    start() {
        // Store the original active state of the visual mesh (first child)
        if (this.node.children.length > 0) {
            this._originalActiveState = this.node.children[0].activeInHierarchy;
        }
        console.log(this._originalActiveState);
    }

    update(deltaTime: number) {
        // This method is intentionally left empty as we'll control
        // the occlusion state through the raycast detection system
    }

    setOccluded(isOccluded: boolean) {
        if (this._isOccluded === isOccluded) {
            return;
        }

        this._isOccluded = isOccluded;
        
        // Only hide the visual mesh (first child), keep the root node active for collision detection
        if (this.node.children.length > 0) {
            if (isOccluded) {
                this.node.children[0].active = false;
            } else {
                this.node.children[0].active = this._originalActiveState;
            }
        }
    }

    // Method to reset the occlusion state
    resetOcclusion() {
        this._isOccluded = false;
        this.node.active = this._originalActiveState;
    }
}
