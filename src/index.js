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
  FamousEngine.loadingScene = FamousEngine.createScene();
  var loader = FamousEngine.loadingScene.addChild(new Loader());
  loader.createLoadingScreen(FamousEngine.loadingScene);
  loader.load(assets, loader.requestUpdate);
  FamousEngine.getClock().setTimeout(function(){
    var game = new Game(FamousEngine);
    //game.init();
  }, 100);
}, false);
