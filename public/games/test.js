(() => {
  const TestGame = {};

  TestGame.Boot = function(game){};
  TestGame.Boot.prototype = {
  preload: function(){
    this.load.image('bella', '/assets/test/bella.png');
    this.load.image('heart', '/assets/test/heart.png');
    this.load.image('rock', '/assets/test/rock.png');
  },
  create: function(){
    // this.bella = this.add.image(400, 300, 'bella');
    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'bella').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'bella');
    this.platforms.create(50, 250, 'bella');
    this.platforms.create(750, 220, 'bella');

    this.player = this.physics.add.sprite(50, 50, 'bella');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(300);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.hearts = this.physics.add.group({
      key: 'heart',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.hearts.children.iterate(function (child) {
      child.setScale(Phaser.Math.FloatBetween(0.3, 0.6));
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setCollideWorldBounds(true);
    });

    this.physics.add.collider(this.hearts, this.platforms);

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });


    this.physics.add.overlap(this.player, this.hearts, (player, heart)=>{
      heart.disableBody(true, true);
      this.score += 10;
      this.scoreText.setText('score: ' + this.score);
    }, null, this);

    this.rocks = this.physics.add.group();
    this.physics.add.collider(this.rocks, this.platforms);

    this.physics.add.collider(this.player, this.rocks, (player, rock)=>{
      this.physics.pause();
      player.setTint(0xff0000);

      // player.anims.play('turn');

      // gameOver = true;
    }, null, this);

    var x = Phaser.Math.FloatBetween(0, 900);
    var rock = this.rocks.create(x, 100, 'rock');
    rock.setBounce(1);
    rock.setCollideWorldBounds(true);
    rock.setVelocity(Phaser.Math.Between(-200, 200), 20);


  },
  update: function(){
    if (this.cursors.left.isDown){
      this.player.setVelocityX(-160);
      // this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      // this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      // this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown ){ //&& this.player.body.touching.down
      this.player.setVelocityY(-330);
    }
  },
};

  window.onload = function(){
    const config = {
      type: Phaser.AUTO,
      width: 900,
      height: 600,
      scene: TestGame.Boot,
      autoCenter: true,
      parent: 'gameContainer',
      title: 'Test Game',
      physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        },
      },
    };
    const game = new Phaser.Game(config);
  };
})();
