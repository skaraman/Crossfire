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
var Gravity3D = require('famous/physics/forces/Gravity3D')
var Framedata = require ('./framedata.js');
var Howler = require('./howler.js')
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
var attractables = [];

if (storageAvailable('localStorage')) {
    if(!window.localStorage.high_score)
        window.localStorage.high_score = 0;
    if(!window.localStorage.games)
        window.localStorage.games = 0;
    game.storage = true;
}
else {
    game.storage = false;
}

document.addEventListener('touchmove', function(event) {
     //event.preventDefault();
     game.onReceive(event.type, event);
}, false);
document.addEventListener('touchend', function(event) {
     //event.preventDefault();
     game.onReceive(event.type, event);
}, false);
document.addEventListener('touchstart', function(event) {
     //event.preventDefault();
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
            var path = payload.target.attributes.getNamedItem(
                'data-fa-path').value;
        }else if (payload.target.parentNode.attributes.getNamedItem(
            'data-fa-path')){
            var path = payload.target.parentNode.attributes.getNamedItem(
                'data-fa-path').value;
        }
        var node = game.dispatch.getNode(path);
        if (node && node.name == "startButtonNode") {
            game.emit('startButton',payload);
        }else if (node && node.name == "addEnemyButtonNode"){
            game.emit('addEnemyButton',payload);
        }else if (node && node.name ==  "howToButtonNode"){
            game.emit('howToButton',payload)
        }else if (node && node.name == "howToX"){
            game.emit('howToXButton',payload)
        }else if (node && node.name == 'soundButtonNode'){
            game.emit('sound',payload)
        }else if (node && node.name == 'creditsButtonNode'){
            game.emit('credits',payload)
        }else if (node && node.name == 'creditsX'){
            game.emit('creditsX',payload)
        }
    }
    else if(event == 'mousemove' || event == 'touchmove'){
        if(payload.target.attributes.getNamedItem('data-fa-path')){
            var path = payload.target.attributes.getNamedItem(
                'data-fa-path').value;
        }else if (payload.target.parentNode.attributes.getNamedItem(
            'data-fa-path')){
            var path = payload.target.parentNode.attributes.getNamedItem(
                'data-fa-path').value;
        }
        if(path)
            var node = game.dispatch.getNode(path);
        if(game.started && game.started == true){
            followAction(payload);
        }
    }
};
createBoxNode();
createStartButtonNode();
createHowToButtonNode();
var gameBG = gameUI.addChild();
gameBG.name = 'background';
gameBG.setSizeMode('relative','relative')
    .setProportionalSize(1,1)
    .setAlign(0,0);
gameBG.DOMElement = new DOMElement(gameBG);
gameBG.DOMElement.setProperty('background-image', 'url(./images/space_new.png)')
    .setProperty('z-index','1')
    .setProperty('background-size','100% 100%');
game.gameLivesNode = gameUI.addChild();
game.gameLivesNode.name = 'gameLivesNode';
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
var posit = 0;
if(game.storage && window.localStorage._pos){
    posit = window.localStorage._pos;
}
var sound = new Howl({
    urls:['./assets/starcatcher.m4a'],
    loop: true
});
var bing = new Howl({
    urls:['./assets/bing.m4a'],
    volume: 0.35
});
var bomb = new Howl({
    urls:['./assets/bomb.m4a']
});
if(game.storage){
    if(window.localStorage.sound && window.localStorage.sound == "true"){
        window.localStorage.sound = game.sound;
        game.sound = true;
        sound.play(function(){
            sound.pos(posit);
        });
    }else if(window.localStorage.sound &&
        (window.localStorage.sound == "false" ||
         window.localStorage.sound == 'undefined')){
        game.sound = false;
    }else if(!window.localStorage.sound){
        window.localStorage.sound = true;
        game.sound = true;
        sound.play(function(){
            sound.pos(posit);
        });
    }
}else{
    game.sound = true;
    sound.play(function(){
        sound.pos(posit);
    });
}

var soundButtonNode = gameUI.addChild();
game.soundButtonNode = soundButtonNode;
soundButtonNode.name = 'soundButtonNode';
soundButtonNode.setSizeMode('absolute','absolute')
    .setAbsoluteSize(40,40)
    .setAlign(0,1)
    .setPosition(20,-170);
soundButtonNode.DOMElement = new DOMElement(soundButtonNode);
if(game.sound == true)
    var property = 'url(./images/music.png)'
else if (game.sound == false)
    var property = 'url(./images/music_off.png)'
soundButtonNode.DOMElement.setProperty(
    'background-image', property)
    .setProperty('z-index','20');
soundButtonNode.soundButtonNodeComponent = {
    id: null,
    node: null,
    onMount: function (node) {
        this.id = node.addComponent(this);
        this.node = node;
    },
    onReceive: function(event, payload){
        if(event == 'sound'){
            this.node.requestUpdate(this.id);
        }
    },
    onUpdate: function(time){
        if(game.sound){
            game.sound = false;
            sound.stop();
            this.node.DOMElement.setProperty(
                'background-image','url(./images/music_off.png)');
            if(game.storage)
                window.localStorage.sound = false;
        }else{
            game.sound = true;
            sound.play();
            this.node.DOMElement.setProperty(
                'background-image','url(./images/music.png)');
            if(game.storage)
                window.localStorage.sound = true;
        }
    }
}
soundButtonNode.addComponent(soundButtonNode.soundButtonNodeComponent);

var creditsButtonNode = gameUI.addChild();
game.creditsButtonNode = creditsButtonNode;
creditsButtonNode.name = 'creditsButtonNode';
creditsButtonNode.setSizeMode('absolute','absolute')
    .setAbsoluteSize(40,40)
    .setAlign(1,1)
    .setPosition(-60,-170);
creditsButtonNode.DOMElement = new DOMElement(creditsButtonNode);
creditsButtonNode.DOMElement.setProperty('background-image', 'url(./images/credits.png)')
    .setProperty('z-index','20');
creditsButtonNode.creditsButtonNodeComponent = {
    id: null,
    node: null,
    onMount: function (node) {
        this.id = node.addComponent(this);
        this.node = node;
    },
    onReceive: function(event, payload){
        if(event == 'credits'){
            this.node.requestUpdate(this.id);
        }
    },
    onUpdate: function(time){
        showCredits();
    }
}
creditsButtonNode.addComponent(creditsButtonNode.creditsButtonNodeComponent);

if(game.storage && window.localStorage.high_score){
    var highScoreNode = gameUI.addChild();
    game.highScoreNode = highScoreNode;
    highScoreNode.name = 'highScoreNode';
    var leng = window.localStorage.high_score.length;

    highScoreNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(50*leng,30)
        .setAlign(1,0)
        .setPosition(-25*leng, 0);
    highScoreNode.DOMElement = new DOMElement(highScoreNode);
    highScoreNode.DOMElement.setProperty('font-size', '40px')
        .setContent(window.localStorage.high_score)
        .setProperty('z-index','2')
        //.setProperty('text-align','left')
        .setProperty('color','white')
        .setProperty('opacity','0.5');
}
var gameTitle = gameUI.addChild();
gameTitle.name = 'title';
game.gameTitle = gameTitle;
gameTitle.setSizeMode('absolute','absolute')
    .setAbsoluteSize(345,45)
    .setAlign(0.5,0.2)
    .setPosition(-175,0);
gameTitle.DOMElement = new DOMElement(gameTitle);
gameTitle.DOMElement.setContent("Stars & Asteroids")
    .setProperty('z-index','1')
    .setProperty('font-size','45px')
    .setProperty('color','white');

function initGame() {
    if(world) world = null;
    world = new physics.PhysicsEngine(options);
    world.game = game;
    game.world = world;
    game.over = false;
    game.speed_reducer = 5;
    game.teir_reducer = 1;

    game.startButtonNode.setPosition(-1000,-1000);
    game.howToButtonNode.setPosition(-1000,-1000);
    game.soundButtonNode.setPosition(-1000,-1000);
    game.creditsButtonNode.setPosition(-1000,-1000);
    gameTitle.setPosition(-10000,-10000);
    document.body.style.cursor = "none";
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
            if(this.active != true){
                loadingScreen('start');
                this.active = true;
                collisionDetection();
                addEnemyUtil();
                game.emit('sequence_timed',{looping:true});
                loadingScreen('end');
            }
        }
    };
    gameEnemies.addComponent(gameEnemies.createEnemiesComponent);
    game.emit("createEnemies",{});
    var payload = {};
    payload.interrupt = true;
    game.emit('loop',payload);
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
        .setContent('0')
        .setProperty('color','white')
        .setProperty('z-index','2');
    game.score = 0;
    resetBody(game.boxNode.box);
}
function createStartButtonNode(restart) {
    var startButtonNode = gameUI.addChild();
    game.startButtonNode = startButtonNode;
    startButtonNode.name = "startButtonNode";
    startButtonNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(240,60)
        .setAlign(0.5,0.8)
        .setPosition(-120,-130);
    startButtonNode.DOMElement = new DOMElement(startButtonNode);
    var content = "Start Game"
    if(restart){
        content = 'Restart';
        startButtonNode.setAbsoluteSize(150,60)
            .setPosition(-75,-30);
    }

    startButtonNode.DOMElement.setProperty('font-size','46px')
        .setContent(content)
        .setProperty('z-index','2')
        .setProperty('color','white');
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
                var pause = sound.pause();
                var locat = pause._audioNode[0]._pos;
                if(game.storage){
                    window.localStorage._pos = locat;
                }
                location.reload();
            }else{
                game.started = true;
                initGame();
            }
        }
    }
    startButtonNode.addComponent(startComponent);
}
function createHowToButtonNode() {
    var howToButtonNode = gameUI.addChild();
    game.howToButtonNode = howToButtonNode;
    howToButtonNode.name = "howToButtonNode";
    howToButtonNode.setSizeMode('absolute','absolute')
        .setAbsoluteSize(190,60)
        .setAlign(0.5,0.8)
        .setPosition(-95,-60);
    howToButtonNode.DOMElement = new DOMElement(howToButtonNode);
    howToButtonNode.DOMElement.setProperty('font-size','30px')
        .setContent('How To Play')
        .setProperty('z-index','2')
        .setProperty('color','white');
    var howToComponent = {
        id: null,
        node: null,
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload){
            if(event == 'howToButton')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            howToPlay();
        }
    }
    howToButtonNode.addComponent(howToComponent);
}
function createBoxNode() {
    var boxNode = gameUI.addChild();
    game.boxNode = boxNode;
    boxNode.name = "boxNode";
    boxNode.framedata = fd.framedata.astro;
    game.idle = true;
    boxNode.ratio = 0.8;
    boxNode.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(80*boxNode.ratio, 120*boxNode.ratio)
        .setAlign(0.5,0.5)
        .setPosition(-40*boxNode.ratio,-60*boxNode.ratio,10000)
        .setOrigin(0.5, 0.5);
    boxNode.size = {w:80,h:120};
    boxNode.DOMElement = new DOMElement(boxNode);
    boxNode.DOMElement.setProperty(
            'background-image', 'url(./images/astro_loop.png)')
        .setProperty('background-size','800% 300%')
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
                var w = boxNode.size.w * boxNode.ratio,
                    h = boxNode.size.h * boxNode.ratio;
                boxNode.box = new Box({
                    mass: 1,
                    size: [w-10,h-5,40],
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
            var boxPosition = boxNode.box.getPosition();
            boxNode.setPosition(boxPosition.x-10, boxPosition.y-20, 10000);
            // rotation has to be set via quaternion
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
                        if(this.node.animationTransitionable)
                            this.node.animationTransitionable.halt();
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
                    this.node.animationTransitionable.from(0).to(
                        duration,
                        'linear',
                        duration,
                        null,
                        this.done,
                        this.node);
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
                var ratio = 1
                if(this.node.ratio) ratio = this.node.ratio;
                if(transition._state < 1){
                    animation.frameIterator = 0;
                    animation.msTimer = 0;
                }
                if(animation.frameIterator < frames.length){
                    if(transition._state <
                        (animation.msTimer +
                             frames[animation.frameIterator].ms + grace)
                    && transition._state >= (animation.msTimer - grace)
                    && animation != null) {
                        this.node.DOMElement.setProperty(
                            'background-position','-' +
                            (frames[animation.frameIterator].x*ratio)
                            + 'px ' + '-' +
                            (frames[animation.frameIterator].y*ratio) + 'px')
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
                        transition.from(0).to(
                            framedata.active.duration,
                            'linear',
                            framedata.active.duration,
                            null,
                            this.done,
                            this.node);
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
function addEnemy(color, speed, timing){
    var newEnemy = gameEnemies.addChild();
    newEnemy.name = "";
    var sizes = [35,40,50,55];
    var size = sizes[Math.floor(Math.random()*sizes.length)];
    newEnemy._size = size;
    newEnemy.setSizeMode('absolute', 'absolute')
        .setAbsoluteSize(size, size)
        .setAlign(0,0)
        .setPosition(-(size+5),-(size+5),3);
    newEnemy.DOMElement = new DOMElement(newEnemy);
    var image;
    if(color == 'yellow'){
        image = "url(./images/star.png)"
    }else if(color == 'rock'){
        image = 'url(./images/rock.png)'
    }else if (color == 'blue') {
        image = 'url(./images/star_b.png)'
    }else if (color == 'grey') {
        image = 'url(./images/star_g.png)'
    }else if (color == 'green') {
        image = 'url(./images/star_grn.png)'
    }else if (color == 'orange') {
        image = 'url(./images/star_oj.png)'
    }else if (color == 'pink') {
        image = 'url(./images/star_p.png)'
    }else if (color == 'red') {
        image = 'url(./images/star_gb.png)'
    }else if (color == 'purple') {
        image = 'url(./images/star_v.png)'
    }else if (color == 'black') {
        image = 'url(./images/star_blk.png)'
    }
    newEnemy.color = color;
    newEnemy.DOMElement.setProperty('background-image',image)
        .setProperty('background-size',"100% 100%")
        .setProperty('color','teal')
        .setProperty('font-size','24px')
        .setProperty('font-weight','bold')
        .setProperty('word-wrap','break-word')
        .setProperty('border-radius', "100%")
        .setProperty('text-align','center')
        //.setContent(
            //newEnemy._id.substring(newEnemy._id.length-2,newEnemy._id.length));
    var newEnemyPosition = newEnemy.getPosition();
    newEnemy._position = newEnemyPosition;
    newEnemy.sphere = new Sphere({
        mass: 1,
        radius: size/2,
        position:new Vec3(newEnemyPosition[0],newEnemyPosition[1],-100),
        restitution: 0,
        friction: 0
    });
    newEnemy.sphere.node = newEnemy;
    if(color != 'red')
        attractables.push(newEnemy.sphere);
    world.addBody(newEnemy.sphere);
    newEnemy.collision = world.addConstraint(
        new Collision([game.boxNode.box,newEnemy.sphere],{restitution:0})
    );
    resetBody(newEnemy.sphere);
    addEnemyComponent(newEnemy);
    setEnemyInMotion(newEnemy, speed, timing);
}
function addEnemyComponent(newEnemy){
    newEnemy.newEnemyComponent = {
        id: null,
        node: null,
        done: function(node){
            if(node in node._updater._updateQueue)
                FamousEngine._updateQueue.splice(node._updater._updateQueue.indexOf(node), 1);
            if(node._updateQueue && node._updateQueue.length)
                node._updateQueue = [];
            if(node._nextUpdateQueue && node._nextUpdateQueue.length)
                node._nextUpdateQueue = [];
            game.world.remove(node.collision);
            game.world.remove(node.sphere);
            game.activeEnemies.splice(game.activeEnemies.indexOf(node),1);
            node.dismount();
            resetBody(game.boxNode.box);
            /*
            node.sphere.setPosition(-100,-100,-100);
            resetBody(node.sphere);
            node.setPosition(-100,-100,3);
            node.requestUpdate(node.newEnemyComponent.id);
            */
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
function setEnemyInMotion(newEnemy, speed, timing){
    game.activeEnemies.push(newEnemy);
    var sidesOps = [1,2,3,4];
    var sideOp = sidesOps[Math.floor(Math.random()*sidesOps.length)];
    var size = newEnemy._size;
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
    var newEnemyPosition = newEnemy.getPosition();
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
    newEnemy.requestUpdate(newEnemy.newEnemyComponent.id);
    FamousEngine.getClock().setTimeout(function(){
         addEnemyUtil();
    }, timing);
}
function addEnemyUtil(){
    var cap = 92;
    if (game.score > 699) cap = 100;
    var x = Math.floor(Math.random()*cap);
    if (game.over == false) {
        var color = 'purple'; //debug 'yellow'
        if (x > 46 && x < 93) {
            color='black';     //rock
        }else if (x == 93){
            color='blue';     //blue
        }else if (x == 94) {
            color='grey';     //grey
        }else if (x == 95){
            color='blue';    //green
        }else if (x == 96){
            color='grey';   //orange
        }else if (x == 97){
            color='blue';     //pnk
        }else if (x == 98){
            color='grey';      //red
        }else if (x == 99){
            color='blue';   //purple
        }else if (x == 100){
            color='grey';    //black
        }
        var timings_teirs = [[500,800],[400,650],[300,500],[200,400],[100,250],[50,125]];
        var speed_range = [200,275];
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
        addEnemy(color, speed, timing);
    }
}
function followAction(event){
    if(!game.boxNode.box){
        createBoxNode();
    }
    var newPosX, newPosY
    if(event.type == "touchmove"){
        newPosX = event.touches[0].clientX - (game.boxNode.size.w/2);
        newPosY = event.touches[0].clientY - (game.boxNode.size.h/2);
    }else {
        newPosX = event.clientX - (game.boxNode.size.w/2);
        newPosY = event.clientY - (game.boxNode.size.h/2);
    }
    if(game.warp || game.idle){
        if(!game.previousPosition){
            game.previousPosition = {
                x:newPosX,
                y:newPosY
            };
            game.idle = false;
        }
        game.boxNode.box.setPosition(newPosX,newPosY,0);
    }else if(!game.warp && game.previousPosition){
        var xDiff = Math.abs(game.previousPosition.x - newPosX);
        var yDiff = Math.abs(game.previousPosition.y - newPosY);
        if(xDiff > 179 || yDiff > 179){
            return;
        }else{
            game.boxNode.box.setPosition(newPosX,newPosY,0);
        }
        game.previousPosition = {
            x: newPosX,
            y: newPosY
        }
    }
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
        slowTimeBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),130,1);
        slowTimeBarTimerNode.DOMElement = new DOMElement(slowTimeBarTimerNode);
        slowTimeBarTimerNode.DOMElement
            .setProperty('background-color','grey')
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
                .setProperty('background-color','blue')
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
function setWarp(){
    if(!game.warp){
        game.warp = true;
        var warpBarTimerNode = gameUI.addChild();
        game.warpBarTimerNode = warpBarTimerNode;
        warpBarTimerNode.name = "warpBarTimerNode";
        warpBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        warpBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-130,1);
        warpBarTimerNode.DOMElement = new DOMElement(warpBarTimerNode);
        warpBarTimerNode.DOMElement
                .setProperty('background-color','purple')
                .setProperty('opacity','0.5');
        warpBarTimerNode.warpBarTimerComponent = {
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
                delete game.warp;
                delete game.warpBarTimerNode.DOMElement;
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
                    if(diffTime > 5000){
                        this.done(this.node);
                    }
                    else {
                        var percentage = diffTime / 5000;
                        percentage = 0.9 * (1 - percentage)
                        this.node.setProportionalSize(percentage,null);
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        warpBarTimerNode.addComponent(warpBarTimerNode.warpBarTimerComponent);
        warpBarTimerNode.requestUpdate(warpBarTimerNode.warpBarTimerComponent.id);
    }else{
        game.warpBarTimerNode.warpBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
function setMagenetic(){
    if(!game.magnetic){
        game.magnetic = true;
        var magneticBarTimerNode = gameUI.addChild();
        game.magneticBarTimerNode = magneticBarTimerNode;
        magneticBarTimerNode.name = "magneticBarTimerNode";
        magneticBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        magneticBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-100,1);
        magneticBarTimerNode.DOMElement = new DOMElement(magneticBarTimerNode);
        magneticBarTimerNode.DOMElement
                .setProperty('background-color','grey')
                .setProperty('opacity','0.4');
        magneticBarTimerNode.magneticBarTimerComponent = {
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
                delete game.magnetic;
                delete game.magneticBarTimerNode.DOMElement;
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
                    if(diffTime > 5000){
                        this.done(this.node);
                    }
                    else {
                        var percentage = diffTime / 5000;
                        percentage = 0.9 * (1 - percentage)
                        this.node.setProportionalSize(percentage,null);
                    }
                }
                if(game.gravity)
                    game.gravity.update();
                var gravity = new Gravity3D(game.boxNode.box, attractables, {
                    strength:100000000
                });
                game.gravity = gravity;

                this.node.requestUpdate(this.id);
            }
        }
        magneticBarTimerNode.addComponent(magneticBarTimerNode.magneticBarTimerComponent);
        magneticBarTimerNode.requestUpdate(magneticBarTimerNode.magneticBarTimerComponent.id);
    }else{
        game.magneticBarTimerNode.magneticBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
function manageLives(gameLivesComponent, op) {
    game.lives += op;
    if(op == 1 && game.lives <= 3){
        var i = game.lives;
        var newLifeNode = game.gameLivesNode.addChild();
        newLifeNode.setSizeMode('absolute','absolute')
            .setAbsoluteSize(40,38)
            .setAlign(0.5,0.5)
            .setPosition((-120)+(40*i),0,1);
        newLifeNode.DOMElement = new DOMElement(newLifeNode);
        newLifeNode.DOMElement.setProperty('background-image','url(./images/life.png)')
            .setProperty('background-size','100%')
            .setProperty('z-index','10000')
            .setProperty('opacity','0.5')
            .setProperty('padding','5px 0px');
    }else if(op == -1 && gameLivesComponent.node._children[gameLivesComponent.node._children.length-1] != null) {
        gameLivesComponent.node._children[gameLivesComponent.node._children.length-1].dismount();
        gameLivesComponent.node._children.splice(gameLivesComponent.node._children.length - 1,1)
    }
    if(game.lives > 3)game.lives = 3;
}
function gameOver(){
    gameEnemies.removeComponent(gameEnemies.collisionComponent);

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
    //score.setContent = score.content;
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
        .setProperty('background','none')
        .setProperty('color','white');
    createStartButtonNode(true);
    score.setAlign(0.5,0.3,0);
    score.DOMElement.setProperty('opacity','1.0');
    game.started = false;
    game.boxNode.setAlign(0.5,0.7)
        .setPosition(-20,-20,1000);
    game.idle = true;
    document.body.style.cursor = "auto";
    if(game.storage == true
    && window.localStorage.high_score
    && window.localStorage.high_score < game.score)
        window.localStorage.high_score = game.score;

    if(game.storage == true
    && window.localStorage.games > 3){
        loadAd();
    }
}
function loadAd(){
    var shadow = gameUI.addChild();
    game.shadow = shadow;
	shadow.setSizeMode('relative','relative')
        .setProportionalSize(1,1)
        .setAlign(0,0)
        .setPosition(0,0);
    shadow.DOMElement = new DOMElement(shadow);
    shadow.DOMElement.setProperty('background-color', 'black')
        .setProperty('opacity','0.5');
    //?load AD?
}
function howToPlay(){
    game.soundButtonNode.setPosition(-1000,-1000);
    game.creditsButtonNode.setPosition(-1000,-1000);
    game.boxNode.box.setPosition(-1000, -1000, 10000);
    game.startButtonNode.setPosition(-1000,-1000);
    game.howToButtonNode.setPosition(-1000,-1000);
    game.gameTitle.setPosition(-10000,-10000);

    var shadow = gameUI.addChild();
    game.shadow = shadow;
	shadow.setSizeMode('relative','relative')
        .setProportionalSize(1,1)
        .setAlign(0,0)
        .setPosition(0,0);
    shadow.DOMElement = new DOMElement(shadow);
    shadow.DOMElement.setProperty('background-color', 'black')
        .setProperty('opacity','0.5');

    var rulesView = gameUI.addChild();
    game.rulesView = rulesView;
    rulesView.name = "rulesView";
    rulesView.setSizeMode('relative','relative')
        .setProportionalSize(0.9,0.8)
        .setAlign(0,0)
        .setPosition(20,35);
    rulesView.DOMElement = new DOMElement(rulesView, {id:'rulesView'});
    rulesView.DOMElement.setProperty('color','white')
        .setProperty('font-size','22px')
        .setContent("Collect the Stars and avoid the Rocks!<br>"
            + "Don't lift your finger off the screen<wbr> except if you get the Warp powerup!!<br>"
            + "The key to a high score<wbr> "
			+ "is to collect powerups and use them to your<wbr> advantage!<br><br>"
            + "Yellow<div id='yellow'></div> - gives you some points!<br>"
			+ "Blue<div id='blue'></div> - makes you invincible for 3 seconds!<br>"
			+ "Grey<div id='grey'></div> - slows down time by 1/2 for 3 seconds!<br>"
			+ "Green<div id='green'></div> - reduces how often objects are spawned!<br>"
			+ "Orange<div id='orange'></div> - reduces how fast objects<wbr> are launched!<br>"
			+ "Pink<div id='pink'></div> - gives you a thousand points instantly!<br>"
			+ "Red<div id='gainsboro'></div> - gives you an exra life (up to 2)!<br>"
			+ "Purple<div id='purple'></div> - makes you master of warp holes for 5 seconds!<br>"
			+ "Black<div id='black'></div> - makes all stars attracted to you for 5 seconds!")
        .setProperty('zIndex','98');

    var howToX = gameUI.addChild();
    howToX.name = "howToX";
    game.howToX = howToX;
    howToX.setSizeMode('absolute','absolute')
        .setAbsoluteSize('40','40')
        .setAlign(0.9,0)
        .setPosition(-10,40);
    howToX.DOMElement = new DOMElement(howToX);
    howToX.DOMElement.setContent("X")
        .setProperty('zIndex','98')
        .setProperty('color','white')
        .setProperty('font-size','24px');

    var howToXComponent = {
        id: null,
        node: null,
        gameOver: arguments[0],
        onMount: function (node) {
            this.id = node.addComponent(this);
            this.node = node;
        },
        onReceive: function (event, payload){
            if(event == 'howToXButton')
                this.node.requestUpdate(this.id);
        },
        onUpdate: function() {
            removeHowTo();
        }
    }
    howToX.addComponent(howToXComponent);
}
function removeHowTo(){
    game.howToX.setPosition(-1000,-1000);
    game.shadow.setPosition(-1000,-1000);
    game.rulesView.DOMElement.setId(" ");
	game.rulesView.setPosition(-10000,-10000);

    game.startButtonNode.setPosition(-120,-130);
	game.howToButtonNode.setPosition(-95, -60);
    game.boxNode.box.setPosition(
        -40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
    game.soundButtonNode.setPosition(20,-170);
    game.creditsButtonNode.setPosition(-60,-170);
    game.gameTitle.setPosition(-175,0);
}
function showCredits(){
    game.soundButtonNode.setPosition(-1000,-1000);
    game.creditsButtonNode.setPosition(-1000,-1000);
    game.gameTitle.setPosition(-10000,-10000);
    if(!game.shadow){
        var shadow = gameUI.addChild();
        game.shadow = shadow;
    	shadow.setSizeMode('relative','relative')
            .setProportionalSize(1,1)
            .setAlign(0,0)
            .setPosition(0,0);
        shadow.DOMElement = new DOMElement(shadow);
        shadow.DOMElement.setProperty('background-color', 'black')
            .setProperty('opacity','0.5');
    }else if (game.shadow){
        game.shadow.setPosition(0,0);
    }
    if(!game.creditsView){
        var creditsView = gameUI.addChild();
        game.creditsView = creditsView;
        creditsView.name = "creditsView";
        creditsView.setSizeMode('relative','relative')
            .setProportionalSize(0.9,0.9)
            .setAlign(0,0)
            .setPosition(20,65);
        creditsView.DOMElement = new DOMElement(creditsView);
        creditsView.DOMElement.setProperty('color','white')
            .setProperty('font-size','22px')
            .setContent("Stars & Asteroids was designed, created, and developed by Semyon Karaman<br>"
                +"Music by Ryan Mixey<br>"
                +"Sound Effects courtesy of www.freesfx.co.uk<br>"
                +"Comments, criticism, concerns, bugs? email me at semyonkaraman@gmail.com<br>"
                +"Made with HTML5, Famous.org, & Cocoon.io")
            .setProperty('zIndex','98');
        game.boxNode.box.setPosition(-1000, -1000, 10000);
        game.startButtonNode.setPosition(-1000,-1000);
        game.howToButtonNode.setPosition(-1000,-1000);
    }else if(game.creditsView){
        game.creditsView.setPosition(20,65)
    }
    if(!game.creditsX){
        var creditsX = gameUI.addChild();
        creditsX.name = "creditsX";
        game.creditsX = creditsX;
        creditsX.setSizeMode('absolute','absolute')
            .setAbsoluteSize('40','40')
            .setAlign(0.9,0)
            .setPosition(-10,40);
        creditsX.DOMElement = new DOMElement(creditsX);
        creditsX.DOMElement.setContent("X")
            .setProperty('zIndex','98')
            .setProperty('color','white')
            .setProperty('font-size','24px');
        var creditsXComponent = {
            id: null,
            node: null,
            gameOver: arguments[0],
            onMount: function (node) {
                this.id = node.addComponent(this);
                this.node = node;
            },
            onReceive: function (event, payload){
                if(event == 'creditsX')
                    this.node.requestUpdate(this.id);
            },
            onUpdate: function() {
                hideCredits();
            }
        }
        creditsX.addComponent(creditsXComponent);
    }else if (game.creditsX){
        game.creditsX.setPosition(-10,40)
    }
};
function hideCredits(){
    game.shadow.setPosition(-10000,-10000);
    game.creditsView.setPosition(-1000,-1000);
    game.creditsX.setPosition(-1000,-1000);

	game.startButtonNode.setPosition(-120,-130);
	game.howToButtonNode.setPosition(-95, -60);
    game.boxNode.box.setPosition(
        -40*game.boxNode.ratio,-60*game.boxNode.ratio,10000);
    game.soundButtonNode.setPosition(20,-170);
    game.creditsButtonNode.setPosition(-60,-170);
    game.gameTitle.setPosition(-175,0);
};
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
                        enemyType = enemy.color;
                        enemy.newEnemyComponent.done(enemy);
                        if(!constraint.detected){
                            constraint.detected = true;
                            if(enemyType == 'yellow'){
                                if(game.sound)
                                    bing.play();
                                var score = enemy._size * 2;
                                updateScore(score);
                            }else if(enemyType == 'rock'){
                                if(game.sound)
                                    bomb.play();
                                if(!game.invincible && game.lives == 1){
                                    gameOver();
                                }else if (!game.invincible){
                                    game.emit('manageLives',{'life':-1});
                                }
                            }else if(enemyType == 'blue'){
                                if(game.sound)
                                    bing.play();
                                setInvincible();
                            }else if(enemyType == 'grey'){
                                if(game.sound)
                                    bing.play();
                                setSlowTime();
                            }else if (enemyType == 'green') {
                                if(game.sound)
                                    bing.play();
                                game.teir_reducer += 2;
                            }else if (enemyType == 'orange') {
                                if(game.sound)
                                    bing.play();
                                game.speed_reducer += 10;
                            }else if (enemyType == 'pink') {
                                if(game.sound)
                                    bing.play();
                                updateScore(1000);
                            }else if (enemyType == 'red') {
                                if(game.sound)
                                    bing.play();
                                game.emit('manageLives',{'life':1});
                            }else if (enemyType == 'purple') {
                                if(game.sound)
                                    bing.play();
                                setWarp();
                            }else if (enemyType == 'black') {
                                if(game.sound)
                                    bing.play();
                                setMagenetic();
                            }
                        }
                    }
                }
            }
            world.update(time);
            if(!game.over)
                updateScore(1);
            this.node.requestUpdate(this.id);
        }
    };
    gameEnemies.collisionComponent = collisionComponent;
    gameEnemies.addComponent(collisionComponent);
    gameEnemies.requestUpdate(collisionComponent.id);
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
