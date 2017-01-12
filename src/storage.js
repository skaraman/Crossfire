var game = document.scene.getChildren();
game = game[0];

function Storage(){
  this.isAvailable = false;
  this.localStorage = null;
}

Storage.prototype.checkAvailable = function checkAvailable(type){
  if(!type)throw new Error('checkAvailable must be called with a type (e.g. localStorage)');
  this.isAvailable ? this.isAvailable : false;
  try {
  	var storage = window[type],
  	x = '__storage_test__';
  	storage.setItem(x, x);
  	storage.removeItem(x);
    this.isAvailable = true;
    this.localStorage = window.localStorage;
    this._setLocals();
  	return this.isAvailable;
  }
  catch(e) {
  	return this.isAvailable;
  }
}

Storage._setLocals = function setLocals(){
  if (this.isAvailable == true) {
      if(!storage.localStorage.high_score)
          storage.localStorage.high_score = 0;
      if(!storage.localStorage.games){
          storage.localStorage.games = 0;
      }else{
          game.games = storage.localStorage.games;
      }
      game.storage = true;
  }
  else {
      game.storage = false;
  }
}

module.exports = Storage;
