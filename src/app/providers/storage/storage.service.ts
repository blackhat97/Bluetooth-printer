import { Injectable } from '@angular/core';

import { Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

  BLUETOOTH_ID = 'bluetoothId';
  LANG = 'lang';

  constructor(
    public events: Events,
    public storage: Storage
  ) {}
  /**
   * 사용자 유형을 반환.
   * @return {Promise<string | null>} bluetoothId.
   */
  async getBluetoothId(): Promise<string | null> {
    const bluetoothId = await this.storage.get(this.BLUETOOTH_ID);
    return (bluetoothId) ? bluetoothId : null;
  }
  /**
   * 사용자 유형을 저장.
   * @param {string} bluetoothId
   */
  async setBluetoothId(bluetoothId: string): Promise<any> {
    return await this.storage.set(this.BLUETOOTH_ID, bluetoothId);
  }
  /**
   * 사용자가 선택한 언어를 저장.
   * @param lang
   */
  async setLang(lang: string): Promise<any> {
    return await this.storage.set(this.LANG, lang);
  }
  /**
   * 사용자가 선택한 언어를 반환.
   * @return {Promise<string>}
   */
  async getLang(): Promise<string> {
    return await this.storage.get(this.LANG);
  }
}
