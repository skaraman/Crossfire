var DOMElement = require('famous/dom-renderables/DOMElement');
var Node = require('famous/core/Node');
var Position = require('famous/components/Position');
//var game = document.scene.getChildren()[0];

function UI(node){
  this.node = node // ? node : game.addChild();
  this.node.name = "node";

  if(window.localStorage.high_score){
    var leng = window.localStorage.high_score.length;
  }else {
    var leng = 0;
  }
  var gameSize = this.node.getSize();

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
        'color' : 'white'
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
      align: { x:0.5, y:0.5},
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
      w: this.gameSize[0], h: 100,
      sizeMode: 'absolute',
      align: { x: 0.5, y: 0.5},
      position: { x: -this.gameSize[0]/2, y: -50},
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
UI.prototype.removeElements = function() {
  game.removeChild(this.node)
  this.node = game.addChild();
}
UI.prototype.startGameView = function(){
  this.removeElements();
  this.createStartButtonNode();
  this.createHowToButtonNode();
  this.createLeaderboardButtonNode();
  this.createCreditsButtonNode();
  this.createSoundButtonNode();
  this.createHighScoreNode();
}
UI.prototype.howToView = function(){
  this.removeElements();
  this.createHowToViewNode();
}
UI.prototype.creditsView = function(){
  //ditto
  this.removeElements();
  this.createCreditsButtonNode();
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
  game.started = false;
  game.over = true;
  game.idle = true;
  game.boxSet = false;
  game.games++;
  delete game.previousPosition;
  delete game.gameenemies;
  this.scoreNode.setAlign(0.5,0.3);
  this.scoreNode.DOMElement.setProperty('opacity','1.0');
  document.body.style.cursor = "auto";
  game.emit('updateHighScore')
  game.emit('interstitial')
  game.emit('resetAstro')
}
UI.prototype.createElement = function(element){
  element = element ? element : null;
  if(element == null) throw new Error('must have element type!');
  var component = this.UI_COMPONENTS[element+"Node"];
  var node = this.node.addChild();
  this[element+"Node"] = node;
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
    for(var i =0;i<component.property.length;i++){
      node.DOMElement.setProperty(component.property[i].id,component.property[i].value)
    }
  }
  if(component.content)
    node.DOMElement.setContent(component.content)
  return node;
}
UI.prototype.createComponent = function(element){
  var component = {
    id: null,
    node: null,
    onMount: function (node) {
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function (event, payload){
      if(event == element){
        this.node.payload = payload;
        this.node.requestUpdate(this.id);
      }
    },
    onUpdate: function() {
      this.node.renew();
    }
  }
  return component;
}
UI.prototype.createStartButtonNode = function(){
  var _this = this;
  this.startButtonNode = this.createElement('startButton');
  this.startButtonNode.renew = function(){
    game.started = true;
    _this.emit('startGame',{});
  }
  var startButtonComponent = this.createComponent('startButton');
  this.startButtonNode.addComponent(startButtonComponent);
}
UI.prototype.createRestartButtonNode = function() {
  this.restartButtonNode = this.createElement('restartButton');
  this.restartButtonNode.renew = function(){
    game.started = true;
    _this.emit('startGame',{});
  }
  var restartButtonComponent = this.createComponent('restartButton');
  this.restartButtonNode.addComponent(restartButtonComponent);
}
UI.prototype.createHowToButtonNode = function() {
  this.howToButtonNode = this.createElement('howToButton');
  this.howToButtonNode.renew = function(){
    this.howToView();
  }
  var howToComponent = this.createComponent('howToButton');
  this.howToButtonNode.addComponent(howToComponent);
}
UI.prototype.createLeaderboardButtonNode = function() {
  this.leaderboardButtonNode = this.createElement('leaderboardButton');
  this.leaderboardButtonNode.renew = function() {
    if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'){
      if(window.social && window.social.isLoggedIn()){
        window.social.showLeaderboard();
      }
    }
  }
  var leaderboardComponent = this.createComponent('leaderboardButton')
  this.leaderboardButtonNode.addComponent(leaderboardComponent);
}
UI.prototype.createSoundButtonNode = function(){
  if(game.soundSwitch == true)
      this.UI_COMPONENTS['soundButtonNode'].property["background-image"] = 'url(./images/music.png)';
  else if (game.soundSwitch == false)
      this.UI_COMPONENTS['soundButtonNode'].property["background-image"] = 'url(./images/music_off.png)'
  this.soundButtonNode = this.createElement('soundButton')
  this.soundButtonNode.renew = function() {
    if(game.soundSwitch){
      game.soundSwitch = false;
      game.sound.pause();
      this.node.DOMElement.setProperty(
        'background-image','url(./images/music_off.png)');
      if(game.storage)
        window.localStorage.sound = false;
    }else{
      game.soundSwitch = true;
      game.sound.play();
      this.node.DOMElement.setProperty(
        'background-image','url(./images/music.png)');
      if(game.storage)
        window.localStorage.sound = true;
    }
  }
  var soundButtonNodeComponent = this.createComponent('soundButton');
  this.soundButtonNode.addComponent(soundButtonNodeComponent);
}
UI.prototype.createCreditsButtonNode = function(){
  this.creditsButtonNode = this.createElement('creditsButton');
  this.creditsButtonNode.renew = function() {
    showCredits();
  }
  var creditsButtonNodeComponent = this.createComponent('creditsButton')
  this.creditsButtonNode.addComponent(creditsButtonNodeComponent);
}
UI.prototype.createHighScoreNode = function() {
  if(!game.storage && !window.localStorage.high_score)
    return null;
  this.highScoreNode = this.createElement('highScore');
  this.highScoreNode.renew = function() {
    this.highScoreNode.DOMElement.setContent(window.localStorage.high_score);
    var gleng = window.localStorage.high_score.length;
    game.highScoreNode.setSizeMode('absolute','absolute')
      .setAbsoluteSize(50*gleng,30)
      .setPosition(-25*gleng, 0);
  }
  var highScoreComponent = this.createComponent('highScore');
  this.highScoreNode.addComponent(highScoreComponent);
}
UI.prototype.createGameTitleNode = function() {
  this.gameTitleNode = this.createElement('gameTitle');
}
UI.prototype.createGameOverNode = function() {
  this.gameOverNode = this.createElement('gameOver');
}
UI.prototype.createHowToViewNode = function(){
  var _this = this;
  this.shadowNode = this.createElement('shadow');
  this.howToViewNode = this.createElement('howToView');
  this.howToViewXNode = this.createElement('howToViewX')
  howToViewXNode.renew = function() {
    _this.startGameView();
  }
  var howToViewXComponent = this.createComponent('howToViewX');
  howToViewXNode.addComponent(howToViewXComponent);
}
UI.prototype.createCreditsViewNode = function(){
  var _this = this;
  this.shadowNode = this.createElement('shadow');
  this.creditsViewNode = this.createElement('creditsView')
  this.creditsXNode = this.createElement('creditsX')
  creditsXNode.renew = function() {
    _this.startGameView();
  }
  var creditsXComponent = this.createComponent('creditsX');
  creditsXNode.addComponent(creditsXComponent);
}
UI.prototype.createScoreNode = function() {
  this.scoreNode = this.createElement('score');
  this.scoreNode.rewnew = function update() {
    game.score += score;
    game.scoreNode.DOMElement.setContent(game.score);
  }
  var scoreComponent = this.createComponent('score');
}
UI.prototype.createLivesNode = function(){
  this.gameLivesNode = thise.createElement('lives')
  this.gameLivesNode.rewnew = function() {
    this.manageLives(this,this.life);
  }
  var gameLivesComponent = this.createComponent('lives')
  this.gameLivesNode.addComponent(gameLivesComponent);
}

module.exports = UI;
