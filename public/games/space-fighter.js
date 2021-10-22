(() => {
  const CONFIG = {
    LEVEL_INTENSITY_MODIFIER: 3, //  increase number of asteroids and baddies every n level,
    ASTEROIDS_PER_DIFFICULTY: 5, // number of asteroids that starts with each difficulty,
    HEALTH_TIER_COLORS: [[0, 232, 0], [0, 186, 0], [0, 116, 0]],
    INVINCIBILITY_HEALTH_COLOR: [247, 219, 167],
    HEIGHT: 600,
    WIDTH: 900,
    HEALTHBAR_SIZE_MODIFIER: 3,
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

  class Bullet extends FlyingSpaceObject {
    constructor(phaser, ship = null) {
      super(phaser);
      this.sprite = phaser.physics.add.sprite(100, 100, 'bullet');
      this.velocity = new Phaser.Math.Vector2(0, 0);
      this.safe = true;
      this.life = 60;
      this.damageValue = 1;
      if (ship) {
        this.fireFromShip(ship);
      }
    }

    fireFromShip(ship) {
      const bulletSpeed = 10;
      const angle = ship.sprite.rotation - (Math.PI / 2); // Might need some math here...
      this.safe = ship.good;

      if (!this.safe) {
        this.sprite.destroy();
        this.sprite = phaser.physics.add.sprite(100, 100, 'badBullet').setScale(0.06);
      }

      this.sprite.x = ship.sprite.x;
      this.sprite.y = ship.sprite.y;
      this.sprite.rotation = ship.sprite.rotation;
      this.damageValue = ship.damageValue;

      this.velocity.x = Math.cos(angle) * (ship.speed + bulletSpeed);
      this.velocity.y = Math.sin(angle) * (ship.speed + bulletSpeed);
    }

    update() {
      this.sprite.x += this.velocity.x;
      this.sprite.y += this.velocity.y;
      this.life -= 1;
      super.update();

      if(!this.isAlive()) {
        this.sprite.destroy();
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

      // this.phaser.sounds.shipEngine.setLoop(true);
      // this.phaser.sounds.shipEngine.play();
      this.sprite.depth = 1000; // Draw on top

      this.initHealthbar();
    }

    update() {
      this.controlShip();
      this.advance();
      this.updateHealthbar();
      this.updateEngineNoise();
      this.wrapSprite();
    }

    advance() {
      this.sprite.x += (Math.sin(this.sprite.rotation) * this.speed);
      this.sprite.y += (-Math.cos(this.sprite.rotation) * this.speed);
      this.invincibility = Math.max(0, this.invincibility - 1);

      if (this.invincibility > 0) {
        this.sprite.setTint(Phaser.Math.FloatBetween(0x000000,0xFFFFFF));
      } else {
        this.sprite.clearTint();
      }
    }

    updateEngineNoise() {
      const currentSpeed = Math.abs(this.speed);
      const speedPercent = (currentSpeed / this.maxSpeed);
      this.phaser.sounds.shipEngine.setVolume(speedPercent / 3);
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

    damage(damageValue) {
      if (this.invincibility === 0){
        this.life -= damageValue;
        this.invincibility += 200;
        this.phaser.sounds.damage.play();
        this.speed = 0;
      }
    }

    initHealthbar() {
      const padding = 5;
      const height = 25;
      const width = this.life * CONFIG.HEALTHBAR_SIZE_MODIFIER;
      const x = padding + (width / 2);
      const y = padding + (height / 2);
      const mainColor = 0x00AA00;
      const badColor = 0xAA0000;

      const redbar = this.phaser.add.rectangle(x, y, width, height, badColor, 0x444444);
      this.healthbar = this.phaser.add.rectangle(x, y, width, height, mainColor, 0x444444);

      this.healthbar.depth = 2000;
      redbar.depth = 1999;
    }

    updateHealthbar(){
      this.healthbar.width = Math.max(0, this.life * CONFIG.HEALTHBAR_SIZE_MODIFIER);
    }

    canSeePoint(x, y) {

    }
  }

  class AsteroidLarge extends FlyingSpaceObject {
    constructor(phaser) {
      super(phaser);

      const rot = Math.random() / 30;
      const cap = Math.random() * 2;
      const vecX = Phaser.Math.FloatBetween(-cap, cap);
      const vecY = Phaser.Math.FloatBetween(-cap, cap);
      const asteroidNumber = Phaser.Math.Between(1, 3);
      const sprite = phaser.physics.add.sprite(0, 0, `asteroid${asteroidNumber}`).setScale(Phaser.Math.FloatBetween(0.79, 1));

      this.rotationSpeed = Math.floor(Math.random() * 2) ? rot : -rot;
      this.velocity = new Phaser.Math.Vector2(vecX, vecY);
      this.sprite = sprite;
      this.sprite.depth = 500;
      this.life = 30;
      this.damageValue = 10;

      this.startAtEdge();
    }

    update() {
      super.update();
      this.sprite.x += this.velocity.x;
      this.sprite.y += this.velocity.y;
    }

    damage(amount) {
      this.phaser.sounds.hit.play();
      this.life -= amount;
    }

    explode() {
      const newAsteroids = [];

      const med1 = new AsteroidMedium(this.phaser);
      med1.sprite.x = this.sprite.x;
      med1.sprite.y = this.sprite.y;
      newAsteroids.push(med1);

      const med2 = new AsteroidMedium(this.phaser);
      med2.sprite.x = this.sprite.x;
      med2.sprite.y = this.sprite.y;
      newAsteroids.push(med2);

      const sm = new AsteroidSmall(this.phaser);
      sm.sprite.x = this.sprite.x;
      sm.sprite.y = this.sprite.y;
      newAsteroids.push(sm);

      this.sprite.destroy();
      this.phaser.sounds.explode.play();
      return newAsteroids;
    }
  }

  class AsteroidMedium extends AsteroidLarge {
    constructor(phaser) {
      super(phaser);
      this.sprite.setScale(Phaser.Math.FloatBetween(0.49, 0.55));

      const rot = Math.random() / 20;
      const cap = Math.random() * 4;
      const vecX = Phaser.Math.FloatBetween(-cap, cap);
      const vecY = Phaser.Math.FloatBetween(-cap, cap);

      this.rotationSpeed = Math.floor(Math.random() * 3) ? rot : -rot;
      this.velocity = new Phaser.Math.Vector2(vecX, vecY);
      this.life = 20;
      this.damageValue = 5;
    }

    explode() {
      const newAsteroids = [];

      const sm1 = new AsteroidSmall(this.phaser);
      sm1.sprite.x = this.sprite.x;
      sm1.sprite.y = this.sprite.y;
      newAsteroids.push(sm1);

      const sm2 = new AsteroidSmall(this.phaser);
      sm2.sprite.x = this.sprite.x;
      sm2.sprite.y = this.sprite.y;
      newAsteroids.push(sm2);

      this.sprite.destroy();
      this.phaser.sounds.explode.play();
      return newAsteroids;
    }
  }

  class AsteroidSmall extends AsteroidMedium {
    constructor(phaser) {
      super(phaser);
      this.sprite.setScale(Phaser.Math.FloatBetween(0.19, 0.25));

      const rot = Math.random() / 30;
      const cap = Math.random() * 5;
      const vecX = Phaser.Math.FloatBetween(-cap, cap);
      const vecY = Phaser.Math.FloatBetween(-cap, cap);

      this.rotationSpeed = Math.floor(Math.random() * 4) ? rot : -rot;
      this.velocity = new Phaser.Math.Vector2(vecX, vecY);
      this.life = 10;
      this.damageValue = 1;
    }

    explode() {
      const newAsteroids = [];

      this.sprite.destroy();
      this.phaser.sounds.explode.play();
      return newAsteroids;
    }
  }


  const SpaceFighter = {};
  SpaceFighter.Boot = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Boot () {
      Phaser.Scene.call(this, { key: 'Boot' });
    },
    preload: function (){
      this.load.image('ship', '/assets/space-fighter/images/ship.png');

      this.load.image('bullet', '/assets/space-fighter/images/bullet.png');
      this.load.image('badBullet', '/assets/space-fighter/images/badBullet.png');

      this.load.image('asteroid1', '/assets/space-fighter/images/asteroid1.png');
      this.load.image('asteroid2', '/assets/space-fighter/images/asteroid2.png');
      this.load.image('asteroid3', '/assets/space-fighter/images/asteroid3.png');

      this.load.image('baddy1', '/assets/space-fighter/images/baddy1.png');
      this.load.image('baddy2', '/assets/space-fighter/images/baddy2.png');
      this.load.image('baddy3', '/assets/space-fighter/images/baddy3.png');
      this.load.image('battlestation', '/assets/space-fighter/images/battlestation.png');

      this.load.image('puGun', '/assets/space-fighter/images/pu_gun.png');
      this.load.image('puHealth', '/assets/space-fighter/images/pu_health.png');
      this.load.image('puShield', '/assets/space-fighter/images/pu_shield.png');


      this.load.audio('hit', ['/assets/space-fighter/sound/hit.wav']);
      this.load.audio('explode', ['/assets/space-fighter/sound/explode.wav']);
      this.load.audio('shipEngine', ['/assets/space-fighter/sound/shipEngine.wav']);
      this.load.audio('laser', ['/assets/space-fighter/sound/laser.wav']);
      this.load.audio('damage', ['/assets/space-fighter/sound/damage.wav']);
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
      this.sounds = {
        hit: this.sound.add('hit'),
        explode: this.sound.add('explode'),
        shipEngine: this.sound.add('shipEngine', { volume: 0.5 }),
        laser: this.sound.add('laser'),
        damage: this.sound.add('damage'),
      };
      this.cursors = this.input.keyboard.createCursorKeys();
      this.asteroids = [];
      this.baddies = [];
      this.bullets = [];
      this.powerUps = [];
      this.level = 1;
      this.score = 0;
      this.mothership = null;
      this.paused = false;
      this.ship = new Ship(this);

      this.pauseButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.bulletGroup = this.physics.add.group();
      this.asteroidGroup = this.physics.add.group();

      this.physics.add.collider(this.ship.sprite, this.asteroidGroup, (shipSprite, aSprite) => {
        const asteroid = this.asteroids.find(a => a.sprite === aSprite);
        this.ship.damage(asteroid.damageValue);
      });
      this.physics.add.collider(this.bulletGroup, this.asteroidGroup, (bSprite, aSprite) => {
        const bullet = this.bullets.find(b => b.sprite === bSprite);
        const asteroid = this.asteroids.find(a => a.sprite === aSprite);
        bullet.life = 0;
        asteroid.damage(10);
        if (!asteroid.isAlive()) {
          const newAsteroids = asteroid.explode();
          newAsteroids.forEach(a => this.asteroidGroup.add(a.sprite));
          this.asteroids = this.asteroids.concat(newAsteroids);
        }
      });

      this._generateStars();
    },
    update: function(){
      if (!this.ship.isAlive()) {
        console.log('Game over');
      }

      if (Phaser.Input.Keyboard.JustDown(this.pauseButton)) {
        this.paused = !this.paused;
      }
      if (this.paused) { return; }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this._fireBullet();
      }

      // Update Entities
      this.ship.update();
      this.bullets.forEach(b => b.update());
      this.asteroids.forEach(a => a.update());

      // Clean up dead things
      this.asteroids = this.asteroids.filter(a => a.isAlive());
      this.bullets = this.bullets.filter(b => b.isAlive());

      // Manage End of Level
      if (!this.asteroids.length && !this.baddies.length && !this.mothership){
        this.level += 1;
        this._generateAsteroids();
        this._generateBaddies();
      }
    },

    _generateAsteroids: function (){
      const difficulty = Math.ceil(this.level / CONFIG.LEVEL_INTENSITY_MODIFIER);
      const asteroidCount = difficulty * CONFIG.ASTEROIDS_PER_DIFFICULTY;

      for (let i = 0; i < asteroidCount ; i++){
        const asteroid = new AsteroidLarge(this);

        this.asteroidGroup.add(asteroid.sprite);
        this.asteroids.push(asteroid);
      }
    },

    _generateBaddies: function () {

    },

    _fireBullet: function () {
      const bullet = new Bullet(this, this.ship);
      this.bulletGroup.add(bullet.sprite);
      this.bullets.push(bullet);
      this.sounds.laser.play();
    },

    _generateStars() {
      const starNumber = Phaser.Math.Between(10, 50);
      for (let i = 0; i < starNumber; i++) {
        const x = Phaser.Math.FloatBetween(0, CONFIG.WIDTH);
        const y = Phaser.Math.FloatBetween(0, CONFIG.HEIGHT);
        this.add.rectangle(x, y, 2, 1, 0xFFFFFF);
      }
    }


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
          // debug: true,
        },
      }
    };
    const game = new Phaser.Game(config);
  };
})();
