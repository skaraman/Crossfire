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
  if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'
  && Cocoon.Ad.AdMob){
      Cocoon.Ad.AdMob.configure({
          ios: {
              banner:"ca-app-pub-4693632452063283/2829774253",
              interstitial:"ca-app-pub-4693632452063283/4023645854"
          }
      });
      loadAndShowBannerAd();
      loadInterstitialAd();
  }

  createBoxNode();

  createStartButtonNode();
  createHowToButtonNode();
  createLeaderboardButtonNode();


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
      var scoreNode = gameUI.addChild();
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
