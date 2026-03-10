import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('bike', 'https://labs.phaser.io/assets/sprites/car90.png');
    this.load.audio('bgm', 'https://labs.phaser.io/assets/audio/tech.mp3');
    this.load.audio('sfxInteract', 'https://labs.phaser.io/assets/audio/SoundEffects/ping.mp3');
  }

  create() {
    // Procedural textures for road/city style
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x4a8f3a, 1); g.fillRect(0, 0, 64, 64); g.generateTexture('grass', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(32, 0, 32, 64); g.generateTexture('road-v', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(0, 32, 64, 32); g.generateTexture('road-h', 64, 64); g.clear();
    g.fillStyle(0x3f3f46, 1); g.fillRect(0,0,64,64); g.lineStyle(2,0xf8fafc,0.9); g.lineBetween(32,0,32,64); g.lineBetween(0,32,64,32); g.generateTexture('road-x',64,64); g.clear();
    g.fillStyle(0x64748b,1); g.fillRect(0,0,64,64); g.fillStyle(0x94a3b8,1); g.fillRect(8,8,48,48); g.generateTexture('building',64,64); g.clear();
    g.fillStyle(0xf59e0b,1); g.fillRoundedRect(0,0,64,64,8); g.fillStyle(0x111827,1); g.fillRect(10,28,44,6); g.generateTexture('poi-shop',64,64); g.clear();
    g.fillStyle(0x22c55e,1); g.fillRoundedRect(0,0,64,64,8); g.fillStyle(0x052e16,1); g.fillRect(10,28,44,6); g.generateTexture('poi-office',64,64); g.clear();

    this.scene.start('WorldScene');
  }
}
