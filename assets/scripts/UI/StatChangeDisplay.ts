import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Component for the StatChange prefab
 * This is just a marker component, the actual logic is in upperInfo
 */
@ccclass('StatChangeDisplay')
export class StatChangeDisplay extends Component {
    start() {
        // This component is just for identification
        // The upperInfo component handles all the logic
    }
}
