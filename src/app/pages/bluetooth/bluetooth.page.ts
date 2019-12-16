import { BluetoothService, StorageService } from './../../providers/providers';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import EscPosEncoder from 'esc-pos-encoder-ionic';

/**
 * 이 클래스는 사용자에게 몇 가지 옵션을 조작 할 수있는 인터페이스를 제공합니다.
 */
@Component({
  selector: 'app-bluetooth',
  templateUrl: 'bluetooth.page.html',
  styleUrls: ['bluetooth.page.scss']
})
export class BluetoothPage implements OnInit, OnDestroy {

  devices: any[] = [];
  showSpinner = false;
  isConnected = false;
  message = '';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private bluetooth: BluetoothService,
    private storage: StorageService
  ) {
  }

  ngOnInit() {
    this.showSpinner = true;
    this.bluetooth.storedConnection().then((connected) => {
      this.isConnected = true;
      this.showSpinner = false;
    }, (fail) => {
      this.bluetooth.searchBluetooth().then((devices: Array<Object>) => {
        this.devices = devices;
        this.showSpinner = false;
      }, (error) => {
        this.presentToast(this.translate.instant(error));
        this.showSpinner = false;
      });
    });
  }
  /**
   * 블루투스 연결해제.
   */
  disconnect(): Promise<boolean> {
    return new Promise(result => {
      this.isConnected = false;
      this.bluetooth.disconnect().then(response => {
        result(response);
      });
    });
  }
  /**
   * 응용 프로그램을 닫을 때 Bluetooth 연결이 닫혀 있는지 확인.
   */
  ngOnDestroy() {
    this.disconnect();
  }
  /**
   * 화면을 아래로 끌어서 Bluetooth 장치를 검색하십시오.
   * @param refresher
   */
  refreshBluetooth(refresher) {
    if (refresher) {
      this.bluetooth.searchBluetooth().then((successMessage: Array<Object>) => {
        this.devices = [];
        this.devices = successMessage;
        refresher.target.complete();
      }, fail => {
        this.presentToast(this.translate.instant(fail));
        refresher.target.complete();
      });
    }
  }
  /**
   * 이미 블루투스 장치에 연결되어 있는지 확인하십시오.
   * @param seleccion
   */
  checkConnection(seleccion) {
    this.bluetooth.checkConnection().then(async (isConnected) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.TITLE'),
        message: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.MESSAGE'),
        buttons: [
          {
            text: this.translate.instant('취소'),
            role: 'cancel',
            handler: () => {}
          },
          {
            text: this.translate.instant('수락'),
            handler: () => {
              this.disconnect().then(() => {
                this.bluetooth.deviceConnection(seleccion.id).then(success => {
                  this.isConnected = true;
                  this.presentToast(this.translate.instant(success));
                }, fail => {
                  this.isConnected = false;
                  this.presentToast(this.translate.instant(fail));
                });
              });
            }
          }
        ]
      });
      await alert.present();
    }, async (notConnected) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.TITLE'),
        message: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.MESSAGE'),
        buttons: [
          {
            text: this.translate.instant('취소'),
            role: 'cancel',
            handler: () => {}
          },
          {
            text: this.translate.instant('수락'),
            handler: () => {
              this.bluetooth.deviceConnection(seleccion.id).then(success => {
                this.isConnected = true;
                this.presentToast(this.translate.instant(success));
              }, fail => {
                this.isConnected = false;
                this.presentToast(this.translate.instant(fail));
              });
            }
          }
        ]
      });
      await alert.present();
    });
  }
  /**
   * 블루투스를 통해 연결할 때 시리얼을 통해 문자 메시지를 보냅니다.
   */
  sendMessage(message: string) {

    const encoder = new EscPosEncoder();
    const result = encoder.initialize();
    result
    .codepage('cp949')
    .line(message)
    .newline()
    .newline()
    .newline()

    this.bluetooth.dataInOut(result.encode());
    /*
    .subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        try {
          if (data) {
            const entry = JSON.parse(data);

          }
        } catch (error) {
          console.log(`[bluetooth-168]: ${JSON.stringify(error)}`);
        }
        this.message = '';
      } else {
        this.presentToast(this.translate.instant(data));
      }
    });
    */
  }
 
  /**
   * 메시지 표시
   * @param {string} text
   */
  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }
}
