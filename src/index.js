function startMe(){
  var DOMElement = require('famous/dom-renderables/DOMElement');
  var FamousEngine = require('famous/core/FamousEngine');
  var Dispatch = require('famous/core/Dispatch');
  var Transitionable = require('famous/transitions/Transitionable');
  var Node = require('famous/core/Node');
  var Position = require('famous/components/Position');
  var math = require('famous/math');
  var physics = require('famous/physics');
  var Sphere = require('famous/physics/bodies/Sphere');
  var Box = require('famous/physics/bodies/Box');
  var Vec3 = require('famous/math/Vec3');
  var Mat33 = require('famous/math/Mat33');
  var Quaternion = require('famous/math/Quaternion');
  var Collision = require('famous/physics/constraints/Collision');
  var Gravity3D = require('famous/physics/forces/Gravity3D');
  var PathStore = require('famous/core/PathStore');
  var Framedata = require ('./framedata.js');
  var Howler = require('./howler.min.js');
  var res = window.devicePixelRatio;
  FamousEngine.init();
  var fd = Framedata.init();
  var scene = FamousEngine.createScene();
  scene.name = "scene";
  document.scene = scene;
  var options = {};
  var world = new physics.PhysicsEngine(options);
  var game = scene.addChild();
  game.clock = FamousEngine.getClock();
  game.world = world;
  game.name = "game";
  game.dispatch = Dispatch;
  game.pathStore = PathStore;
  var gameUI = game.addChild();
  gameUI.name = "gameUI";
  var gameSize = game.getSize();
  game.attractables = [];
  game.games = 0;
  game.ongoing = false;
  var Storage = require('./storage.js');
  var storage = new Storage();

  var Input = require('./input.js');
  Input.init();
  game.onReceive = Input.dispatch;

  if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios') {
      window.social = Cocoon.Social.GameCenter.init();
      window.social = Cocoon.Social.GameCenter.getSocialInterface();
      loggedIn = window.social.isLoggedIn();
      function loginSocial() {
          if (!window.social.isLoggedIn()) {
              window.social.login();
          }
      }
      if (window.social){
          window.social.on("loginStatusChanged", function(loggedIn, error) {
              if (loggedIn) {
                  window.social.requestScore(function(score, error) {
                      if (error) {
                          console.error("Error getting user score: " + error.message);
                      }else if (score) {
                          console.log("score: " + score.score);
                          window.localUserScore = score.score;
                          if(game.storage)
                              window.localStorage.high_score = score.score
                      }
                  }, {
                      leaderboardID: "com.karaman.crossfire.highScore"
                  });
              }
          });
      }
      loginSocial();
  }
  createBoxNode();
  createStartButtonNode();
  createHowToButtonNode();
  createLeaderboardButtonNode();
  var gameBG = gameUI.addChild();
  gameBG.name = 'background';
  gameBG.setSizeMode('relative','relative')
      .setProportionalSize(1,1)
      .setAlign(0,0);
  gameBG.DOMElement = new DOMElement(gameBG);
  gameBG.DOMElement.setProperty('background-image', 'url(./images/space_new.png)')
      .setProperty('z-index','1')
      .setProperty('background-size','100% 100%');
  game.gameLivesNode = gameUI.addChild();
  game.gameLivesNode.name = 'gameLivesNode';
  game.gameLivesNode.gameLivesComponent = {
      id:null,
      node:null,
      life:null,
      onMount: function(node){
          this.id = node.addComponent(this);
          this.node = node;
      },
      onReceive: function(event,payload){
          if(event == 'manageLives'){
              this.life = payload.life;
              this.node.requestUpdate(this.id);
          }
      },
      onUpdate: function(time){
          manageLives(this,this.life);
      },
  }
  game.gameLivesNode.addComponent(game.gameLivesNode.gameLivesComponent);
  var posit = 0;
  game.enemyIT = 0;
  game.boxSet = false;
  var sound = new Howl({
      src:['./assets/starcatcher.m4a'],
      loop: true
  });
  var bing = new Howl({
      src:['./assets/bing.m4a'],
      volume: 0.35
  });
  var bomb = new Howl({
      src:['./assets/bomb.m4a']
  });
  if(game.storage){
      if(window.localStorage.sound &&
          (window.localStorage.sound == "true"|| window.localStorage.sound == 'undefined')){
          game.sound = true;
          window.localStorage.sound = game.sound;
          sound.play(function(){
              sound.pos(posit);
          });
      }else if(window.localStorage.sound &&
          (window.localStorage.sound == "false")){
          game.sound = false;
      }else if(!window.localStorage.sound){
          window.localStorage.sound = true;
          game.sound = true;
          sound.play(function(){
              sound.pos(posit);
          });
      }
  }
  else{
      game.sound = true;
      sound.play(function(){
          sound.pos(posit);
      });
  }
  var soundButtonNode = gameUI.addChild();
  game.soundButtonNode = soundButtonNode;
  soundButtonNode.name = 'soundButtonNode';
  soundButtonNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(40,40)
      .setAlign(0,1)
      .setPosition(20,-170);
  soundButtonNode.DOMElement = new DOMElement(soundButtonNode,{
      attributes: {
          class:'famous-dom-element needsclick'
      }
  });
  if(game.sound == true)
      var property = 'url(./images/music.png)'
  else if (game.sound == false)
      var property = 'url(./images/music_off.png)'
  soundButtonNode.DOMElement.setProperty(
      'background-image', property)
      .setProperty('z-index','20');
  soundButtonNode.soundButtonNodeComponent = {
      id: null,
      node: null,
      onMount: function (node) {
          this.id = node.addComponent(this);
          this.node = node;
      },
      onReceive: function(event, payload){
          if(event == 'sound'){
              this.node.requestUpdate(this.id);
          }
      },
      onUpdate: function(time){
          if(game.sound){
              game.sound = false;
              sound.pause();
              this.node.DOMElement.setProperty(
                  'background-image','url(./images/music_off.png)');
              if(game.storage)
                  window.localStorage.sound = false;
          }else{
              game.sound = true;
              sound.play();
              this.node.DOMElement.setProperty(
                  'background-image','url(./images/music.png)');
              if(game.storage)
                  window.localStorage.sound = true;
          }
      }
  }
  soundButtonNode.addComponent(soundButtonNode.soundButtonNodeComponent);
  var creditsButtonNode = gameUI.addChild();
  game.creditsButtonNode = creditsButtonNode;
  creditsButtonNode.name = 'creditsButtonNode';
  creditsButtonNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(40,40)
      .setAlign(1,1)
      .setPosition(-60,-170);
  creditsButtonNode.DOMElement = new DOMElement(creditsButtonNode);
  creditsButtonNode.DOMElement.setProperty('background-image', 'url(./images/credits.png)')
      .setProperty('z-index','20');
  creditsButtonNode.creditsButtonNodeComponent = {
      id: null,
      node: null,
      onMount: function (node) {
          this.id = node.addComponent(this);
          this.node = node;
      },
      onReceive: function(event, payload){
          if(event == 'credits'){
              this.node.requestUpdate(this.id);
          }
      },
      onUpdate: function(time){
          showCredits();
      }
  }
  creditsButtonNode.addComponent(creditsButtonNode.creditsButtonNodeComponent);
  if(game.storage && window.localStorage.high_score){
      highScoreNode = gameUI.addChild();
      game.highScoreNode = highScoreNode;
      highScoreNode.name = 'highScoreNode';
      leng = window.localStorage.high_score.length;
      highScoreNode.setSizeMode('absolute','absolute')
          .setAbsoluteSize(50*leng,30)
          .setAlign(1,0)
          .setPosition(-25*leng, 0);
      highScoreNode.DOMElement = new DOMElement(highScoreNode);
      highScoreNode.DOMElement.setProperty('font-size', '40px')
          .setContent(window.localStorage.high_score)
          .setProperty('z-index','2')
          .setProperty('color','white')
          .setProperty('opacity','0.5');
  }
  var gameTitle = gameUI.addChild();
  gameTitle.name = 'title';
  game.gameTitle = gameTitle;
  gameTitle.setSizeMode('absolute','absolute')
      .setAbsoluteSize(341,45)
      .setAlign(0.5,0.2)
      .setPosition(-150,0);
  gameTitle.DOMElement = new DOMElement(gameTitle);
  gameTitle.DOMElement.setContent("Stars & Asteroids")
      .setProperty('z-index','1')
      .setProperty('font-size',40+'px')
      .setProperty('color','white');
  var gameOverNode = gameUI.addChild();
  game.gameOverNode = gameOverNode;
  gameOverNode.name = "gameOverNode";
  gameOverNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(400,100)
      .setAlign(0.5,0.5)
      .setPosition(-1000,-1000);
  gameOverNode.DOMElement = new DOMElement(gameOverNode);
  gameOverNode.DOMElement.setProperty('font-size','55px')
      .setProperty('text-align','center')
      .setContent('Game Over')
      .setProperty('background','none')
      .setProperty('color','white');
  if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'
  && Cocoon.Ad.AdMob){
      Cocoon.Ad.AdMob.configure({
          ios: {
              banner:"ca-app-pub-4693632452063283/2829774253",
              interstitial:"ca-app-pub-4693632452063283/4023645854",
          }
      });
      loadAndShowBannerAd();
      loadInterstitialAd();
  }
  var gameEnemies = game.addChild();
  game.gameEnemies = gameEnemies;
  gameEnemies.name = "gameEnemies";
  gameEnemies.createEnemiesComponent = {
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
              setEnemyInMotionUtil();
          }
      }
  }
  gameEnemies.addComponent(gameEnemies.createEnemiesComponent);
  game.idleEnemies = [];
  for(var b=0;b<200;b++){
      addEnemy(b);
  }
  function initGame() {
      game.over = false;
      game.speed_reducer = 5;
      game.teir_reducer = 1;
      game.lives = 1;
      game.score = 0;
      game.startButtonNode.setPosition(-1000,-1000);
      game.howToButtonNode.setPosition(-1000,-1000);
      game.soundButtonNode.setPosition(-1000,-1000);
      game.creditsButtonNode.setPosition(-1000,-1000);
      game.leaderboardButtonNode.setPosition(-1000,-1000);
      gameTitle.setPosition(-10000,-10000);
      if(game.gameOverNode)game.gameOverNode.setPosition(-1000,-1000);
      document.body.style.cursor = "none";
      resetBody(game.boxNode.box);
      game.activeEnemies = [];
      if(!game.scoreNode){
          scoreNode = gameUI.addChild();
          game.scoreNode = scoreNode;
          scoreNode.name = "scoreNode";
          scoreNode.setSizeMode('absolute','absolute')
              .setAbsoluteSize(gameSize[0],100)
              .setAlign(0.5,0.5)
              .setPosition(-gameSize[0]/2,-50);
          scoreNode.DOMElement = new DOMElement(scoreNode);
          scoreNode.DOMElement.setProperty('font-size','60px')
              .setProperty('opacity','0.5')
              .setProperty('text-align','center')
              .setContent('0')
              .setProperty('color','white')
              .setProperty('z-index','2');
      }
      else {
          game.scoreNode.DOMElement.setContent('0')
              .setProperty('opacity','0.5');
          game.scoreNode.setPosition(-gameSize[0]/2,-50)
              .setAlign(0.5,0.5);
      }
      game.emit("createEnemies",{});
      game.emit('loop',{looping:true,interrupt:true});
  }
  function createStartButtonNode() {
      var startButtonNode = gameUI.addChild();
      game.startButtonNode = startButtonNode;
      startButtonNode.name = "startButtonNode";
      startButtonNode.setSizeMode('absolute','absolute')
          .setAbsoluteSize(240,60)
          .setAlign(0.5,0.8)
          .setPosition(-102,-130);
      startButtonNode.DOMElement = new DOMElement(startButtonNode);
      var content = "Start Game"
      startButtonNode.DOMElement.setProperty('font-size',40+'px')
          .setContent(content)
          .setProperty('z-index','2')
          .setProperty('color','white');
      var startComponent = {
          id: null,
          node: null,
          onMount: function (node) {
              this.id = node.addComponent(this);
              this.node = node;
          },
          onReceive: function (event, payload){
              if(event == 'startButton')
                  this.node.requestUpdate(this.id);
          },
          onUpdate: function() {
              game.started = true;
              initGame();
          }
      }
      startButtonNode.addComponent(startComponent);
  }
  function createLeaderboardButtonNode() {
      var leaderboardButtonNode = gameUI.addChild();
      game.leaderboardButtonNode = leaderboardButtonNode;
      leaderboardButtonNode.name = "leaderboardButtonNode";
      leaderboardButtonNode.setSizeMode('absolute','absolute')
          .setAbsoluteSize(140,60)
          .setAlign(0.5,0.8)
          .setPosition(-85,-20);
      leaderboardButtonNode.DOMElement = new DOMElement(leaderboardButtonNode);
      var content = "Leaderboard"
      leaderboardButtonNode.DOMElement.setProperty('font-size',30+'px')
          .setContent(content)
          .setProperty('z-index','2')
          .setProperty('color','white');
      var leaderboardComponent = {
          id: null,
          node: null,
          onMount: function (node) {
              this.id = node.addComponent(this);
              this.node = node;
          },
          onReceive: function (event, payload){
              if(event == 'leaderboardButton')
                  this.node.requestUpdate(this.id);
          },
          onUpdate: function() {
              if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'){
                  if(window.social && window.social.isLoggedIn()){
                      window.social.showLeaderboard();
                  }
              }
          }
      }
      leaderboardButtonNode.addComponent(leaderboardComponent);
  }
  function createHowToButtonNode() {
      var howToButtonNode = gameUI.addChild();
      game.howToButtonNode = howToButtonNode;
      howToButtonNode.name = "howToButtonNode";
      howToButtonNode.setSizeMode('absolute','absolute')
          .setAbsoluteSize(190,60)
          .setAlign(0.5,0.8)
          .setPosition(-85,-70);
      howToButtonNode.DOMElement = new DOMElement(howToButtonNode);
      howToButtonNode.DOMElement.setProperty('font-size',30+'px')
          .setContent('How To Play')
          .setProperty('z-index','2')
          .setProperty('color','white');
      var howToComponent = {
          id: null,
          node: null,
          onMount: function (node) {
              this.id = node.addComponent(this);
              this.node = node;
          },
          onReceive: function (event, payload){
              if(event == 'howToButton')
                  this.node.requestUpdate(this.id);
          },
          onUpdate: function() {
              howToPlay();
          }
      }
      howToButtonNode.addComponent(howToComponent);
  }
  function createBoxNode() {
      var boxNode = gameUI.addChild();
      game.boxNode = boxNode;
      boxNode.name = "boxNode";
      boxNode.framedata = fd.framedata.astro;
      game.idle = true;
      boxNode.ratio = 0.8;
      boxNode.setSizeMode('absolute', 'absolute')
          .setAbsoluteSize(80*boxNode.ratio, 120*boxNode.ratio)
          .setAlign(0.5,0.5)
          .setPosition(-36*boxNode.ratio,-60*boxNode.ratio,10000)
          .setOrigin(0.5, 0.5);
      boxNode.size = {w:80,h:120};
      boxNode.DOMElement = new DOMElement(boxNode);
      boxNode.DOMElement.setProperty(
              'background-image', 'url(./images/astro_loop.png)')
          .setProperty('background-size','800% 300%')
          .setProperty('z-index','1000');
      var boxNodePosition = boxNode.getPosition();
      var w = boxNode.size.w * boxNode.ratio;
      var h = boxNode.size.h * boxNode.ratio;
      boxNode.box = new Box({
          mass: 30000000,
          size: [(w-35),(h-15),40],
          position:new Vec3(boxNodePosition[0],boxNodePosition[1]),
          restitution: 0,
          friction: 0
      });
      boxNode.box.node = boxNode;
      world.addBody(boxNode.box);
      var boxNodeComponentID = boxNode.addComponent({
          id:null,
          node:null,
          onMount: function(node) {
              this.id = node.addComponent(this);
              this.node = node;
          },
          onUpdate: function(time) {
              if(game.started == true && game.boxSet != true){
                  boxNode.setAlign(0,0)
                  boxNode.box.setPosition(gameSize[0]/2,gameSize[1]/2, 0);
                  game.boxSet = true;
              }
              var boxPosition = boxNode.box.getPosition();
              boxNode.setPosition(boxPosition.x-10, boxPosition.y-20, 10000);
              boxNode.requestUpdate(this.id);
          }
      });
      addAnimationComponent(boxNode);
      boxNode.requestUpdate(boxNodeComponentID);
  }
  function addAnimationComponent(char){
      var myComponent = {
          id: null,
          node: null,
          done: function(node) {
              node.framedata.active.frameIterator = 0;
              node.framedata.active.msTimer = 0;
              node.framedata.active = null;
              node.animationTransitionable.halt();
          },
          onMount: function (node) {
              this.id = node.addComponent(this);
              this.node = node;
          },
          onReceive: function (event, payload) {
              var framedata = this.node.framedata;
              if (framedata[event]) {
                  if(!framedata.active){
                      framedata.active = framedata[event];
                      framedata.active.event = event;
                      framedata.active.frameIterator = 0;
                      if((typeof payload.looping) != 'undefined')
                          framedata.active.looping = payload.looping;
                      if((typeof payload.interruptable) != 'undefined')
                          framedata.active.interruptable = payload.interruptable;
                  }
                  if((typeof framedata.active.interruptable) != 'undefined'){
                      if(framedata.active.interruptable == false){
                          payload.interrupt = false;
                      }
                  }
                  if (framedata.active.frameIterator < 1 || payload.interrupt) {
                      if(payload.interrupt){
                          if(this.node.animationTransitionable)
                              this.node.animationTransitionable.halt();
                          framedata.active.frameIterator = 0;
                      }
                      framedata.active = framedata[event];
                      framedata.active.event = event;
                      if((typeof payload.interruptable) != 'undefined')
                          framedata.active.interruptable = payload.interruptable;
                      var frames = framedata.active.frames;
                      var duration=0;
                      for(x=0; x < frames.length; x++){
                          duration += frames[x].ms;
                      }
                      framedata.active.duration = duration;
                      this.node.animationTransitionable = new Transitionable(0);
                      this.node.requestUpdate(this.id);
                      this.node.animationTransitionable.from(0).to(
                          duration,
                          'linear',
                          duration,
                          null,
                          this.done,
                          this.node);
                  }
              }
          },
          onUpdate: function() {
              var framedata = this.node.framedata;
              if(framedata.active){
                  var animation = framedata.active;
                  var frames = animation.frames;
                  var transition = this.node.animationTransitionable;
                  var grace = 2;
                  var ratio = 1
                  if(this.node.ratio) ratio = this.node.ratio;
                  if(transition._state < 1){
                      animation.frameIterator = 0;
                      animation.msTimer = 0;
                  }
                  if(animation.frameIterator < frames.length){
                      if(transition._state <
                          (animation.msTimer +
                               frames[animation.frameIterator].ms + grace)
                      && transition._state >= (animation.msTimer - grace)
                      && animation != null) {
                          this.node.DOMElement.setProperty(
                              'background-position','-' +
                              (frames[animation.frameIterator].x*ratio)
                              + 'px ' + '-' +
                              (frames[animation.frameIterator].y*ratio) + 'px')
                          animation.msTimer += frames[animation.frameIterator].ms;
                          animation.frameIterator++;
                          forceMove = transition.get();
                          this.node.requestUpdate(this.id);
                      }
                      else if(transition.isActive()) {
                          forceMove = transition.get();
                          this.node.requestUpdate(this.id);
                      }
                  }else if(animation.frameIterator >= frames.length){
                      if(transition.isActive()){
                          transition.halt();
                      }
                      if(animation.looping){
                          animation.frameIterator = 0;
                          transition.from(0).to(
                              framedata.active.duration,
                              'linear',
                              framedata.active.duration,
                              null,
                              this.done,
                              this.node);
                          this.node.requestUpdate(this.id);
                      }else{
                          framedata.active = null;
                      }
                  }
              }
          }
      };
      char.addComponent(myComponent);
  }
  function addEnemy(x){
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
      var newEnemy = gameEnemies.addChild();
      newEnemy.name = "";
      game.newEnemy = newEnemy;
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
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              updateScore(payload.bodyB.node._size * 2);
          });
      }else if(color == 'rock'){
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
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
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              setInvincible();
          });
      }else if(color == 'grey'){
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              setSlowTime();
          });
      }else if (color == 'green') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              game.teir_reducer += 2;
          });
      }else if (color == 'orange') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              game.speed_reducer += 10;
          });
      }else if (color == 'pink') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              updateScore(1000);
          });
      }else if (color == 'red') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              game.emit('manageLives',{'life':1});
          });
      }else if (color == 'purple') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              setWarp();
          });
      }else if (color == 'black') {
          newEnemy.sphere.on('collision:start', function(payload){
              payload.bodyB.node.enemyComponent.done(payload.bodyB.node);
              resetBody(payload.bodyA);
              if(game.sound)
                  bing.play();
              setMagenetic();
          });
      }
      newEnemy.sphere.node = newEnemy;
      resetBody(newEnemy.sphere);
      addEnemyComponent(newEnemy);
      newEnemy.idle = true;
      game.idleEnemies.push(newEnemy);
      game.enemyIT++;
  }
  function addEnemyComponent(enemy){
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
  function setEnemyInMotion(speed, timing){
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
  function setEnemyInMotionUtil(){
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
  function followAction(event){
      if(event.type == "touchmove"){
          newPosX = event.touches[0].clientX - (game.boxNode.size.w/2);
          newPosY = event.touches[0].clientY - (game.boxNode.size.h/2);
      }else {
          newPosX = event.clientX - (game.boxNode.size.w/2);
          newPosY = event.clientY - (game.boxNode.size.h/2);
      }
      if(game.warp || game.idle){
          if(!game.previousPosition){
              game.previousPosition = {
                  x:newPosX,
                  y:newPosY
              };
          }
          game.idle = false;
          game.boxNode.box.setPosition(newPosX,newPosY,0);
      }else if(!game.warp && game.previousPosition){
          xDiff = Math.abs(game.previousPosition.x - newPosX);
          yDiff = Math.abs(game.previousPosition.y - newPosY);
          if(xDiff > 79 || yDiff > 79){
              return;
          }else{
              game.boxNode.box.setPosition(newPosX,newPosY,0);
          }
          game.previousPosition.x = newPosX;
          game.previousPosition.y = newPosY;
      }
  }
  function updateScore(score){
      game.score += score;
      game.scoreNode.DOMElement.setContent(game.score);
  }
  function setSlowTime() {
      if(!game.slowTime){
          game.slowTime = true;
          slowTimeBarTimerNode = gameUI.addChild();
          game.slowTimeBarTimerNode = slowTimeBarTimerNode;
          slowTimeBarTimerNode.name = "slowTimeBarTimerNode";
          slowTimeBarTimerNode.setSizeMode('relative','absolute')
              .setAbsoluteSize(null,10)
              .setProportionalSize(0.9,null)
              .setAlign(0.5,0);
          slowTimeBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),130,1);
          slowTimeBarTimerNode.DOMElement = new DOMElement(slowTimeBarTimerNode);
          slowTimeBarTimerNode.DOMElement
              .setProperty('background-color','grey')
              .setProperty('opacity','0.5');
          slowTimeBarTimerNode.slowTimeBarTimerComponent = {
              id:null,
              node:null,
              startTime:null,
              done: function(node){
                  if(node in node._updater._updateQueue)
                      FamousEngine._updateQueue.splice(node._updater._updateQueue.indexOf(node), 1);
                  if(node._updateQueue && node._updateQueue.length)
                      node._updateQueue = [];
                  if(node._nextUpdateQueue && node._nextUpdateQueue.length)
                      node._nextUpdateQueue = [];
                  if(node.isMounted())node.dismount();
                  delete game.slowTime;
                  delete game.slowTimeBarTimerNode.DOMElement;
                  for(q=0; q< game.activeEnemies.length; q++){
                      if(game.activeEnemies[q] != null){
                          veloArr1 = game.activeEnemies[q].sphere.velocity.toArray();
                          for(j=0; j< veloArr1.length; j++){
                              veloArr1[j] = Math.floor(veloArr1[j]*2);
                          }
                          game.activeEnemies[q].sphere.setVelocity(veloArr1[0],veloArr1[1],veloArr1[2]);
                          game.activeEnemies[q].slowed = false;
                      }
                  }
              },
              onMount: function(node){
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onUpdate: function(time){
                  if(this.startTime == null){
                      this.startTime = time;
                  }
                  else{
                      diffTimeST = time - this.startTime;
                      if(diffTimeST > 3000){
                          this.done(this.node);
                          return;
                      }
                      else {
                          percentageST = diffTimeST / 3000;
                          percentageST = 0.9 * (1 - percentageST)
                          this.node.setProportionalSize(percentageST,null);
                      }
                  }
                  for(g=0; g< game.activeEnemies.length; g++){
                      if(game.activeEnemies[g] != null && !game.activeEnemies[g].slowed){
                          veloArr2 = game.activeEnemies[g].sphere.velocity.toArray();
                          for(h=0; h< veloArr2.length; h++){
                              veloArr2[h] = Math.floor(veloArr2[h]/2);
                          }
                          game.activeEnemies[g].sphere.setVelocity(veloArr2[0],veloArr2[1],veloArr2[2])
                          game.activeEnemies[g].slowed = true;
                      }
                  }
                  this.node.requestUpdate(this.id);
              }
          }
          slowTimeBarTimerNode.addComponent(slowTimeBarTimerNode.slowTimeBarTimerComponent);
          slowTimeBarTimerNode.requestUpdate(slowTimeBarTimerNode.slowTimeBarTimerComponent.id);
      }else{
          game.slowTimeBarTimerNode.slowTimeBarTimerComponent.startTime = FamousEngine.getClock()._time;
      }
  }
  function setInvincible(){
      if(!game.invincible){
          game.invincible = true;
          invincibleBarTimerNode = gameUI.addChild();
          game.invincibleBarTimerNode = invincibleBarTimerNode;
          invincibleBarTimerNode.name = "invincibleBarTimerNode";
          invincibleBarTimerNode.setSizeMode('relative','absolute')
              .setAbsoluteSize(null,10)
              .setProportionalSize(0.9,null)
              .setAlign(0.5,0);
          invincibleBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),100,1);
          invincibleBarTimerNode.DOMElement = new DOMElement(invincibleBarTimerNode);
          invincibleBarTimerNode.DOMElement
                  .setProperty('background-color','blue')
                  .setProperty('opacity','0.5');
          invincibleBarTimerNode.invincibleBarTimerComponent = {
              id:null,
              node:null,
              startTime:null,
              done: function(node){
                  if(node.isMounted())node.dismount();
                  for(k=0;k<FamousEngine._updateQueue.length;k++){
                      if(FamousEngine._updateQueue[k] == node){
                          FamousEngine._updateQueue.splice(i,1);
                          k--;
                          continue;
                      }
                  }
                  delete game.invincible;
                  delete game.invincibleBarTimerNode.DOMElement;
              },
              onMount: function(node){
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onUpdate: function(time){
                  if(this.startTime == null){
                      this.startTime = time;
                  }
                  else{
                      diffTimeI = time - this.startTime;
                      if(diffTimeI > 3000){
                          this.done(this.node);
                          return;
                      }
                      else {
                          percentageI = diffTimeI / 3000;
                          percentageI = 0.9 * (1 - percentageI)
                          this.node.setProportionalSize(percentageI,null);
                      }
                  }
                  this.node.requestUpdate(this.id);
              }
          }
          invincibleBarTimerNode.addComponent(invincibleBarTimerNode.invincibleBarTimerComponent);
          invincibleBarTimerNode.requestUpdate(invincibleBarTimerNode.invincibleBarTimerComponent.id);
      }else{
          game.invincibleBarTimerNode.invincibleBarTimerComponent.startTime = FamousEngine.getClock()._time;
      }
  }
  function setWarp(){
      if(!game.warp){
          game.warp = true;
          warpBarTimerNode = gameUI.addChild();
          game.warpBarTimerNode = warpBarTimerNode;
          warpBarTimerNode.name = "warpBarTimerNode";
          warpBarTimerNode.setSizeMode('relative','absolute')
              .setAbsoluteSize(null,10)
              .setProportionalSize(0.9,null)
              .setAlign(0.5,0);
          warpBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-130,1);
          warpBarTimerNode.DOMElement = new DOMElement(warpBarTimerNode);
          warpBarTimerNode.DOMElement
                  .setProperty('background-color','purple')
                  .setProperty('opacity','0.5');
          warpBarTimerNode.warpBarTimerComponent = {
              id:null,
              node:null,
              startTime:null,
              done: function(node){
                  if(node.isMounted())node.dismount();
                  for(l=0;l<FamousEngine._updateQueue.length;l++){
                      if(FamousEngine._updateQueue[l] == node){
                          FamousEngine._updateQueue.splice(l,1);
                          l--;
                          continue;
                      }
                  }
                  delete game.warp;
                  delete game.warpBarTimerNode.DOMElement;
                  game.idle = true;
                  game.previousPosition = null;
              },
              onMount: function(node){
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onUpdate: function(time){
                  if(this.startTime == null){
                      this.startTime = time;
                  }
                  else{
                      diffTimeW = time - this.startTime;
                      if(diffTimeW > 5000){
                          this.done(this.node);
                          return;
                      }
                      else {
                          percentageW = diffTimeW / 5000;
                          percentageW = 0.9 * (1 - percentageW)
                          this.node.setProportionalSize(percentageW,null);
                      }
                  }
                  this.node.requestUpdate(this.id);
              }
          }
          warpBarTimerNode.addComponent(warpBarTimerNode.warpBarTimerComponent);
          warpBarTimerNode.requestUpdate(warpBarTimerNode.warpBarTimerComponent.id);
      }else{
          game.warpBarTimerNode.warpBarTimerComponent.startTime = FamousEngine.getClock()._time;
      }
  }
  function setMagenetic(){
      if(!game.magnetic){
          game.magnetic = true;
          magneticBarTimerNode = gameUI.addChild();
          game.magneticBarTimerNode = magneticBarTimerNode;
          magneticBarTimerNode.name = "magneticBarTimerNode";
          magneticBarTimerNode.setSizeMode('relative','absolute')
              .setAbsoluteSize(null,10)
              .setProportionalSize(0.9,null)
              .setAlign(0.5,0);
          magneticBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-100,1);
          magneticBarTimerNode.DOMElement = new DOMElement(magneticBarTimerNode);
          magneticBarTimerNode.DOMElement
                  .setProperty('background-color','grey')
                  .setProperty('opacity','0.4');
          magneticBarTimerNode.magneticBarTimerComponent = {
              id:null,
              node:null,
              startTime:null,
              done: function(node){
                  if(node.isMounted())node.dismount();
                  for(m=0;m<FamousEngine._updateQueue.length;m++){
                      if(FamousEngine._updateQueue[m] == node){
                          FamousEngine._updateQueue.splice(m,1);
                          m--;
                          continue;
                      }
                  }
                  delete game.magnetic;
                  delete game.magneticBarTimerNode.DOMElement;
              },
              onMount: function(node){
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onUpdate: function(time){
                  if(this.startTime == null){
                      this.startTime = time;
                  }
                  else{
                      diffTimeM = time - this.startTime;
                      if(diffTimeM > 5000){
                          this.done(this.node);
                          return;
                      }
                      else {
                          percentageM = diffTimeM / 5000;
                          percentageM = 0.9 * (1 - percentageM)
                          this.node.setProportionalSize(percentageM,null);
                      }
                  }
                  if(game.gravity)
                      game.gravity.update();
                  gravity = new Gravity3D(game.boxNode.box, game.attractables, {
                      strength:10
                  });
                  game.gravity = gravity;

                  this.node.requestUpdate(this.id);
              }
          }
          magneticBarTimerNode.addComponent(magneticBarTimerNode.magneticBarTimerComponent);
          magneticBarTimerNode.requestUpdate(magneticBarTimerNode.magneticBarTimerComponent.id);
      }else{
          game.magneticBarTimerNode.magneticBarTimerComponent.startTime = FamousEngine.getClock()._time;
      }
  }
  function manageLives(gameLivesComponent, op) {
      game.lives += op;
      if(op == 1 && game.lives <= 3){
          newLifeNode = game.gameLivesNode.addChild();
          newLifeNode.setSizeMode('absolute','absolute')
              .setAbsoluteSize(40,38)
              .setAlign(0.5,0.5)
              .setPosition((-120)+(40*game.lives),0,1);
          newLifeNode.DOMElement = new DOMElement(newLifeNode);
          newLifeNode.DOMElement.setProperty('background-image','url(./images/life.png)')
              .setProperty('background-size','100%')
              .setProperty('z-index','10000')
              .setProperty('opacity','0.5')
              .setProperty('padding','5px 0px');
      }else if(op == -1 && gameLivesComponent.node._children[gameLivesComponent.node._children.length-1] != null) {
          gameLivesComponent.node._children[gameLivesComponent.node._children.length-1].dismount();
          gameLivesComponent.node._children.splice(gameLivesComponent.node._children.length - 1,1)
      }
      if(game.lives > 3)game.lives = 3;
  }
  function gameOver(){
      while(game.activeEnemies.length){
          if(game.activeEnemies[0]==null){
              game.activeEnemies.splice(0,1);
              continue;
          }
          game.activeEnemies[0].enemyComponent.done(game.activeEnemies[0]);
      }
      gameEnemies.requestUpdate(gameEnemies.createEnemiesComponent.id);
      if(game.warpBarTimerNode)
          game.warpBarTimerNode.warpBarTimerComponent.done(
              game.warpBarTimerNode);
      if(game.slowTimeBarTimerNode)
          game.slowTimeBarTimerNode.slowTimeBarTimerComponent.done(
              game.slowTimeBarTimerNode);
      if(game.magneticBarTimerNode)
          game.magneticBarTimerNode.magneticBarTimerComponent.done(
              game.magneticBarTimerNode);
      gameEnemies.removeComponent(gameEnemies.collisionComponent);
      gameEnemies.createEnemiesComponent.active = false;
      game.over = true;
      game.games++;
      game.enemyIT = 0;
      delete game.previousPosition;
      delete game.gameenemies;
      game.gameOverNode.setPosition(-200,-50);
      game.startButtonNode.setPosition(-62,-150);
      game.startButtonNode.DOMElement.setContent('Restart');
      game.scoreNode.setAlign(0.5,0.3);
      game.scoreNode.DOMElement.setProperty('opacity','1.0');
      game.started = false;
      game.boxNode.setAlign(0.5,0.7)
          .setPosition(-20,-20,1000);
      game.howToButtonNode.setPosition(-85,-70);
      game.leaderboardButtonNode.setPosition(-85,-20);
      game.soundButtonNode.setPosition(20,-170);
      game.creditsButtonNode.setPosition(-60,-170);
      game.idle = true;
      game.boxSet = false;
      document.body.style.cursor = "auto";
      if(game.storage == true
      && window.localStorage.high_score
      && window.localStorage.high_score < game.score){
          window.localStorage.high_score = game.score;
          game.highScoreNode.DOMElement.setContent(window.localStorage.high_score);
          gleng = window.localStorage.high_score.length;
          game.highScoreNode.setSizeMode('absolute','absolute')
              .setAbsoluteSize(50*gleng,30)
              .setPosition(-25*gleng, 0);
          if (typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'
          && window.social && window.social.isLoggedIn()) {
              socialScore = window.localStorage.high_score;
              if((window.localUserScore && window.localUserScore < window.localStorage.high_score)
              || !window.localUserScore){
                  window.social.submitScore(socialScore, function(error){
                      if (error) console.error("submitScore error: " + error.message);
                  },{
                      leaderboardID: "com.karaman.crossfire.highScore"
                  });
              }
          }
      }
      if (typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'){
          if(Cocoon.Ad.AdMob && game.interstitial){
              game.interstitial.show();
          }
      }
      return;
  }
  function loadAndShowBannerAd(){
      banner = Cocoon.Ad.AdMob.createBanner();
      banner.setLayout(Cocoon.Ad.BannerLayout.BOTTOM_CENTER);
      banner.load();
      banner.show();
  }
  function loadInterstitialAd(){
      interstitial = Cocoon.Ad.AdMob.createInterstitial();
      game.interstitial = interstitial;
      interstitial.on("show", function(){
          sound.volume(0);
      });
      interstitial.on("dismiss", function(){
          sound.volume(1);
      });
      interstitial.load();
  }
  function howToPlay(){
      game.soundButtonNode.setPosition(-1000,-1000);
      game.creditsButtonNode.setPosition(-1000,-1000);
      game.boxNode.box.setPosition(-1000, -1000, 10000);
      game.startButtonNode.setPosition(-1000,-1000);
      game.howToButtonNode.setPosition(-1000,-1000);
      game.gameTitle.setPosition(-10000,-10000);
      game.leaderboardButtonNode.setPosition(-1000,-2000);
      if(game.over){
          game.scoreNode.setPosition(-10000,-10000);
          game.gameOverNode.setPosition(-10000,-10000);
      }
      if(!game.shadow){
          shadowH = gameUI.addChild();
          game.shadow = shadowH;
      	game.shadow.setSizeMode('relative','relative')
              .setProportionalSize(1,1)
              .setAlign(0,0)
              .setPosition(0,0);
          game.shadow.DOMElement = new DOMElement(shadowH);
          game.shadow.DOMElement.setProperty('background-color', 'black')
              .setProperty('opacity','0.5');
      }else if(game.shadow){
          game.shadow.setPosition(0,0);
      }
      if(!game.rulesView){
          rulesView = gameUI.addChild();
          game.rulesView = rulesView;
          rulesView.name = "rulesView";
          rulesView.setSizeMode('relative','relative')
              .setProportionalSize(0.9,0.8)
              .setAlign(0,0)
              .setPosition(20,35);
          rulesView.DOMElement = new DOMElement(rulesView, {id:'rulesView'});
          rulesView.DOMElement.setProperty('color','white')
              .setProperty('font-size','22px')
              .setContent("Collect the Stars and avoid the Asteroids!<br>"
                  + "Don't lift your finger off the screen<wbr> except if you get the Warp powerup!!<br>"
                  + "The key to a high score<wbr> "
      			+ "is to collect powerups and use them to your<wbr> advantage!<br><br>"
                  + "Yellow<div id='yellow'></div> - gives you some points!<br>"
      			+ "Blue<div id='blue'></div> - makes you invincible for 3 seconds!<br>"
      			+ "Green<div id='green'></div> - reduces how often objects are spawned!<br>"
      			+ "Orange<div id='orange'></div> - reduces how fast objects<wbr> are launched!<br>"
      			+ "Pink<div id='pink'></div> - gives you a thousand points instantly!<br>"
      			+ "Red<div id='gainsboro'></div> - gives you an exra life (up to 2)!<br>"
      			+ "Purple<div id='purple'></div> - makes you master of warp holes for 5 seconds!<br>"
                  + "Grey<div id='grey'></div> - slows down time by 1/2 for 3 seconds!<br>"
      			+ "Black<div id='black'></div> - makes all stars attracted to you for 5 seconds!")
              .setProperty('zIndex','98');
      }else if (game.rulesView) {
          game.rulesView.setPosition(20,35);
          game.rulesView.DOMElement.setId('rulesView');
      }
      if(!game.howToX){
          howToX = gameUI.addChild();
          howToX.name = "howToX";
          game.howToX = howToX;
          howToX.setSizeMode('absolute','absolute')
              .setAbsoluteSize('40','40')
              .setAlign(0.9,0)
              .setPosition(-10,40);
          howToX.DOMElement = new DOMElement(howToX);
          howToX.DOMElement.setContent("X")
              .setProperty('zIndex','98')
              .setProperty('color','white')
              .setProperty('font-size','24px');
          howToXComponent = {
              id: null,
              node: null,
              onMount: function (node) {
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onReceive: function (event, payload){
                  if(event == 'howToXButton')
                      this.node.requestUpdate(this.id);
              },
              onUpdate: function() {
                  removeHowTo();
              }
          }
          howToX.addComponent(howToXComponent);
      }else if(game.howToX){
          game.howToX.setPosition(-10,40)
      }
  }
  function removeHowTo(){
      game.howToX.setPosition(-1000,-1000);
      game.shadow.setPosition(-1000,-1000);
      game.rulesView.DOMElement.setId(" ");
      game.rulesView.setPosition(-10000,-10000);
      game.howToButtonNode.setPosition(-85, -70);
      game.leaderboardButtonNode.setPosition(-85,-20);
      if(!game.over){
          game.startButtonNode.setPosition(-102,-130);
          game.gameTitle.setPosition(-150,0);
          game.boxNode.box.setPosition(
              -40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
      }else if (game.over){
          game.startButtonNode.setPosition(-62,-150);
          game.scoreNode.setPosition(-gameSize[0]/2,-50);
          game.gameOverNode.setPosition(-200,-50);
      }
      game.creditsButtonNode.setPosition(-60,-170);
      game.soundButtonNode.setPosition(20,-170);
  }
  function showCredits(){
      game.soundButtonNode.setPosition(-1000,-1000);
      game.creditsButtonNode.setPosition(-1000,-1000);
      game.gameTitle.setPosition(-2000,-2000);
      game.boxNode.box.setPosition(-1000, -1000, 10000);
      game.startButtonNode.setPosition(-1000,-1000);
      game.howToButtonNode.setPosition(-1000,-1000);
      game.leaderboardButtonNode.setPosition(-2000,-2000);
      if(game.over){
          game.gameOverNode.setPosition(-2000,-2000);
          game.scoreNode.setPosition(-1000,-1000);
      }
      if(!game.shadow){
          shadowC = gameUI.addChild();
          game.shadow = shadowC;
      	game.shadow.setSizeMode('relative','relative')
              .setProportionalSize(1,1)
              .setAlign(0,0)
              .setPosition(0,0);
          game.shadow.DOMElement = new DOMElement(shadowC);
          game.shadow.DOMElement.setProperty('background-color', 'black')
              .setProperty('opacity','0.5');
      }else if (game.shadow){
          game.shadow.setPosition(0,0);
      }
      if(!game.creditsView){
          creditsView = gameUI.addChild();
          game.creditsView = creditsView;
          creditsView.name = "creditsView";
          creditsView.setSizeMode('relative','relative')
              .setProportionalSize(0.9,0.9)
              .setAlign(0,0)
              .setPosition(20,65);
          creditsView.DOMElement = new DOMElement(creditsView);
          creditsView.DOMElement.setProperty('color','white')
              .setProperty('font-size','22px')
              .setContent("Stars & Asteroids was designed, created, and developed by Sem Karaman<br>"
                  +"Music by Ryan Mixey<br>"
                  +"Sound Effects courtesy of www.freesfx.co.uk<br>"
                  +"Comments, feedback, bugs? email me at help@semkaraman.com<br>"
                  +"Made with HTML5, Famous.org, & Cocoon.io")
                  /*special thanks go my beautiful wife Maggie Karaman © bewwy co*/
              .setProperty('zIndex','98');
      }else if(game.creditsView){
          game.creditsView.setPosition(20,65)
      }
      if(!game.creditsX){
          creditsX = gameUI.addChild();
          creditsX.name = "creditsX";
          game.creditsX = creditsX;
          creditsX.setSizeMode('absolute','absolute')
              .setAbsoluteSize('40','40')
              .setAlign(0.9,0)
              .setPosition(-10,40);
          creditsX.DOMElement = new DOMElement(creditsX);
          creditsX.DOMElement.setContent("X")
              .setProperty('zIndex','98')
              .setProperty('color','white')
              .setProperty('font-size','24px');
          creditsXComponent = {
              id: null,
              node: null,
              onMount: function (node) {
                  this.id = node.addComponent(this);
                  this.node = node;
              },
              onReceive: function (event, payload){
                  if(event == 'creditsX')
                      this.node.requestUpdate(this.id);
              },
              onUpdate: function() {
                  hideCredits();
              }
          }
          creditsX.addComponent(creditsXComponent);
      }else if (game.creditsX){
          game.creditsX.setPosition(-10,40)
      }
  }
  function hideCredits(){
      game.shadow.setPosition(-10000,-10000);
      game.creditsView.setPosition(-1000,-1000);
      game.creditsX.setPosition(-1000,-1000);
  	game.startButtonNode.setPosition(-102,-130);
      if(!game.over){
          game.boxNode.box.setPosition(
              -40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
          game.gameTitle.setPosition(-150,0);
      }
      if(game.over){
          game.gameOverNode.setPosition(-200,-50);
          game.scoreNode.setPosition(-gameSize[0]/2,-50);
          game.startButtonNode.setPosition(-62,-150);
      }
      game.creditsButtonNode.setPosition(-60,-170);
      game.soundButtonNode.setPosition(20,-170);
  	game.howToButtonNode.setPosition(-85, -70);
      game.leaderboardButtonNode.setPosition(-85,-20);
  }
  function resetBody(body){
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
  function collisionDetection(){
      collisionComponent = {
          id:null,
          node:null,
          onMount: function(node){
              this.id = node.addComponent(this);
              this.node = node;
              return;
          },
          onUpdate: function(time) {
              world.update(time);
              if(!game.over){
                  updateScore(1);
              }
              this.node.requestUpdate(this.id);
              game.ongoing = true;
              return;
          }
      };
      game.gameEnemies.collisionComponent = collisionComponent;
      game.gameEnemies.addComponent(collisionComponent);
      game.gameEnemies.requestUpdate(collisionComponent.id);
      return;
  }

}

document.addEventListener("deviceready", function(){
    startMe();
}, false);


var dateNow, requestAnimation, start, stop, timeoutFunc;
window.rtimeOut=function(callback,delay){
    dateNow=Date.now;
    requestAnimation=window.requestAnimationFrame;
    start=dateNow();
    timeoutFunc=function(){
        dateNow()-start<delay?stop||requestAnimation(timeoutFunc):callback()
    };
    requestAnimation(timeoutFunc);
    return{
        clear:function(){stop=1}
    }
}
