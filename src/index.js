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
FamousEngine.init();
var theScene = FamousEngine.createScene();
theScene.name = "theScene";
document.theScene = theScene;
var options = {};
var world;
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
        case 'click':
            switch (payload.node.name) {
                case "startButtonNode":
                    game.emit('startButton',payload);
                break;
                case "addEnemyButtonNode":
                    game.emit('addEnemyButton',payload);
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

    world.addBody(game.boxNode.box);

    var gameUIChildren = gameUI.getChildren();

    for(var i=gameUIChildren.length;i--;){
        if(gameUIChildren[i].name == "scoreNode"
        || gameUIChildren[i].name == "startButtonNode"
        || gameUIChildren[i].name == "gameOverNode"){
            gameUI.removeChild(gameUIChildren[i]);
        }
    }
    document.body.style.cursor = "none";

    if(gameEnemies){
        Dismount(gameEnemies);
        gameEnemies = {};
    }
    gameEnemies = game.addChild();
    gameEnemies.name = "gameEnemies";
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
    var scoreElement = new DOMElement(scoreNode);
    scoreElement.setProperty('font-size','60px')
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
}
function createStartButtonNode() {
    var startButtonNode = gameUI.addChild();
    startButtonNode.name = "startButtonNode";
    startButtonNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(240,60)
        .setAlign(0.5,0.8)
        .setPosition(-120,-30);
    var startButtonElement = new DOMElement(startButtonNode);
    startButtonElement.setProperty('font-size','46px')
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
    boxNode.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(40, 40)
        .setAlign(0.5,0.5)
        .setPosition(-20,-20,1000)
        .setOrigin(0.5, 0.5);
    boxNode.size = 80;
    var boxNodeElement = new DOMElement(boxNode);
    boxNodeElement.setProperty('background-color', 'blue')
        .setProperty('z-index','1000');
    boxNode.addUIEvent('click');
    var boxNodePosition = boxNode.getPosition();
    boxNode.box = new Box({
        mass: 1,
        size: [40,40,40],
        position:new Vec3(boxNodePosition[0],boxNodePosition[1])
    });
    boxNode.box.node = boxNode;
    // need to add the below boxNodeComponent as a physics interation
    // on the Box, not as the below basic animation on the node
    // this is because i want the physics engine to monitor the
    // corners of the spinning box, this lets us have collisions
    // on the spinning corners

    var boxNodeComponent = boxNode.addComponent({
        onUpdate: function(time) {
            // set boxNode.box to spin on it's z axis
            var currentPos = boxNode.box.getPosition();
            boxNode.box.setPosition(currentPos[0],currentPos[1],time/1000);
            // set boxNode to update to .box position = move away from
            // followAction()
            boxNode.requestUpdateOnNextTick(boxNodeComponent);
        }
    });
    // Let the magic begin...
    boxNode.requestUpdate(boxNodeComponent);

    boxNode.idle = true;
}

function addEnemy(speed){
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
    var newEnemyElement = new DOMElement(newEnemy);
    var colors = ['red','black']
    newEnemyElement.setProperty('background',colors[Math.floor(Math.random()*colors.length)])
        .setProperty('border-radius',"100%");
    var newEnemyComponent = {
        id: null,
        node: null,
        done: function(node){
            gameEnemies.removeChild(node);
            if(node._components[3] != null)
            node.removeComponent(node._components[3]);
            if(node._components[2] != null)
            node.removeComponent(node._components[2]);
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
    newEnemy.addComponent(newEnemyComponent);
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
}
function addEnemyUtil(){
    if(gameEnemies._components[3]){
        gameEnemies.removeComponent(gameEnemies._components[3]);
    }
    var timings_teir1 = [400,500];
    var timing = timings_teir1[Math.floor(Math.random()*timings_teir1.length)];

    game.addEnemyInterval = FamousEngine.getClock().setInterval(function(){
        addEnemy(300)
    },timing);
}
function followAction(){
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
        game.boxNode.setAlign(0,0,0);
        game.boxNode.setPosition(newPosX,newPosY);
        game.boxNode.box.setPosition(newPosX,newPosY,0);
        game.boxNode.idle = false;
    } else {
        var xDiff, yDiff;
        xDiff = Math.abs(currentPos[0] - newPosX);
        yDiff = Math.abs(currentPos[1] - newPosY);
        if(xDiff > 200 || yDiff > 200 ){
            game.boxNode.position = new Position(game.boxNode);
            game.boxNode.position.set(newPosX,newPosY,10000,{duration:1000});
            game.boxNode.position.onUpdate;
        }else if((game.boxNode.position && !game.boxNode.position.isActive())||!game.boxNode.position){
            game.boxNode.setPosition(newPosX,newPosY);
            game.boxNode.box.setPosition(newPosX,newPosY,0);
        }
    }
}
function updateScore(score,node){
    var numScore = parseInt(score._components[3]._content);
    var newScore = numScore + 10;
    game.score = newScore;
    score._components[3].setContent(newScore);
    node._components[4].done(node);
}
function gameOver(){
    FamousEngine.getClock().clearTimer(game.addEnemyInterval);
    var gC = gameUI.getChildren()
    var score = gC[1];
    var gameOverNode = gameUI.addChild();
    gameOverNode.name = "gameOverNode";
    gameOverNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(400,100)
        .setAlign(0.5,0.5)
        .setPosition(-200,-50);
    var gameOverElement = new DOMElement(gameOverNode);
    gameOverElement.setProperty('font-size','64px')
        .setProperty('text-align','center')
        .setContent('Game Over');

    createStartButtonNode();

    score.setAlign(0.5,0.3,0);
    score._components[3].setProperty('opacity','1.0');
    game.started = false;
    boxNode.setAlign(0.5,0.7)
        .setPosition(-20,-20,1000);
    boxNode.idle = true;
    document.body.style.cursor = "auto";


    var allEnemies = gameEnemies.getChildren();
    while(allEnemies.length){
        allEnemies[0].removeComponent(allEnemies[0]._components[3]);
        Dismount(allEnemies[0]);
        //gameEnemies.removeChild(allEnemies[0]);
    }
    gameEnemies.requestUpdate(gameEnemies._components[3].id);
}
function resetBody(body){
    body.angularMomentum = new Vec3(0,0,0);
    body.angularVelocity = new Vec3(0,0,0);
    body.momentum = new Vec3(0,0,0);
    body.orientation = new Quaternion(1,0,0,0);
    body.velocity = new Vec3(0,0,0);
}
function collisionDetection(){
    var gameEnemies = game.getChildren()[1];
    var collisionComponent = {
        id:null,
        node:null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time) {
            for(var i = 0; i < world.constraints.length;i++){
                if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && !world.constraints[i].detected){
                    world.constraints[i].detected = true;
                    resetBody(game.boxNode.box);
                    if(world.constraints[i].targets[1].node._components[3]){
                        var enemyType = world.constraints[i].targets[1].node._components[3]._styles.background;
                        if(enemyType == 'black'){
                            console.log('hit black!');
                            var payload = {};
                            payload.deadNode = world.constraints[i].targets[1].node;
                            game.emit('updateScore',payload)
                        }else if(enemyType == 'red'){
                            console.log('hit red!');
                            gameOver();
                        }
                        world.removeConstraint(world.constraints[i]);
                    }else{
                        console.log('fizzle');
                    }
                }else if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && world.constraints[i].detected){
                    world.removeConstraint(world.constraints[i]);
                }
            }
            console.log(time);
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
