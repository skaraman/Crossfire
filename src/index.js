document.addEventListener("deviceready", function(){
  var FamousEngine = require('famous/core/FamousEngine');
  var Game = require('./game.js')
  var Loader = require('./loader.js')
  var assets = [
    "assets/Walkway.ttf",
    "images/astro_loop.png",
    "images/life.png",
    "images/space_new.png",
    "images/music.png",
    "images/music_off.png",
    "images/credits.png"
  ];
  FamousEngine.init();
  FamousEngine.Scene = FamousEngine.createScene();
  FamousEngine.Game = FamousEngine.Scene.addChild();
  var loader = new Loader(FamousEngine.Game);
  var sceneComponent = {
    id:null, node:null,
    onMount: function (node) {
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function (event, payload) {
      if(event == 'initGame'){
        FamousEngine.getClock().setTimeout(function(){
          var game = new Game(FamousEngine);
        }, 100);
      }
    }
  }
  FamousEngine.Game.addComponent(sceneComponent);
  FamousEngine.Game.LoadingScreen = loader;
  loader.createLoadingScreen(FamousEngine.Game);
  loader.load(assets, loader.requestUpdate);
}, false);
