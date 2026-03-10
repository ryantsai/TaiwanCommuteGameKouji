import Phaser from 'phaser';

const TILE = 64;
const MAP_W = 40;
const MAP_H = 28;

export default class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  create() {
    this.add.tileSprite(0,0,MAP_W*TILE,MAP_H*TILE,'grass').setOrigin(0);

    this.blockers = this.physics.add.staticGroup();
    this.interactives = this.physics.add.staticGroup();

    // Build a simple Hsinchu-like grid: two main roads + cross roads
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
        this.add.image(x*TILE+TILE/2, y*TILE+TILE/2, key).setAlpha(key==='grass'?0.8:1);

        // Buildings on non-road tiles (sparser)
        if (!isV && !isH && (x+y)%3===0) {
          const b = this.add.image(x*TILE+TILE/2, y*TILE+TILE/2, 'building');
          this.blockers.add(b);
        }
      }
    }

    const shop = this.add.image(18*TILE+TILE/2, 6*TILE+TILE/2, 'poi-shop');
    const office = this.add.image(28*TILE+TILE/2, 22*TILE+TILE/2, 'poi-office');
    this.interactives.add(shop);
    this.interactives.add(office);

    this.player = this.physics.add.sprite(8*TILE+10, 6*TILE+10, 'bike').setScale(1.3);
    this.player.setAngle(90);
    this.engineSound = this.sound.add('bgm', { loop: true, volume: 0.18 });
    this.engineSound.play();
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 30).setOffset(6, 14);

    this.physics.world.setBounds(0, 0, MAP_W*TILE, MAP_H*TILE);
    this.cameras.main.setBounds(0, 0, MAP_W*TILE, MAP_H*TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.physics.add.collider(this.player, this.blockers);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D,E');

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    this.hud = this.add.text(20, 20, '任務：先去便利店，再去公司打卡\n[E] 互動', { fontSize: '22px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.45)', padding: {x:10,y:8}}).setScrollFactor(0).setDepth(10);
    this.msg = this.add.text(20, 100, '', { fontSize: '20px', color: '#fde68a', backgroundColor: 'rgba(0,0,0,0.45)', padding: {x:10,y:8}}).setScrollFactor(0).setDepth(10);

    this.questState = { gotBreakfast:false, clockedIn:false };
  }

  update() {
    const speed = 190;
    let vx = 0, vy = 0;
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
      const near = this.physics.overlapCirc(this.player.x, this.player.y, 70, true, true)
        .find((b) => this.interactives.contains(b.gameObject));
      if (near) {
        this.sound.play('sfxInteract', { volume: 0.25 });
        const tex = near.gameObject.texture.key;
        if (tex === 'poi-shop' && !this.questState.gotBreakfast) {
          this.questState.gotBreakfast = true;
          this.msg.setText('🍙 買到早餐了！下一站：公司打卡');
        } else if (tex === 'poi-office' && this.questState.gotBreakfast && !this.questState.clockedIn) {
          this.questState.clockedIn = true;
          this.msg.setText('✅ 打卡成功！今天通勤任務完成');
        } else if (tex === 'poi-office' && !this.questState.gotBreakfast) {
          this.msg.setText('⏰ 先去買早餐，不然上班會餓到靈魂出竅');
        }
      }
    }
  }
}
