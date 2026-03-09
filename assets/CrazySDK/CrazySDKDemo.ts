import { _decorator, Component, debug, log, Label, error } from 'cc';
import CrazySDK from './CrazySDK';
const { ccclass, property } = _decorator;

/**
 * You can find the documentation here https://docs.crazygames.com/sdk/cocos
 */

@ccclass('CrazySDKDemo')
export class CrazySDKDemo extends Component {
  @property({ type: Label })
  supportedPlatformLabel: Label;

  @property({ type: Label })
  environmentLabel: Label;

  @property({ type: Label })
  adblockUsageLabel: Label;

  @property({ type: Label })
  inviteLinkLabel: Label;

  onLoad() {
    this.supportedPlatformLabel.string = `Supported platform: ${CrazySDK.isSupportedPlatform ? 'yes' : 'no'}`;
    if (CrazySDK.isSupportedPlatform) {
      CrazySDK.init()
        .then(() => {
          this.environmentLabel.string = `Environment: ${CrazySDK.environment}`;
        })
        .catch((error) => {
          error(`Initialization failed ${error}`);
        });
    }
  }

  //#region Ad module

  showRewardedVideo() {
    CrazySDK.ad.requestAd('rewarded', {
      adError: (error) => {
        log('Rewarded video error', error);
      },
      adStarted: () => {
        log('Rewarded video started');
      },
      adFinished: () => {
        log('Rewarded video finished');
      },
    });
  }

  showAdBreakVideo() {
    CrazySDK.ad.requestAd('midgame', {
      adError: (error) => {
        log('Ad break video error', error);
      },
      adStarted: () => {
        log('Ad break video started');
      },
      adFinished: () => {
        log('Ad break video finished');
      },
    });
  }

  //#endregion

  //#region Game module

  async checkAdblockUsage() {
    try {
      const adblockUsage = await CrazySDK.ad.hasAdblock(); // you can also pass a callback object if you don't have the possibility to use promises
      this.adblockUsageLabel.string = `Adblock: ${adblockUsage ? 'on' : 'off'}`;
    } catch (e) {
      this.adblockUsageLabel.string = 'Adblock check failed';
      error('Adblock check failed', e);
    }
  }

  gameplayStart() {
    CrazySDK.game.gameplayStart();
  }

  gameplayStop() {
    CrazySDK.game.gameplayStop();
  }

  sdkGameLoadingStart() {
    CrazySDK.game.loadingStart();
  }

  sdkGameLoadingStop() {
    CrazySDK.game.loadingStop();
  }

  happytime() {
    CrazySDK.game.happytime();
  }

  async inviteLink() {
    const inviteLink = await CrazySDK.game.inviteLink({ roomId: '123' }); // you can also pass a callback object if you don't have the possibility to use promises
    this.inviteLinkLabel.string = inviteLink;
  }

  //#endregion

  //#region User module

  async getUser() {
    const user = await CrazySDK.user.getUser();
    console.log(`User retrieved: ${JSON.stringify(user)}`);
  }

  async showAuthPrompt() {
    const result = await CrazySDK.user.showAuthPrompt();
    console.log(`Auth prompt result: ${JSON.stringify(result)}`);
  }

  //#endregion
}
