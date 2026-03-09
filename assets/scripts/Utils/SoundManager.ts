import { _decorator, AudioClip, AudioSource, Camera, Component, geometry, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    private static _instance: SoundManager | null = null;

    @property(AudioSource)
    audioSource: AudioSource = null;

    @property(Node)
    mainCameraNode: Node = null;

    @property(AudioClip)
    jumpClip: AudioClip = null;

    @property(AudioClip)
    landingClip: AudioClip = null;

    @property(AudioClip)
    dashClip: AudioClip = null;

    @property(AudioClip)
    flagCollectClip: AudioClip = null;

    @property(AudioClip)
    missileLaunchClip: AudioClip = null;

    @property(AudioClip)
    missileImpactClip: AudioClip = null;

    @property(AudioClip)
    step1Clip: AudioClip = null;

    @property(AudioClip)
    step2Clip: AudioClip = null;

    protected onLoad(): void {
        if (SoundManager._instance && SoundManager._instance !== this) {
            this.destroy();
            return;
        }
        SoundManager._instance = this;
        if (!this.audioSource) {
            this.audioSource = this.getComponent(AudioSource);
        }
    }

    public static get instance(): SoundManager | null {
        return SoundManager._instance;
    }

    private playClip(clip: AudioClip | null): void {
        if (!this.audioSource || !clip) return;
        this.audioSource.playOneShot(clip, 1.0);
    }

    private isNodeVisibleInCamera(node: Node): boolean {
        if (!node || !this.mainCameraNode) return true;
        const camera = this.mainCameraNode.getComponent(Camera);
        if (!camera) return true;

        const frustum = new geometry.Frustum();
        camera.update();
        camera.updateFrustum(frustum);

        const position = node.getWorldPosition();
        const sphere = new geometry.Sphere(position.x, position.y, position.z, 0.5);
        return geometry.intersect.sphereFrustum(sphere, frustum);
    }

    playJump(): void {
        this.playClip(this.jumpClip);
    }

    playLanding(): void {
        this.playClip(this.landingClip);
    }

    playDash(): void {
        this.playClip(this.dashClip);
    }

    playFlagCollect(): void {
        this.playClip(this.flagCollectClip);
    }

    playMissileLaunch(source?: Node): void {
        if (source && !this.isNodeVisibleInCamera(source)) return;
        this.playClip(this.missileLaunchClip);
    }

    playMissileImpact(source?: Node): void {
        if (source && !this.isNodeVisibleInCamera(source)) return;
        this.playClip(this.missileImpactClip);
    }

    playStep(): void {
        const useFirst = Math.random() < 0.5;
        this.playClip(useFirst ? this.step1Clip : this.step2Clip);
    }
}
