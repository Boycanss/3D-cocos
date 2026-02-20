import { _decorator, Component, Node, Prefab, instantiate, Vec3, randomRange, CCInteger, CCFloat } from 'cc';
const { ccclass, property } = _decorator;
import { SurvivalZone } from '../SurvivalZone';

@ccclass('SurvivalZoneManager')
export class SurvivalZoneManager extends Component {
    @property(Prefab)
    survivalZonePrefab: Prefab = null;

    @property(Node)
    playerNode: Node = null;

    @property(CCInteger)
    spawnCount: number = 3;

    @property(CCFloat)
    spawnRadius: number = 10;

    start() {
        this.spawnZones();
    }

    spawnZones() {
        if (!this.survivalZonePrefab) {
            console.error('SurvivalZone prefab not assigned');
            return;
        }

        for (let i = 0; i < this.spawnCount; i++) {
            const zone = instantiate(this.survivalZonePrefab);
            // Random position within radius
            const randomPos = new Vec3(
                randomRange(-this.spawnRadius, this.spawnRadius),
                this.node.position.y,
                randomRange(-this.spawnRadius, this.spawnRadius)
            );
            zone.setPosition(randomPos);
            zone.setParent(this.node);
        }
    }

    clearZones() {
        this.node.children.forEach(child => {
            child.destroy();
        });
    }
}
