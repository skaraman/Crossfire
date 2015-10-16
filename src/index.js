'use strict';
// Famous dependencies
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
// Boilerplate code to make ymy life easier
FamousEngine.init();
// Initialize with a scene; then, add a 'node' to the scene root
var theScene = FamousEngine.createScene();
theScene.name = "theScene";
document.theScene = theScene;
var options = {};
var world = new physics.PhysicsEngine(options);
var game = theScene.addChild();
game.name = "game";
world.game = game;
game.world = world;
var gameUI = game.addChild();
gameUI.name = "gameUI";
var gameSize = game.getSize();

var gameEnemies;
// listen for touches from mobile devices (the primary audience)
document.addEventListener('touchmove', function(event) {
     event.preventDefault();
     game.onReceive(event.type, event);
}, false);
// listen for keypresses on the document
// because why not, maybe it will be great
// for debugging on PC or something
document.addEventListener('keydown', function(event) {
    game.onReceive(event.type, event);
}.bind(this));
// listen for mouse movement from desktop
// for development and debugging
document.addEventListener('mousemove', function(event) {
    game.onReceive(event.type, event);
});
// sets the game Node to process the keydown listener from above
// and fire an emit() to all children,
// emit event is sent based on which button was pressed
game.onReceive = function(event, payload) {
    // since game.onReceive basically listens to all
    // the above input commands, i can switch between
    // them to handle the different cases
    // then emit an event to all my game children
    // since some children are listening to certain events
    // via their own "onReceive" functions
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
            // the game should be started, i don't want the
            // followAction() method to run in the event that
            // the player touches the screen on the "start game" screen
            // and doesn't touch the actual "start game" button
            if(game.started && game.started == true){
                followAction();
            }
        break;
    }
}
// creating my 'character', in this case it's just a box
var boxNode = gameUI.addChild();
game.boxNode = boxNode;
boxNode.name = "boxNode";
boxNode.setSizeMode('absolute', 'absolute')
    .setAbsoluteSize(40, 40)
    .setAlign(0.5,0.5)
    .setPosition(-20,-20)
    .setOrigin(0.5, 0.5);
boxNode.size = 80;
// adding the actual dom-element to the node
// it's what shows my sprite image on my node!
var boxNodeElement = new DOMElement(boxNode);
boxNodeElement.setProperty('background-color', 'blue')
    .setProperty('z-index','1000');
boxNode.addUIEvent('click');
// position the Box to the boxNode
var boxNodePosition = boxNode.getPosition();
boxNode.box = new Box({
    mass: 1,
    size: [40,40,40],
    position:new Vec3(boxNodePosition[0],boxNodePosition[1]) //bug?
});
// Box is attached to boxNode, but not the other way around
// so i attach it
boxNode.box.node = boxNode;
world.addBody(boxNode.box);
// need to add the below spinner as a physics interation
// on the Box, not as the below basic animation on the node
// this is because i want the physics engine to monitor the
// corners of the spinning box, this lets us have collisions
// on the spinning corners

var spinner = boxNode.addComponent({
    onUpdate: function(time) {
        var currentPos = boxNode.box.getPosition();
        boxNode.box.setPosition(currentPos[0],currentPos[1],time/1000);
        boxNode.requestUpdateOnNextTick(spinner);

    }
});
// Let the magic begin...
boxNode.requestUpdate(spinner);

// the box is idle before the game starts
// this helps position the box at the start
// of the game immediatly to the player's finger press
// since i also want to prevent 'false warping'
boxNode.idle = true;
// the start game button
// attach it to game so i can call it on gameOver()
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
// add a start component to the start node
// this will handle our main start function
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
function initGame() {
    gameUI.removeChild(startButtonNode);
    // document.body.style.cursor = "none";
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
            if(event == 'updateScore')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            updateScore();
        }
    }
    scoreNode.addComponent(scoreComponent);

}
function addEnemy(speed){
    // create an enemy at a random side with a random size,
    //
    var newEnemy = gameEnemies.addChild();
    newEnemy.name = "newEnemy";
    // choose a random size
    var sizes = [30,40,50,60];
    var size = sizes[Math.floor(Math.random()*sizes.length)];
    newEnemy.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(size, size);
    // choose a random side
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
    // adding the actual dom-element to the node
    // it's what shows my sprite image on my node!
    var newEnemyElement = new DOMElement(newEnemy);
    var colors = ['red','black']
    newEnemyElement.setProperty('background',colors[Math.floor(Math.random()*colors.length)])
        .setProperty('border-radius',"100%");
    // the enemy component that updates the node position based on the
    // sphere position
    var newEnemyComponent = {
        id: null,
        node: null,
        done: function(node){
            gameEnemies.removeChild(node);
            node.removeComponent(node._components[3]);
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
    world.addConstraint(new Collision([boxNode.box,newEnemy.sphere],{restitution:0}));
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
    // get rid of the createEnemiesComponent since
    // i don't need it anymore, addEnemyUtil will be my
    // goto for updating enemy properties
    // and collisionDetection() will be constantly
    // scanning for collisions
    if(gameEnemies._components[3]){
        gameEnemies.removeComponent(gameEnemies._components[3]);
    }
    ///**
    var timings_teir1 = [400,500];
    var timing = timings_teir1[Math.floor(Math.random()*timings_teir1.length)];
    game.addEnemyTimeout = FamousEngine.getClock().setInterval(function(){
        addEnemy(300)
    },timing);
    //*/
    //addEnemy(300);
    // ^^
}
function followAction(){
    // get the coordinates from the player's finger press
    // this one also includes mouse (else) behavior
    // for dev and debugging
    // (touchmove was a bit of a pain to figure out, .touches UGH...)
    var newPosX, newPosY
    if(event.type == "touchmove"){
        newPosX = event.touches[0].clientX - (boxNode.size/2);
        newPosY = event.touches[0].clientY - (boxNode.size/2);
    }else {
        newPosX = event.clientX - (boxNode.size/2);
        newPosY = event.clientY - (boxNode.size/2);
    }
    var currentPos = boxNode.getPosition();
    // box is idle when the game hasn't started yet,
    // so i dont want to punish the player for "warping"
    if(boxNode.idle == true){
        boxNode.setAlign(0,0,0);
        boxNode.setPosition(newPosX,newPosY);
        boxNode.box.setPosition(newPosX,newPosY,0);
        boxNode.idle = false;
    } else {
        // box isn't idle so i'm going to check how far
        // the next movement coordinates are from the previous ones
        var xDiff, yDiff;
        xDiff = Math.abs(currentPos[0] - newPosX);
        yDiff = Math.abs(currentPos[1] - newPosY);
        // whoa! this is more than 200 pixels x or y, they must be using
        // two fingers and releasing one in an attempt to 'warp', i don't
        // take kindly to 'false warpers', so i'm going to set a duration
        // for their warp period
        // i need to figure out the bugs here
        if(xDiff > 200 || yDiff > 200 ){
            boxNode.position = new Position(boxNode);
            boxNode.position.set(newPosX,newPosY,10000,{duration:1000});
            boxNode.position.onUpdate;
        }else{
            boxNode.setPosition(newPosX,newPosY);
            boxNode.box.setPosition(newPosX,newPosY,0);
        }
    }
}
function updateScore(){
    var score = gameUI.getChildren();
}
function gameOver(){
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
        .setContent('Game Over');

    /** i don't need this right?
     var gameOverComponent = {
        id: null,
        node: null,
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload){
            if(event == 'gameOver')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            game.started = true;
            initGame();
        }
    }
    gameOverNode.addComponent(gameOverComponent);
    */
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

    score.setAlign(0.5,0.3,0);
    score._components[3].setProperty('opacity','1.0');

}
function resetBrokenBody(body){
    // is it Famous? is it me?
    // either way, the box and sphere get broken when colliding from a
    // fast flick! i get NaN in each of these properties!
    // luckily, the box is simple enough, i can reset it and just get rid
    // of the sphere... but why this happen Famous?!
    body.angularMomentum = new Vec3(0,0,0);
    body.angularVelocity = new Vec3(0,0,0);
    body.momentum = new Vec3(0,0,0);
    body.orientation = new Quaternion(1,0,0,0);
    body.velocity = new Vec3(0,0,0);
}
function collisionDetection(){
    // this took a while to figure out, but it's basically the game updater
    // through the onUpdate sheme here i scan for collisions, fix broken ones,
    // reset the box from its collision velocities, check which enemy was hit,
    // call the correct method, update the PE (world), and call this updater again
    // THE CIRCLE OF LIFE and it keeps on going...
    var gameEnemies = game.getChildren()[1];
    var collisionComponent = {
        id:null,
        node:null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time) {
            // console.log('collision detection scanning',time);
            // when the collision breaks, velocity of the box is garanteed to
            // be NaN, so throw that sucker into a quick reset and proceed with
            // life, more info in resetBrokenBody comments
            var boxVelocity = boxNode.box.getVelocity();
            /*if(isNaN(boxVelocity.x)){
                resetBrokenBody(boxNode.box);
            }*/
            // everytime i made a collision, i added it to the PE (world), so
            // now at a "game update" i'll scan each collision to see if it has
            // collision data, which means a collision occured,
            // i don't care about the data, just that it's there
            for(var i = 0; i < world.constraints.length;i++){
                if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && !world.constraints[i].detected){
                    world.constraints[i].detected = true;
                    // box get's bounced around too, probably possible to
                    // remove this in box properties but this reset works fine
                    // for me, for now
                    resetBrokenBody(boxNode.box);
                    // check the type of enemy i hit, simply by looking
                    // at it's div's bg color, and call it's update methods
                    var enemyType = world.constraints[i].targets[1].node._components[3]._styles.background;
                    if(enemyType == 'black'){
                        // destroy the node & update score
                        console.log('hit black!');
                        updateScore();
                    }else if(enemyType == 'red'){
                        // destroy all nodes, reset box, move score,
                        // and game over
                        console.log('hit red!');
                        gameOver();
                    }
                    world.removeConstraint(world.constraints[i]);
                }else if(world.constraints[i]
                && world.constraints[i].contactManifoldTable.collisionMatrix.hasOwnProperty(0)
                && world.constraints[i].detected){
                    // i need to remove collisions already detected otherwise
                    // they create a problem since their targets are probably
                    // removed already
                    world.removeConstraint(world.constraints[i]);
                }
            }
            // the magic that is time + reproduction
            world.update(time);
            this.node.requestUpdateOnNextTick(this.id);
        }
    };
    // the meteor that brings the life stuff
    gameEnemies.addComponent(collisionComponent);
    // the spark that made it happen
    gameEnemies.requestUpdate(collisionComponent.id);
}
