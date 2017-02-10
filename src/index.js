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
  FamousEngine.Scene.Loader = FamousEngine.Scene.addChild();
  FamousEngine.Scene.Loader = new Loader(FamousEngine.Scene.Loader);
  var loader = FamousEngine.Scene.Loader;
  var loaderComponent = {
    id:null, node:null,
    onMount: function (node) {
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function (event, payload) {
      if(event == 'initGame'){
        FamousEngine.getClock().setTimeout(function(){
          FamousEngine.Scene.Loader.UIHolder.dismount();
          FamousEngine.getClock().setTimeout(function(){
            FamousEngine.Game = new Game(FamousEngine);
          }, 0);
        }, 1000);
      }
    }
  }
  loader.node.addComponent(loaderComponent);
  loader.createLoadingScreen();
  loader.load(assets,
    loader.node.requestUpdate);
}, false);
