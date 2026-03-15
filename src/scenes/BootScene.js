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

// 圖磚表
import tilemapUrl from '../assets/images/tilemap_packed.png';

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

import { VEHICLES } from '../TileData.js';

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

    // 圖磚表（8×8 spritesheet）
    this.load.spritesheet('cityTiles', tilemapUrl, {
      frameWidth: 8, frameHeight: 8,
    });

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

    // 用圖磚組合 NPC 車輛精靈紋理
    this._buildVehicleTextures();

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

    // ===== POI 建築物紋理 =====
    // 城隍廟（紅色廟宇風格）
    g.fillStyle(0x8b1a1a, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0xdc2626, 1); g.fillRect(4, 0, 40, 8);
    g.fillStyle(0xfbbf24, 1); g.fillRect(4, 2, 40, 3);
    g.fillStyle(0xb91c1c, 1); g.fillRect(6, 10, 36, 34);
    g.fillStyle(0xfef08a, 0.9);
    g.fillRect(12, 14, 8, 10); g.fillRect(28, 14, 8, 10);
    g.fillStyle(0x7c2d12, 1); g.fillRect(20, 28, 8, 20);
    g.generateTexture('poiTemple', 48, 48); g.clear();

    // 新竹車站（灰白色歐風車站）
    g.fillStyle(0x64748b, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0xe2e8f0, 1); g.fillRect(4, 6, 40, 38);
    g.fillStyle(0x475569, 1); g.fillRect(4, 0, 40, 8);
    g.fillStyle(0x334155, 1); g.fillRect(16, 2, 16, 4);
    g.fillStyle(0x93c5fd, 0.8);
    g.fillRect(8, 12, 6, 8); g.fillRect(18, 12, 6, 8); g.fillRect(28, 12, 6, 8); g.fillRect(38, 12, 6, 8);
    g.fillStyle(0x475569, 1); g.fillRect(18, 30, 12, 18);
    g.generateTexture('poiStation', 48, 48); g.clear();

    // 巨城 Big City（現代商場）
    g.fillStyle(0x1e40af, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x3b82f6, 1); g.fillRect(2, 2, 44, 44);
    g.fillStyle(0x93c5fd, 0.6);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillRect(4 + col * 11, 4 + row * 11, 8, 8);
      }
    }
    g.fillStyle(0x22c55e, 1); g.fillRect(16, 38, 16, 10);
    g.generateTexture('poiMall', 48, 48); g.clear();

    // 清華大學（校門風格）
    g.fillStyle(0x4a6741, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x6b8f60, 1); g.fillRect(2, 2, 44, 44);
    g.fillStyle(0x8b5cf6, 1); g.fillRect(10, 8, 28, 20);
    g.fillStyle(0xfef08a, 0.8);
    g.fillRect(14, 12, 6, 6); g.fillRect(28, 12, 6, 6);
    g.fillStyle(0xffffff, 1); g.fillRect(16, 34, 16, 2);
    g.fillRect(10, 32, 4, 6); g.fillRect(34, 32, 4, 6);
    g.generateTexture('poiUniversity', 48, 48); g.clear();

    // 科學園區公司（現代辦公大樓）
    g.fillStyle(0x334155, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x475569, 1); g.fillRect(3, 3, 42, 42);
    g.fillStyle(0x93c5fd, 0.7);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        g.fillRect(5 + col * 8, 5 + row * 8, 6, 5);
      }
    }
    g.fillStyle(0x22c55e, 1); g.fillRect(10, 42, 28, 6);
    g.generateTexture('poiOffice', 48, 48); g.clear();

    g.destroy();

    // 爆炸動畫
    this.anims.create({
      key: 'explode',
      frames: Array.from({ length: 9 }, (_, i) => ({ key: `exp${i}` })),
      frameRate: 16,
      repeat: 0,
    });

    this.scene.start('WorldScene');
  }

  _buildVehicleTextures() {
    // 水平車輛：16×8px（2 tiles 橫排）
    const hVehicles = {
      tileCarRedH: VEHICLES.H_RED,
      tileCarGreenH: VEHICLES.H_GREEN,
      tileCarYellowH: VEHICLES.H_YELLOW,
      tileBusH: VEHICLES.H_BUS,
    };
    for (const [name, frames] of Object.entries(hVehicles)) {
      const rt = this.make.renderTexture({ width: 16, height: 8, add: false });
      rt.drawFrame('cityTiles', frames[0], 0, 0);
      rt.drawFrame('cityTiles', frames[1], 8, 0);
      rt.saveTexture(name);
      rt.destroy();
    }

    // 垂直車輛：8×16px（2 tiles 直排）
    const vVehicles = {
      tileCarBlueV: VEHICLES.V_BLUE,
      tileCarRedV: VEHICLES.V_RED,
      tileCarRed2V: VEHICLES.V_RED2,
      tileTruckV: VEHICLES.V_TRUCK,
    };
    for (const [name, frames] of Object.entries(vVehicles)) {
      const rt = this.make.renderTexture({ width: 8, height: 16, add: false });
      rt.drawFrame('cityTiles', frames[0], 0, 0);
      rt.drawFrame('cityTiles', frames[1], 0, 8);
      rt.saveTexture(name);
      rt.destroy();
    }
  }
}
