import { _decorator, BoxCollider, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {

    boxCollider: BoxCollider;
    private _hasCollidedWithPlane: boolean = false;
    private _hasCollidedWithObstacle: boolean = false;
    private _isEligible: boolean = false;

    start() {
        this.boxCollider = this.getComponent(BoxCollider);
        if (this.boxCollider) {
            this.boxCollider.on('onCollisionEnter', this._onCollisionEnter, this);
        }
    }

    update(deltaTime: number) {
        
    }

    private _onCollisionEnter(event: any) {
        if (event.contacts && event.contacts.length > 0) {
            const otherBody = event.contacts[0].getOtherBody(this.boxCollider);
            if (otherBody) {
                if (otherBody.node.name.includes('Plane') || otherBody.node.name === 'Ground') {
                    this._hasCollidedWithPlane = true;
                    this._updateEligibility();
                } else if (otherBody.node.name.includes('Obstacle')) {
                    this._hasCollidedWithObstacle = true;
                    this._updateEligibility();
                }
            }
        }
    }

    private _updateEligibility() {
        this._isEligible = this._hasCollidedWithPlane && !this._hasCollidedWithObstacle;
    }

    isEligible(): boolean {
        return this._isEligible;
    }

    hasCollidedWithObstacle(): boolean {
        return this._hasCollidedWithObstacle;
    }
}


