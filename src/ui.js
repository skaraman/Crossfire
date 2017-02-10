var DOMElement = require('famous/dom-renderables/DOMElement');
var Node = require('famous/core/Node');
var Position = require('famous/components/Position');
//var game = document.scene.getChildren()[0];

function UI(Game){
  this.node = Game.node.addChild();
  this.node.name = 'UINode'
  this.game = Game;
  this.addHolder();
  if(window.localStorage.high_score){
    var leng = window.localStorage.high_score.length;
  }else {
    var leng = 0;
  }
  this.UI_COMPONENTS = {
    'backgroundNode': {
      w: 1,h: 1,
      sizeMode: 'relative',
      align: { x: 0, y: 0},
      property: {
        'background-image': 'url(./images/space_new.png)',
        'z-index': '1',
        'background-size': '100% 100%'
      }
    },
    'startButtonNode': {
      w: 240, h: 60,
      sizeMode: 'absolute',
      align:{ x: 0.5, y: 0.8},
      position: { x: -102, y: -130},
      content: "Start Game",
      property: {
        'font-size' : '40px',
        'z-index' : '2',
        'color' : 'white',
        'background': 'none'
      }
    },
    'howToButtonNode': {
      w: 190, h: 60,
      sizeMode: 'absolute',
      align: { x:0.5, y:0.8},
      position: { x:-85, y:-70},
      content: "How to Play",
      property: {
        'font-size' : '30px',
        'z-index' : '2',
        'color' : 'white'
      }
    },
    'howToVeiwNode': {
      attribute: {
        'id':'howToView'
      },
      w: 0.9, h: 0.8,
      sizeMode: 'relative',
      align: { x: 0, y: 0},
      position: { x: 20, y: 35},
      content: "Collect the Stars and avoid the Asteroids!<br>"
        + "Don't lift your finger off the screen!"
        + "The key to a high score<wbr> "
        + "is to collect powerups and use them to your<wbr> advantage!<br><br>"
        + "Yellow<div id='yellow'></div> - gives you some points!<br>"
        + "Blue<div id='blue'></div> - makes you invincible for 6 seconds!<br>"
        + "Green<div id='green'></div> - reduces how often objects are spawned!<br>"
        + "Orange<div id='orange'></div> - reduces how fast objects<wbr> are launched!<br>"
        + "Pink<div id='pink'></div> - gives you a thousand points instantly!<br>"
        + "Red<div id='gainsboro'></div> - gives you an exra life (max 2 lives)!<br>"
        + "Purple<div id='purple'></div> - makes you master of warp holes for 10 seconds!<br>"
        + "Grey<div id='grey'></div> - slows down time by 1/2 for 6 seconds!<br>"
        + "Black<div id='black'></div> - makes all stars attracted to you for 10 seconds!",
      property:{
        'color': 'white',
        'font-size': '22px',
        'z-index': '98'
      }
    },
    'howToViewXNode': {
      w: '40', h: '40',
      sizeMode: 'absolute',
      align: { x: 0.9, y: 0},
      position: { x: -10, y: 40 },
      content: "X",
      property: {
        'z-index': '98',
        'color': 'white',
        'font-size': '24px'
      }
    },
    'leaderboardButtonNode': {
      w: 140,h: 60,
      sizeMode: 'absolute',
      align: { x:0.5, y:0.8},
      position: { x:-85, y:-20},
      content: "Leaderboard",
      property: {
        'font-size' : '30px',
        'z-index' : '2',
        'color' : 'white'
      }
    },
    'soundButtonNode': {
      attribute: {
        'class': 'famous-dom-element needsclick'
      },
      w: 40, h: 40,
      sizeMode: 'absolute',
      align:{ x:0, y:1},
      position: { x: 20, y:-170 },
      property: {
        'background-image': 'url(./images/music.png)',
        'z-index': '20'
      }
    },
    'creditsButtonNode': {
      w: 40,h: 40,
      sizeMode: 'absolute',
      align:{ x:1, y:1},
      position:{ x:-60, y:-170},
      property: {
        'background-image': 'url(./images/credits.png)',
        'z-index': '20'
      }
    },
    'creditsViewNode': {
      w: 0.9, h: 0.9,
      sizeMode: 'relative',
      align: { x: 0, y: 0},
      position: { x: 20, y: 65},
      content: "Stars & Asteroids was designed, created, and developed by Sem Karaman<br>"
        +"Music by Ryan Mixey<br>"
        +"Sound Effects courtesy of www.freesfx.co.uk<br>"
        +"Comments, feedback, bugs? email me at help@semkaraman.com<br>"
        /*special thanks go my beautiful wife Maggie Karaman © bewwy co*/,
      property: {
        'color':'white',
        'font-size':'22px',
        'z-index':'98'
      }
    },
    'creditsXNode': {
      w: '40', h: '40',
      sizeMode: 'absolute',
      align: { x: 0.9, y: 0},
      position: { x: -10, y: 40},
      content: "X",
      property:{
        'z-index': '98',
        'color': 'white',
        'font-size': '24px'
      }
    },
    'highScoreNode': {
      w: 50*this.leng,h: 30,
      sizeMode: 'absolute',
      align: { x: 1, y: 0},
      position: { x: -25*this.leng, y: 0},
      content: window.localStorage.high_score,
      property: {
        'font-size': '40px',
        'z-index': '2',
        'color': 'white',
        'opacity': '0.5'
      }
    },
    'gameTitleNode': {
      w: 341, h: 45,
      sizeMode: 'absolute',
      align: { x: 0.5, y: 0.2},
      position: { x: -150, y: 0},
      content: "Stars & Asteroids",
      property: {
        'z-index':'1',
        'font-size':'40px',
        'color':'white'
      }
    },
    'scoreNode': {
      w: null, h: 100,
      sizeMode: 'absolute',
      align: { x: 0.5, y: 0.5},
      position: { x: null, y: -50},
      content: "0",
      property: {
        'font-size':'60px',
        'opacity':'0.5',
        'text-align':'center',
        'color':'white',
        'z-index':'2'
      }
    },
    'gameOverNode': {
      w: 400, h: 100,
      sizeMode: 'absolute',
      align: { x: 0.5, y: 0.5},
      position: { x: -200, y: -50},
      content: "Game Over",
      property: {
        'font-size':'55px',
        'text-align':'center',
        'background':'none',
        'color':'white'
      }
    },
    'shadowNode': {
      w: 1, h: 1,
      sizeMode: 'relative',
      align: { x: 0, y: 0},
      position: { x: 0, y: 0},
      content: '',
      property:{
        'background-color': 'black',
        'opacity': '0.5'
      }
    },
    'restartButtonNode': {
      w: 240, h: 60,
      sizeMode: 'absolute',
      align:{ x: 0.5, y: 0.8},
      position: { x: -62, y: -150},
      content: "Restart",
      property: {
        'font-size' : '40px',
        'z-index' : '2',
        'color' : 'white'
      }
    }
  }
}
UI.prototype.addHolder = function(){
  this.UIHolder = this.node.addChild();
  this.UIHolder.name = 'UIHolder';
  this.UIHolder.onDismount = function (path) {
    var children = this.getChildren();
    children.map(function(child){
      child.DOMElement.remove();
    });
  }
}
UI.prototype.removeElements = function() {
  var oldHolder = this.UIHolder;
  this.addHolder();
  oldHolder.dismount();
}
UI.prototype.startGameView = function(){
  this.removeElements();
  var _this = this;
  this.node._updater.getClock().setTimeout(function(){
    _this.createStartButtonNode();
    _this.createHowToButtonNode();
    _this.createLeaderboardButtonNode();
    _this.createCreditsButtonNode();
    _this.createSoundButtonNode();
    _this.createHighScoreNode();
    _this.createGameTitleNode();
  }, 100);
}
UI.prototype.howToView = function(){
  this.removeElements();
  var _this = this;
  this.node._updater.getClock().setTimeout(function(){
    _this.createHowToViewNode();
  }, 1);
}
UI.prototype.creditsView = function(){
  this.removeElements();
  var _this = this;
  this.node._updater.getClock().setTimeout(function(){
    _this.createCreditsViewNode();
  }, 1);
}
UI.prototype.gameOverView = function() {
  this.removeElements();
  this.createHighScoreNode();
  this.createGameOverNode();
  this.createRestartButtonNode();
  this.createLeaderboardButtonNode();
  this.createHowToButtonNode();
  this.createSoundButtonNode();
  this.createCreditsButtonNode();
  this.game.started = false;
  this.game.over = true;
  this.game.idle = true;
  this.game.boxSet = false;
  this.game.games++;
  delete this.game.previousPosition;
  delete this.game.gameenemies;
  this.scoreNode.setAlign(0.5,0.3);
  this.scoreNode.DOMElement.setProperty('opacity','1.0');
  document.body.style.cursor = "auto";
  this.game.emit('updateHighScore');
  this.game.emit('interstitial');
  this.game.emit('resetAstro');
}
UI.prototype.createElement = function(element){
  element = element ? element : null;
  if(element == null) throw new Error('must have element type!');
  var component = this.UI_COMPONENTS[element+"Node"];
  var node = this.UIHolder.addChild();
  this.UIHolder[element+"Node"] = node;
  node.name = element+"Node";
  node.setSizeMode(component.sizeMode,component.sizeMode)
  if(component.sizeMode == 'absolute')
    node.setAbsoluteSize(component.w,component.h)
  if(component.sizeMode == 'relative')
    node.setProportionalSize(component.w,component.h)
  if(component.align)
    node.setAlign(component.align.x,component.align.y)
  if(component.position)
    node.setPosition(component.position.x,component.position.y)
  if(component.attribute){
    var attribute = {}
    attribute[component.attribute[0]] = component.attribute[1];
    node.DOMElement = new DOMElement(node,attribute);
  }else{
    node.DOMElement = new DOMElement(node);
  }
  if(component.property){
    for(let prop in component.property){
      node.DOMElement.setProperty(prop, component.property[prop])
    }
  }
  if(component.content)
    node.DOMElement.setContent(component.content)
  return node;
}
UI.prototype.createComponent = function(element){
  var component = {
    id: null, node: null, game: null,
    onMount: function (node) {
      this.id = node.addComponent(this);
      this.node = node;
      this.game = node._updater.Game;
    },
    onReceive: function (event, payload){
      if(event == element+"Node"){
        this.node.payload = payload;
        this.node.requestUpdate(this.id);
      }
    },
    onUpdate: function() {
      this.node.renew(this.game);
    }
  }
  return component;
}
UI.prototype.createStartButtonNode = function(){
  var startButtonNode = this.createElement('startButton');
  startButtonNode.renew = function(game){
    game.started = true;
    game.node.emit('startGame',{});
  }
  var startButtonComponent = this.createComponent('startButton');
  startButtonNode.addComponent(startButtonComponent);
}
UI.prototype.createRestartButtonNode = function() {
  var restartButtonNode = this.createElement('restartButton');
  restartButtonNode.renew = function(game){
    game.started = true;
    game.node.emit('startGame',{});
  }
  var restartButtonComponent = this.createComponent('restartButton');
  restartButtonNode.addComponent(restartButtonComponent);
}
UI.prototype.createHowToButtonNode = function() {
  var howToButtonNode = this.createElement('howToButton');
  howToButtonNode.renew = function(game){
    game.UI.howToView();
  }
  var howToComponent = this.createComponent('howToButton');
  howToButtonNode.addComponent(howToComponent);
}
UI.prototype.createLeaderboardButtonNode = function() {
  var leaderboardButtonNode = this.createElement('leaderboardButton');
  leaderboardButtonNode.renew = function(game) {
    if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'){
      if(window.social && window.social.isLoggedIn()){
        window.social.showLeaderboard();
      }
    }
  }
  var leaderboardComponent = this.createComponent('leaderboardButton')
  leaderboardButtonNode.addComponent(leaderboardComponent);
}
UI.prototype.createSoundButtonNode = function(){
  if(this.game.soundSwitch == true)
      this.UI_COMPONENTS['soundButtonNode'].property["background-image"] = 'url(./images/music.png)';
  else if (this.game.soundSwitch == false)
      this.UI_COMPONENTS['soundButtonNode'].property["background-image"] = 'url(./images/music_off.png)'
  var soundButtonNode = this.createElement('soundButton')
  soundButtonNode.renew = function(game) {
    if(game.soundSwitch){
      game.soundSwitch = false;
      game.sound.pause();
      this.DOMElement.setProperty(
        'background-image','url(./images/music_off.png)');
      if(game.storage)
        window.localStorage.sound = false;
    }else{
      game.soundSwitch = true;
      game.sound.play();
      this.DOMElement.setProperty(
        'background-image','url(./images/music.png)');
      if(game.storage)
        window.localStorage.sound = true;
    }
  }
  var soundButtonNodeComponent = this.createComponent('soundButton');
  soundButtonNode.addComponent(soundButtonNodeComponent);
}
UI.prototype.createCreditsButtonNode = function(){
  var creditsButtonNode = this.createElement('creditsButton');
  creditsButtonNode.renew = function(game) {
    game.UI.creditsView();
  }
  var creditsButtonNodeComponent = this.createComponent('creditsButton')
  creditsButtonNode.addComponent(creditsButtonNodeComponent);
}
UI.prototype.createHighScoreNode = function() {
  if(!this.game.storage && !window.localStorage.high_score)
    return null;
  var highScoreNode = this.createElement('highScore');
  highScoreNode.renew = function(game) {
    this.highScoreNode.DOMElement.setContent(window.localStorage.high_score);
    var gleng = window.localStorage.high_score.length;
    this.highScoreNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(50*gleng,30)
      .setPosition(-25*gleng, 0);
  }
  var highScoreComponent = this.createComponent('highScore');
  highScoreNode.addComponent(highScoreComponent);
}
UI.prototype.createGameTitleNode = function() {
  var gameTitleNode = this.createElement('gameTitle');
}
UI.prototype.createGameOverNode = function() {
  var gameOverNode = this.createElement('gameOver');
}
UI.prototype.createHowToViewNode = function(){
  var shadowNode = this.createElement('shadow');
  var howToViewNode = this.createElement('howToView');
  var howToViewXNode = this.createElement('howToViewX')
  howToViewXNode.renew = function(game) {
    game.UI.startGameView();
  }
  var howToViewXComponent = this.createComponent('howToViewX');
  howToViewXNode.addComponent(howToViewXComponent);
}
UI.prototype.createCreditsViewNode = function(){
  var shadowNode = this.createElement('shadow');
  var creditsViewNode = this.createElement('creditsView')
  var creditsXNode = this.createElement('creditsX')
  creditsXNode.renew = function(game) {
    game.UI.startGameView();
  }
  var creditsXComponent = this.createComponent('creditsX');
  creditsXNode.addComponent(creditsXComponent);
}
UI.prototype.createScoreNode = function() {
    var gameSize = this.node.getSize();
    this.UI_COMPONENTS['scoreNode'].w = gameSize;
    this.UI_COMPONENTS['scoreNode'].position.x = gameSize;
  var scoreNode = this.createElement('score');
  scoreNode.rewnew = function update(game) {
    game.score += score;
    game.scoreNode.DOMElement.setContent(game.score);
  }
  var scoreComponent = this.createComponent('score');
  scoreNode.addComponent(scoreComponent);
}
UI.prototype.createLivesNode = function(){
  var gameLivesNode = thise.createElement('lives')
  gameLivesNode.rewnew = function(game) {
    this.manageLives(this,this.life);
  }
  var gameLivesComponent = this.createComponent('lives')
  gameLivesNode.addComponent(gameLivesComponent);
}

module.exports = UI;
