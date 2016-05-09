var world;
var gameVars = {};
gameVars.bodies = [];	// instances of b2Body (from Box2D)
gameVars.actors = [];	// instances of Bitmap (from IvanK)
gameVars.up;
gameVars.char = {};
gameVars.fontLoader = 0;
function Start() {
	function Animate(){
		// callbacks are funcions that are run on every
		// animate update, things like collision detection,
		// moving pieces, etc belong here, use the addCallback and destroyCallback
		// proto functions to manipulate this array
		this.callbacks = [updateEnemyByBody];
	}
	Animate.prototype.animate = function animate(e){
		var z = fps.getFPS();
		if(document.querySelector("#fps"))
			document.querySelector("#fps").innerHTML = z;
		if(animator.callbacks){
			for(var c in animator.callbacks){
				animator.callbacks[c]();
			}
		}
		//IvanK.js Event.ENTER_FRAME takes care of calling the next frame update ;)
	}
	Animate.prototype.addCallback = function addCallback(callback) {
		this.callbacks.push(callback);
	}
	Animate.prototype.destroyCallback = function destroyCallback(callback){
		this.callbacks.splice(this.callbacks.indexOf(callback),1);
	}
	var res = window.devicePixelRatio;
	// Matter.js module aliases
	var Engine = Matter.Engine,
	    World = Matter.World,
	    Bodies = Matter.Bodies,
		Body = Matter.Body,
		Vector = Matter.Vector,
		Events = Matter.Events;
		// create a Matter.js engine
		// engine render object
	// setting the matterRender and the IvanK renderer to /2 height for debugging,
	var matterRender = {render: {element: document.body,controller: Matter.Render,
		options: {
			width:window.innerWidth,
			height:(window.innerHeight/2),
			wireframeBackground: 'images/bj.png',
			pixelRatio: res
		}
	}};
	var engine = Engine.create(matterRender);
	engine.enableSleeping = true;
	var mouse = Matter.MouseConstraint.create(engine, {
		mouse: Matter.Mouse.create(document.getElementById('c'))
	});
	engine.world.gravity = {scale:0.001,x:0,y:0};
	var stage = new Stage("c",{w:window.innerWidth,h:window.innerHeight/2});
	stage.updateLayersOrder = function () {
		stage._children.sort(function(a,b) {
			a.zIndex = a.zIndex || 0;
			b.zIndex = b.zIndex || 0;
			return b.zIndex - a.zIndex
		});
	};
	document.stage = stage;
	var gameSize = {
		h: document.stage.stageHeight/res,
		w: document.stage.stageWidth/res
	}
	var animator = new Animate();
	stage.addEventListener(Event.ENTER_FRAME, animator.animate);
	//bg
	var bmD = new BitmapData('./images/space.png')
	var s = new Sprite();
	gameVars.bg = s;
	s.graphics.beginBitmapFill(bmD);
	s.graphics.drawRect(0,0,gameSize.w*2,gameSize.h*2);
	//s.graphics.drawRect(0,0,gameSize.w*2,gameSize.h*2);
	s.scaleY = ((gameSize.h*2) / 300) * (res/2);
	s.scaleX = ((gameSize.w*2) / 300) * (res/2);
	s.zIndex = 100;
	stage.addChild(s);
	stage.updateLayersOrder()
	var cS = 40;
	gameVars.char.body = Bodies.rectangle( (gameSize.w/2), (gameSize.h/2), cS, cS, { isStatic: true});
	gameVars.char.sprite =
		(function(){
			var texture = new BitmapData('./images/astro_loop.png')
			var bm = new MBitmap(texture, 3, 8);
			bm.x = gameVars.char.body.vertices[0].x*res;
			bm.y = gameVars.char.body.vertices[0].y*res;
			bm.scaleX = bm.scaleY = (cS/(80/res));
			//bm.play(6);
			bm.w = cS*res;
			bm.h = cS*res;
			/*var sprite = new Sprite();
			sprite.addChild(bm);
			sprite.x = 100;// gameVars.char.body.position.x;
			sprite.y = 100;//gameVars.char.body.position.y;
			return sprite;*/
			return bm;
		})();
	//gameVars.bodies.push(gameVars.char.body);
	//gameVars.actors.push(gameVars.char);
	gameVars.char.sprite.zIndex = 1;
	gameVars.char.body.sleepThreshold = -1;
	World.add(engine.world,gameVars.char.body);
	stage.addChild(gameVars.char.sprite);
	stage.updateLayersOrder();



	var scoreFormat = new TextFormat("Conductive", 30*res, 0xFFFFFF, false, false, 'center');
	gameVars.scoreView = new TextField();
	gameVars.scoreView.selectable = false;
	gameVars.scoreView.setTextFormat(scoreFormat);
	gameVars.scoreView.text = "0";
	gameVars.scoreView.x = (gameSize.w/2-((gameVars.scoreView._textW/res)/1.5))*res;
	gameVars.scoreView.y = (gameSize.h/2-100)*res;
	gameVars.scoreView.alpha = 0.5;
	gameVars.scoreView.width = gameVars.scoreView._textW;
	gameVars.scoreView.height = gameVars.scoreView._textH;
	gameVars.score = 0;
	gameVars.scoreView.zIndex = 99;
	stage.addChild(gameVars.scoreView);
	stage.updateLayersOrder();

	gameVars.teir_reducer = 1;
	gameVars.speed_reducer = 1;
	gameVars.score = 0;
	gameVars.invincible = false;
	gameVars.lives = 1;
	gameVars.timings_teirs = [[500,1000],[400,700],[300,500],[200,400],[100,250],[50,125]];
	gameVars.speed_range = [250,300];
	gameVars.speed=0;
	gameVars.sizes = [30,40,50,60];
	gameVars.sidesOps = [1,2,3,4];
	Engine.run(engine);
	createStartButton();
	function initGame(){
		stage.removeChild(gameVars.startButton);

		gameVars.gameLives = new Sprite();
		var livesBD = new BitmapData('./images/life.png')
		var h = 26;
		var w = 25 * gameVars.lives;
		var livesBM = new Bitmap(livesBD);
		gameVars.gameLives.addChild(livesBM);
		gameVars.gameLives.x = (gameSize.w/2) - 20;
		gameVars.gameLives.y = 10;
		gameVars.gameLives.scaleX = (20/(w/res));
		gameVars.gameLives.scaleY = (20/(h/res));
		gameVars.gameLives.zIndex = 10;
		stage.addChild(gameVars.gameLives);
		stage.updateLayersOrder();
		addEnemyUtil();
		animator.addCallback(checkForBFR);
		Events.on(mouse, 'mousemove', positionChar);
		animator.addCallback(updateOne);
		gameVars.char.sprite.gotoAndLoop(9 , 22, 5);
	}
	// collision detection in PE
	Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;
		for(n in pairs){
			var pair = pairs[n];
			var body;
			if(pair.bodyA.name){
				body = pair.bodyA;
			}else{
				body = pair.bodyB;
			}
			var index = gameVars.bodies.indexOf(pair.bodyB);
			if(index == -1){
				continue;
			}
			var enemyType = gameVars.actors[index].sprite.color;
			var score =  gameVars.actors[index].sprite.ss;
			if(enemyType == 'black'){
				done(index);
                updateScore(score);
            }else if(enemyType == 'red'){
				done(index);
                if(!gameVars.invincible && gameVars.lives == 1){
                    gameOver();
                }else if (!gameVars.invincible){
                    manageLives(-1);
                }
            }else if(enemyType == 'blue'){
				done(index);
                setInvincible();
            }else if(enemyType == 'grey'){
				done(index);
                setSlowTime();
            }else if (enemyType == 'green') {
				done(index);
                gameVars.teir_reducer += 2;
            }else if (enemyType == 'yellow') {
				done(index);
                gameVars.speed_reducer += 10;
            }else if (enemyType == 'orange') {
				done(index);
                updateScore(1000);
            }else if (enemyType == 'purple') {
				done(index);
                manageLives(1);
            }else if (enemyType == 'violet') {
				done(index);
                setMagenetic();
            }else if (enemyType == 'gainsboro') {
				done(index);
                setWarp();
            }
		}
    });
	function updateOne(){
		updateScore(1);
	}
	function updateScore(score){
		gameVars.score += Math.round(score);
		animator.addCallback(function(){
			gameVars.scoreView.text = gameVars.score;
			gameVars.scoreView.x = (gameSize.w/2-((gameVars.scoreView._textW/res)/1.5))*res;
			gameVars.scoreView.width = gameVars.scoreView._textW;
			gameVars.scoreView.height = gameVars.scoreView._textH;
			animator.destroyCallback(this);
		});
	}
	function addEnemyUtil(){
		gameVars.speed = Math.floor(
		   (Math.floor(Math.random()*(gameVars.speed_range[1]-gameVars.speed_range[0]))+gameVars.speed_range[0])
		   + (Math.floor(Math.random()*((gameVars.score/100)+1))/ gameVars.speed_reducer));
		var i=0;
	   	if ((gameVars.score/gameVars.teir_reducer) < 200 ){
			i=0
	   	}else if ((gameVars.score/gameVars.teir_reducer)< 400 ) {
		   	i=1;
	   	}else if ((gameVars.score/gameVars.teir_reducer)< 800) {
		   	i=2;
	   	}else if ((gameVars.score/gameVars.teir_reducer)< 1600) {
		   	i=3;
	   	}else if ((gameVars.score/gameVars.teir_reducer)< 2400) {
		   	i=4;
	   	}else if ((gameVars.score/gameVars.teir_reducer)>= 2400) {
		   	i=5;
	   	}
	   	var timing_teir = gameVars.timings_teirs[i];
	   	var timing = Math.floor(Math.random()*(timing_teir[1] - timing_teir[0])) + timing_teir[0];
	   	addEnemy(gameVars.speed,timing);
	}
	function addEnemy(speed, timing){
		if(!gameVars.over){
			var size = gameVars.sizes[Math.floor(Math.random()*gameVars.sizes.length)];
			var sideOp = gameVars.sidesOps[Math.floor(Math.random()*gameVars.sidesOps.length)];
			var newEnemy = {};
			newEnemy.body = PhysicsObject(newEnemy, sideOp, size, speed);
			newEnemy.sprite = SpriteObject(newEnemy, size);
			gameVars.actors.push(newEnemy);
			World.add(engine.world, newEnemy.body);
			setTimeout(function(){
			    addEnemyUtil();
			},timing);
		}
	}
	function SpriteObject(newEnemy, size) {
		var colors = [],
			ran = Math.random(),
			x = Math.floor(ran*100);
		gameVars.texture = new BitmapData('./images/rock.png');
		var w = 105;
		var h = 105;
		if(gameVars.score < 699){
			var color = 'red';
			if (x > 50) {
				color='black';
				gameVars.texture = new BitmapData('./images/star.png');
				w = 105;
				h = 105;
			}
		}else{
			colors = ['red','black','blue','grey','green','yellow','orange','purple'];
			color = colors[0];
			if (x > 47 && x < 94) {
				color=colors[1];
				gameVars.texture = new BitmapData('./images/star.png');
				w = 200;
				h = 200;
			}else if (x == 95){
				color=colors[2];
				gameVars.texture = new BitmapData('./images/star_b.png');
				w = 200;
				h = 200;
			}else if (x == 96) {
				color=colors[3];
				gameVars.texture = new BitmapData('./images/star_g.png');
				w = 200;
				h = 200;
			}else if (x == 97){
				color=colors[4];
				gameVars.texture = new BitmapData('./images/star_grn.png');
				w = 200;
				h = 200;
			}else if (x == 98){
				color=colors[5];
				gameVars.texture = new BitmapData('./images/star_y.png');
				w = 200;
				h = 200;
			}else if (x == 99){
				color=colors[6];
				gameVars.texture = new BitmapData('./images/star_oj.png');
				w = 200;
				h = 200;
			}else if (x == 100){
				color=colors[7];
				gameVars.texture = new BitmapData('./images/star_p.png');
				w = 200;
				h = 200;
			}
		}
		var bm = new Bitmap(gameVars.texture);
		//bm.x= -13;
		//bm.y= - 18.5;
		var bunny = new Sprite();
		newEnemy.sprite = bunny;
		bunny.color = color;
		bunny.ss = size;
		bunny.addChild(bm);
		bunny.x = (newEnemy.body.position.x-size)*res;
		bunny.y = (newEnemy.body.position.y-size)*res;
		bunny.scaleX = (size/(w/res));
		bunny.scaleY = (size/(h/res));
		bunny.zIndex = 98;
		stage.addChild(bunny);
		stage.updateLayersOrder();
		return bunny;
	}
	function PhysicsObject(newEnemy, sideOp, size, speed) {
		var x, y, circle,
			diag = Math.random() < 0.5 ? true : false,
			speed = speed/100;
		switch (sideOp) {
			case 1:
				x = gameSize.w + (size/2);
				y = (Math.round(Math.random()*gameSize.h)+size)/2;
				circle = Bodies.circle(x, y, size/2);
				circle.name = "right";
				if(diag == true){
					if(y > (gameSize.h/2)){
						Matter.Body.setVelocity(circle, {x: -speed,y: -speed});
					}else{
						Matter.Body.setVelocity(circle, {x: -speed,y: speed});
					}
				}else{
					Matter.Body.setVelocity(circle, {x: -speed,y: 0});
				}
			break;
			case 2:
				x = 0 - (size/2);
				y = (Math.round(Math.random()*gameSize.h)+size)/2;
				circle = Bodies.circle(x, y, size/2);
				circle.name = "left";
				if(diag == true){
					if(y > (gameSize.h/2)){
						Matter.Body.setVelocity(circle, {x: speed,y: -speed});
					}else{
						Matter.Body.setVelocity(circle, {x: speed,y: speed});
					}
				}else{
					Matter.Body.setVelocity(circle, {x: speed,y: 0});
				}
			break;
			case 3:
				x = (Math.round(Math.random()*gameSize.w)+size)/2;
				y = gameSize.h + (size/2);
				circle = Bodies.circle(x, y, size/2);
				circle.name = "bottom";
				if(diag == true){
					if(x > (gameSize.w/2)){
						Matter.Body.setVelocity(circle, {x: -speed,y: -speed});
					}else {
						Matter.Body.setVelocity(circle, {x: speed,y: -speed});
					}
				}else{
					Matter.Body.setVelocity(circle, {x: 0,y: -speed});
				}
			break;
			case 4:
				x = (Math.round(Math.random()*gameSize.w)+size)/2;
				y = 0 - (size/2);
				circle = Bodies.circle(x, y, size/2);
				circle.name = "top";
				if(diag == true){
					if(x > (gameSize.w/2)){
						Matter.Body.setVelocity(circle, {x: -speed,y: speed});
					}else{
						Matter.Body.setVelocity(circle, {x: speed,y: speed});
					}
				}else{
					Matter.Body.setVelocity(circle, {x: 0,y: speed});
				}
			break;
		}
		circle.friction = 0;
		circle.frictionAir = 0;
		var defaultCat = 0x0001;
		var secondCat = 0x0002;
		circle.collisionFilter.category = secondCat;
		circle.collisionFilter.mask = defaultCat;
		gameVars.bodies.push(circle);
		newEnemy.body = circle;
		return circle;
	}
	function done(index){
		World.remove(engine.world, gameVars.bodies[index]);
		stage.removeChild(gameVars.actors[index].sprite);
		gameVars.bodies.splice(index,1);
		gameVars.actors.splice(index,1);
	}
	function checkForBFR(){
		if (gameVars.fontLoader <= 3){
			updateScore(0);
			gameVars.fontLoader++;
		}
		for(n in gameVars.bodies){
			var body = gameVars.bodies[n];
			if(body.position.x-100 > gameSize.w
			|| body.position.y-100 > gameSize.h
			|| body.position.x+100 < 0
			|| body.position.y+100 < 0)
				done(n);
		}
	}
	function updateEnemyByBody(){
		for(var i=0; i<gameVars.actors.length; i++){
			var body  = gameVars.bodies[i];
			var bunny = gameVars.actors[i].sprite;
			var p = body.position;
			var size = body.circleRadius;
			bunny.x = (p.x-size)*res;	// updating bunny
			bunny.y = (p.y-size)*res;
			bunny.rotation = body.angle*180/Math.PI;
		}
	}
	function positionChar(event){
		Matter.Body.setPosition(gameVars.char.body,
			Matter.Vector.create(event.mouse.position.x/res,event.mouse.position.y/res)
		);
		gameVars.char.sprite.x = event.mouse.position.x-(gameVars.char.sprite.w)/2;
		gameVars.char.sprite.y = event.mouse.position.y-(gameVars.char.sprite.h)/2;

	}
	function gameOver(){
	    var allEnemies = gameVars.actors;
	    while(allEnemies.length){
	        if(allEnemies[0]==null){
	            allEnemies.splice(0,1)
	            continue;
	        }
	        done(0);
	    }
		animator.destroyCallback(updateEnemyByBody);
		animator.destroyCallback(checkForBFR);
	    gameVars.over = true;

	    var gameOverFormat = new TextFormat("Conductive", 30*res, 0xFFFFFF, false, false, 'left');
		gameVars.gameOverView = new TextField();
		gameVars.gameOverView.selectable = false;
		gameVars.gameOverView.setTextFormat(gameOverFormat);
		gameVars.gameOverView.text = "Game Over";
		gameVars.gameOverView.x = (gameSize.w/2 - ((gameVars.gameOverView._textW/res)/2))*res;
		gameVars.gameOverView.y = (gameSize.h/2-100)*res;
		gameVars.gameOverView.width = gameVars.gameOverView._textW;
		gameVars.gameOverView.height = gameVars.gameOverView._textH;
		gameVars.gameOverView.zIndex = 99;
		stage.addChild(gameVars.gameOverView);
		stage.updateLayersOrder();

		createStartButton('restart');
		gameVars.scoreView.y = (gameSize.h/2)*res;
	    gameVars.started = false;
		Events.off(mouse,'mousemove', positionChar);
		animator.destroyCallback(updateOne);


		/*game.boxNode.setAlign(0.5,0.7)
	        .setPosition(-20,-20,1000);
	    game.boxNode.idle = true;
	    document.body.style.cursor = "auto";
		*/
	    if(gameVars.storage.available == true
	    && window.localStorage.high_score
	    && window.localStorage.high_score < gameVars.score)
	        window.localStorage.high_score = gameVars.score;
	}
	function createStartButton() {
	    var startButtonFormat = new TextFormat("Conductive", 30*res, 0xFFFFFF, false, false, 'left');
		gameVars.startButtonView = new TextField();
		gameVars.startButtonView.selectable = false;
		gameVars.startButtonView.setTextFormat(startButtonFormat);
		if (arguments.length > 0) gameVars.startButtonView.text = "Restart";
		else gameVars.startButtonView.text = "Start Game";
		gameVars.startButtonView.x = (gameSize.w/2-((gameVars.startButtonView._textW/res)/2))*res;
		gameVars.startButtonView.y = (gameSize.h/2 + 100)*res;
		gameVars.startButtonView.width = gameVars.startButtonView._textW;
		gameVars.startButtonView.height = gameVars.startButtonView._textH;
		gameVars.startButton = new Sprite();
		gameVars.startButton.addChild(gameVars.startButtonView);
		gameVars.startButton.zIndex = 98;
		gameVars.startButton.addEventListener(MouseEvent.CLICK, startGame);
		stage.addChild(gameVars.startButton);
		stage.updateLayersOrder();
	}
	function startGame(){
		if(gameVars.over)
			location.reload();
		else{
			initGame();
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
}
var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function(){
		this.frameNumber++;
		var d = new Date().getTime(),
		currentTime = ( d - this.startTime ) / 1000,
		result = Math.floor( ( this.frameNumber / currentTime ) );
		if( currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;
	}
};
function MBitmap(bd, rows, cols){
	Sprite.call(this);
	// public
	this.bitmapData = bd;
	this.totalFrames = rows*cols;
	this.currentFrame = 0;
 	this.isPlaying = false;
	this.loop = false;
	this.loopEnd = 0;
	this.loopStart = 0;
	// private
	this._rows = rows;  this._cols = cols;
	this._frames = [];
	this._time = 0; this._step = 1;
	if(bd.width == 0) // not loaded
        bd.loader.addEventListener2(Event.COMPLETE, this._init, this);
    else this._init();
}
MBitmap.prototype = new Sprite();
MBitmap.prototype._init = function(e){
	var fx = 1/this._cols, fy = 1/this._rows;
	var w = this.bitmapData.width *fx, h = this.bitmapData.height*fy;
   	for(var y=0; y<this._rows; y++)
        for(var x=0; x<this._cols; x++){
        	var gr = new Graphics();
        	gr.beginBitmapFill(this.bitmapData);
        	gr.drawTriangles([0,0, w,0, 0,h, w,h], [0,1,2, 1,2,3],
        		[x*fx,y*fy, (x+1)*fx,y*fy, x*fx,(y+1)*fy, (x+1)*fx,(y+1)*fy ]);
        	this._frames.push(gr);
        }
   this.graphics = this._frames[this.currentFrame];
}
MBitmap.prototype.gotoAndStop = function(k){
   this.currentFrame = (k+this.totalFrames)%this.totalFrames;
   if(this.bitmapData.width) this.graphics = this._frames[k%this.totalFrames];
}
MBitmap.prototype.nextFrame = function(){
	this.gotoAndStop(this.currentFrame+1);
}
MBitmap.prototype.prevFrame = function(){
	this.gotoAndStop(this.currentFrame-1);
}
MBitmap.prototype.gotoAndPlay = function(k,step){
	this.gotoAndStop(k); this.play(step);
}
MBitmap.prototype.gotoAndLoop = function(k, d, step){
	this.loop = true;
	this.loopEnd = d;
	this.loopStart = k;
	this.loopStep = step;
	if(this.currentFrame >= d || this.currentFrame < k){
		this.gotoAndStop(k);
		this.play(step);
	}
}
// step == K :
// animation frame will be displayed for K display frames (default is 1)
MBitmap.prototype.play = function(step){
	this._step = step ? step : 1;  this.isPlaying = true;
    this.addEventListener2  (Event.ENTER_FRAME, this._ef, this);
}
MBitmap.prototype.stop = function(){
	this.isPlaying = false;
    this.removeEventListener(Event.ENTER_FRAME, this._ef);
	if(this.loop && this.currentFrame == this.loopEnd)
		this.gotoAndLoop(this.loopStart, this.loopEnd, this.loopStep)
}
MBitmap.prototype._ef=function(e){
	if(this.loop && this.currentFrame == this.loopEnd)
		this.stop()
	else if(this._time++%this._step==0) this.nextFrame();
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
    gameVars.storage = {available:true};
}
else {
    game.storage = {available:false};
}
Start();
