import { TranslateService } from '@ngx-translate/core';
import { Component, QueryList, ViewChildren } from '@angular/core';

import { Platform, Config, IonRouterOutlet, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './providers/providers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private storage: StorageService,
    private config: Config,
    private toastCtrl: ToastController,

  ) {
    this.initTranslate();
    this.initializeApp();
    this.backButtonEvent();

  }
  /**
   * 스플래시 화면 숨김
   */
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  /**
   * 기본 언어와 현재 언어를 설정
   */
  initTranslate() {
    this.translate.setDefaultLang('ko');
    this.storage.getLang().then(lang => {
      if (!lang && this.translate.getBrowserLang() !== undefined) {
        this.translate.use(this.translate.getBrowserLang());
      } else {
        this.translate.use(lang || 'ko'); // 기본언어 설정
      }
      this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
        this.config.set('backButtonText', values.BACK_BUTTON_TEXT);
      });
    });
  }

  backButtonEvent() {
    this.platform.backButton.subscribe(async () => {

      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
    
        if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
          navigator['app'].exitApp();
        } else {
          let toast = this.toastCtrl.create({
            message: '뒤로 버튼을 한번 더 누르시면 앱이 종료됩니다.',
            duration: 2000,
            position: 'bottom'
          });
          toast.then(toast => toast.present());
          this.lastTimeBackPress = new Date().getTime();
        }
        
      });
    });
  }

}
