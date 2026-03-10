import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor(){ super('BootScene'); }
  preload(){
    this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/drawtiles-spaced.png');
    this.load.tilemapTiledJSON('map', 'https://labs.phaser.io/assets/tilemaps/maps/cybernoid.json');
    this.load.spritesheet('dude','https://labs.phaser.io/assets/sprites/dude.png',{frameWidth:32,frameHeight:48});
  }
  create(){ this.scene.start('WorldScene'); }
}
