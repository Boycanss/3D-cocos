import { _decorator, Component, director, sys } from 'cc';
import CrazySDK from '../../CrazySDK/CrazySDK';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

interface ParkourSaveData {
    bestTime: number;
    bestDistance: number;
    bestScore: number;
    updatedAt: number;
}

@ccclass('CrazyGamesManager')
export class CrazyGamesManager extends Component {
    private static _instance: CrazyGamesManager | null = null;

    @property({ tooltip: 'Enable CrazyGames integration for web builds' })
    enableCrazyGames: boolean = true;

    @property({ tooltip: 'Pause gameplay during ads and SDK-driven interruptions' })
    pauseOnAdBreak: boolean = true;

    @property({ tooltip: 'Mute audio during ads' })
    muteAudioDuringAds: boolean = true;

    private _isInitialized = false;
    private _isGameplayActive = false;
    private _isPausedBySdk = false;
    private _savedAudioVolume: number | null = null;
    private readonly _storageKey = 'parkourCrazySave';

    public static get instance(): CrazyGamesManager | null {
        return CrazyGamesManager._instance;
    }

    protected onLoad(): void {
        if (CrazyGamesManager._instance && CrazyGamesManager._instance !== this) {
            this.destroy();
            return;
        }

        CrazyGamesManager._instance = this;
        director.addPersistRootNode(this.node);
    }

    start(): void {
        this.initializeSdk();
    }

    private async initializeSdk(): Promise<void> {
        if (!this.enableCrazyGames || !sys.isBrowser || !CrazySDK.isSupportedPlatform) return;

        try {
            await CrazySDK.init();
            this._isInitialized = true;
            CrazySDK.game.loadingStart();
            CrazySDK.game.hideInviteButton();
        } catch (error) {
            console.warn('CrazySDK initialization failed', error);
        }
    }

    public notifyLoadingStarted(): void {
        if (!this._isInitialized) return;
        CrazySDK.game.loadingStart();
    }

    public notifyLoadingFinished(): void {
        if (!this._isInitialized) return;
        CrazySDK.game.loadingStop();
    }

    public notifyGameplayStart(): void {
        if (!this._isInitialized) return;
        this._isGameplayActive = true;
        CrazySDK.game.gameplayStart();
    }

    public notifyGameplayStop(): void {
        if (!this._isInitialized) return;
        this._isGameplayActive = false;
        CrazySDK.game.gameplayStop();
    }

    public happytime(): void {
        if (!this._isInitialized) return;
        CrazySDK.game.happytime();
    }

    public requestMidgameAd(onFinished?: () => void): void {
        if (!this._isInitialized) {
            onFinished?.();
            return;
        }

        CrazySDK.ad.requestAd('midgame', {
            adStarted: () => this.handleSdkPause(true),
            adFinished: () => {
                this.handleSdkResume(true);
                onFinished?.();
            },
            adError: () => {
                this.handleSdkResume(true);
                onFinished?.();
            },
        });
    }

    public requestRewardedAd(onReward?: () => void, onFinished?: () => void): void {
        if (!this._isInitialized) {
            onFinished?.();
            return;
        }

        let rewardGranted = false;
        CrazySDK.ad.requestAd('rewarded', {
            adStarted: () => this.handleSdkPause(true),
            adFinished: () => {
                rewardGranted = true;
                this.handleSdkResume(true);
                if (rewardGranted) onReward?.();
                onFinished?.();
            },
            adError: () => {
                this.handleSdkResume(true);
                onFinished?.();
            },
        });
    }

    public getUser(): Promise<any> | null {
        if (!this._isInitialized) return null;
        return CrazySDK.user.getUser();
    }

    public showAuthPrompt(): Promise<any> | null {
        if (!this._isInitialized) return null;
        return CrazySDK.user.showAuthPrompt();
    }

    public saveGameData(data: ParkourSaveData): void {
        const serialized = JSON.stringify(data);

        try {
            sys.localStorage.setItem(this._storageKey, serialized);
        } catch (error) {
            console.warn('Local save failed', error);
        }

        if (!this._isInitialized) return;

        try {
            CrazySDK.data.setItem(this._storageKey, serialized);
        } catch (error) {
            console.warn('CrazySDK cloud save failed', error);
        }
    }

    public async loadGameData(): Promise<ParkourSaveData | null> {
        if (this._isInitialized) {
            try {
                const remoteValue = CrazySDK.data.getItem(this._storageKey);
                if (remoteValue) {
                    return JSON.parse(remoteValue) as ParkourSaveData;
                }
            } catch (error) {
                console.warn('CrazySDK cloud load failed', error);
            }
        }

        try {
            const localValue = sys.localStorage.getItem(this._storageKey);
            return localValue ? JSON.parse(localValue) as ParkourSaveData : null;
        } catch (error) {
            console.warn('Local load failed', error);
            return null;
        }
    }

    public async syncExistingLocalData(bestTime: number, bestDistance: number, bestScore: number): Promise<ParkourSaveData> {
        const cloudData = await this.loadGameData();
        const merged: ParkourSaveData = {
            bestTime: Math.max(cloudData?.bestTime || 0, bestTime || 0),
            bestDistance: Math.max(cloudData?.bestDistance || 0, bestDistance || 0),
            bestScore: Math.max(cloudData?.bestScore || 0, bestScore || 0),
            updatedAt: Date.now(),
        };

        this.saveGameData(merged);
        return merged;
    }

    public handleSdkPause(fromAd = false): void {
        if (this._isPausedBySdk) return;
        this._isPausedBySdk = true;

        if (this.pauseOnAdBreak) {
            director.pause();
        }

        if (this.muteAudioDuringAds) {
            const soundManager = SoundManager.instance;
            if (soundManager?.audioSource) {
                this._savedAudioVolume = soundManager.audioSource.volume;
                soundManager.setMuted(true);
            }
        }

        if (fromAd) {
            this.notifyGameplayStop();
        }
    }

    public handleSdkResume(fromAd = false): void {
        if (!this._isPausedBySdk) return;
        this._isPausedBySdk = false;

        if (this.pauseOnAdBreak) {
            director.resume();
        }

        if (this.muteAudioDuringAds && this._savedAudioVolume !== null) {
            const soundManager = SoundManager.instance;
            if (soundManager?.audioSource) {
                soundManager.audioSource.volume = this._savedAudioVolume;
            }
            this._savedAudioVolume = null;
        }

        if (fromAd && this._isGameplayActive) {
            this.notifyGameplayStart();
        }
    }
}
