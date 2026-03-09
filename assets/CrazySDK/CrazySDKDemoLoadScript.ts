import { _decorator, CCString, Component, director, error } from 'cc';
import CrazySDK from './CrazySDK';
const { ccclass, property } = _decorator;

@ccclass('CrazySDKDemoLoadScene')
export class CrazySDKDemoLoadScene extends Component {
  @property(CCString)
  nextSceneName = '';

  start() {
    CrazySDK.init()
      .then(() => {
        this.loadScene();
      })
      .catch((error) => {
        error(`Initialization failed ${error}`);
      });
  }

  loadScene() {
    if (this.nextSceneName) {
      director.loadScene(this.nextSceneName);
    } else {
      console.warn('Scene name is not provided');
    }
  }
}
