import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { StorageService } from '../storage/storage.service';
import { Observable, Subscription, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
/**
 * 이 클래스는 블루투스 연결을 처리합니다.
 *
 * @see [Bluetooth Serial](https://ionicframework.com/docs/native/bluetooth-serial/)
 */
@Injectable()
export class BluetoothService {

  private connection: Subscription;
  private connectionCommunication: Subscription;
  private reader: Observable<any>;

  constructor(
    private bluetoothSerial: BluetoothSerial,
    private storage: StorageService
  ) {  }
  /**
   * 사용 가능한 블루투스 장치를 검색하고 기능을 사용할 수 있는지 평가
   * 장치의 블루투스.
   * @return {Promise<Object>} 찾은 장치 목록을 반환합니다.
   */
  searchBluetooth(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isEnabled().then(success => {
        this.bluetoothSerial.discoverUnpaired().then(response => {
          if (response.length > 0) {
            resolve(response);
          } else {
            reject('BLUETOOTH.NOT_DEVICES_FOUND');
          }
        }).catch((error) => {
          console.log(`[bluetooth.service-41] Error: ${JSON.stringify(error)}`);
          reject('BLUETOOTH.NOT_AVAILABLE_IN_THIS_DEVICE');
        });
      }, fail => {
        console.log(`[bluetooth.service-45] Error: ${JSON.stringify(fail)}`);
        reject('BLUETOOTH.NOT_AVAILABLE');
      });
    });
  }
  /**
   * 이미 블루투스 장치에 연결되어 있는지 확인하십시오.
   */
  checkConnection() {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isConnected().then(isConnected => {
        resolve('BLUETOOTH.CONNECTED');
      }, notConnected => {
        reject('BLUETOOTH.NOT_CONNECTED');
      });
    });
  }
  /**
   * id로 블루투스 기기에 부여됩니다.
   * @param id 연결하려는 장치의 ID입니다
   * @return {Promise<any>} 성공적으로 연결되었는지 여부를 나타내는 메시지를 반환합니다.
   */
  deviceConnection(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connection = this.bluetoothSerial.connect(id).subscribe(() => {
        this.storage.setBluetoothId(id);
        resolve('BLUETOOTH.CONNECTED');
      }, fail => {
        console.log(`[bluetooth.service-88] Error conexión: ${JSON.stringify(fail)}`);
        reject('BLUETOOTH.CANNOT_CONNECT');
      });
    });
  }
  /**
   * 블루투스 장치와 연결하기 위해 소켓을 닫습니다.
   * @return {Promise<boolean>}
   */
  disconnect(): Promise<boolean> {
    return new Promise((result) => {
      if (this.connectionCommunication) {
        this.connectionCommunication.unsubscribe();
      }
      if (this.connection) {
        this.connection.unsubscribe();
      }
      result(true);
    });
  }
  /**
   * 블루투스 장치에 연결 한 후 직렬 통신을위한 소켓을 설정합니다.
   * @param message 보내려는 텍스트입니다.
   * @returns {Observable<any>} 연결을 통해 도착한 텍스트를 반환
   * 장치에 대한 Bluetooth, 연결이 없으면 다음을 나타내는 메시지가 표시됩니다.
   * _ 블루투스 장치에 연결되어 있지 않습니다_.
   */
  dataInOut(message){
    return this.bluetoothSerial.write(message);
  }
  /*
  dataInOut(message: string): Observable<any> {
    return Observable.create(observer => {
      this.bluetoothSerial.isConnected().then((isConnected) => {
        this.reader = from(this.bluetoothSerial.write(message)).pipe(mergeMap(() => {
            return this.bluetoothSerial.subscribeRawData();
          })).pipe(mergeMap(() => {
            return this.bluetoothSerial.readUntil('\n');   // <= delimitador
          }));
        this.reader.subscribe(data => {
          observer.next(data);
        });
      }, notConected => {
        observer.next('BLUETOOTH.NOT_CONNECTED');
        observer.complete();
      });
    });
  }
  */
  /**
   * 코드의 다른 부분에서 호출하여
   * 마지막으로 연결된 Bluetooth 장치의 ID입니다.
   * @return {Promise<any>} 성공적으로 연결되었는지 여부를 나타내는 메시지를 반환합니다.
   */
  storedConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.getBluetoothId().then(bluetoothId => {
        console.log(`[bluetooth.service-129] ${bluetoothId}`);
        this.deviceConnection(bluetoothId).then(success => {
          resolve(success);
        }, fail => {
          reject(fail);
        });
      });
    });
  }
}
