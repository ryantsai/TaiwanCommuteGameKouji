import Phaser from 'phaser';

const TILE = 64;
const MAP_W = 40;
const MAP_H = 28;

export default class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  create() {
    this.add.tileSprite(0, 0, MAP_W * TILE, MAP_H * TILE, 'grass').setOrigin(0);

    this.blockers = this.physics.add.staticGroup();
    this.interactives = this.physics.add.staticGroup();

    const roadCols = new Set([8, 18, 28]);
    const roadRows = new Set([6, 14, 22]);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const isV = roadCols.has(x);
        const isH = roadRows.has(y);
        let key = 'grass';
        if (isV && isH) key = 'road-x';
        else if (isV) key = 'road-v';
        else if (isH) key = 'road-h';
        this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key).setAlpha(key === 'grass' ? 0.8 : 1);

        if (!isV && !isH && (x + y) % 3 === 0) {
          const b = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, 'building');
          this.blockers.add(b);
        }
      }
    }

    // POIs
    this.poi = {
      shop: this.add.image(18 * TILE + TILE / 2, 6 * TILE + TILE / 2, 'poi-shop'),
      office: this.add.image(28 * TILE + TILE / 2, 22 * TILE + TILE / 2, 'poi-office'),
      customer: this.add.image(8 * TILE + TILE / 2, 22 * TILE + TILE / 2, 'poi-shop').setTint(0x60a5fa),
      police: this.add.image(18 * TILE + TILE / 2, 14 * TILE + TILE / 2, 'poi-office').setTint(0xf43f5e),
    };
    Object.values(this.poi).forEach((p) => this.interactives.add(p));

    this.player = this.physics.add.sprite(8 * TILE + 10, 6 * TILE + 10, 'bike').setScale(1.3);
    this.player.setAngle(90);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 30).setOffset(6, 14);

    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.physics.add.collider(this.player, this.blockers);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D,E');

    this.questState = {
      stage: 0,
      gotBreakfast: false,
      deliveredPackage: false,
      clockedIn: false,
      ticketCleared: false,
      startAt: this.time.now,
      deadlineMs: 180000,
    };

    this.hud = this.add
      .text(20, 20, '', { fontSize: '22px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 10, y: 8 } })
      .setScrollFactor(0)
      .setDepth(10);
    this.msg = this.add
      .text(20, 110, '', { fontSize: '20px', color: '#fde68a', backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 10, y: 8 } })
      .setScrollFactor(0)
      .setDepth(10);

    this.rain = this.add.particles(0, 0, 'grass', {
      x: { min: 0, max: MAP_W * TILE },
      y: 0,
      lifespan: 1000,
      speedY: { min: 500, max: 700 },
      scale: { start: 0.02, end: 0.01 },
      alpha: { start: 0.25, end: 0 },
      quantity: 2,
      emitting: false,
    });
    this.rain.setScrollFactor(0.9);

    this.setStage(0);
  }

  setStage(stage) {
    this.questState.stage = stage;
    const stages = [
      '任務1：去便利店買早餐（E互動）',
      '任務2：把文件送到客戶端（藍色店）',
      '任務3：去公司打卡',
      '任務4：經過警察點，解除違停罰單',
      '任務完成：你今天是新竹最會通勤的人',
    ];
    this.msg.setText(stages[Math.min(stage, stages.length - 1)]);
  }

  handleInteract(target) {
        const stage = this.questState.stage;

    if (target === this.poi.shop && stage === 0) {
      this.questState.gotBreakfast = true;
      this.setStage(1);
      return;
    }
    if (target === this.poi.customer && stage === 1) {
      this.questState.deliveredPackage = true;
      this.setStage(2);
      this.rain.start(); // Event: sudden rain after delivery
      return;
    }
    if (target === this.poi.office && stage === 2) {
      this.questState.clockedIn = true;
      this.setStage(3);
      return;
    }
    if (target === this.poi.police && stage === 3) {
      this.questState.ticketCleared = true;
      this.setStage(4);
      this.rain.stop();
      return;
    }

    this.msg.setText('這個點現在還不能互動，先照任務順序跑。');
  }

  update() {
    const speed = 190;
    let vx = 0,
      vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx -= speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx += speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy -= speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy += speed;

    this.player.setVelocity(vx, vy);

    if (vx < 0) this.player.setAngle(180);
    else if (vx > 0) this.player.setAngle(0);
    else if (vy < 0) this.player.setAngle(270);
    else if (vy > 0) this.player.setAngle(90);

    const moving = Math.abs(vx) + Math.abs(vy) > 0;
    this.player.setScale(moving ? 1.33 : 1.3);

    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      const near = this.physics
        .overlapCirc(this.player.x, this.player.y, 70, true, true)
        .find((b) => this.interactives.contains(b.gameObject));
      if (near) this.handleInteract(near.gameObject);
    }

    // HUD + timer challenge
    const left = Math.max(0, this.questState.deadlineMs - (this.time.now - this.questState.startAt));
    const sec = Math.ceil(left / 1000);
    this.hud.setText(`通勤挑戰剩餘：${sec}s\n任務進度：${this.questState.stage}/4`);

    if (left <= 0 && this.questState.stage < 4) {
      this.msg.setText('⏰ 超時！老闆說你今天要請全公司喝手搖。按 F5 再戰。');
      this.player.setVelocity(0, 0);
      this.input.keyboard.enabled = false;
    }
  }
}
