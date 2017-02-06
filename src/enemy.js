var DOMElement = require('famous/dom-renderables/DOMElement');
var Sphere = require('famous/physics/bodies/Sphere');
var Vec3 = require('famous/math/Vec3');
var Mat33 = require('famous/math/Mat33');
var Quaternion = require('famous/math/Quaternion');

function Enemy(FamousEngine){
  this.idleEnemies = [];
  this.enemyIT = 0;
  this.scene = FamousEngine._scenes.body;
  this.enemies = this.scene.addChild();
  this.enemies.createEnemiesComponent = {
    id: null,
    node: null,
    active: null,
    onMount: function(node){
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function(event,payload) {
      if(event == 'createEnemies')
        this.node.requestUpdate(this.id);
    },
    onUpdate: function() {
      if(!game.over && this.active != true){
        collisionDetection();
        this.active = true;
        this.setEnemyInMotionUtil();
      }
    }
  }
  this.enemies.addComponent(this.enemies.createEnemiesComponent);
}
Enemy.prototype.addEnemy = function(x){
  var color = 'yellow'; // debug 'yellow'
  var image = "url(./images/star.png)" // star.png
  if (x > 91 && x < 184) {
    color='rock';   // rock
    image = 'url(./images/rock.png)'  //rock.png
  }else if (x == 184 || x == 185){
    color='blue';
    image = 'url(./images/star_b.png)'
  }else if (x == 186 || x == 187) {
    color='grey';
    image = 'url(./images/star_g.png)'
  }else if (x == 188 || x == 189){
    color='green';
    image = 'url(./images/star_grn.png)'
  }else if (x == 190 || x == 191){
    color='orange';
    image = 'url(./images/star_oj.png)'
  }else if (x == 192 || x == 193){
    color='pink';
    image = 'url(./images/star_p.png)'
  }else if (x == 194 || x == 195){
    color='red';
    image = 'url(./images/star_gb.png)'
  }else if (x == 196 || x == 197){
    color='purple';
    image = 'url(./images/star_v.png)'
  }else if (x == 198 || x == 199){
    color='black';
    image = 'url(./images/star_blk.png)'
  }
  var newEnemy = this.enemies.addChild();
  var sizes = [35,40,50,55];
  var size = sizes[Math.floor(Math.random()*sizes.length)];
  newEnemy._size = size;
  newEnemy.setSizeMode('absolute', 'absolute')
    .setAbsoluteSize(size, size)
    .setAlign(0,0)
    .setPosition(-1000,-1000,3);
  newEnemy.DOMElement = new DOMElement(newEnemy);
  newEnemy.color = color;
  newEnemy.DOMElement.setProperty('background-image',image)
    .setProperty('background-size',"100% 100%")
    .setProperty('color','red')
    .setProperty('font-size','20px')
    .setProperty('font-weight','bold')
    .setProperty('word-wrap','break-word')
    .setProperty('border-radius', "100%")
    .setProperty('text-align','center');
  var newEnemyPosition = newEnemy.getPosition();
  newEnemy._position = newEnemyPosition;
  newEnemy.sphere = new Sphere({
    mass: 1,
    radius: (size/2)-1,
    position:new Vec3(newEnemyPosition[0],newEnemyPosition[1],-100),
    restitution: 0,
    friction: 0
  });
  if(color == 'yellow'){
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      updateScore(payload.bodyB.node._size * 2);
    });
  }else if(color == 'rock'){
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bomb.play();
      if(!game.invincible && game.lives <= 1){
        game.ongoing = false;
        gameOver();
      }else if (!game.invincible){
        game.emit('manageLives',{'life':-1});
      }
    });
  }else if(color == 'blue'){
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      setInvincible();
    });
  }else if(color == 'grey'){
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      setSlowTime();
    });
  }else if (color == 'green') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      game.teir_reducer += 2;
    });
  }else if (color == 'orange') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      game.speed_reducer += 10;
    });
  }else if (color == 'pink') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      updateScore(1000);
    });
  }else if (color == 'red') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      game.emit('manageLives',{'life':1});
    });
  }else if (color == 'purple') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      setWarp();
    });
  }else if (color == 'black') {
    newEnemy.sphere.on('collision:start', function(payload){
      payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
      this.resetBody(payload.bodyA);
      if(game.sound)
        bing.play();
      setMagenetic();
    });
  }
  newEnemy.sphere.node = newEnemy;
  this.resetBody(newEnemy.sphere);
  this.addEnemyComponent(newEnemy);
  newEnemy.idle = true;
  this.idleEnemies.push(newEnemy);
  this.enemyIT++;
}
Enemy.prototype.addEnemyComponent = function(enemy){
  enemy.enemyComponent = {
    id: null,
    node: null,
    done: function(node){
      node.setPosition(-1000,-1000,3);
      node.sphere.setPosition(-1000,-1000,0)
        .setVelocity(0,0,0);
      game.world.remove(node.collision);
      game.world.remove(node.sphere);
      node.idle = true;
      game.attractables.splice(game.attractables.indexOf(node.sphere),1);
      game.idleEnemies.unshift(node);
      game.activeEnemies.splice(game.activeEnemies.indexOf(node),1);
    },
    onMount: function (node){
      this.id = node.addComponent(this);
      this.node = node;
    },
    onUpdate: function(time){
      spherePosition = this.node.sphere.getPosition();
      if(this.node.name == 'bottom'){
        if((spherePosition.x-100) > gameSize[0] || (spherePosition.x+100) < 0
        || (spherePosition.y+100) < 0){
          if(this.node._id != null && !this.node.idle){
            this.done(this.node);
          }
        }else{
          this.node.setPosition(spherePosition.x,spherePosition.y,3);
          this.node.requestUpdate(this.id);
        }
      }
      else if(this.node.name == 'top'){
        if((spherePosition.x-100) > gameSize[0] || (spherePosition.x+100) < 0
        || (spherePosition.y-100) > gameSize[1]){
          if(this.node._id != null && !this.node.idle){
            this.done(this.node);
          }
        }else{
          this.node.setPosition(spherePosition.x,spherePosition.y,3);
          this.node.requestUpdate(this.id);
        }
      }
      else if(this.node.name == 'left'){
        if((spherePosition.x-100) > gameSize[0]
        || (spherePosition.y-100) > gameSize[1] || (spherePosition.y+100) < 0){
          if(this.node._id != null && !this.node.idle){
            this.done(this.node);
          }
        }else{
          this.node.setPosition(spherePosition.x,spherePosition.y,3);
          this.node.requestUpdate(this.id);
        }
      }
      else if(this.node.name == 'right'){
        if((spherePosition.x+100) < 0
        || (spherePosition.y-100) > gameSize[1] || (spherePosition.y+100) < 0){
          if(this.node._id != null && !this.node.idle){
            this.done(this.node);
          }
        }else{
          this.node.setPosition(spherePosition.x,spherePosition.y,3);
          this.node.requestUpdate(this.id);
        }
      }
    }
  };
  enemy.addComponent(enemy.enemyComponent);
}
Enemy.prototype.setEnemyInMotion = function(speed, tiing){
  r = Math.floor(Math.random()*game.idleEnemies.length);
  aEnemy = game.idleEnemies.splice(r,1)[0];
  aEnemy.idle = false;
  world.addBody(aEnemy.sphere);
  aEnemy.collision = world.addConstraint(
    new Collision([game.boxNode.box,aEnemy.sphere],{restitution:0})
  );
  sidesOps = [1,2,3,4];
  sideOp = sidesOps[Math.floor(Math.random()*sidesOps.length)];
  sEIMsize = aEnemy._size;
  if(sideOp == 1){
    aEnemy.setPosition(gameSize[0],Math.round(Math.random() * gameSize[1]),3);
    aEnemy.sphere.setPosition(gameSize[0],Math.round(Math.random() * gameSize[1]),0);
    aEnemy.name = "right";
  }else if(sideOp == 2){
    aEnemy.setPosition(-sEIMsize,Math.round(Math.random() * gameSize[1]),3);
    aEnemy.sphere.setPosition(-sEIMsize,Math.round(Math.random() * gameSize[1]),0)
    aEnemy.name = "left";
  }else if(sideOp == 3){
    aEnemy.setPosition(Math.round(Math.random() * gameSize[0]),gameSize[1],3);
    aEnemy.sphere.setPosition(Math.round(Math.random() * gameSize[0]),gameSize[1],0)
    aEnemy.name = "bottom";
  }else if(sideOp == 4){
    aEnemy.setPosition(Math.round(Math.random() * gameSize[0]),-sEIMsize,3);
    aEnemy.sphere.setPosition(Math.round(Math.random() * gameSize[0]),-sEIMsize,0)
    aEnemy.name = "top";
  }
  diag = Math.random() < 0.5 ? true : false;
  aEnemyPosition = aEnemy.getPosition();
  if(aEnemy.name == "left"){
    if(diag == true){
      if(aEnemyPosition[1]> (gameSize[1]/2)){
        aEnemy.sphere.setVelocity(speed,-speed);
      }
      else{
        aEnemy.sphere.setVelocity(speed,speed);
      }
    }
    else{
      aEnemy.sphere.setVelocity(speed,0);
    }
  }else if(aEnemy.name == "right"){
    if(diag == true){
      if(aEnemyPosition[1]> (gameSize[1]/2)){
        aEnemy.sphere.setVelocity(-speed,-speed);
      }
      else{
        aEnemy.sphere.setVelocity(-speed,speed);
      }
    }
    else{
      aEnemy.sphere.setVelocity(-speed,0);
    }
  }else if(aEnemy.name == "top"){
    if(diag == true){
      if(aEnemyPosition[0]> (gameSize[0]/2)){
        aEnemy.sphere.setVelocity(-speed,speed);
      }
      else{
        aEnemy.sphere.setVelocity(speed,speed)
      }
    }
    else{
      aEnemy.sphere.setVelocity(0,speed);
    }
  }else if(aEnemy.name == "bottom"){
    if(diag == true){
      if(aEnemyPosition[0]> (gameSize[0]/2)){
        aEnemy.sphere.setVelocity(-speed,-speed);
      }
      else {
        aEnemy.sphere.setVelocity(speed,-speed);
      }
    }
    else{
      aEnemy.sphere.setVelocity(0,-speed);
    }
  }
  game.activeEnemies.push(aEnemy);
  if(aEnemy.color != 'rock')
    game.attractables.push(aEnemy.sphere);
  aEnemy.requestUpdate(aEnemy.enemyComponent.id);
  game.clock.timeout(function(){
     setEnemyInMotionUtil();
  }, timing);
}
Enemy.prototype.setEnemyInMotionUtil = function(){
  if (game.over == false) {
    timings_teirs = [[500,800],[400,650],[300,500],[200,400],[100,250],[50,125]];
    speed_range = [200,275];
    speed = Math.floor(
      (Math.floor(Math.random()*(speed_range[1]-speed_range[0]))+speed_range[0])
      + (Math.floor(Math.random()*((game.score/2)+1))/ game.speed_reducer)
    );
    game.timing_teir_i=0;
    if ((game.score/game.teir_reducer) < 200 ){
      game.timing_teir_i=0
    }else if ((game.score/game.teir_reducer)< 400 ) {
      game.timing_teir_i=1;
    }else if ((game.score/game.teir_reducer)< 800) {
      game.timing_teir_i=2;
    }else if ((game.score/game.teir_reducer)< 1600) {
      game.timing_teir_i=3;
    }else if ((game.score/game.teir_reducer)< 2400) {
      game.timing_teir_i=4;
    }else if ((game.score/game.teir_reducer)>= 2400) {
      game.timing_teir_i=5;
    }
    timing_teir = timings_teirs[game.timing_teir_i];
    timing = Math.floor(Math.random()*(timing_teir[1] - timing_teir[0])) + timing_teir[0];
    setEnemyInMotion(speed, timing);
  }
}
Enemy.prototype.resetBody = function(body){
  body.angularMomentum = new Vec3(0,0,0);
  body.angularVelocity = new Vec3(0,0,0);
  body.momentum = new Vec3(0,0,0);
  body.orientation = new Quaternion(1,0,0,0);
  body.velocity = new Vec3(0,0,0);
  body.torque = new Vec3(0,0,0);
  body.inverseInertia = new Mat33([1,0,0,0,1,0,0,0,1]);
  body.localInertia = new Mat33([1,0,0,0,1,0,0,0,1]);
  body.localInverseInertia = new Mat33([1,0,0,0,1,0,0,0,1]);
  body.restitution = 0;
  body.friction = 0;
  return;
}

module.exports = Enemy;
