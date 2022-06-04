(() => {
  const Game = {};

  Game.Boot = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Boot () {
      Phaser.Scene.call(this, { key: 'Boot' });
    },
    preload: function (){
      this.load.image('ball', '/assets/pball-wizard/images/ball.png');
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
      this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);
      this.ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(-600, 0), 'ball');
      this.ball.setScale(0.3);
      this.ball.setCircle();
      this.ball.setFriction(0.005);
      this.ball.setBounce(1);
    }
  });

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: 900,
      height: 600,
      backgroundColor: '#CCCCFF',
      physics: {
        default: 'matter',
        matter: {
          debug: true,
          enableSleeping: true,
        },
      },
      scene: [ Game.Boot, Game.Play ],
      autoCenter: true,
      parent: 'gameContainer',
      title: 'P-Ball Wizard',
    };
    const game = new Phaser.Game(config);
  };
})();
