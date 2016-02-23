'use strict';
var DOMElement = require('famous/dom-renderables/DOMElement');
var FamousEngine = require('famous/core/FamousEngine');
var Dispatch = require('famous/core/Dispatch');
var Transitionable = require('famous/transitions/Transitionable');
var Node = require('famous/core/Node');
var Position = require('famous/components/Position');
var math = require('famous/math');
var physics = require('famous/physics');
var Sphere = require('famous/physics/bodies/Sphere');
var Box = require('famous/physics/bodies/Box');
var Vec3 = require('famous/math/Vec3');
var Mat33 = require('famous/math/Mat33');
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
game.dispatch = Dispatch;
var gameUI = game.addChild();
gameUI.name = "gameUI";
var gameSize = game.getSize();
var gameEnemies;
document.addEventListener('touchmove', function(event) {
     event.preventDefault();
     game.onReceive(event.type, event);
}, false);
document.addEventListener('touchend', function(event) {
     event.preventDefault();
     game.onReceive(event.type, event);
}, false);
document.addEventListener('keydown', function(event) {
    game.onReceive(event.type, event);
}.bind(this));
document.addEventListener('mousemove', function(event) {
    game.onReceive(event.type, event);
});
document.addEventListener('click', function(event){
    game.onReceive(event.type, event)
});
game.onReceive = function(event, payload) {
    if(event == 'keydown'){
        if (payload.keyCode == 66) {
            game.emit('sequence',payload);
        }else if (payload.keyCode == 67){
            game.emit('reverseSequence',payload);
        }else if (payload.keyCode == 65){
            payload.interruptable = false;
            game.emit('sequence_timed',payload);
        }
    }else if(event == 'click' || event == 'touchend' ){
        if(payload.target.attributes.getNamedItem('data-fa-path')){
            var path = payload.target.attributes.getNamedItem('data-fa-path').value;
        }else if (payload.target.parentNode.attributes.getNamedItem('data-fa-path')){
            var path = payload.target.parentNode.attributes.getNamedItem('data-fa-path').value;
        }
        var node = game.dispatch.getNode(path);
        if (node && node.name == "startButtonNode") {
            game.emit('startButton',payload);
        }else if (node && node.name == "addEnemyButtonNode"){
            game.emit('addEnemyButton',payload);
        }else if (node && node.name ==  "boxNode"){
            payload.interrupt = true;
            game.emit('sequence',payload)
        }
    }
    else if(event == 'mousemove' || event == 'touchmove'){
        if(game.started && game.started == true){
            followAction();
        }
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
    game.speed_reducer = 5;
    game.teir_reducer = 1;
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
        gameEnemies.dismount();
        gameEnemies = {};
    }
    gameEnemies = game.addChild();
    game.activeEnemies = [];
    game.gameEnemies = gameEnemies;
    gameEnemies.name = "gameEnemies";
    game.lives = 1;
    gameEnemies.createEnemiesComponent = {
        id: null,
        node: null,
        active: false,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function(event,payload) {
            if(event == 'createEnemies')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            loadingScreen('start');
            if(this.active != true){
                addEnemyUtil();
                setEnemyInMotion(gameEnemies._children[0]);
                collisionDetection();
                this.active = true;
                game.emit('sequence_timed',{looping:true});
                loadingScreen('end');
            }
        }
    };
    gameEnemies.addComponent(gameEnemies.createEnemiesComponent);
    game.emit("createEnemies",{});
    var scoreNode = gameUI.addChild();
    game.scoreNode = scoreNode;
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
    game.score = 0;
    resetBody(game.boxNode.box);
    game.gameLivesNode = gameUI.addChild();
    game.gameLivesNode.gameLivesComponent = {
        id:null,
        node:null,
        life:null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function(event,payload){
            if(event == 'manageLives'){
                this.life = payload.life;
                this.node.requestUpdate(this.id);
            }
        },
        onUpdate: function(time){
            manageLives(this,this.life);
        },
    }
    game.gameLivesNode.addComponent(game.gameLivesNode.gameLivesComponent);
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
    var startComponent = {
        id: null,
        node: null,
        gameOver: arguments[0],
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload){
            if(event == 'startButton')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            if(this.gameOver == true){
                location.reload();
            }else{
                game.started = true;
                initGame();
            }
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
        .setPosition(-20,-20,10000)
        .setOrigin(0.5, 0.5);
    boxNode.size = 80;
    boxNode.DOMElement = new DOMElement(boxNode);
    boxNode.DOMElement.setProperty('background-image', 'url(./assets/grid.png)')
        .setProperty('background-size','1100% 600%')
        .setProperty('z-index','1000');
    var boxNodePosition = boxNode.getPosition();
    var boxNodeComponentID = boxNode.addComponent({
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
                    position:new Vec3(boxNodePosition[0],boxNodePosition[1]),
                    restitution: 0,
                    friction: 0
                });
                boxNode.box.node = boxNode;
                world.addBody(boxNode.box);
            }
            if(game.started == true){
                boxNode.setAlign(0,0)
            }
            var currentPos = boxNode.box.getPosition();
            boxNode.setPosition(currentPos.x,currentPos.y,10000);
            boxNode.requestUpdate(this.id);
        }
    });
    addAnimationComponent(boxNode);
    boxNode.requestUpdate(boxNodeComponentID);
}
function addAnimationComponent(char){
    var myComponent = {
        id: null,
        node: null,
        done: function(node) {
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
            var framedata = this.node.framedata;
            if (framedata[event]) {
                if(!framedata.active){
                    framedata.active = framedata[event];
                    framedata.active.event = event;
                    framedata.active.frameIterator = 0;
                    if((typeof payload.looping) != 'undefined')
                        framedata.active.looping = payload.looping;
                    if((typeof payload.interruptable) != 'undefined')
                        framedata.active.interruptable = payload.interruptable;
                }
                if((typeof framedata.active.interruptable) != 'undefined'){
                    if(framedata.active.interruptable == false){
                        payload.interrupt = false;
                    }
                }
                if (framedata.active.frameIterator < 1 || payload.interrupt) {
                    if(payload.interrupt){
                        if(this.node.animationTransitionable) this.node.animationTransitionable.halt();
                        framedata.active.frameIterator = 0;
                    }
                    framedata.active = framedata[event];
                    framedata.active.event = event;
                    if((typeof payload.interruptable) != 'undefined')
                        framedata.active.interruptable = payload.interruptable;
                    var frames = framedata.active.frames;
                    var duration=0;
                    for(var x=0; x < frames.length; x++){
                        duration += frames[x].ms;
                    }
                    framedata.active.duration = duration;
                    this.node.animationTransitionable = new Transitionable(0);
                    this.node.requestUpdate(this.id);
                    this.node.animationTransitionable.from(0).to(duration, 'linear', duration, null, this.done, this.node);
                }
            }
        },
        onUpdate: function() {
            var framedata = this.node.framedata;
            if(framedata.active){
                var animation = framedata.active;
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
                        this.node.requestUpdate(this.id);
                    }
                    else if(transition.isActive()) {
                        var forceMove = transition.get();
                        this.node.requestUpdate(this.id);
                    }
                }else if(animation.frameIterator >= frames.length){
                    if(transition.isActive()){
                        transition.halt();
                    }
                    if(animation.looping){
                        animation.frameIterator = 0;
                        transition.from(0).to(framedata.active.duration, 'linear', framedata.active.duration, null, this.done, this.node);
                        this.node.requestUpdate(this.id);
                    }else{
                        framedata.active = null;
                    }
                }
            }
        }
    };
    char.addComponent(myComponent);
}
function addEnemy(color){
    var newEnemy = gameEnemies.addChild();
    newEnemy.name = "";
    var sizes = [30,40,50,60];
    var size = sizes[Math.floor(Math.random()*sizes.length)];
    newEnemy._size = size;
    newEnemy.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(size, size)
        .setPosition(-(size+5),-(size+5),3);
    newEnemy.DOMElement = new DOMElement(newEnemy);
    newEnemy.DOMElement.setProperty('background',color)
        .setProperty('color','teal')
        .setProperty('font-size','24px')
        .setProperty('font-weight','bold')
        .setProperty('word-wrap','break-word')
        .setProperty('border-radius', "100%")
        .setProperty('text-align','center')
        .setContent(newEnemy._id.substring(newEnemy._id.length-2,newEnemy._id.length));
    var newEnemyPosition = newEnemy.getPosition();
    newEnemy._position = newEnemyPosition;
    newEnemy.sphere = new Sphere({
        mass: 1,
        radius: size/2,
        position:new Vec3(newEnemyPosition[0],newEnemyPosition[1]),
        restitution: 0,
        friction: 0
    });
    newEnemy.sphere.node = newEnemy;
    world.addBody(newEnemy.sphere);
    newEnemy.collision = world.addConstraint(
        new Collision([game.boxNode.box,newEnemy.sphere],{restitution:0})
    );
    resetBody(newEnemy.sphere);
    addEnemyComponent(newEnemy)
}
function addEnemyComponent(newEnemy){
    newEnemy.newEnemyComponent = {
        id: null,
        node: null,
        done: function(node){
            node.sphere.setPosition(-100,-100,-100);
            resetBody(node.sphere);
            resetBody(game.boxNode.box);
            game.inactive.push(node);
            game.activeEnemies.splice(game.activeEnemies.indexOf(node),1);
            node.setPosition(-100,-100,3);
            node.requestUpdate(node.newEnemyComponent.id);
        },
        onMount: function (node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time){
            var spherePosition = this.node.sphere.getPosition();
            if (spherePosition.z != -100){
                if(((spherePosition.x-65) > gameSize[0] || (spherePosition.x+65) < 0
                    || (spherePosition.y-65) > gameSize[1] || (spherePosition.y+65) < 0)){
                    if(this.node._id != null){
                        this.done(this.node);
                    }
                }else{
                    this.node.setPosition(spherePosition.x,spherePosition.y,3);
                    this.node.requestUpdate(this.id);
                }
            }
        }
    };
    newEnemy.addComponent(newEnemy.newEnemyComponent);
}
function setEnemyInMotion(newEnemy){
    game.activeEnemies.push(newEnemy);
    var size = newEnemy._size,
        newEnemyPosition = newEnemy._position;
    var timings_teirs = [[500,1000],[400,700],[300,500],[200,400],[100,250],[50,125]];
    var speed_range = [200,300];
    var speed = Math.floor(
        (Math.floor(Math.random()*(speed_range[1]-speed_range[0]))+speed_range[0])
        + (Math.floor(Math.random()*(game.score+1))/ game.speed_reducer)
    );
    game.timing_teir_i=0;
    if ((game.score/game.teir_reducer) < 200 ){
        game.timing_teir_i=0
    }else if ((game.score/game.teir_reducer)< 400 ) {
        game.timing_teir_i=1;
    }else if ((game.score/game.teir_reducer)< 800) {
        game.timing_teir_i=2;
    }else if ((game.score/game.teir_reducer)< 1600) {
        game.timing_teir_i=3;
    }else if ((game.score/game.teir_reducer)< 2400) {
        game.timing_teir_i=4;
    }else if ((game.score/game.teir_reducer)>= 2400) {
        game.timing_teir_i=5;
    }
    var timing_teir = timings_teirs[game.timing_teir_i];
    var timing = Math.floor(Math.random()*(timing_teir[1] - timing_teir[0])) + timing_teir[0];

    var sidesOps = [1,2,3,4];
    var sideOp = sidesOps[Math.floor(Math.random()*sidesOps.length)];
    if(sideOp == 1){
        newEnemy.setPosition(gameSize[0],Math.round(Math.random() * gameSize[1]),3);
        newEnemy.sphere.setPosition(gameSize[0],Math.round(Math.random() * gameSize[1]),0);
        newEnemy.name = "right";
    }else if(sideOp == 2){
        newEnemy.setPosition(-size,Math.round(Math.random() * gameSize[1]),3);
        newEnemy.sphere.setPosition(-size,Math.round(Math.random() * gameSize[1]),0)
        newEnemy.name = "left";
    }else if(sideOp == 3){
        newEnemy.setPosition(Math.round(Math.random() * gameSize[0]),gameSize[1],3);
        newEnemy.sphere.setPosition(Math.round(Math.random() * gameSize[0]),gameSize[1],0)
        newEnemy.name = "bottom";
    }else if(sideOp == 4){
        newEnemy.setPosition(Math.round(Math.random() * gameSize[0]),-size,3);
        newEnemy.sphere.setPosition(Math.round(Math.random() * gameSize[0]),-size,0)
        newEnemy.name = "top";
    }
    var diag = Math.random() < 0.5 ? true : false;
    if(newEnemy.name == "left"){
        if(diag == true){
            if(newEnemyPosition[1]> (gameSize[1]/2)){
                newEnemy.sphere.setVelocity(speed,-speed);
            }
            else{
                newEnemy.sphere.setVelocity(speed,speed);
            }
        }
        else{
            newEnemy.sphere.setVelocity(speed,0);
        }
    }else if(newEnemy.name == "right"){
        if(diag == true){
            if(newEnemyPosition[1]> (gameSize[1]/2)){
                newEnemy.sphere.setVelocity(-speed,-speed);
            }
            else{
                newEnemy.sphere.setVelocity(-speed,speed);
            }
        }
        else{
            newEnemy.sphere.setVelocity(-speed,0);
        }
    }else if(newEnemy.name == "top"){
        if(diag == true){
            if(newEnemyPosition[0]> (gameSize[0]/2)){
                newEnemy.sphere.setVelocity(-speed,speed);
            }
            else{
                newEnemy.sphere.setVelocity(speed,speed)
            }
        }
        else{
            newEnemy.sphere.setVelocity(0,speed);
        }
    }else if(newEnemy.name == "bottom"){
        if(diag == true){
            if(newEnemyPosition[0]> (gameSize[0]/2)){
                newEnemy.sphere.setVelocity(-speed,-speed);
            }
            else {
                newEnemy.sphere.setVelocity(speed,-speed);
            }
        }
        else{
            newEnemy.sphere.setVelocity(0,-speed);
        }
    }
    if(!game.inactive){
        game.inactive = gameEnemies._children.filter(returnEnemy);
    }else {
        game.inactive = game.inactive.filter(returnEnemy);
    }
    function returnEnemy(gameEnemy) {
        if(gameEnemy != newEnemy)
            return gameEnemy;
    }
    var ran = Math.random()
    var x = Math.floor(ran*game.inactive.length);
    newEnemy.requestUpdate(newEnemy.newEnemyComponent.id);
    FamousEngine.getClock().setTimeout(function(){
         setEnemyInMotion(game.inactive[x]);
    }, timing);
}
function addEnemyUtil(){
    var colors = ['black','red','blue','grey','green','yellow','orange','purple','violet','gainsboro'];
    for(var x = 0; x < 100; x++){
        if(gameEnemies.createEnemiesComponent){
            gameEnemies.removeComponent(gameEnemies.createEnemiesComponent);
        }
        if (game.over == false) {
            var color = colors[0];
            if (x > 46 && x < 93) {
                color=colors[1];
            }else if (x == 93){
                color=colors[2];
            }else if (x == 94) {
                color=colors[3];
            }else if (x == 95){
                color=colors[4];
            }else if (x == 96){
                color=colors[5];
            }else if (x == 97){
                color=colors[6];
            }else if (x == 98){
                color=colors[7];
            }else if (x == 99){
                color=colors[8];
            }else if (x == 100){
                color=colors[9];
            }
            addEnemy(color);
        }
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
    game.boxNode.box.setPosition(newPosX,newPosY,0);
}
function updateScore(score){
    game.score += score;
    game.scoreNode.DOMElement.setContent(game.score);
}
function manageGUIBars(){
    var type = null;
    if(arguments[0]) type = arguments[0];
}
function setSlowTime() {
    if(!game.slowTime){
        game.slowTime = true;
        var slowTimeBarTimerNode = gameUI.addChild();
        game.slowTimeBarTimerNode = slowTimeBarTimerNode;
        slowTimeBarTimerNode.name = "slowTimeBarTimerNode";
        slowTimeBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        slowTimeBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),120,1);
        slowTimeBarTimerNode.DOMElement = new DOMElement(slowTimeBarTimerNode);
        slowTimeBarTimerNode.DOMElement
            .setProperty('background-color','black')
            .setProperty('opacity','0.5');
        slowTimeBarTimerNode.slowTimeBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                if(node in node._updater._updateQueue)
                    FamousEngine._updateQueue.splice(node._updater._updateQueue.indexOf(node), 1);
                if(node._updateQueue && node._updateQueue.length)
                    node._updateQueue = [];
                if(node._nextUpdateQueue && node._nextUpdateQueue.length)
                    node._nextUpdateQueue = [];
                node.dismount();
                delete game.slowTime;
                delete game.slowTimeBarTimerNode.DOMElement;
                for(var i=0; i< gameEnemies._children.length; i++){
                    if(gameEnemies._children[i] != null){
                        var veloArr = gameEnemies._children[i].sphere.velocity.toArray();
                        for(var j=0; j< veloArr.length; j++){
                            veloArr[j] = Math.floor(veloArr[j]*2);
                        }
                        gameEnemies._children[i].sphere.setVelocity(veloArr[0],veloArr[1],veloArr[2])
                    }
                }
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    var diffTime = time - this.startTime;
                    if(diffTime > 3000){
                        this.done(this.node);
                    }
                    else {
                        var percentage = diffTime / 3000;
                        percentage = 0.9 * (1 - percentage)
                        this.node.setProportionalSize(percentage,null);
                    }
                }
                for(var i=0; i< gameEnemies._children.length; i++){
                    if(gameEnemies._children[i] != null && !gameEnemies._children[i].slowed){
                        var veloArr = gameEnemies._children[i].sphere.velocity.toArray();
                        for(var j=0; j< veloArr.length; j++){
                            veloArr[j] = Math.floor(veloArr[j]/2);
                        }
                        gameEnemies._children[i].sphere.setVelocity(veloArr[0],veloArr[1],veloArr[2])
                        gameEnemies._children[i].slowed = true;
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        slowTimeBarTimerNode.addComponent(slowTimeBarTimerNode.slowTimeBarTimerComponent);
        slowTimeBarTimerNode.requestUpdate(slowTimeBarTimerNode.slowTimeBarTimerComponent.id);
    }else{
        game.slowTimeBarTimerNode.slowTimeBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
function setInvincible(){
    if(!game.invincible){
        game.invincible = true;
        var invincibleBarTimerNode = gameUI.addChild();
        game.invincibleBarTimerNode = invincibleBarTimerNode;
        invincibleBarTimerNode.name = "invincibleBarTimerNode";
        invincibleBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        invincibleBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),100,1);
        invincibleBarTimerNode.DOMElement = new DOMElement(invincibleBarTimerNode);
        invincibleBarTimerNode.DOMElement
                .setProperty('background-color','black')
                .setProperty('opacity','0.5');
        invincibleBarTimerNode.invincibleBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                node.dismount();
                for(var i=0;i<FamousEngine._updateQueue.length;i++){
                    if(FamousEngine._updateQueue[i] == node){
                        FamousEngine._updateQueue.splice(i,1);
                        i--;
                        continue;
                    }
                }
                delete game.invincible;
                delete game.invincibleBarTimerNode.DOMElement;
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    var diffTime = time - this.startTime;
                    if(diffTime > 3000){
                        this.done(this.node);
                    }
                    else {
                        var percentage = diffTime / 3000;
                        percentage = 0.9 * (1 - percentage)
                        this.node.setProportionalSize(percentage,null);
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        invincibleBarTimerNode.addComponent(invincibleBarTimerNode.invincibleBarTimerComponent);
        invincibleBarTimerNode.requestUpdate(invincibleBarTimerNode.invincibleBarTimerComponent.id);
    }else{
        game.invincibleBarTimerNode.invincibleBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }

}
function manageLives(gameLivesComponent, op) {
    game.lives += op;
    if(op == 1 && game.lives <= 3){
        var i = game.lives;
        var newLifeNode = game.gameLivesNode.addChild();
        newLifeNode.setSizeMode('absolute','absolute')
            .setAbsoluteSize(40,40)
            .setAlign(0.5,0.5)
            .setPosition((-120)+(40*i),0,1);
        newLifeNode.DOMElement = new DOMElement(newLifeNode);
        newLifeNode.DOMElement.setProperty('background-color','green')
            .setProperty('opacity','0.4')
            .setProperty('padding','5px 0px');
    }else if(op == -1 && gameLivesComponent.node._children[gameLivesComponent.node._children.length-1] != null) {
        gameLivesComponent.node._children[gameLivesComponent.node._children.length-1].dismount();
        gameLivesComponent.node._children.splice(gameLivesComponent.node._children.length - 1,1)
    }
    if(game.lives > 3)game.lives = 3;
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
    gameEnemies.requestUpdate(gameEnemies.createEnemiesComponent.id);
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
        .setContent('Game Over')
        .setProperty('background','none');
    createStartButtonNode(true);
    score.setAlign(0.5,0.3,0);
    score.DOMElement.setProperty('opacity','1.0');
    game.started = false;
    game.boxNode.setAlign(0.5,0.7)
        .setPosition(-20,-20,1000);
    game.boxNode.idle = true;
    document.body.style.cursor = "auto";
    if(game.storage.available == true
    && window.localStorage.high_score
    && window.localStorage.high_score < game.score)
        window.localStorage.high_score = game.score;
}
function resetBody(body){
    body.angularMomentum = new Vec3(0,0,0);
    body.angularVelocity = new Vec3(0,0,0);
    body.momentum = new Vec3(0,0,0);
    body.orientation = new Quaternion(1,0,0,0);
    body.velocity = new Vec3(0,0,0);
    body.torque = new Vec3(0,0,0);

    body.inverseInertia = new Mat33([1,0,0,0,1,0,0,0,1]);
    body.localInertia = new Mat33([1,0,0,0,1,0,0,0,1]);
    body.localInverseInertia = new Mat33([1,0,0,0,1,0,0,0,1]);

    body.restitution = 0;
    body.friction = 0;
}
function collisionDetection(){
    var gameEnemies = game.gameEnemies;
    var collisionComponent = {
        id:null,
        node:null,
        onMount: function(node){
            this.id = node.addComponent(this);
            this.node = node;
        },
        onUpdate: function(time) {
            var c = game.activeEnemies.map(function(a){
                return a.collision;
            }) ;
            var len = c.length;
            var constraint, enemy, enemyType, payload;
            for(var i = 0; i < len;i++){
                constraint = c[i];
                if(constraint
                && constraint.contactManifoldTable.collisionMatrix.hasOwnProperty(0)){
                    resetBody(game.boxNode.box);
                    if(constraint.targets[1].node.DOMElement){
                        enemy = constraint.targets[1].node;
                        enemyType = enemy.DOMElement._styles.background;
                        enemy.newEnemyComponent.done(enemy);
                        if(!constraint.detected){
                            constraint.detected = true;
                            if(enemyType == 'black'){
                                var score = enemy._size
                                updateScore(score);
                            }else if(enemyType == 'red'){
                                if(!game.invincible && game.lives == 1){
                                    gameOver();
                                }else if (!game.invincible){
                                    game.emit('manageLives',{'life':-1});
                                }
                            }else if(enemyType == 'blue'){
                                setInvincible();
                            }else if(enemyType == 'grey'){
                                setSlowTime();
                            }else if (enemyType == 'green') {
                                game.teir_reducer += 2;
                            }else if (enemyType == 'yellow') {
                                game.speed_reducer += 10;
                            }else if (enemyType == 'orange') {
                                updateScore(1000);
                            }else if (enemyType == 'purple') {
                                game.emit('manageLives',{'life':1});
                            }else if (enemyType == 'violet') {
                                //magenetic
                            }else if (enemyType == 'gainsboro') {
                                //warp
                            }
                        }
                    }
                }
            }
            world.update(time);
            this.node.requestUpdate(this.id);
        }
    };
    gameEnemies.collisionComponent = collisionComponent;
    gameEnemies.addComponent(collisionComponent);
    gameEnemies.requestUpdate(gameEnemies.createEnemiesComponent.id);
}
function loadingScreen(oper){
    if (oper == 'start'){
        var loadingScreen = gameUI.addChild();
        loadingScreen.setPosition(0,0,1000000)
            .setSizeMode('relative','relative')
            .setProportionalSize(1,1);

        loadingScreen.DOMElement =  new DOMElement(loadingScreen);
        loadingScreen.DOMElement
            .setProperty('background-color','white');

        var loadingNode = loadingScreen.addChild();
        game.loading = loadingScreen;

        loadingNode.name = "loadingNode";
        loadingNode.setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(240, 60)
            .setAlign(0.5,0.5)
            .setPosition(-120,-30,1000002)
            .setOrigin(0.5, 0.5);
        loadingNode.DOMElement = new DOMElement(loadingNode);
        loadingNode.DOMElement
            .setProperty('z-index','1000')
            .setProperty('font-size','24px')
            .setProperty('color','black')
            .setContent('Loading...');
        var loadingNodePosition = loadingNode.getPosition();
        var loadingNodeComponentID = loadingNode.addComponent({
            id:null,
            node:null,
            onMount: function(node) {
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time) {
            }
        });
    }else if (oper == 'end'){
        gameUI.removeChild(game.loading);
    }
}
function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}
if (storageAvailable('localStorage')) {
    if(!window.localStorage.high_score)
        window.localStorage.high_score = 0;
    game.storage = {available:true};
}
else {
    game.storage = {available:false};
}
