import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import WorldScene from './scenes/WorldScene';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'app',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, WorldScene],
};
new Phaser.Game(config);
