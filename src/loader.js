var Dispatch = require('famous/core/Dispatch');
var UI = require('./ui.js');
var DOMElement = require('famous/dom-renderables/DOMElement');

function Loader(loader){
  this.node = loader;
  this.node.name = "loader";
  this.UIHolder = this.node.addChild();
  this.UIHolder.name = 'UIHolder';
  var loaderComponent = {
    id:null, node:null, scene:null,
    onMount: function (node, id) {
      this.id = node.addComponent(this);
      this.node = node;
      this.scene = node._updater.Scene;
    },
    onReceive: function (event) {
      if(event == 'removeLoading') this.scene.emit('initGame');
    }
  }
  this.UIHolder.onDismount = function (path) {
    var children = this.getChildren();
    children.map(function(child){
      child.DOMElement.remove();
    });
  }
  this.node.addComponent(loaderComponent);
  this.UI_COMPONENTS = {
    'loadingScreenNode': {
      sizeMode: 'relative',
      w:1, h:1,
      property: {
        background: 'black'
      }
    },
    'loadingTextNode': {
      sizeMode: 'absolute',
      w: 340, h:45,
      align: { x:0.5, y:0.2},
      position: { x: -150, y: 0},
      content: "Loading",
      property: {
        'z-index': 1,
        'font-size':'40px',
        'color':'white'
      }
    },
    'progressBarContainerNode':{
      sizeMode: 'absolute',
      w: 200, h:20,
      align: { x:0.5, y:0.5},
      position: { x:-100, y:0}
    },
    'progressBarNode': {
      sizeMode: 'relative',
      w: 0, h:1,
      align: { x:0, y:0},
      position: { x:0, y:0},
      property: {
        background: 'white'
      }
    }
  }
  this.background = this.node.addChild();
  this.background.name = 'backgroud';
  this.background.setSizeMode('relative')
    .setProportionalSize(1, 1)
    .setAlign(0, 0)
  this.background.DOMElement = new DOMElement(this.background);
  this.background.DOMElement.setProperty(
    'background-image','url(./images/space_new.png)')
  .setProperty('z-index', '1')
  .setProperty('background-size', '100% 100%')
}
Loader.prototype = Object.create(UI.prototype);
Loader.prototype.constructor = Loader;
Loader.prototype.createLoadingScreen = function() {
  this.createElement('loadingScreen');
  this.createElement('loadingText');
  this.createElement('progressBarContainer');
  this.createElement('progressBar');
  this.progressBarComponent = {
    id:null, node:null, loader:null, scene:null,
    onMount: function(node, id) {
      this.id = node.addComponent(this);
      this.node = node;
      this.loader = node._updater.Scene.Loader;
      this.scene = node._updater.Scene;
    },
    onReceive: function (event, payload) {
      if(event == 'progressLoad'){
        this.node.payload = payload;
        this.node.requestUpdate(this.id)
      }
    },
    onUpdate: function (time){
      var percent = this.node.payload.complete;
      this.node.setAbsoluteSize(percent, 1);
      if(percent >= 1 && !this.done) {
        this.done = true;
        this.scene.emit('removeLoading');
      }
    }
  }
  this.UIHolder.progressBarNode.addComponent(this.progressBarComponent)
  return this;
}
Loader.prototype.load = function(assets, callback){
  var len = assets.length, loaded = 0.0, _this = this;
  var promises = assets.map(function(asset){
    if(asset.match(/\.[png,gif,jpg]/)){
			let promise = new Promise(function(resolve, reject) {
	    	var image = new Image();
				image.src = asset;
				image.onload = resolve;
	  	});
      return promise;
		}else {
      return _get(asset).then(progress());
      function _get(url){
        return new Promise(function(resolve, reject) {
      		_this.get(url, resolve, reject);
    		});
      }
    }
  });
  for(let promise of promises){
    Promise.resolve(promise).then(progress())
  }
  function progress(){
    loaded++;
    _this.node.emit('progressLoad', {complete:loaded/len})
  }
}
Loader.prototype.get = function(url, success, failure) {
  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.onload = function() {
    if (req.status == 200) {
      success(req.response);
    } else {
      failure(Error(req.statusText));
    }
  };
  req.onerror = function() {
    failure(Error("Network Error"));
  };
  req.send();
}
module.exports = Loader;
