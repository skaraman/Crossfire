var world;
var gameVars = {};
gameVars.bodies = [];	// instances of b2Body (from Box2D)
gameVars.actors = [];	// instances of Bitmap (from IvanK)
gameVars.char = {};
gameVars.fontLoader = 0;
gameVars.circles = [];
function Start() {
	function Animate(){
		// callbacks are funcions that are run on every
		// animate update, things like collision detection,
		// moving pieces, etc belong here, use the addCallback and destroyCallback
		// proto functions to manipulate this array
		this.callbacks = [updateEnemyByBody];
	}
	Animate.prototype.animate = function animate(e){
		/*var z = fps.getFPS();
		if(document.querySelector("#fps"))
			document.querySelector("#fps").innerHTML = z;*/
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
	var engine = Engine.create();//matterRender);
	engine.enableSleeping = true;
	var mouse = Matter.MouseConstraint.create(engine, {
		mouse: Matter.Mouse.create(document.getElementById('c'))
	});
	engine.world.gravity = {scale:0.001,x:0,y:0};
	var stage = new Stage("c",{w:window.innerWidth,h:window.innerHeight});///2});
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
	//var cS = 40;
	gameVars.char.body = Bodies.rectangle( (gameSize.w/2), (gameSize.h/2), 20, 50, { isStatic: true});
	gameVars.char.sprite =
		(function(){
			var texture = new BitmapData('./images/astro_loop.png')
			var bm = new MBitmap(texture, 3, 8);
			bm.x = (gameVars.char.body.vertices[0].x-7)*res;
			bm.y = (gameVars.char.body.vertices[0].y)*res;
			bm.scaleX = (30/(80/res));
			bm.scaleY = (60/(120/res));
			//bm.play(6);
			bm.w = 30*res;
			bm.h = 60*res;
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
	gameVars.char.sprite.x = ((gameSize.w/2)-(gameVars.char.sprite.w/2/res))*res;
	gameVars.char.sprite.y = ((gameSize.h/2)-(gameVars.char.sprite.h/2/res))*res;
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
	gameVars.scoreView.alpha = 1;
	gameVars.scoreView.width = gameVars.scoreView._textW;
	gameVars.scoreView.height = gameVars.scoreView._textH;
	gameVars.score = 0;
	gameVars.scoreView.zIndex = 98;
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

	var howToFormat = new TextFormat("Conductive", 30*res, 0xFFFFFF, false, false, 'left');
	gameVars.howToView = new TextField();
	gameVars.howToView.selectable = false;
	gameVars.howToView.setTextFormat(howToFormat);
	gameVars.howToView.text = "How to Play";
	gameVars.howToView.x = (gameSize.w/2-((gameVars.howToView._textW/res)/2))*res;
	gameVars.howToView.y = (gameSize.h/2 + 150)*res;
	gameVars.howToView.width = gameVars.howToView._textW;
	gameVars.howToView.height = gameVars.howToView._textH;
	gameVars.howToButton = new Sprite();
	gameVars.howToButton.addChild(gameVars.howToView);
	gameVars.howToButton.zIndex = 98;
	gameVars.howToButton.addEventListener(MouseEvent.CLICK, howToPlay);
	stage.addChild(gameVars.howToButton);
	stage.updateLayersOrder();

	if (gameVars.storage.high_score){
		var highScoreFormat = new TextFormat("Conductive", 24*res, 0xFFFFFF, false, false, 'center');
		gameVars.highScoreView = new TextField();
		gameVars.highScoreView.selectable = false;
		gameVars.highScoreView.setTextFormat(highScoreFormat);
		gameVars.highScoreView.text = gameVars.storage.high_score;
		gameVars.highScoreView.x = (gameSize.w - (gameVars.highScoreView._textW/res)-(10) )*res;
		gameVars.highScoreView.y = (10)*res;
		gameVars.highScoreView.alpha = 0.5;
		gameVars.highScoreView.width = gameVars.highScoreView._textW;
		gameVars.highScoreView.height = gameVars.highScoreView._textH;
		gameVars.highScoreView.zIndex = 97;
		stage.addChild(gameVars.highScoreView);
		stage.updateLayersOrder();
	}

	for(var x=0;x<50;x++){
		var size = gameVars.sizes[Math.floor(Math.random()*gameVars.sizes.length)];
		var circle = Bodies.circle(-100, -100, size/2);
		gameVars.circles.push(circle);
	}

	function initGame(){
		gameVars.startTime = new Date().getTime();
		gameVars.firstTouch = false;
		stage.removeChild(gameVars.startButton);
		gameVars.scoreView.alpha = 0.5;
		addEnemyUtil();
		animator.addCallback(checkForBFR);
		Events.on(mouse, 'mousemove', positionChar);
		animator.addCallback(updateOne);
		gameVars.char.sprite.gotoAndLoop(9 , 22, 5);
		gameVars.howToButton.x += -1000;
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
                    //gameOver();
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
			var sideOp = gameVars.sidesOps[Math.floor(Math.random()*gameVars.sidesOps.length)];
			var newEnemy = {};
			newEnemy.body = PhysicsObject(newEnemy, sideOp, speed);
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
			colors = ['red','black','blue','grey','green','yellow','orange','purple','violet','gainsboro'];
			color = colors[0];
			if (x > 46 && x < 92) {
				color=colors[1];
				gameVars.texture = new BitmapData('./images/star.png');
				w = 105;
				h = 105;
			}else if (x == 93){
				color=colors[8];
				gameVars.texture = new BitmapData('./images/star_v.png');
				w = 105;
				h = 105;
			}else if (x == 94){
				color=colors[9];
				gameVars.texture = new BitmapData('./images/star_gb.png');
				w = 105;
				h = 105;
			}else if (x == 95){
				color=colors[2];
				gameVars.texture = new BitmapData('./images/star_b.png');
				w = 105;
				h = 105;
			}else if (x == 96) {
				color=colors[3];
				gameVars.texture = new BitmapData('./images/star_g.png');
				w = 105;
				h = 105;
			}else if (x == 97){
				color=colors[4];
				gameVars.texture = new BitmapData('./images/star_grn.png');
				w = 105;
				h = 105;
			}else if (x == 98){
				color=colors[5];
				gameVars.texture = new BitmapData('./images/star_y.png');
				w = 105;
				h = 105;
			}else if (x == 99){
				color=colors[6];
				gameVars.texture = new BitmapData('./images/star_oj.png');
				w = 105;
				h = 105;
			}else if (x == 100){
				color=colors[7];
				gameVars.texture = new BitmapData('./images/star_p.png');
				w = 105;
				h = 105;
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
	function PhysicsObject(newEnemy, sideOp, speed) {
		var x, y, circle,
			diag = Math.random() < 0.5 ? true : false,
			speed = speed/100;
		switch (sideOp) {
			case 1:
				x = gameSize.w + (size/2);
				y = (Math.round(Math.random()*gameSize.h)+size)/2;
				circle = gameVars.circles.pop();
				Matter.Body.setPosition(circle, {x:x,y:y});
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
				circle = gameVars.circles.pop();
				Matter.Body.setPosition(circle, {x:x,y:y});
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
				circle = gameVars.circles.pop();
				Matter.Body.setPosition(circle, {x:x,y:y});
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
				circle = gameVars.circles.pop();
				Matter.Body.setPosition(circle, {x:x,y:y});
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
		stage.removeChild(gameVars.actors[index].sprite);
		gameVars.circles.unshift(gameVars.bodies[index]);
		Matter.Body.setPosition(gameVars.bodies[index],
			{x:-100,y:-100}
		);
		Matter.Body.setVelocity(gameVars.bodies[index],
			{x:0,y:0}
		);
		World.remove(engine.world, gameVars.bodies[index]);
		gameVars.bodies.splice(index,1);
		gameVars.actors.splice(index,1);

	}
	function checkForBFR(){  // BattleFieldRemoval
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
		if(gameVars.warp || gameVars.firstTouch == false){
			if(gameVars.firstTouch == false){
				gameVars.firstTouch = true;
				gameVars.previousTouch = {
					x: event.mouse.position.x,
					y: event.mouse.position.y
				}
			}
			Matter.Body.setPosition(gameVars.char.body,
				Matter.Vector.create(event.mouse.position.x/res,event.mouse.position.y/res)
			);
			gameVars.char.sprite.x = event.mouse.position.x-(gameVars.char.sprite.w)/2;
			gameVars.char.sprite.y = event.mouse.position.y-(gameVars.char.sprite.h)/2;

		}else if (!gameVars.warp && gameVars.firstTouch == true){
			var xDiff = Math.abs(gameVars.previousTouch.x - event.mouse.position.x);
			var yDiff = Math.abs(gameVars.previousTouch.y - event.mouse.position.y);
			if (xDiff > 100 || yDiff > 100){
				return;
			}else{
				Matter.Body.setPosition(gameVars.char.body,
					Matter.Vector.create(event.mouse.position.x/res,event.mouse.position.y/res)
				);
				gameVars.char.sprite.x = event.mouse.position.x-(gameVars.char.sprite.w)/2;
				gameVars.char.sprite.y = event.mouse.position.y-(gameVars.char.sprite.h)/2;
			}
			gameVars.previousTouch = {
				x: event.mouse.position.x,
				y: event.mouse.position.y
			}

		}
		if(gameVars.magnetic){
			engine.world.gravity = {
				x: event.mouse.position.x,
				y: event.mouse.position.y,
				isPoint: true,
				scale: 0.0005
			}
		}else{
			engine.world.gravity = {scale:0.001,x:0,y:0,isPoint:false};
		}
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
		gameVars.scoreView.y = ((gameSize.h/2)-50)*res;
		gameVars.scoreView.alpha = 1;
	    gameVars.started = false;

		gameVars.char.sprite.x = ((gameSize.w/2)-15) * res;
		gameVars.char.sprite.y = (gameSize.h/2) * res;

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
	function howToPlay(){
		gameVars.char.sprite.x = 10;
		gameVars.char.sprite.y = gameSize.h/2;

		gameVars.s = new Sprite();
		gameVars.s.graphics.beginFill(0x000000, 0.5);
		gameVars.s.graphics.drawRect(20*res,20*res,(gameSize.w-40)*res,(gameSize.h-40)*res);
		gameVars.s.graphics.endFill();
		gameVars.s.zIndex = 99;
		stage.addChild(gameVars.s);
		stage.updateLayersOrder();

		var rulesFormat = new TextFormat("Conductive", 16*res, 0xFFFFFF, false, false, 'left');
		gameVars.rulesText = new TextField();
		gameVars.rulesText.selectable = false;
		gameVars.rulesText.setTextFormat(rulesFormat);
		gameVars.rulesText.text = "Collect the Stars and avoid the Rocks!\n The key to a high score\n"
								+ "is to collect powerups and use them to\n your advantage!\n\n"
								+ "Blue - makes you invincible for 3 seconds!\n"
								+ "Grey - slows down time by 1/2 for 3 seconds!\n"
								+ "Green - reduces how often objects are spawned!\n"
								+ "Bright Yellow - reduces how fast\n objects are launched!\n"
								+ "Orange - gives you a thousand points instantly!\n"
								+ "Pink - gives you another chance! \nAny more give you a thousand points\n instantly!\n"
								+ "Red - makes you master of warp holes!\n"
								+ "Purple - makes things crazy!";
		gameVars.rulesText.x = 45*res;
		gameVars.rulesText.y = 30*res;
		gameVars.rulesText.width = (gameSize.w-40)*res;
		gameVars.rulesText.wordWrap = true;
		gameVars.rulesText.height = gameVars.rulesText._textH;
		gameVars.rulesView = new Sprite();
		gameVars.rulesView.addChild(gameVars.rulesText);
		gameVars.rulesView.zIndex = 98;
		//gameVars.rulesView.addEventListener(MouseEvent.CLICK, startGame);
		stage.addChild(gameVars.rulesView);
		stage.updateLayersOrder();

		gameVars.startButton.x += -1000;
		gameVars.howToButton.x += -1000;
		gameVars.scoreView.x += -1000;

		var xFormat = new TextFormat("Conductive", 24*res, 0xFFFFFF, false, false, 'left');

		gameVars.howToX = new TextField();
		gameVars.howToX.selectable = false;
		gameVars.howToX.setTextFormat(rulesFormat);
		gameVars.howToX.text = "X";
		gameVars.howToX.x = ((gameSize.w-gameVars.howToX._textW) - 20)*res;
		gameVars.howToX.y = 30*res;
		gameVars.howToX.width = gameVars.howToX._textW;
		gameVars.howToX.height = gameVars.howToX._textH;
		gameVars.xView = new Sprite();
		gameVars.xView.addChild(gameVars.howToX);
		gameVars.xView.zIndex = 98;
		gameVars.xView.addEventListener(MouseEvent.CLICK, removeHowTo);
		stage.addChild(gameVars.xView);
		stage.updateLayersOrder();

	}
	function removeHowTo(){
		stage.removeChild(gameVars.s);
		stage.removeChild(gameVars.howToView);
		stage.removeChild(gameVars.xView);
		stage.removeChild(gameVars.rulesView);

		gameVars.startButton.x += 1000;
		gameVars.howToButton.x += 1000;
		gameVars.scoreView.x += 1000;

		gameVars.char.sprite.x = ((gameSize.w/2)-(gameVars.char.sprite.w/2/res))*res;
		gameVars.char.sprite.y = ((gameSize.h/2)-(gameVars.char.sprite.h/2/res))*res;


	}
	function startGame(){
		if(gameVars.over)
			location.reload();
		else{
			initGame();
		}
	}
	function manageLives(op) {
		if (op == 1 && gameVars.lives == 1){
			gameVars.gameLives = new Sprite();
			var livesBD = new BitmapData('./images/life.png')
			var h = 26;
			var w = 25 * gameVars.lives;
			var livesBM = new Bitmap(livesBD);
			gameVars.gameLives.addChild(livesBM);
			gameVars.gameLives.x = ((gameSize.w/2)-10)*res;
			gameVars.gameLives.y = 20*res;
			gameVars.gameLives.scaleX = (20/(w/res));
			gameVars.gameLives.scaleY = (20/(h/res));
			gameVars.gameLives.zIndex = 10;
			stage.addChild(gameVars.gameLives);
			stage.updateLayersOrder();
			gameVars.lives = 2;
		}else if (op == -1){
			stage.removeChild(gameVars.gameLives);
			gameVars.lives = 1;
		}else if (op == 1 && gameVars.lives == 2){
			updateScore(1000);
		}
	}
	function setSlowTime() {
		if(!gameVars.slow){
	        gameVars.slow = true;
	        var slowBarTimer = new Sprite();
			gameVars.sBT = slowBarTimer;
			slowBarTimer.graphics.lineStyle(10*res, 0x888888 ,0.5);
			slowBarTimer.graphics.moveTo((40)*res, (65)*res);
			slowBarTimer.graphics.lineTo((gameSize.w-40)*res, 65*res);
			stage.addChild(slowBarTimer);
			var now = new Date().getTime();
			if(!slowBarTimer.start){
				slowBarTimer.start = now;
			}
			var barShrinkerAndSlower = function barShrinkerAndSlower(){
				var now = new Date().getTime();
				var diff = now - slowBarTimer.start;
				if(diff > 3000){
					stage.removeChild(slowBarTimer);
					animator.destroyCallback(barShrinkerAndSlower);
					gameVars.slow = false;
					for(var i=0;i<gameVars.actors.length; i++){
						if(gameVars.actors[i] != null){
							var veloArray = toArray(gameVars.actors[i].body.velocity);
							for(var j=0; j< veloArray.length; j++){
								veloArray[j] = Math.floor(veloArray[j]*2);
							}
							var veloObj = {x:veloArray[0],y:veloArray[1]};
							Body.setVelocity(gameVars.actors[i].body, veloObj)
							gameVars.actors[i].slowed = false;
						}
					}
					return;
				}
				var percent = (diff/3000)*100;
				percent = (100 - percent)/100;
				var width = (gameSize.w - 80)*percent;
				slowBarTimer.graphics.clear();
				slowBarTimer.graphics.lineStyle(10*res, 0x888888 ,0.5);
				slowBarTimer.graphics.moveTo((40)*res, (65)*res);
				slowBarTimer.graphics.lineTo((40+width)*res, 65*res);
				for(var i=0;i<gameVars.actors.length; i++){
					if(gameVars.actors[i] != null && !gameVars.actors[i].slowed){
						var veloArray = toArray(gameVars.actors[i].body.velocity);
						for(var j=0; j< veloArray.length; j++){
							veloArray[j] = Math.floor(veloArray[j]/2);
						}
						var veloObj = {x:veloArray[0],y:veloArray[1]};
						Body.setVelocity(gameVars.actors[i].body, veloObj)
						gameVars.actors[i].slowed = true;

					}
				}
			}
			animator.addCallback(barShrinkerAndSlower);
		}else{
			gameVars.sBT.start = new Date().getTime();
		}
	}
	function setInvincible(){
	    if(!gameVars.invincible){
	        gameVars.invincible = true;
	        var invincibleBarTimer = new Sprite();
			gameVars.iBT = invincibleBarTimer;
			invincibleBarTimer.graphics.lineStyle(10*res, 0x1e3e74 ,0.5);
			invincibleBarTimer.graphics.moveTo((40)*res, (40)*res);
			invincibleBarTimer.graphics.lineTo((gameSize.w-40)*res, 40*res);
			stage.addChild(invincibleBarTimer);

			var now = new Date().getTime();
			if(!invincibleBarTimer.start){
				invincibleBarTimer.start = now;
			}
			var barShrinker = function barShrinker(){
				var now = new Date().getTime();
				var diff = now - invincibleBarTimer.start;
				if(diff > 3000){
					stage.removeChild(invincibleBarTimer);
					animator.destroyCallback(barShrinker);
					gameVars.invincible = false;
					return;
				}
				var percent = (diff/3000)*100;
				percent = (100 - percent)/100;
				var width = (gameSize.w - 80)*percent;
				invincibleBarTimer.graphics.clear();
				invincibleBarTimer.graphics.lineStyle(10*res, 0x1e3e74 ,0.5);
				invincibleBarTimer.graphics.moveTo((40)*res, (40)*res);
				invincibleBarTimer.graphics.lineTo((40+width)*res, 40*res);
			}
			animator.addCallback(barShrinker);
		}else{
			gameVars.iBT.start = new Date().getTime();
		}
	}
	function setMagenetic(){
		if(!gameVars.magnetic){
	        gameVars.magnetic = true;

			var magneticBarTimer = new Sprite();
			gameVars.mBT = magneticBarTimer;
			magneticBarTimer.graphics.lineStyle(10*res, 0x7400bb ,0.5);
			magneticBarTimer.graphics.moveTo((40)*res, (gameSize.h-40)*res);
			magneticBarTimer.graphics.lineTo((gameSize.w-40)*res, (gameSize.h-40)*res);
			stage.addChild(magneticBarTimer);

			var now = new Date().getTime();
			if(!magneticBarTimer.start){
				magneticBarTimer.start = now;
			}
			var barShrinkerMag = function barShrinkerMag(){
				var now = new Date().getTime();
				var diff = now - magneticBarTimer.start;
				if(diff > 5000){
					engine.world.gravity = {scale:0.001,x:0,y:0};
					stage.removeChild(magneticBarTimer);
					animator.destroyCallback(barShrinkerMag);
					gameVars.magnetic = false;
					return;
				}
				var percent = (diff/5000)*100;
				percent = (100 - percent)/100;
				var width = (gameSize.w - 80)*percent;
				magneticBarTimer.graphics.clear();
				magneticBarTimer.graphics.lineStyle(10*res, 0x7400bb ,0.5);
				magneticBarTimer.graphics.moveTo((40)*res, (gameSize.h-40)*res);
				magneticBarTimer.graphics.lineTo((40+width)*res, (gameSize.h-40)*res);
			}
			animator.addCallback(barShrinkerMag);
		}
		else{
			gameVars.mBT.start = new Date().getTime();
		}
	}
	function setWarp(){
		if(!gameVars.warp){
	        gameVars.warp = true;

			var warpBarTimer = new Sprite();
			gameVars.wBT = warpBarTimer;
			warpBarTimer.graphics.lineStyle(10*res, 0xa7180a ,0.5);
			warpBarTimer.graphics.moveTo((40)*res, (gameSize.h-65)*res);
			warpBarTimer.graphics.lineTo((gameSize.w-40)*res, (gameSize.h-65)*res);
			stage.addChild(warpBarTimer);

			var now = new Date().getTime();
			if(!warpBarTimer.start){
				warpBarTimer.start = now;
			}
			var barShrinkerWarp = function barShrinkerWarp(){
				var now = new Date().getTime();
				var diff = now - warpBarTimer.start;
				if(diff > 5000){
					stage.removeChild(warpBarTimer);
					animator.destroyCallback(barShrinkerWarp);
					gameVars.warp = false;
					return;
				}
				var percent = (diff/5000)*100;
				percent = (100 - percent)/100;
				var width = (gameSize.w - 80)*percent;
				warpBarTimer.graphics.clear();
				warpBarTimer.graphics.lineStyle(10*res, 0xa7180a ,0.5);
				warpBarTimer.graphics.moveTo((40)*res, (gameSize.h-65)*res);
				warpBarTimer.graphics.lineTo((40+width)*res, (gameSize.h-65)*res);
			}
			animator.addCallback(barShrinkerWarp);
		}
		else{
			gameVars.wBT.start = new Date().getTime();
		}
	}
}
function toArray(object){
	var innerArray = [];
	for (property in object) {
	    innerArray.push(object[property]);
	}
	return innerArray;
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
    gameVars.storage = {available:true, high_score: window.localStorage.high_score};
}
else {
    game.storage = {available:false};
}

setTimeout(function(){
	Start();
}, 300);
