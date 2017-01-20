  var game = document.scene.getChildren()[0];
  var DOMElement = require('famous/dom-renderables/DOMElement');
  var Node = require('famous/core/Node');
  var Position = require('famous/components/Position');

function UI(){
  this.UI_COMPONENTS = {
    'startButtonNode': {
      w:240,h:60,
      align:{x:0.5,y:0.8},
      position:{x:-102,y:-130},
      content="Start Game",
      property: [
        {id:'font-size',value:'40px'},
        {id:'z-index',value:'2'},
        {id:'color',value:'white'}
      ]
    },
    'howToButtonNode': {
      w:240,h:60,align:{x:,y:},position:{x:,y:}
    },
    'howToVeiwNode':{
    },
    'leaderboardButtonNode': {w:240,h:60,align:{x:,y:},position:{x:,y:}
    },
    'soundButtonNode': {w:240,h:60,align:{x:,y:},position:{x:,y:}
    },
    'creditsButtonNode': {w:240,h:60,align:{x:,y:},position:{x:,y:}
    },
    'highScoreNode': {w:240,h:60,align:{x:,y:},position:{x:,y:}
    },
    'scoreNode':{
    },
  };

  this.gameUI = game.addChild();
  this.gameUI.name = "gameUI";
}
UI.prototype.startGameView() = function startGameView(){

  //create all the UI elements for the start Game screen
}
UI.prototype._createElement = function createElement(element){
  element = element ? element : null;
  if(element == null) throw new Error('must have element type!');
  var component = this.UI_COMPONENTS[element];
  var node = this.gameUI.addChild();
  game[element+"Node"] = node;
  node.name = element+"Node";
  node.setSizeMode('absolute','absolute')
    .setAbsoluteSize(component.w,component.h)
    .setAlign(component.align.x,component.align.y)
    .setPosition(component.position.x,component.position.y);

  node.DOMElement = new DOMElement(node);
  for(var i =0;i<component.property.length;i++){
    node.DOMElement.setProperty(component.property[i].id,component.property[i].value)
  }
  if(component.content)
    node.DOMElement.setContent(component.content)

  return node;
}
UI.prototype._createComponent = function createComponent(element) {
  var component = {
      id: null,
      node: null,
      onMount: function (node) {
          this.id = node.addComponent(this);
          this.node = node;
      },
      onReceive: function (event, payload){
          if(event == element+'Node')
              this.node.requestUpdate(this.id);
      },
      onUpdate: function() {
        this.node.update();
      }
  }
  return component;
}
UI.prototype.createStartButtonNode = function createStartButtonNode() {
  var startButtonNode = this.createElement('startButton');
  startButtonNode.update = function update(){
    game.started = true;
    initGame();
  }
  var startButtonComponent = this.createComponent('startButton');
  startButtonNode.addComponent(startButtonComponent);
}
UI.prototype.createHowToButtonNode = function createHowToButtonNode() {
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
            if(event == 'howToButtonNode')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            howToPlay();
        }
    }
    howToButtonNode.addComponent(howToComponent);
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
            if(event == 'leaderboardButtonNode')
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
              if(event == 'howToXButtonNode')
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
    game.boxNode.box.setPosition(-40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
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
    game.boxNode.box.setPosition(-40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
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
