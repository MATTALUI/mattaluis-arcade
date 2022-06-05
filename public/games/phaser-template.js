(() => {
  const Game = {};

  Game.Boot = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Boot () {
      Phaser.Scene.call(this, { key: 'Boot' });
    },
    preload: function (){
      // TODO: preload tempaltes here
    },
    create: function (){
      console.log('Boot');
      this.scene.start('Play');
    }
  });

  Game.Play = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Play (){
      Phaser.Scene.call(this, { key: 'Play' });
    },
    create: function (){
      console.log('Play');
    }
  });

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: 900,
      height: 600,
      scene: [ Game.Boot, Game.Play ],
      autoCenter: true,
      parent: 'gameContainer',
      title: '[GAME NAME]',
      fps: {
        target: 30,
        forceSetTimeOut: true
      },
    };
    const game = new Phaser.Game(config);
  };
})();
