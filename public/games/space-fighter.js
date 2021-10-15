(() => {
  class FlyingSpaceObject {
    constructor(phaser){
      this.phaser = phaser;
      this.sprite = null;
      this.speed = 0;
      this.maxSpeed = 10;
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

      this.ship = this.physics.add.sprite(450, 300, 'ship').setScale(0.13);
      this.ship.speed = 0;
      this.ship.maxSpeed = 10;

      this.station = this.physics.add.sprite(Phaser.Math.Between(0,900), Phaser.Math.Between(0,600), 'battlestation').setScale(0.3);
      this.station.rotation += Phaser.Math.Between(-3,3);

      this.physics.add.collider(this.ship, this.station);
      this.physics.add.overlap(this.ship, this.station, (player, heart)=>{
        console.log('crash!');
      }, null, this);
    },
    update: function(){
      this.controlShip();
      this.controlStation();
    },
    controlStation: function(){
      const stationSpeed = 0.6;
      this.station.x += (Math.sin(this.station.rotation) * stationSpeed);
      this.station.y += (-Math.cos(this.station.rotation) * stationSpeed);
      this.wrapObject(this.station);
    },
    controlShip: function(){
      if (this.cursors.left.isDown){
        this.ship.rotation -= 0.1;
      }else if (this.cursors.right.isDown){
        this.ship.rotation += 0.1;
      }
      if (this.cursors.up.isDown){
        this.ship.speed += 0.3;
        if (this.ship.speed > this.ship.maxSpeed) { this.ship.speed = this.ship.maxSpeed; }
      }else if (this.cursors.down.isDown) {
        this.ship.speed -= 0.1;
        if (this.ship.speed < -1) { this.ship.speed = -1; }
      }
      this.ship.x += (Math.sin(this.ship.rotation) * this.ship.speed);
      this.ship.y += (-Math.cos(this.ship.rotation) * this.ship.speed);
      this.wrapObject(this.ship);
    },
    wrapObject: function(object){
      if(object.x < 0) {
        object.x = 900;
      }else if (object.x > 900) {
        object.x = 0;
      }
      if(object.y < 0) {
        object.y = 600;
      }else if (object.y > 600) {
        object.y = 0;
      }
    },
  });

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: 900,
      height: 600,
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
