var Dispatch = require('famous/core/Dispatch');
var Node = require('famous/core/Node');
var DOMElement = require('famous/dom-renderables/DOMElement');

function Loader(){
  Node.call(this);
  var loaderComponent = {
    id:null,
    node:null,
    onMount: function (node, id) {
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function (event) {
      if(event == 'removeLoading'){
        this.node._updater.removeScene(this.node._parent);
        delete this.node._updater.loadingScene;
      }
    }
  }
  this.addComponent(loaderComponent)
}
Loader.prototype = new Node();
Loader.prototype.createLoadingScreen = function functionName(scene) {
  this.loadingScreenNode = this.addChild();
  this.loadingScreenNode.setSizeMode('relative','relative')
    .setProportionalSize(1,1);
  this.loadingScreenNode.DOMElement = new DOMElement(this.loadingScreenNode);
  this.loadingScreenNode.DOMElement.setProperty('background','black')
  var loadingTextNode = this.loadingScreenNode.addChild();
  loadingTextNode.setSizeMode('absolute','absolute')
    .setAbsoluteSize(341, 45)
    .setAlign(0.5, 0.2)
    .setPosition(-150, 0);
  loadingTextNode.DOMElement = new DOMElement(loadingTextNode);
  loadingTextNode.DOMElement.setContent("Loading")
    .setProperty('z-index','1')
    .setProperty('font-size','40px')
    .setProperty('color','white')
  var progressBarContainerNode = this.loadingScreenNode.addChild();
  progressBarContainerNode.setSizeMode('absolute','absolute')
    .setAbsoluteSize(200,20)
    .setAlign(0.5,0.5)
    .setPosition(-50,0);
  var progressBarNode = progressBarContainerNode.addChild();
  progressBarNode.setSizeMode('relative','relative')
    .setAbsoluteSize(0,1)
    .setAlign(0,0)
    .setPosition(-50,0);
  progressBarNode.DOMElement = new DOMElement(progressBarNode);
  progressBarNode.DOMElement.setProperty('background','white');
  this.progressBarComponent = {
    id:null,
    node:null,
    onMount: function(node, id){
      this.id = node.addComponent(this);
      this.node = node;
    },
    onReceive: function (event, payload) {
      if(event == 'progressLoad'){
        this.node.payload = payload;
        this.node.requestUpdate(this.id)
      }
    },
    onUpdate: function (time) {
      var percent = this.node.payload.complete;
      this.node.setAbsoluteSize(percent, 1);
      if(percent == 1 && this.node._updater.loadingScene)
        this.node._updater.loadingScene.emit('removeLoading');
    }
  }
  progressBarNode.addComponent(this.progressBarComponent)
  return this.loadingScreenNode;
}
Loader.prototype.load = function(assets, callback){
  var len = assets.length;
  var loaded = 0.0;
  var _this = this;
  var promises = assets.map(function(asset){
    if(asset.match(/\.[png,gif,jpg]/)){
			let promise = new Promise(function(resolve, reject) {
	    	var image = new Image();
				image.src = asset;
				image.onload = resolve;
	  	});
      return promise;
		}else {
      return _get(asset).then(function(result){
				loaded++;
			  _this.emit('progressLoad', {complete:loaded/len})
			});
      function _get(url){
        return new Promise(function(resolve, reject) {
      		_this.get(url, resolve, reject);
    		});
      }
    }
  });
  for(let promise of promises){
    Promise.resolve(promise).then(function(){
      loaded++;
      _this.emit('progressLoad', {complete:loaded/len})
    })
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
