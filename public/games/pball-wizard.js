(() => {
  const CONFIG = {
    TITLE: 'P-Ball Wizard',
    STORAGE_KEY_PREFIX: 'PBALLWIZARD::',
    LEVEL_INTENSITY_MODIFIER: 3, //  increase number of asteroids and baddies every n level,
    ASTEROIDS_PER_DIFFICULTY: 5, // number of asteroids that starts with each difficulty,
    HEALTH_TIER_COLORS: [[0, 232, 0], [0, 186, 0], [0, 116, 0]],
    INVINCIBILITY_HEALTH_COLOR: [247, 219, 167],
    HEIGHT: 600,
    WIDTH: 900,
    HEALTHBAR_SIZE_MODIFIER: 2.95,
    UI_PADDING: 5,
  };
  const PBallWizard = {};

  PBallWizard.Boot = new Phaser.Class({
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

  PBallWizard.Play = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Play (){
      Phaser.Scene.call(this, { key: 'Play' });
    },
    create: function (){
      console.log('Play');
      const internalPadding = 1000;
      const verticalPadding = 25;
      const centerX = CONFIG.WIDTH / 2;
      const centerY = CONFIG.HEIGHT / 2;
      const desiredWidth = (2/3) * CONFIG.WIDTH;
      const desiredHeight = CONFIG.HEIGHT - (verticalPadding * 2);
      const centeredBoundsX = (CONFIG.WIDTH - desiredWidth) / 2;
      const centeredBoundsY =  (CONFIG.HEIGHT - desiredHeight) / 2;
      this.matter.world.setBounds(centeredBoundsX, centeredBoundsY, desiredWidth, desiredHeight, internalPadding);//, 5, true, true, false, true);

      this.ball = this.matter.add.image(centerX, centerY - 100, 'ball');
      this.ball.setScale(0.045);
      this.ball.setCircle(10, {
        // sleepThreshold: 5,
        // slop: 1,
        // ignoreGravity: true,
      });
      this.ball.setFriction(0.05);
      this.ball.setBounce(1);

      window.testCircle = this.matter.add.circle(centerX, centerY, 25, {
        isStatic: true,
        restitution: 1,
      });
      console.log(window.testCircle);
      // '40 0 40 20 100 20 100 80 40 80 40 100 0 50'
      // '100,0,100,100,0,100,0,0'
      this.matter.add.circle(100, 100, 10, {
        isStatic: true,
      })
      const verts = [
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 1000 },
        { x: 0, y: 0 },
      ]
      window.pointer = this.matter.add.fromVertices(centerX, centerY, verts, {
        isStatic: true,
      });

      this.matter.add.mouseSpring({ length: 1, stiffness: 0.6 });
    }
  });

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      backgroundColor: '#CCCCFF',
      physics: {
        default: 'matter',
        matter: {
          debug: true,
          enableSleeping: true,
        },
      },
      scene: [ PBallWizard.Boot, PBallWizard.Play ],
      autoCenter: true,
      parent: 'gameContainer',
      title: CONFIG.title,
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
    };
    const game = new Phaser.Game(config);
  };
})();
