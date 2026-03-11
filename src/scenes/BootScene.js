import Phaser from 'phaser';
import bikeUrl from '../assets/images/player_bike.png';
import shopUrl from '../assets/images/poi_shop.png';
import officeUrl from '../assets/images/poi_office.png';
import policeUrl from '../assets/images/poi_police.png';
import customerUrl from '../assets/images/poi_customer.png';
import bgmUrl from '../assets/audio/bgm_time_driving.ogg';
import sfxUrl from '../assets/audio/sfx_interact.ogg';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('bikeReal', bikeUrl);
    this.load.image('poiShopReal', shopUrl);
    this.load.image('poiOfficeReal', officeUrl);
    this.load.image('poiPoliceReal', policeUrl);
    this.load.image('poiCustomerReal', customerUrl);
    this.load.audio('bgmLoop', bgmUrl);
    this.load.audio('sfxInteract', sfxUrl);
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x4a8f3a, 1); g.fillRect(0, 0, 64, 64); g.generateTexture('grass', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(32, 0, 32, 64); g.generateTexture('road-v', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(0, 32, 64, 32); g.generateTexture('road-h', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0,0,64,64); g.lineStyle(2,0xf8fafc,0.9); g.lineBetween(32,0,32,64); g.lineBetween(0,32,64,32); g.generateTexture('road-x',64,64); g.clear();
    g.fillStyle(0x64748b,1); g.fillRect(0,0,64,64); g.fillStyle(0x94a3b8,1); g.fillRect(8,8,48,48); g.generateTexture('building',64,64); g.clear();

    g.fillStyle(0x93c5fd, 1); g.fillRect(0, 0, 2, 8); g.generateTexture('rain', 2, 8); g.clear();

    this.scene.start('WorldScene');
  }
}
