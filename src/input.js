var Dispatch = require('famous/core/Dispatch');
var GestureHandler = require('famous/components/GestureHandler');
function Input(game) {
  this.game = game;
  this.listeners = [
    'touchmove',
    'touchstart',
    'keydown',
    'mousemove',
    'click'
  ];
}
Input.prototype.init = function init() {
  for(let listener of this.listeners){
    this.addEventListener(listener)
  }
}
Input.prototype.handleEvent = function handleEvent(event){
  var type = event.type;
  if(type == 'touchmove' || 'mousemove'){
    if(event.target.parentElement.id != 'rulesView'){
      // custom fix for touch scrolling
      event.preventDefault();
    }
    if(this.game.started){
      followAction(event);
    }
  }
  if(type == 'touchstart' || type == 'keydown' || type == 'click'){
    this.dispatch(event.type, event);
  }
}
Input.prototype.addEventListener = function addEventListener(type){
  if(!type)throw new Error('addEventListener must be called with a listener type (e.g. click)');
  document.addEventListener(type, function(event) {
    this.handleEvent(event);
  }.bind(this));
}
Input.prototype.dispatch = function dispatch(event, payload) {
  if(event == 'keydown'){
    if (payload.keyCode == 66) {
      this.game.emit('sequence',payload);
    }
    else if (payload.keyCode == 67){
      this.game.emit('reverseSequence',payload);
    }
    else if (payload.keyCode == 65){
      payload.interruptable = false;
      this.game.emit('sequence_timed',payload);
    }
  }
  else if(event == 'click' || event == 'touchstart'){
    if(payload.target.attributes.getNamedItem('data-fa-path')){
      var path = payload.target.attributes.getNamedItem(
        'data-fa-path').value;
    }
    else if (payload.target.parentNode.attributes.getNamedItem(
      'data-fa-path')){
      var path = payload.target.parentNode.attributes.getNamedItem(
        'data-fa-path').value;
    }
    if(path){
      var node = Dispatch.getNode(path);
      this.game.node.emit(node.name, payload)
    }
  }
}
module.exports = Input;
