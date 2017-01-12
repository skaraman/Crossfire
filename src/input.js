var game = document.scene.getChildren();
game = game[0];

function Input() {
  this.listeners = [];
}

Input.prototype.init = function init() {
  document.addEventListener('touchmove', function(event) {
    if(event.target.parentElement.id != 'rulesView'){// custom fix for touch scrolling
      event.preventDefault();
    }
    if(game.started && game.started == true){
      followAction(event);
    }
  }, false);
  document.addEventListener('touchstart', function(event) {
      game.onReceive(event.type, event);
  }, false);
  document.addEventListener('keydown', function(event) {
    game.onReceive(event.type, event);
  }.bind(this));
  document.addEventListener('mousemove', function(event) {
    if(game.started && game.started == true){
      followAction(event);
    }
  });
  document.addEventListener('click', function(event){
    game.onReceive(event.type, event)
  });
}

Input.prototype.addEventListener = function addEventListener(type, callback){
  if(!type)throw new Error('addEventListener must be called with a listener type (e.g. click)');

}

Input.prototype.dispatch = function dispatch(event, payload) {
    if(event == 'keydown'){
        if (payload.keyCode == 66) {
            game.emit('sequence',payload);
        }
        else if (payload.keyCode == 67){
            game.emit('reverseSequence',payload);
        }
        else if (payload.keyCode == 65){
            payload.interruptable = false;
            game.emit('sequence_timed',payload);
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
            var node = game.dispatch.getNode(path);
            game.emit(node.name,payload)
        }
    }
}

module.exports = new Input();
