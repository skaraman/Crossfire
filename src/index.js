'use strict';
var DOMElement = require('famous/dom-renderables/DOMElement');
var FamousEngine = require('famous/core/FamousEngine');
var Transitionable = require('famous/transitions/Transitionable');
var Node = require('famous/core/Node');
var Position = require('famous/components/Position');
var math = require('famous/math');
var physics = require('famous/physics');
var Sphere = require('famous/physics/bodies/Sphere');
var Box = require('famous/physics/bodies/Box');
var Vec3 = require('famous/math/Vec3');
var Quaternion = require('famous/math/Quaternion');
var Collision = require('famous/physics/constraints/Collision');
var Framedata = require ('./framedata.js');
FamousEngine.init();
var fd = Framedata.init();
var theScene = FamousEngine.createScene();
theScene.name = "theScene";
document.theScene = theScene;
var options = {};
var world = new physics.PhysicsEngine(options);
var game = theScene.addChild();
game.name = "game";
var gameUI = game.addChild();
gameUI.name = "gameUI";
var gameSize = game.getSize();
var gameEnemies;
document.addEventListener('touchmove', function(event) {
     event.preventDefault();
     game.onReceive(event.type, event);
}, false);
document.addEventListener('keydown', function(event) {
    game.onReceive(event.type, event);
}.bind(this));
document.addEventListener('mousemove', function(event) {
    game.onReceive(event.type, event);
});
game.onReceive = function(event, payload) {
    switch(event){
        case 'keydown':
            switch (payload.keyCode) {
                case 66:
                    game.emit('sequence',payload);
                break;
                case 67:
                    game.emit('reverseSequence',payload);
                break;
                case 65:
                    payload.interruptable = false;
                    game.emit('sequence_timed',payload);
                break;
            }
        break;
        case 'click':
            switch (payload.node.name) {
                case "startButtonNode":
                    game.emit('startButton',payload);
                break;
                case "addEnemyButtonNode":
                    game.emit('addEnemyButton',payload);
                break;
                case "boxNode":
                    payload.interrupt = true;
                    game.emit('sequence',payload)
                break;
            }
        break;
        case 'mousemove':
        case 'touchmove':
            if(game.started && game.started == true){
                followAction();
            }
        break;
    }
}

createBoxNode();
createStartButtonNode();

function initGame() {
    if(world) world = null;
    world = new physics.PhysicsEngine(options);
    world.game = game;
    game.world = world;
    game.over = false;

    var gameUIChildren = gameUI.getChildren();

    for(var i=gameUIChildren.length;i--;){
        if(gameUIChildren[i] != null){
            if(gameUIChildren[i].name == "scoreNode"
            || gameUIChildren[i].name == "startButtonNode"
            || gameUIChildren[i].name == "gameOverNode"){
                gameUI.removeChild(gameUIChildren[i]);
            }
        }
    }
    document.body.style.cursor = "none";

    if(gameEnemies){
        Dismount(gameEnemies);
        gameEnemies = {};
    }
    gameEnemies = game.addChild();
    game.gameEnemies = gameEnemies;
    gameEnemies.name = "gameEnemies";
    gameEnemies.constraintIterator = 0;
    var createEnemiesComponent = {
        id: null,
        node: null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function(event,payload) {
            if(event == 'createEnemies')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            addEnemyUtil();
            collisionDetection();
        }
    };
    gameEnemies.addComponent(createEnemiesComponent);
    gameEnemies.requestUpdate(gameEnemies._components[2].id);
    var payload={}, emitted = false;
    if(emitted == false ){
        game.emit("createEnemies",payload);
        emitted = true;
    }
    var scoreNode = gameUI.addChild();
    scoreNode.name = "scoreNode";
    game.sizes = game.getSize();
    scoreNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(game.sizes[0],100)
        .setAlign(0.5,0.5)
        .setPosition(-game.sizes[0]/2,-50);
    scoreNode.DOMElement = new DOMElement(scoreNode);
    scoreNode.DOMElement.setProperty('font-size','60px')
        .setProperty('opacity','0.5')
        .setProperty('text-align','center')
        .setContent('0');
    game.score = "0";
    var scoreComponent = {
        id:null,
        node:null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function(event,payload) {
            if(event == 'updateScore'){
                this.node.deadNode = payload.deadNode;
                this.node.requestUpdate(this.id);
            }
        },
        onUpdate: function() {
            updateScore(scoreNode,scoreNode.deadNode);
        }
    }
    scoreNode.addComponent(scoreComponent);
    resetBody(game.boxNode.box);
}
function createStartButtonNode() {
    var startButtonNode = gameUI.addChild();
    startButtonNode.name = "startButtonNode";
    startButtonNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(240,60)
        .setAlign(0.5,0.8)
        .setPosition(-120,-30);
    startButtonNode.DOMElement = new DOMElement(startButtonNode);
    startButtonNode.DOMElement.setProperty('font-size','46px')
        .setContent('Start Game');
    startButtonNode.addUIEvent('click');
    var startComponent = {
        id: null,
        node: null,
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload){
            if(event == 'startButton')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            game.started = true;
            initGame();
        }
    }
    startButtonNode.addComponent(startComponent);
}
function createBoxNode() {
    var boxNode = gameUI.addChild();
    game.boxNode = boxNode;
    boxNode.name = "boxNode";
    boxNode.framedata = fd.framedata.test_box;
    boxNode.idle = true;
    boxNode.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(40, 40)
        .setAlign(0.5,0.5)
        .setPosition(-20,-20,1000)
        .setOrigin(0.5, 0.5);
    boxNode.size = 80;
    boxNode.DOMElement = new DOMElement(boxNode);
    boxNode.DOMElement.setProperty('background-image', 'url(./assets/grid.png)')
        .setProperty('background-size','1100% 600%')
        .setProperty('z-index','1000')
        .setContent('Click Me');

    boxNode.addUIEvent('click');
    var boxNodePosition = boxNode.getPosition();

    // need to add the below boxNodeComponent as a physics interation
    // on the Box, not as the below basic animation on the node
    // this is because i want the physics engine to monitor the
    // corners of the spinning box, this lets us have collisions
    // on the spinning corners

    var boxNodeComponent = boxNode.addComponent({
        id:null,
        node:null,
        onMount: function(node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time) {
            if(!boxNode.box){
                boxNode.box = new Box({
                    mass: 1,
                    size: [40,40,40],
                    position:new Vec3(boxNodePosition[0],boxNodePosition[1])
                });
                boxNode.box.node = boxNode;
                world.addBody(boxNode.box);
            }
            if(game.started == true){
                boxNode.setAlign(0,0)
            }
            // set boxNode.box to spin on it's z axis
            var currentPos = boxNode.box.getPosition();
            boxNode.setPosition(currentPos.x,currentPos.y,10000);
            boxNode.setRotation(0,0,-time/1000)
            boxNode.requestUpdateOnNextTick(this.id);
        }
    });
    addAnimationComponent(boxNode);
    boxNode.requestUpdate(boxNodeComponent);
}

function addAnimationComponent(char){
    var myComponent = {
        id: null,
        node: null,
        done: function(node) {
            console.log("addAnimationComponent Done ran")
            if( typeof(node.framedata.active) == "null"){
                node
            }
            node.framedata.active.frameIterator = 0;
            node.framedata.active.msTimer = 0;
            node.framedata.active = null;
            node.animationTransitionable.halt();
        },
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload) {
            if (this.node.framedata[event]) {
                if(!this.node.framedata.active){
                    this.node.framedata.active = this.node.framedata[event];
                    this.node.framedata.active.event = event;
                    if((typeof payload.interruptable) != 'undefined')
                        this.node.framedata.active.interruptable = payload.interruptable;
                }
                if((typeof this.node.framedata.active.interruptable) != 'undefined'){
                    if(this.node.framedata.active.interruptable == false){
                        payload.interrupt = false;
                    }
                }
                if (this.node.framedata.active.frameIterator < 1 || payload.interrupt) {
                    if(payload.interrupt){
                        if(this.node.animationTransitionable) this.node.animationTransitionable.halt();
                        this.node.framedata.active.frameIterator = 0;
                    }
                    this.node.framedata.active = this.node.framedata[event];
                    this.node.framedata.active.event = event;
                    if((typeof payload.interruptable) != 'undefined')
                        this.node.framedata.active.interruptable = payload.interruptable;

                    var frames = this.node.framedata.active.frames;
                    var duration=0;
                    for(var x=0; x < frames.length; x++){
                        duration += frames[x].ms;
                    }
                    this.node.animationTransitionable = new Transitionable(0);
                    this.node.requestUpdate(this.id);
                    this.node.animationTransitionable.from(0).to(duration, 'linear', duration, this.done, null, this.node);
                }
            }
        },
        onUpdate: function() {
            if(this.node.framedata.active){
                var animation = this.node.framedata.active;
                var frames = animation.frames;
                var transition = this.node.animationTransitionable;
                var grace = 2;
                if(transition._state < 1){
                    animation.frameIterator = 0;
                    animation.msTimer = 0;
                }
                if(animation.frameIterator < frames.length){
                    if(transition._state < (animation.msTimer + frames[animation.frameIterator].ms + grace)
                    && transition._state >= (animation.msTimer - grace)
                    && animation != null) {
                        this.node.DOMElement.setProperty('background-position','-' + (frames[animation.frameIterator].x/4)
                            + 'px ' + '-' + (frames[animation.frameIterator].y/4) + 'px')
                        animation.msTimer += frames[animation.frameIterator].ms;
                        animation.frameIterator++;
                        var forceMove = transition.get();
                        this.node.requestUpdateOnNextTick(this.id);
                    }
                    else if(transition.isActive()) {
                        var forceMove = transition.get();
                        this.node.requestUpdateOnNextTick(this.id);
                    }
                }else if(animation.frameIterator >= frames.length){
                    if(transition.isActive()){
                        transition.get();
                        this.node.requestUpdateOnNextTick(this.id);
                    }
                }
            }
        }
    };
    char.addComponent(myComponent);
}

function addEnemy(speed, timing){
    var newEnemy = gameEnemies.addChild();
    newEnemy.name = "newEnemy";
    var sizes = [30,40,50,60];
    var size = sizes[Math.floor(Math.random()*sizes.length)];
    newEnemy.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(size, size);
    var sidesOps = [1,2,3,4];
    var sideOp = sidesOps[Math.floor(Math.random()*sidesOps.length)];
    switch (sideOp) {
        case 1:
            newEnemy.setPosition(gameSize[0],Math.round(Math.random() * gameSize[1]));
            newEnemy.name = "right";
        break;
        case 2:
            newEnemy.setPosition(-size,Math.round(Math.random() * gameSize[1]));
            newEnemy.name = "left";
        break;
        case 3:
            newEnemy.setPosition(Math.round(Math.random() * gameSize[0]),gameSize[1]);
            newEnemy.name = "bottom";
        break;
        case 4:
            newEnemy.setPosition(Math.round(Math.random() * gameSize[0]),-size);
            newEnemy.name = "top";
        break;
    }
    newEnemy.DOMElement = new DOMElement(newEnemy);
    var colors = ['red','black']
    newEnemy.DOMElement.setProperty('background',colors[Math.floor(Math.random()*colors.length)])
        .setProperty('border-radius',"100%");
    newEnemy.newEnemyComponent = {
        id: null,
        node: null,
        done: function(node){
            console.log('newEnemyComponent '+ node._id +' Done ran')
            game.world.remove(node.collision);
            game.world.remove(node.sphere);
            Dismount(node);
        },
        onMount: function (node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function(event,payload){
            if(event == "animateEnemies"){
                this.node.requestUpdate(this.id);
            }
        },
        onUpdate: function(time){
            var spherePosition = this.node.sphere.getPosition();
            if(Math.abs(spherePosition.x) > gameSize[0] || Math.abs(spherePosition.y) > gameSize[1]){
                if(this.node._id != null)
                    this.done(this.node);
            }else{
                this.node.setPosition(spherePosition.x,spherePosition.y);
                this.node.requestUpdateOnNextTick(this.id);
            }
        }
    };
    var newEnemyPosition = newEnemy.getPosition();
    newEnemy.sphere = new Sphere({
        mass: 1,
        radius: size/2,
        position:new Vec3(newEnemyPosition[0],newEnemyPosition[1])
    });
    newEnemy.sphere.node = newEnemy;
    world.addBody(newEnemy.sphere);
    world.addConstraint(new Collision([game.boxNode.box,newEnemy.sphere],{restitution:0}));
    newEnemy.collision = world.constraints[world.constraints.length-1];
    gameEnemies.constraintIterator++;
    newEnemy.addComponent(newEnemy.newEnemyComponent);
    switch (newEnemy.name) {
        case "left":
            newEnemy.sphere.setVelocity(speed,0);
        break;
        case "right":
            newEnemy.sphere.setVelocity(-speed,0);
        break;
        case "top":
            newEnemy.sphere.setVelocity(0,speed);
        break;
        case "bottom":
            newEnemy.sphere.setVelocity(0,-speed);
        break;
    }
    var payload={};
    game.emit('animateEnemies',payload);
    FamousEngine.getClock().setTimeout(function(){
      addEnemyUtil();
      collisionDetection();
    },timing);
}
function addEnemyUtil(){
    if(gameEnemies._components[3]){
        gameEnemies.removeComponent(gameEnemies._components[3]);
    }
    if (game.over == false) {
        var timings_teirs = [
          [600,800],
          [500,700],
          [400,600],
          [300,500],
          [200,300],
          [100,200]
        ];
        // speed should be determined by a factor of the score and is a measure
        // of how fast the enemy will be
        var speed = 300; // 300 + (random * score)
        // timing should be determined by a factor of the score and is a measure
        // of how quickly new enemy will be created
        var i=0;
        if (game.score < 1000 ){
            i=0
        }else if (game.score < 2000 ) {
            i=1;
        }else if (game.score < 3000) {
            i=2;
        }else if (game.score < 4000) {
            i=3;
        }else if (game.score < 5000) {
            i=4;
        }else if (game.score > 5001) {
            i=5;
        }
        var timing_teir = timings_teirs[i];
        var timing = Math.floor(Math.random()*(timing_teir[1] - timing_teir[0])) + timing_teir[0];
        addEnemy(speed,timing)
    }
}
function followAction(){
    if(!game.boxNode.box){
        createBoxNode();
    }
    var newPosX, newPosY
    if(event.type == "touchmove"){
        newPosX = event.touches[0].clientX - (game.boxNode.size/2);
        newPosY = event.touches[0].clientY - (game.boxNode.size/2);
    }else {
        newPosX = event.clientX - (game.boxNode.size/2);
        newPosY = event.clientY - (game.boxNode.size/2);
    }
    var currentPos = game.boxNode.getPosition();
    if(game.boxNode.idle == true){
        game.boxNode.box.setPosition(newPosX,newPosY,0);
        game.boxNode.idle = false;
    } else {
        var xDiff, yDiff;
        xDiff = Math.abs(currentPos[0] - newPosX);
        yDiff = Math.abs(currentPos[1] - newPosY);
        if(xDiff > 200 || yDiff > 200 ){
            game.boxNode.box.position = new Position(game.boxNode);
            game.boxNode.box.position.set(newPosX,newPosY,10000,{duration:1000});
            game.boxNode.box.position.onUpdate;
        }else if((game.boxNode.position && !game.boxNode.position.isActive())||!game.boxNode.position){
            game.boxNode.box.setPosition(newPosX,newPosY,0);
        }
    }
}
function updateScore(score,node){
    var numScore = parseInt(score.DOMElement._content);
    var newScore = numScore + node.getSize()[0];
    game.score = newScore;
    score.DOMElement.setContent(newScore);
    if(node._id != null){
        node.newEnemyComponent.done(node);
    }
}
function gameOver(){

    var allEnemies = gameEnemies.getChildren();
    while(allEnemies.length){
        if(allEnemies[0]==null){
            allEnemies.splice(0,1)
            continue;
        }
        allEnemies[0].newEnemyComponent.done(allEnemies[0]);
    }
    gameEnemies.requestUpdate(gameEnemies._components[3].id);

    game.over = true;
    var gC = gameUI.getChildren()
    var score = gC[1];
    var gameOverNode = gameUI.addChild();
    gameOverNode.name = "gameOverNode";
    gameOverNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(400,100)
        .setAlign(0.5,0.5)
        .setPosition(-200,-50);
    gameOverNode.DOMElement = new DOMElement(gameOverNode);
    gameOverNode.DOMElement.setProperty('font-size','64px')
        .setProperty('text-align','center')
        .setContent('Game Over');

    createStartButtonNode();

    score.setAlign(0.5,0.3,0);
    score.DOMElement.setProperty('opacity','1.0');
    game.started = false;
    game.boxNode.setAlign(0.5,0.7)
        .setPosition(-20,-20,1000);
    game.boxNode.idle = true;
    document.body.style.cursor = "auto";



}
function resetBody(body){
    body.angularMomentum = new Vec3(0,0,0);
    body.angularVelocity = new Vec3(0,0,0);
    body.momentum = new Vec3(0,0,0);
    body.orientation = new Quaternion(1,0,0,0);
    body.velocity = new Vec3(0,0,0);
}
function collisionDetection(){
    var gameEnemies = game.gameEnemies;
    var collisionComponent = {
        id:null,
        node:null,
        counter:0,
        counterBefore:0,
        dateBefore: null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time) {
          this.counter++;
          var difference = Date.now() - this.dateBefore;
          var countDelta = this.counter-this.counterBefore;
          if(difference > 100) {
            console.log('counter: ', this.counter, ' countDelta ', countDelta, ' diff: ', difference);
            console.log('POOP', 'counter: ' + countDelta/(difference/100) );
            this.counterBefore = this.counter;
            this.dateBefore = Date.now();
          }

            for(var i = 0; i < world.constraints.length;i++){

                if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && !world.constraints[i].detected){
                    world.constraints[i].detected = true;
                    resetBody(game.boxNode.box);
                    if(world.constraints[i].targets[1].node.DOMElement){
                        var enemyType = world.constraints[i].targets[1].node.DOMElement._styles.background;
                        if(enemyType == 'black'){
                            console.log('hit black!');
                            var payload = {};
                            payload.deadNode = world.constraints[i].targets[1].node;
                            game.emit('updateScore',payload)
                        }else if(enemyType == 'red'){
                            console.log('hit red!');
                            gameOver();
                        }
                        if(world.constraints[i] != null)
                            world.removeConstraint(world.constraints[i]);
                    }
                }else if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && world.constraints[i].detected && world.constraints[i] != null){
                        world.removeConstraint(world.constraints[i]);
                }
            }
            world.update(time);
            this.node.requestUpdateOnNextTick(this.id);
        }
    };
    gameEnemies.addComponent(collisionComponent);
    gameEnemies.requestUpdate(gameEnemies._components[3].id);
}
var Dismount = function(node) {
    var aNodes = [];
    if ( !(node instanceof Node) )
        throw "node not a Famous#Node";
    var f = function(current) {
        aNodes.push(current);
        var aChildren = current.getChildren();
        for ( var i in aChildren )
            f(aChildren[i]);
    };
    f(node);
    while ( aNodes.length ) {
        var x = aNodes.pop();
        if ( x.isMounted())
            x.dismount();
    }
}
