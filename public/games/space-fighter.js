(() => {
  const CONFIG = {
    LEVEL_INTENSITY_MODIFIER: 3, //  increase number of asteroids and baddies every n level,
    ASTEROIDS_PER_DIFFICULTY: 5, // number of asteroids that starts with each difficulty,
    HEALTH_TIER_COLORS: [[0, 232, 0], [0, 186, 0], [0, 116, 0]],
    INVINCIBILITY_HEALTH_COLOR: [247, 219, 167],
    HEIGHT: 600,
    WIDTH: 900,
  };

  class FlyingSpaceObject {
    constructor(phaser){
      this.phaser = phaser;
      // this.sprite = sprite;
      this.sprite = null;
      this.speed = 0;
      this.maxSpeed = 10;
      this.rotationSpeed = 0;
      // this.rotationAngle = 0;
      this.life = 1;
      this.damageValue = 0;
    }

    addSprite(spriteName) {
      // this.sprite =
    }

    isAlive() {
      return this.life > 0;
    }

    update() {
      this.sprite.rotation += this.rotationSpeed;
      this.wrapSprite();
    }

    wrapSprite() {
      if (this.sprite.x < 0) {
        this.sprite.x = CONFIG.WIDTH;
      } else if (this.sprite.x > CONFIG.WIDTH) {
        this.sprite.x = 0;
      }

      if (this.sprite.y < 0) {
        this.sprite.y = CONFIG.HEIGHT;
      } else if (this.sprite.y > CONFIG.HEIGHT) {
        this.sprite.y = 0;
      }
    }

    startAtEdge() {
      const edge = Phaser.Math.Between(0,4);

      switch(edge) {
        case 0: // TOP
          this.sprite.x = Phaser.Math.FloatBetween(0, CONFIG.WIDTH);
          this.sprite.y = CONFIG.HEIGHT;
          break;
        case 1: // Right
          this.sprite.x = CONFIG.WIDTH;
          this.sprite.y = Phaser.Math.FloatBetween(0, CONFIG.HEIGHT);
          break;
        case 2: // Bottom
          this.sprite.x = Phaser.Math.FloatBetween(0, CONFIG.WIDTH);
          this.sprite.y = 0;
          break;
        case 3: // Left
          this.sprite.x = 0;
          this.sprite.y = Phaser.Math.FloatBetween(0, CONFIG.HEIGHT);
          break;
      }
    }
  }

  class Ship extends FlyingSpaceObject {
    constructor(phaser){
      super(phaser);
      this.sprite = phaser.physics.add.sprite(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'ship').setScale(0.13);
      this.speed = 0.1;
      this.maxLife = 300;
      this.life = 100;
      this.maxSpeed = 5;
      this.invincibility = 0;
      this.machineGun = 0;
      this.good = true;
      this.damageValue = 10;
      this.rotationSpeed = 0.08;
      this.id = null; // ID is for multiplayer ability
    }

    update() {
      this.controlShip();
      this.sprite.x += (Math.sin(this.sprite.rotation) * this.speed);
      this.sprite.y += (-Math.cos(this.sprite.rotation) * this.speed);
      this.wrapSprite();
    }

    turnLeft() {
      // NOTE: Sprite rotations are in radians
      this.sprite.rotation -= this.rotationSpeed;
    }

    turnRight() {
      // NOTE: Sprite rotations are in radians
      this.sprite.rotation += this.rotationSpeed;
    }

    thrust() {
      this.speed += 0.3;
      if (this.speed > this.maxSpeed) { this.speed = this.maxSpeed; }
    }

    reverse() {
      this.speed -= 0.2;
      if (this.speed < -1) { this.speed = -1; }
    }

    controlShip() {
      if (this.phaser.cursors.left.isDown){
        this.turnLeft();
      }else if (this.phaser.cursors.right.isDown){
        this.turnRight();
      }

      if (this.phaser.cursors.up.isDown){
        this.thrust();
      }else if (this.phaser.cursors.down.isDown) {
        this.reverse();
      }
    }
  }

  class AsteroidLarge extends FlyingSpaceObject {
    constructor(phaser) {
      super(phaser);

      const rot = Math.random() / 30;
      const cap = Math.random() * 2;
      const vecX = Phaser.Math.FloatBetween(-cap, cap);
      const vecY = Phaser.Math.FloatBetween(-cap, cap);
      const sprite = phaser.physics.add.sprite(0, 0, 'asteroid1').setScale(0.69);

      this.rotationSpeed = Math.floor(Math.random() * 2) ? rot : -rot;
      this.velocity = new Phaser.Math.Vector2(vecX, vecY);
      this.sprite = sprite;

      this.startAtEdge();
    }

    update() {
      super.update();
      this.sprite.x += this.velocity.x;
      this.sprite.y += this.velocity.y;
    }
  }


  const SpaceFighter = {};
  SpaceFighter.Boot = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Boot () {
      Phaser.Scene.call(this, { key: 'Boot' });
    },
    preload: function (){
      this.load.image('asteroid1', '/assets/space-fighter/images/asteroid1.png');
      this.load.image('asteroid2', '/assets/space-fighter/images/asteroid2.png');
      this.load.image('asteroid3', '/assets/space-fighter/images/asteroid3.png');

      this.load.image('baddy1', '/assets/space-fighter/images/baddy1.png');
      this.load.image('baddy2', '/assets/space-fighter/images/baddy2.png');
      this.load.image('baddy3', '/assets/space-fighter/images/baddy3.png');

      this.load.image('battlestation', '/assets/space-fighter/images/battlestation.png');

      this.load.image('ship', '/assets/space-fighter/images/ship.png');
    },
    create: function (){
      this.scene.start('Play');
    }
  });

  SpaceFighter.Play = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Play (){
      Phaser.Scene.call(this, { key: 'Play' });
    },
    create: function (){
      this.cursors = this.input.keyboard.createCursorKeys();
      this.asteroids = [];
      this.baddies = [];
      this.bullets = [];
      this.powerUps = [];
      this.level = 1;
      this.score = 0;
      this.mothership = null;
      this.paused = false;
      this.ship = new Ship(this); //this.physics.add.sprite(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'ship').setScale(0.13);

      this._generateAsteroids();




      //
      // this.station = this.physics.add.sprite(Phaser.Math.Between(0,900), Phaser.Math.Between(0,600), 'battlestation').setScale(0.3);
      // this.station.rotation += Phaser.Math.Between(-3,3);
      //
      // this.physics.add.collider(this.ship, this.station);
      // this.physics.add.overlap(this.ship, this.station, (player, heart)=>{
      //   console.log('crash!');
      // }, null, this);
    },
    update: function(){
      // Update Entities
      this.ship.update();
      this.asteroids.forEach(a => a.update());

      // Clean up dead things
      this.asteroids = this.asteroids.filter(a => a.isAlive());
    },

    _generateAsteroids: function(){
      const difficulty = Math.ceil(this.level / CONFIG.LEVEL_INTENSITY_MODIFIER);
      const asteroidCount = difficulty * CONFIG.ASTEROIDS_PER_DIFFICULTY;

      for (let i = 0; i < asteroidCount ; i++){
        const asteroid = new AsteroidLarge(this);

        this.asteroids.push(asteroid);
      }
    },


    // controlStation: function(){
    //   const stationSpeed = 0.6;
    //   this.station.x += (Math.sin(this.station.rotation) * stationSpeed);
    //   this.station.y += (-Math.cos(this.station.rotation) * stationSpeed);
    //   this.wrapObject(this.station);
    // },
  });

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      scene: [ SpaceFighter.Boot, SpaceFighter.Play ],
      autoCenter: true,
      parent: 'gameContainer',
      title: 'Space Fighter',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
        },
      }
    };
    const game = new Phaser.Game(config);
  };
})();
