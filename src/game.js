var DOMElement = require('famous/dom-renderables/DOMElement');
var Node = require('famous/core/Node');
var Position = require('famous/components/Position');
var Physics = require('famous/physics');
var Box = require('famous/physics/bodies/Box');
var Vec3 = require('famous/math/Vec3');
var Mat33 = require('famous/math/Mat33');
var Quaternion = require('famous/math/Quaternion');
var Collision = require('famous/physics/constraints/Collision');
var fd = require ('./framedata.js');
var Howler = require('./howler.min.js');
var res = window.devicePixelRatio;
function Game(FamousEngine){
  this.scene = FamousEngine.Game;
  document.scene = this.scene;
  this.node = this.scene.addChild();
  var UI = require('./ui.js');
  var Storage = require('./storage.js');
  var Input = require('./input.js');
  var Enemy = require('./enemy.js');
  var options = {};
  var world = new Physics.PhysicsEngine(options);
  this.clock = FamousEngine.getClock();
  this.world = world;
  var gameSize = this.node.getSize();
  this.attractables = [];
  this.games = 0;
  this.ongoing = false;
  this.UI = new UI(this.node);
  var background = this.UI.createElement('background');
  var storage = new Storage();
  Input.init();
  this.node.onReceive = Input.dispatch;
  var OnlineFeatures = require('./onlineFeatures.js');
  this.UI.startGameView();
  var posit = 0;
  this.enemyIT = 0;
  this.boxSet = false;
  this.sound = new Howl({
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
  if(this.storage){
    if(window.localStorage.sound &&
      (window.localStorage.sound == "true"|| window.localStorage.sound == 'undefined')){
      this.soundSwitch = true;
      window.localStorage.sound = this.soundSwitch;
      this.sound.play(function(){
        this.sound.pos(posit);
      });
    }else if(window.localStorage.sound &&
      (window.localStorage.sound == "false")){
      this.soundSwitch = false;
    }else if(!window.localStorage.sound){
      window.localStorage.sound = true;
      this.soundSwitch = true;
      this.sound.play(function(){
          this.sound.pos(posit);
      });
    }
  }
  else{
    this.soundSwitch = true;
    this.sound.play(function(){
      this.sound.pos(posit);
    });
  }
  this.createBoxNode();
  this.enemies = new Enemy(FamousEngine);
  this.idleEnemies = [];
  for(var b=0;b<200;b++){
      this.enemies.addEnemy(b);
  }
}
Game.prototype.init = function() {
  this.over = false;
  this.speed_reducer = 5;
  this.teir_reducer = 1;
  this.lives = 1;
  this.score = 0;
  document.body.style.cursor = "none";
  this.resetBody(boxNode.box);
  this.activeEnemies = [];
  this.node.emit("createEnemies",{});
  this.node.emit('loop',{looping:true,interrupt:true});
}
Game.prototype.createBoxNode = function() {
  var boxNode = this.UI.node.addChild();
  this.boxNode = boxNode;
  boxNode.name = "boxNode";
  boxNode.framedata = fd.framedata.astro;
  this.idle = true;
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
  this.world.addBody(boxNode.box);
  var boxNodeComponentID = boxNode.addComponent({
    id:null,
    node:null,
    onMount: function(node) {
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function(event, payload) {
      if(event == 'resetAstro')
        this.node.setAlign(0.5,0.7).setPosition(-20,-20,1000);
    },
    onUpdate: function(time) {
      if(this.node.started == true && this.node.boxSet != true){
        this.node.setAlign(0,0)
        this.node.box.setPosition(gameSize[0]/2,gameSize[1]/2, 0);
        this.node.boxSet = true;
      }
      var boxPosition = boxNode.box.getPosition();
      boxNode.setPosition(boxPosition.x-10, boxPosition.y-20, 10000);
      boxNode.requestUpdate(this.id);
    }
  });
  fd.addAnimationComponent(boxNode);
  boxNode.requestUpdate(boxNodeComponentID);
}
Game.prototype.followAction = function(event){
  if(event.type == "touchmove"){
    newPosX = event.touches[0].clientX - (this.boxNode.size.w/2);
    newPosY = event.touches[0].clientY - (this.boxNode.size.h/2);
  }else {
    newPosX = event.clientX - (this.boxNode.size.w/2);
    newPosY = event.clientY - (this.boxNode.size.h/2);
  }
  if(this.warp || this.idle){
    if(!this.previousPosition){
      this.previousPosition = {
        x:newPosX,
        y:newPosY
      };
    }
    this.idle = false;
    this.boxNode.box.setPosition(newPosX,newPosY,0);
  }else if(!this.warp && this.previousPosition){
    xDiff = Math.abs(this.previousPosition.x - newPosX);
    yDiff = Math.abs(this.previousPosition.y - newPosY);
    if(xDiff > 79 || yDiff > 79){
      return;
    }else{
      this.boxNode.box.setPosition(newPosX,newPosY,0);
    }
    this.previousPosition.x = newPosX;
    this.previousPosition.y = newPosY;
  }
}
 Game.prototype.manageLives = function(gameLivesComponent, op) {
  this.lives += op;
  if(op == 1 && this.lives <= 3){
    newLifeNode = this.gameLivesNode.addChild();
    newLifeNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(40,38)
      .setAlign(0.5,0.5)
      .setPosition((-120)+(40*this.lives),0,1);
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
  if(this.lives > 3)this.lives = 3;
}
Game.prototype.loadAndShowBannerAd = function(){
  banner = Cocoon.Ad.AdMob.createBanner();
  banner.setLayout(Cocoon.Ad.BannerLayout.BOTTOM_CENTER);
  banner.load();
  banner.show();
}
Game.prototype.loadInterstitialAd = function(){
  interstitial = Cocoon.Ad.AdMob.createInterstitial();
  this.interstitial = interstitial;
  interstitial.on("show", function(){
    sound.volume(0);
  });
  interstitial.on("dismiss", function(){
    sound.volume(1);
  });
  interstitial.load();
}
Game.prototype.resetBody = function(body){
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
Game.prototype.collisionDetection = function(){
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
      if(!this.over){
        updateScore(1);
      }
      this.node.requestUpdate(this.id);
      this.ongoing = true;
      return;
    }
  };
  this.gameEnemies.collisionComponent = collisionComponent;
  this.gameEnemies.addComponent(collisionComponent);
  this.gameEnemies.requestUpdate(collisionComponent.id);
  return;
}
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
module.exports = Game;
