import Phaser from 'phaser';
import bikeUrl from '../assets/images/player_bike.png';
import scooterUrl from '../assets/images/scooter.png';
import shopUrl from '../assets/images/poi_shop.png';
import officeUrl from '../assets/images/poi_office.png';
import policeUrl from '../assets/images/poi_police.png';
import customerUrl from '../assets/images/poi_customer.png';

// NPC 車輛
import taxiUrl from '../assets/images/taxi.png';
import policeCarUrl from '../assets/images/police.png';
import ambulanceUrl from '../assets/images/ambulance.png';
import sedanUrl from '../assets/images/sedan_blue.png';
import redCarUrl from '../assets/images/rounded_red.png';
import greenCarUrl from '../assets/images/rounded_green.png';
import busUrl from '../assets/images/bus.png';
import truckUrl from '../assets/images/truck.png';
import sportsUrl from '../assets/images/sports_red.png';

// 道具
import trafficLightUrl from '../assets/images/traffic_light.png';
import barrierUrl from '../assets/images/barrier.png';

// 爆炸動畫
import exp0 from '../assets/images/pixelExplosion00.png';
import exp1 from '../assets/images/pixelExplosion01.png';
import exp2 from '../assets/images/pixelExplosion02.png';
import exp3 from '../assets/images/pixelExplosion03.png';
import exp4 from '../assets/images/pixelExplosion04.png';
import exp5 from '../assets/images/pixelExplosion05.png';
import exp6 from '../assets/images/pixelExplosion06.png';
import exp7 from '../assets/images/pixelExplosion07.png';
import exp8 from '../assets/images/pixelExplosion08.png';

// 音效
import bgmUrl from '../assets/audio/bgm_time_driving.ogg';
import bgmActionUrl from '../assets/audio/bgm_action.ogg';
import bgmGameoverUrl from '../assets/audio/bgm_gameover.ogg';
import sfxUrl from '../assets/audio/sfx_interact.ogg';
import sfxCoinUrl from '../assets/audio/sfx_coin.ogg';
import sfxCrashUrl from '../assets/audio/sfx_crash.ogg';
import sfxHurtUrl from '../assets/audio/sfx_hurt.ogg';
import sfxPowerupUrl from '../assets/audio/sfx_powerup.ogg';
import sfxBoostUrl from '../assets/audio/sfx_boost.ogg';
import sfxHonkUrl from '../assets/audio/sfx_honk.ogg';
import sfxGameoverUrl from '../assets/audio/sfx_gameover.ogg';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // 顯示載入畫面
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.graphics();
    const loadText = this.add.text(w / 2, h / 2 - 30, '載入中...', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

    this.load.on('progress', (v) => {
      bar.clear();
      bar.fillStyle(0x3b82f6, 1);
      bar.fillRect(w / 2 - 150, h / 2, 300 * v, 20);
      bar.lineStyle(2, 0xffffff, 1);
      bar.strokeRect(w / 2 - 150, h / 2, 300, 20);
    });
    this.load.on('complete', () => { bar.destroy(); loadText.destroy(); });

    // 角色
    this.load.image('bikeReal', bikeUrl);
    this.load.image('scooter', scooterUrl);

    // POI
    this.load.image('poiShopReal', shopUrl);
    this.load.image('poiOfficeReal', officeUrl);
    this.load.image('poiPoliceReal', policeUrl);
    this.load.image('poiCustomerReal', customerUrl);

    // NPC 車輛
    this.load.image('npcTaxi', taxiUrl);
    this.load.image('npcPolice', policeCarUrl);
    this.load.image('npcAmbulance', ambulanceUrl);
    this.load.image('npcSedan', sedanUrl);
    this.load.image('npcRed', redCarUrl);
    this.load.image('npcGreen', greenCarUrl);
    this.load.image('npcBus', busUrl);
    this.load.image('npcTruck', truckUrl);
    this.load.image('npcSports', sportsUrl);

    // 道具
    this.load.image('trafficLight', trafficLightUrl);
    this.load.image('barrier', barrierUrl);

    // 爆炸動畫幀
    const expFrames = [exp0, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8];
    expFrames.forEach((url, i) => this.load.image(`exp${i}`, url));

    // 音效
    this.load.audio('bgmLoop', bgmUrl);
    this.load.audio('bgmAction', bgmActionUrl);
    this.load.audio('bgmGameover', bgmGameoverUrl);
    this.load.audio('sfxInteract', sfxUrl);
    this.load.audio('sfxCoin', sfxCoinUrl);
    this.load.audio('sfxCrash', sfxCrashUrl);
    this.load.audio('sfxHurt', sfxHurtUrl);
    this.load.audio('sfxPowerup', sfxPowerupUrl);
    this.load.audio('sfxBoost', sfxBoostUrl);
    this.load.audio('sfxHonk', sfxHonkUrl);
    this.load.audio('sfxGameover', sfxGameoverUrl);
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // 草地 - 更豐富的顏色
    g.fillStyle(0x4a8f3a, 1); g.fillRect(0, 0, 64, 64);
    // 加點草紋理細節
    g.fillStyle(0x3d7a30, 0.5);
    for (let i = 0; i < 8; i++) {
      const rx = Math.floor(Math.random() * 60);
      const ry = Math.floor(Math.random() * 60);
      g.fillRect(rx, ry, 2, 4);
    }
    g.generateTexture('grass', 64, 64); g.clear();

    // 道路
    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(32, 0, 32, 64);
    g.generateTexture('road-v', 64, 64); g.clear();

    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(0, 32, 64, 32);
    g.generateTexture('road-h', 64, 64); g.clear();

    g.fillStyle(0x3f3f46, 1); g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xf8fafc, 0.9); g.lineBetween(32, 0, 32, 64); g.lineBetween(0, 32, 64, 32);
    g.generateTexture('road-x', 64, 64); g.clear();

    // 建築物 - 多種顏色
    const buildColors = [
      { wall: 0x64748b, roof: 0x94a3b8 },
      { wall: 0x7c5e3c, roof: 0xa47b52 },
      { wall: 0x4a6741, roof: 0x6b8f60 },
      { wall: 0x8b4513, roof: 0xcd853f },
      { wall: 0x5b3a6b, roof: 0x8b6aae },
    ];
    buildColors.forEach((c, i) => {
      g.fillStyle(c.wall, 1); g.fillRect(0, 0, 64, 64);
      g.fillStyle(c.roof, 1); g.fillRect(6, 6, 52, 52);
      // 窗戶
      g.fillStyle(0xfef08a, 0.8);
      g.fillRect(14, 14, 8, 8); g.fillRect(42, 14, 8, 8);
      g.fillRect(14, 42, 8, 8); g.fillRect(42, 42, 8, 8);
      g.generateTexture(`building${i}`, 64, 64); g.clear();
    });

    // 金幣
    g.fillStyle(0xfbbf24, 1); g.fillCircle(8, 8, 7);
    g.fillStyle(0xf59e0b, 1); g.fillCircle(8, 8, 4);
    g.fillStyle(0xfef3c7, 1); g.fillCircle(6, 6, 2);
    g.generateTexture('coin', 16, 16); g.clear();

    // 加速道具
    g.fillStyle(0x3b82f6, 1); g.fillCircle(10, 10, 9);
    g.fillStyle(0x60a5fa, 1); g.fillCircle(10, 10, 6);
    g.lineStyle(2, 0xffffff, 1);
    g.lineBetween(7, 5, 10, 10); g.lineBetween(10, 10, 7, 15);
    g.generateTexture('boostPickup', 20, 20); g.clear();

    // 時間加成道具
    g.fillStyle(0x22c55e, 1); g.fillCircle(10, 10, 9);
    g.fillStyle(0x4ade80, 1); g.fillCircle(10, 10, 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(9, 5, 2, 7); g.fillRect(9, 9, 5, 2);
    g.generateTexture('timePickup', 20, 20); g.clear();

    // 雨滴
    g.fillStyle(0x93c5fd, 1); g.fillRect(0, 0, 2, 8);
    g.generateTexture('rain', 2, 8); g.clear();

    // 火花粒子（碰撞用）
    g.fillStyle(0xff6b35, 1); g.fillRect(0, 0, 4, 4);
    g.generateTexture('spark', 4, 4); g.clear();

    // 人行道
    g.fillStyle(0x9ca3af, 1); g.fillRect(0, 0, 64, 64);
    g.fillStyle(0xd1d5db, 0.3);
    g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32);
    g.generateTexture('sidewalk', 64, 64); g.clear();

    // 爆炸動畫
    this.anims.create({
      key: 'explode',
      frames: Array.from({ length: 9 }, (_, i) => ({ key: `exp${i}` })),
      frameRate: 16,
      repeat: 0,
    });

    this.scene.start('WorldScene');
  }
}
