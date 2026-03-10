import Phaser from 'phaser';
export default class WorldScene extends Phaser.Scene {
  constructor(){ super('WorldScene'); }
  create(){
    const map = this.make.tilemap({ key:'map' });
    const tiles = map.addTilesetImage('drawtiles-spaced','tiles');
    const layer = map.createLayer('Background', tiles, 0, 0);
    layer.setScale(2);
    this.player = this.physics.add.sprite(200, 200, 'dude', 4).setScale(1.2);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.anims.create({ key:'left', frames:this.anims.generateFrameNumbers('dude',{start:0,end:3}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'turn', frames:[{ key:'dude', frame:4 }], frameRate:20 });
    this.anims.create({ key:'right', frames:this.anims.generateFrameNumbers('dude',{start:5,end:8}), frameRate:10, repeat:-1 });
  }
  update(){
    const speed = 180;
    this.player.setVelocity(0);
    if(this.cursors.left.isDown){ this.player.setVelocityX(-speed); this.player.anims.play('left',true); }
    else if(this.cursors.right.isDown){ this.player.setVelocityX(speed); this.player.anims.play('right',true); }
    if(this.cursors.up.isDown){ this.player.setVelocityY(-speed); }
    else if(this.cursors.down.isDown){ this.player.setVelocityY(speed); }
    if(!this.cursors.left.isDown && !this.cursors.right.isDown) this.player.anims.play('turn');
  }
}
