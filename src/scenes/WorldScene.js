import Phaser from 'phaser';

const TILE = 64;
const MAP_W = 40;
const MAP_H = 28;
const ROAD_COLS = [8, 9, 18, 19, 28, 29]; // 雙線道
const ROAD_ROWS = [6, 7, 14, 15, 22, 23];
const NPC_TYPES = ['npcTaxi', 'npcPolice', 'npcAmbulance', 'npcSedan', 'npcRed', 'npcGreen', 'npcBus', 'npcTruck', 'npcSports'];

export default class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  create() {
    this.score = 0;
    this.combo = 1;
    this.lastCoinTime = 0;
    this.isBoosting = false;
    this.boostFuel = 100;
    this.invincible = false;
    this.gameOver = false;
    this.gameWon = false;
    this.baseSpeed = 200;
    this.npcHonkTimer = 0;

    // 建構地圖
    this.buildMap();

    // 建立群組
    this.coins = this.physics.add.group();
    this.boosts = this.physics.add.group();
    this.timeBonuses = this.physics.add.group();
    this.npcCars = this.physics.add.group();

    // 放置金幣和道具
    this.spawnCoins();
    this.spawnPowerups();

    // 生成 NPC 車輛
    this.spawnNPCCars();

    // 玩家
    this.player = this.physics.add.sprite(8 * TILE + 32, 6 * TILE + 32, 'scooter').setScale(3);
    this.player.setAngle(90);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(12, 8).setOffset(2, 1);
    this.player.setDepth(5);

    // 尾焰粒子效果
    this.exhaust = this.add.particles(0, 0, 'spark', {
      follow: this.player,
      followOffset: { x: -10, y: 0 },
      lifespan: 300,
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      quantity: 1,
      emitting: false,
      tint: [0xff6b35, 0xfbbf24, 0xff4444],
    });

    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.physics.add.collider(this.player, this.blockers);

    // 碰撞偵測
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.boosts, this.collectBoost, null, this);
    this.physics.add.overlap(this.player, this.timeBonuses, this.collectTime, null, this);
    this.physics.add.overlap(this.player, this.npcCars, this.hitByCar, null, this);

    // 操控
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D,E,SPACE');
    this.setupVirtualControls();

    // 音效
    this.engineSound = this.sound.add('bgmLoop', { loop: true, volume: 0.15 });
    this.engineSound.play();
    this.sfx = {
      interact: this.sound.add('sfxInteract', { volume: 0.4 }),
      coin: this.sound.add('sfxCoin', { volume: 0.3 }),
      crash: this.sound.add('sfxCrash', { volume: 0.5 }),
      hurt: this.sound.add('sfxHurt', { volume: 0.4 }),
      powerup: this.sound.add('sfxPowerup', { volume: 0.4 }),
      boost: this.sound.add('sfxBoost', { volume: 0.3 }),
      honk: this.sound.add('sfxHonk', { volume: 0.2 }),
      gameover: this.sound.add('sfxGameover', { volume: 0.5 }),
    };

    // 任務系統
    this.questState = {
      stage: 0,
      startAt: this.time.now,
      deadlineMs: 180000,
    };

    // HUD
    this.setupHUD();

    // 目標方向箭頭（螢幕邊緣指向當前任務目標）
    this.arrow = this.add.triangle(0, 0, 0, 12, 20, 0, 0, -12, 0xfbbf24)
      .setScrollFactor(0).setDepth(12).setAlpha(0.85);
    this.arrowDist = this.add.text(0, 0, '', {
      fontSize: '13px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(12).setOrigin(0.5);

    // 雨
    this.rain = this.add.particles(0, 0, 'rain', {
      x: { min: 0, max: MAP_W * TILE },
      y: 0, lifespan: 800,
      speedY: { min: 600, max: 900 },
      speedX: { min: -50, max: -100 },
      scale: { start: 0.04, end: 0.02 },
      alpha: { start: 0.4, end: 0 },
      quantity: 4,
      emitting: false,
    });
    this.rain.setScrollFactor(0.9).setDepth(15);

    // 定時重生金幣和道具
    this.time.addEvent({ delay: 8000, callback: this.spawnCoins, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 15000, callback: this.spawnPowerups, callbackScope: this, loop: true });

    // NPC 定時補充
    this.time.addEvent({ delay: 5000, callback: this.spawnNPCCars, callbackScope: this, loop: true });

    // 隨機事件
    this.time.addEvent({ delay: 20000, callback: this.randomEvent, callbackScope: this, loop: true });

    this.setStage(0);
  }

  buildMap() {
    this.add.tileSprite(0, 0, MAP_W * TILE, MAP_H * TILE, 'grass').setOrigin(0);
    this.blockers = this.physics.add.staticGroup();
    this.interactives = this.physics.add.staticGroup();

    const roadColSet = new Set(ROAD_COLS);
    const roadRowSet = new Set(ROAD_ROWS);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        const isV = roadColSet.has(x);
        const isH = roadRowSet.has(y);

        if (isV && isH) {
          this.add.image(cx, cy, 'road-x');
        } else if (isV) {
          this.add.image(cx, cy, 'road-v');
        } else if (isH) {
          this.add.image(cx, cy, 'road-h');
        } else {
          // 路旁人行道
          const nearRoadV = roadColSet.has(x - 1) || roadColSet.has(x + 1);
          const nearRoadH = roadRowSet.has(y - 1) || roadRowSet.has(y + 1);
          if (nearRoadV || nearRoadH) {
            this.add.image(cx, cy, 'sidewalk').setAlpha(0.7);
          }

          // 建築物（離道路遠一些）
          if (!nearRoadV && !nearRoadH && (x + y * 3) % 5 === 0 && x > 1 && x < MAP_W - 2 && y > 1 && y < MAP_H - 2) {
            const bType = (x * 7 + y * 13) % 5;
            const b = this.add.image(cx, cy, `building${bType}`);
            this.blockers.add(b);
          }
        }
      }
    }

    // 紅綠燈放在路口
    const intersections = [];
    for (const col of [8, 18, 28]) {
      for (const row of [6, 14, 22]) {
        intersections.push({ x: col, y: row });
        this.add.image((col - 1) * TILE + TILE / 2, (row - 1) * TILE + TILE / 2, 'trafficLight')
          .setScale(2).setAlpha(0.9).setDepth(3);
      }
    }

    // POI（興趣點）
    this.poi = {
      shop: this.createPOI(18, 6, 'poiShopReal', '便利店', 0xfbbf24),
      customer: this.createPOI(8, 22, 'poiCustomerReal', '客戶', 0x3b82f6),
      office: this.createPOI(28, 22, 'poiOfficeReal', '公司', 0x22c55e),
      police: this.createPOI(18, 14, 'poiPoliceReal', '警察局', 0xef4444),
    };
    Object.values(this.poi).forEach((p) => this.interactives.add(p.sprite));
  }

  createPOI(gridX, gridY, texture, label, color) {
    const x = gridX * TILE + TILE / 2;
    const y = gridY * TILE + TILE / 2;
    const sprite = this.add.image(x, y, texture).setScale(2.5).setDepth(4);

    // 發光圈
    const glow = this.add.circle(x, y, 35, color, 0.2).setDepth(3);
    this.tweens.add({
      targets: glow, alpha: { from: 0.1, to: 0.35 }, scale: { from: 0.9, to: 1.1 },
      duration: 800, yoyo: true, repeat: -1,
    });

    // 標籤
    this.add.text(x, y - 40, label, {
      fontSize: '14px', color: '#fff', backgroundColor: `rgba(0,0,0,0.6)`,
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(4);

    return { sprite, glow, gridX, gridY };
  }

  spawnCoins() {
    // 清除舊金幣（已被收集的不在了）
    const existingCount = this.coins.countActive();
    if (existingCount > 30) return;

    const roadColSet = new Set(ROAD_COLS);
    const roadRowSet = new Set(ROAD_ROWS);

    for (let i = 0; i < 15; i++) {
      // 隨機在道路上放金幣
      const useHorizontal = Math.random() > 0.5;
      let x, y;
      if (useHorizontal) {
        x = Phaser.Math.Between(2, MAP_W - 3);
        const rows = [6, 7, 14, 15, 22, 23];
        y = rows[Phaser.Math.Between(0, rows.length - 1)];
      } else {
        const cols = [8, 9, 18, 19, 28, 29];
        x = cols[Phaser.Math.Between(0, cols.length - 1)];
        y = Phaser.Math.Between(2, MAP_H - 3);
      }
      const cx = x * TILE + TILE / 2;
      const cy = y * TILE + TILE / 2;

      const coin = this.coins.create(cx, cy, 'coin').setScale(1.5).setDepth(3);
      coin.body.setAllowGravity(false);

      // 金幣浮動動畫
      this.tweens.add({
        targets: coin, y: cy - 5, duration: 600,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  spawnPowerups() {
    if (this.boosts.countActive() > 3) return;
    if (this.timeBonuses.countActive() > 3) return;

    // 加速道具
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(3, MAP_W - 4) * TILE + TILE / 2;
      const y = Phaser.Math.Between(3, MAP_H - 4) * TILE + TILE / 2;
      const b = this.boosts.create(x, y, 'boostPickup').setScale(1.8).setDepth(3);
      b.body.setAllowGravity(false);
      this.tweens.add({
        targets: b, angle: 360, duration: 2000, repeat: -1,
      });
    }

    // 時間加成
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(3, MAP_W - 4) * TILE + TILE / 2;
      const y = Phaser.Math.Between(3, MAP_H - 4) * TILE + TILE / 2;
      const t = this.timeBonuses.create(x, y, 'timePickup').setScale(1.8).setDepth(3);
      t.body.setAllowGravity(false);
      this.tweens.add({
        targets: t, scale: { from: 1.6, to: 2.0 }, duration: 500,
        yoyo: true, repeat: -1,
      });
    }
  }

  spawnNPCCars() {
    const activeNPCs = this.npcCars.countActive();
    if (activeNPCs > 12) return;

    const toSpawn = Math.min(4, 14 - activeNPCs);
    for (let i = 0; i < toSpawn; i++) {
      this.spawnOneNPC();
    }
  }

  spawnOneNPC() {
    const type = NPC_TYPES[Phaser.Math.Between(0, NPC_TYPES.length - 1)];
    const horizontal = Math.random() > 0.5;
    let x, y, vx, vy, angle;

    if (horizontal) {
      const rows = [6, 7, 14, 15, 22, 23];
      const row = rows[Phaser.Math.Between(0, rows.length - 1)];
      const goRight = row % 2 === 0; // 偶數行往右，奇數行往左
      x = goRight ? -50 : MAP_W * TILE + 50;
      y = row * TILE + TILE / 2;
      const speed = Phaser.Math.Between(80, 160);
      vx = goRight ? speed : -speed;
      vy = 0;
      angle = goRight ? 0 : 180;
    } else {
      const cols = [8, 9, 18, 19, 28, 29];
      const col = cols[Phaser.Math.Between(0, cols.length - 1)];
      const goDown = col % 2 === 0; // 偶數列往下
      x = col * TILE + TILE / 2;
      y = goDown ? -50 : MAP_H * TILE + 50;
      const speed = Phaser.Math.Between(80, 160);
      vx = 0;
      vy = goDown ? speed : -speed;
      angle = goDown ? 90 : 270;
    }

    const car = this.npcCars.create(x, y, type);
    car.setScale(2.2).setAngle(angle).setDepth(4);
    car.body.setAllowGravity(false);
    car.setVelocity(vx, vy);
    car.body.setSize(28, 12).setOffset(3, 1);

    // 超出地圖邊界後自動銷毀
    this.time.delayedCall(25000, () => {
      if (car.active) car.destroy();
    });
  }

  collectCoin(player, coin) {
    const now = this.time.now;
    // 連擊系統：2秒內連續撿金幣 combo 增加
    if (now - this.lastCoinTime < 2000) {
      this.combo = Math.min(this.combo + 1, 10);
    } else {
      this.combo = 1;
    }
    this.lastCoinTime = now;

    const points = 10 * this.combo;
    this.score += points;

    // 彈出分數文字
    this.showFloatingText(coin.x, coin.y - 20, `+${points}`, this.combo > 1 ? '#fbbf24' : '#fff');
    if (this.combo > 1) {
      this.showFloatingText(coin.x, coin.y - 40, `${this.combo}x COMBO!`, '#ff6b35');
    }

    this.sfx.coin.play();
    coin.destroy();
  }

  collectBoost(player, boost) {
    this.boostFuel = Math.min(100, this.boostFuel + 50);
    this.showFloatingText(boost.x, boost.y - 20, '加速燃料 +50!', '#3b82f6');
    this.sfx.powerup.play();
    boost.destroy();
  }

  collectTime(player, timeBonus) {
    this.questState.deadlineMs += 15000; // +15秒
    this.showFloatingText(timeBonus.x, timeBonus.y - 20, '時間 +15s!', '#22c55e');
    this.sfx.powerup.play();

    // 全螢幕綠色閃爍
    this.cameras.main.flash(300, 34, 197, 94, false);
    timeBonus.destroy();
  }

  hitByCar(player, car) {
    if (this.invincible || this.gameOver || this.gameWon) return;

    // 碰撞！
    this.invincible = true;
    this.sfx.crash.play();

    // 扣時間和分數
    this.questState.deadlineMs -= 10000; // -10秒
    this.score = Math.max(0, this.score - 50);
    this.combo = 1;

    // 爆炸效果
    const exp = this.add.sprite(player.x, player.y, 'exp0').setScale(0.6).setDepth(20);
    exp.play('explode');
    exp.on('animationcomplete', () => exp.destroy());

    // 碰撞火花
    this.add.particles(player.x, player.y, 'spark', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 15,
      tint: [0xff4444, 0xfbbf24, 0xff6b35],
      emitting: false,
    }).explode(15);

    // 相機震動
    this.cameras.main.shake(300, 0.015);
    this.cameras.main.flash(200, 255, 0, 0, false);

    this.showFloatingText(player.x, player.y - 30, '-10秒! -50分!', '#ef4444');

    // 玩家閃爍無敵
    this.tweens.add({
      targets: player, alpha: { from: 0.3, to: 1 },
      duration: 100, repeat: 10, yoyo: true,
      onComplete: () => {
        player.setAlpha(1);
        this.invincible = false;
      },
    });

    // 擊退效果
    const knockAngle = Phaser.Math.Angle.Between(car.x, car.y, player.x, player.y);
    player.setVelocity(Math.cos(knockAngle) * 300, Math.sin(knockAngle) * 300);
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: t, y: y - 50, alpha: 0, duration: 1000,
      onComplete: () => t.destroy(),
    });
  }

  randomEvent() {
    if (this.gameOver || this.gameWon) return;

    const events = [
      () => {
        // 救護車衝過來（高速）
        this.showFloatingText(this.player.x, this.player.y - 60, '⚠ 救護車來了！小心！', '#ef4444');
        const car = this.npcCars.create(-50, this.player.y, 'npcAmbulance');
        car.setScale(0.5).setAngle(0).setDepth(4);
        car.body.setAllowGravity(false);
        car.setVelocityX(300);
        car.body.setSize(16, 24).setOffset(8, 10);
        this.sfx.honk.play();
        this.time.delayedCall(10000, () => { if (car.active) car.destroy(); });
      },
      () => {
        // 金幣雨
        this.showFloatingText(this.player.x, this.player.y - 60, '金幣雨！趕快撿！', '#fbbf24');
        for (let i = 0; i < 20; i++) {
          const cx = this.player.x + Phaser.Math.Between(-200, 200);
          const cy = this.player.y + Phaser.Math.Between(-200, 200);
          const coin = this.coins.create(cx, cy, 'coin').setScale(1.5).setDepth(3);
          coin.body.setAllowGravity(false);
          this.tweens.add({ targets: coin, y: cy - 5, duration: 600, yoyo: true, repeat: -1 });
        }
      },
      () => {
        // 速度狂潮 - 所有NPC加速
        this.showFloatingText(this.player.x, this.player.y - 60, '⚠ 尖峰時段！車流加速！', '#f97316');
        this.npcCars.getChildren().forEach(c => {
          if (c.active) {
            c.body.velocity.x *= 1.8;
            c.body.velocity.y *= 1.8;
          }
        });
        // 10秒後恢復
        this.time.delayedCall(10000, () => {
          this.npcCars.getChildren().forEach(c => {
            if (c.active) {
              c.body.velocity.x /= 1.8;
              c.body.velocity.y /= 1.8;
            }
          });
        });
      },
    ];

    const event = events[Phaser.Math.Between(0, events.length - 1)];
    event();
  }

  setupVirtualControls() {
    this.virtual = { up: false, down: false, left: false, right: false, interact: false, boost: false };
    const btnStyle = { fontSize: '28px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', padding: { x: 14, y: 10 } };

    const mkBtn = (x, y, label, keyName) => {
      const b = this.add.text(x, y, label, btnStyle).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
      b.on('pointerdown', () => this.virtual[keyName] = true);
      b.on('pointerup', () => this.virtual[keyName] = false);
      b.on('pointerout', () => this.virtual[keyName] = false);
      b.on('pointerupoutside', () => this.virtual[keyName] = false);
      return b;
    };

    const h = this.scale.height;
    const w = this.scale.width;
    mkBtn(24, h - 130, '◀', 'left');
    mkBtn(88, h - 194, '▲', 'up');
    mkBtn(88, h - 66, '▼', 'down');
    mkBtn(152, h - 130, '▶', 'right');

    const btnE = mkBtn(w - 90, h - 120, 'E', 'interact');
    btnE.setStyle({ fontSize: '30px', backgroundColor: 'rgba(34,197,94,0.5)' });

    const btnBoost = mkBtn(w - 90, h - 190, '⚡', 'boost');
    btnBoost.setStyle({ fontSize: '26px', backgroundColor: 'rgba(59,130,246,0.5)' });
  }

  setupHUD() {
    // 上方 HUD 面板
    this.hud = this.add.text(20, 16, '', {
      fontSize: '18px', color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 },
      lineSpacing: 4,
    }).setScrollFactor(0).setDepth(10);

    // 分數顯示（右上角）
    this.scoreText = this.add.text(this.scale.width - 20, 16, '', {
      fontSize: '22px', color: '#fbbf24', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(10).setOrigin(1, 0);

    // 任務提示
    this.msg = this.add.text(20, 100, '', {
      fontSize: '18px', color: '#fde68a',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(10);

    // 加速條
    this.boostBarBg = this.add.rectangle(this.scale.width / 2, this.scale.height - 20, 200, 12, 0x1e293b, 0.7)
      .setScrollFactor(0).setDepth(10);
    this.boostBar = this.add.rectangle(this.scale.width / 2, this.scale.height - 20, 200, 12, 0x3b82f6, 0.9)
      .setScrollFactor(0).setDepth(10);
    this.boostLabel = this.add.text(this.scale.width / 2, this.scale.height - 36, '加速 [SPACE]', {
      fontSize: '12px', color: '#93c5fd',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    // 小地圖
    this.setupMinimap();
  }

  setupMinimap() {
    const mmW = 150;
    const mmH = 105;
    const mmX = this.scale.width - mmW - 10;
    const mmY = 60;

    this.minimapBg = this.add.rectangle(mmX + mmW / 2, mmY + mmH / 2, mmW, mmH, 0x1e293b, 0.7)
      .setScrollFactor(0).setDepth(9).setStrokeStyle(1, 0x475569);

    // 小地圖上的玩家點
    this.minimapDot = this.add.circle(0, 0, 3, 0x22c55e)
      .setScrollFactor(0).setDepth(10);

    // 小地圖上的 POI 點
    this.minimapPOIs = {};
    const poiColors = { shop: 0xfbbf24, customer: 0x3b82f6, office: 0x22c55e, police: 0xef4444 };
    for (const [name, poi] of Object.entries(this.poi)) {
      const mx = mmX + (poi.gridX / MAP_W) * mmW;
      const my = mmY + (poi.gridY / MAP_H) * mmH;
      this.minimapPOIs[name] = this.add.circle(mx, my, 3, poiColors[name])
        .setScrollFactor(0).setDepth(10);
    }

    this.mmX = mmX; this.mmY = mmY; this.mmW = mmW; this.mmH = mmH;
  }

  setStage(stage) {
    this.questState.stage = stage;
    const stages = [
      '📋 任務1：去便利店買早餐',
      '📋 任務2：把文件送到客戶端',
      '📋 任務3：去公司打卡',
      '📋 任務4：去警察局解除罰單',
      '🎉 任務完成！你是新竹最強通勤王！',
    ];
    this.msg.setText(stages[Math.min(stage, stages.length - 1)]);

    if (stage > 0 && stage < 5) {
      this.sfx.interact.play();
      this.score += 100 * stage;
      this.showFloatingText(this.player.x, this.player.y - 50, `任務完成 +${100 * stage}分！`, '#22c55e');
      this.cameras.main.flash(300, 34, 197, 94, false);
    }

    // 任務2完成後下雨
    if (stage === 2) {
      this.rain.start();
      this.showFloatingText(this.player.x, this.player.y - 70, '下雨了！路滑小心！', '#93c5fd');
      this.baseSpeed = 160; // 下雨減速
    }
    // 任務4完成停雨
    if (stage === 4) {
      this.rain.stop();
      this.baseSpeed = 200;
      this.gameWon = true;
      this.showVictory();
    }
  }

  handleInteract(target) {
    const stage = this.questState.stage;
    if (target === this.poi.shop.sprite && stage === 0) { this.setStage(1); return; }
    if (target === this.poi.customer.sprite && stage === 1) { this.setStage(2); return; }
    if (target === this.poi.office.sprite && stage === 2) { this.setStage(3); return; }
    if (target === this.poi.police.sprite && stage === 3) { this.setStage(4); return; }
    this.msg.setText('⚠ 先照任務順序跑！');
  }

  showVictory() {
    this.engineSound.stop();
    const left = Math.max(0, this.questState.deadlineMs - (this.time.now - this.questState.startAt));
    const timeBonus = Math.floor(left / 1000) * 5;
    this.score += timeBonus;

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(30);

    this.add.text(cx, cy - 80, '🏆 通勤王！', {
      fontSize: '48px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.add.text(cx, cy, [
      `金幣分數：${this.score - timeBonus}`,
      `剩餘時間加成：+${timeBonus}`,
      `最終分數：${this.score}`,
      '',
      '按 R 重新開始',
    ].join('\n'), {
      fontSize: '22px', color: '#fff', align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.input.keyboard.once('keydown-R', () => this.scene.restart());
  }

  showGameOver() {
    this.gameOver = true;
    this.engineSound.stop();
    this.sfx.gameover.play();
    this.player.setVelocity(0, 0);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(30);

    this.add.text(cx, cy - 60, '💀 超時！', {
      fontSize: '48px', color: '#ef4444', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.add.text(cx, cy + 20, [
      '老闆說你今天要請全公司喝手搖飲！',
      `最終分數：${this.score}`,
      '',
      '按 R 重新開始',
    ].join('\n'), {
      fontSize: '20px', color: '#fff', align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.input.keyboard.once('keydown-R', () => this.scene.restart());
  }

  update() {
    if (this.gameOver || this.gameWon) return;

    // 移動
    const boosting = (this.keys.SPACE.isDown || this.virtual.boost) && this.boostFuel > 0;
    if (boosting && !this.isBoosting) {
      this.isBoosting = true;
      this.sfx.boost.play();
    }
    if (!boosting) this.isBoosting = false;

    const speed = boosting ? this.baseSpeed * 1.8 : this.baseSpeed;
    if (boosting) {
      this.boostFuel = Math.max(0, this.boostFuel - 0.5);
      this.exhaust.emitting = true;
    } else {
      this.boostFuel = Math.min(100, this.boostFuel + 0.08);
      this.exhaust.emitting = false;
    }

    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown || this.virtual.left) vx -= speed;
    if (this.cursors.right.isDown || this.keys.D.isDown || this.virtual.right) vx += speed;
    if (this.cursors.up.isDown || this.keys.W.isDown || this.virtual.up) vy -= speed;
    if (this.cursors.down.isDown || this.keys.S.isDown || this.virtual.down) vy += speed;

    // 對角線歸一化
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    // 轉向
    if (vx < 0) this.player.setAngle(180);
    else if (vx > 0) this.player.setAngle(0);
    else if (vy < 0) this.player.setAngle(270);
    else if (vy > 0) this.player.setAngle(90);

    // 動態縮放
    const moving = Math.abs(vx) + Math.abs(vy) > 0;
    const targetScale = boosting ? 3.4 : (moving ? 3.2 : 3);
    this.player.setScale(Phaser.Math.Linear(this.player.scaleX, targetScale, 0.1));

    // 互動
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || this.virtual.interact) {
      const near = this.physics.overlapCirc(this.player.x, this.player.y, 70, true, true)
        .find((b) => this.interactives.contains(b.gameObject));
      if (near) this.handleInteract(near.gameObject);
      this.virtual.interact = false;
    }

    // 計時器
    const left = Math.max(0, this.questState.deadlineMs - (this.time.now - this.questState.startAt));
    const sec = Math.ceil(left / 1000);

    // 時間緊張時閃紅
    const urgent = sec <= 30;
    const timerColor = urgent ? '#ef4444' : '#fff';

    this.hud.setText([
      `⏱ ${sec}s ${urgent ? '⚠ 快沒時間了！' : ''}`,
      `📋 任務：${this.questState.stage}/4`,
      `🔥 連擊：${this.combo}x`,
    ].join('\n'));
    this.hud.setColor(timerColor);

    this.scoreText.setText(`💰 ${this.score}`);

    // 加速條
    this.boostBar.width = (this.boostFuel / 100) * 200;
    this.boostBar.fillColor = this.boostFuel > 30 ? 0x3b82f6 : 0xef4444;

    // 小地圖更新
    const px = this.mmX + (this.player.x / (MAP_W * TILE)) * this.mmW;
    const py = this.mmY + (this.player.y / (MAP_H * TILE)) * this.mmH;
    this.minimapDot.setPosition(px, py);

    const targetNames = ['shop', 'customer', 'office', 'police'];

    // 高亮當前任務目標
    for (const [name, dot] of Object.entries(this.minimapPOIs)) {
      const isTarget = targetNames[this.questState.stage] === name;
      dot.setRadius(isTarget ? 4 : 2);
      dot.setAlpha(isTarget ? 1 : 0.5);
    }

    // 目標方向箭頭
    const curTarget = this.poi[targetNames[this.questState.stage]];
    if (curTarget && this.questState.stage < 4) {
      const tx = curTarget.sprite.x;
      const ty = curTarget.sprite.y;
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, tx, ty);
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty);
      const margin = 60;
      const hw = this.scale.width / 2 - margin;
      const hh = this.scale.height / 2 - margin;
      const ax = this.scale.width / 2 + Math.cos(angle) * Math.min(hw, dist * 0.3);
      const ay = this.scale.height / 2 + Math.sin(angle) * Math.min(hh, dist * 0.3);
      this.arrow.setPosition(ax, ay).setAngle(Phaser.Math.RadToDeg(angle)).setVisible(dist > 120);
      this.arrowDist.setPosition(ax, ay + 18).setText(`${Math.floor(dist / TILE)}格`).setVisible(dist > 120);
    } else {
      this.arrow.setVisible(false);
      this.arrowDist.setVisible(false);
    }

    // 清除離開地圖的 NPC
    this.npcCars.getChildren().forEach(car => {
      if (car.active && (car.x < -200 || car.x > MAP_W * TILE + 200 ||
          car.y < -200 || car.y > MAP_H * TILE + 200)) {
        car.destroy();
      }
    });

    // NPC 偶爾按喇叭
    this.npcHonkTimer += this.game.loop.delta;
    if (this.npcHonkTimer > 5000) {
      this.npcHonkTimer = 0;
      const nearCars = this.npcCars.getChildren().filter(c =>
        c.active && Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y) < 200
      );
      if (nearCars.length > 0) {
        this.sfx.honk.play();
      }
    }

    // 超時
    if (left <= 0 && this.questState.stage < 4) {
      this.showGameOver();
    }
  }
}
