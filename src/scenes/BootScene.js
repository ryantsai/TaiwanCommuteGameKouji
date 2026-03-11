import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('bikeReal', 'src/assets/images/player_bike.png');
    this.load.image('poiShopReal', 'src/assets/images/poi_shop.png');
    this.load.image('poiOfficeReal', 'src/assets/images/poi_office.png');
    this.load.image('poiPoliceReal', 'src/assets/images/poi_police.png');
    this.load.image('poiCustomerReal', 'src/assets/images/poi_customer.png');
    this.load.audio('bgmLoop', 'src/assets/audio/bgm_time_driving.ogg');
    this.load.audio('sfxInteract', 'src/assets/audio/sfx_interact.ogg');
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x4a8f3a, 1); g.fillRect(0, 0, 64, 64); g.generateTexture('grass', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(32, 0, 32, 64); g.generateTexture('road-v', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(0, 32, 64, 32); g.generateTexture('road-h', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0,0,64,64); g.lineStyle(2,0xf8fafc,0.9); g.lineBetween(32,0,32,64); g.lineBetween(0,32,64,32); g.generateTexture('road-x',64,64); g.clear();
    g.fillStyle(0x64748b,1); g.fillRect(0,0,64,64); g.fillStyle(0x94a3b8,1); g.fillRect(8,8,48,48); g.generateTexture('building',64,64); g.clear();
    g.fillStyle(0xf59e0b,1); g.fillRoundedRect(0,0,64,64,8); g.fillStyle(0x111827,1); g.fillRect(10,28,44,6); g.generateTexture('poi-shop',64,64); g.clear();
    g.fillStyle(0x22c55e,1); g.fillRoundedRect(0,0,64,64,8); g.fillStyle(0x052e16,1); g.fillRect(10,28,44,6); g.generateTexture('poi-office',64,64); g.clear();

    // bike texture
    g.fillStyle(0x1d4ed8, 1); g.fillRoundedRect(4, 18, 56, 28, 6);
    g.fillStyle(0x111827, 1); g.fillCircle(14, 50, 10); g.fillCircle(50, 50, 10);
    g.fillStyle(0xfbbf24, 1); g.fillRect(50, 22, 8, 6);
    g.generateTexture('bike', 64, 64); g.clear();

    // rain pixel
    g.fillStyle(0x93c5fd, 1); g.fillRect(0, 0, 2, 8); g.generateTexture('rain', 2, 8); g.clear();

    this.textures.renameTexture('bike','bikeFallback');
    this.scene.start('WorldScene');
  }
}
