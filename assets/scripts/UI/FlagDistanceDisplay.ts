import { _decorator, Component, Label, Node, Vec3 } from 'cc';
import { FlagManager } from '../GameManager/FlagManager';
const { ccclass, property } = _decorator;

@ccclass('FlagDistanceDisplay')
export class FlagDistanceDisplay extends Component {
    @property(Node)
    playerNode: Node = null;

    @property(FlagManager)
    flagManager: FlagManager = null;

    @property(Label)
    distanceLabel: Label = null;

    @property({ tooltip: 'Show distance in meters' })
    showDistance: boolean = true;

    @property({ tooltip: 'Number of decimal places' })
    decimalPlaces: number = 1;

    @property({ tooltip: 'Prefix text (e.g., "Distance: ")' })
    prefixText: string = '';

    @property({ tooltip: 'Suffix text (e.g., "m")' })
    suffixText: string = 'm';

    update(deltaTime: number) {
        if (!this.playerNode || !this.flagManager || !this.distanceLabel) {
            return;
        }

        if (!this.showDistance) {
            this.distanceLabel.string = '';
            return;
        }

        // Get current flag
        const currentFlag = this.flagManager.getCurrentFlag();
        
        if (!currentFlag || !currentFlag.isValid) {
            this.distanceLabel.string = '';
            return;
        }

        // Calculate distance
        const playerPos = this.playerNode.getWorldPosition();
        const flagPos = currentFlag.getWorldPosition();
        const distance = Vec3.distance(playerPos, flagPos);

        // Format and display
        const distanceText = distance.toFixed(this.decimalPlaces);
        this.distanceLabel.string = `${this.prefixText}${distanceText}${this.suffixText}`;
    }
}
