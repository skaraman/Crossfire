
function Start() {
	var res = window.devicePixelRatio;
	// Matter.js module aliases
	var Engine = Matter.Engine,
	    World = Matter.World,
	    Bodies = Matter.Bodies,
		Body = Matter.Body;
	// create a Matter.js engine
	// engine render object
	var matterRender = {render: {element: document.body,controller: Matter.Render,options: {width:window.innerWidth,height:(window.innerHeight/2)-5}}}
	var engine = Engine.create(matterRender);
	var ground = {
		body: Bodies.rectangle(window.innerWidth/2, (window.innerHeight/2)-5, window.innerWidth, 60, { isStatic: true}),
		sprite: new PIXI.Graphics()
				.lineStyle(1, 0x000000, 1)
				.beginFill(0x676767, 1)
				.drawRect(0, ((window.innerHeight/2)-5)-30, window.innerWidth+1, 60)
				.endFill()
	};
	var bodies = [];
	bodies.push(ground.body);
	var renderer = new PIXI.CanvasRenderer(window.innerWidth, (window.innerHeight/2)-5,{
		backgroundColor : 0x1099bb,
		//antialias: true,
		resolution: res

	});
	renderer.roundPixels = true;

	var stage = new PIXI.Container();
	stage.updateLayersOrder = function () {
		stage.children.sort(function(a,b) {
			a.zIndex = a.zIndex || 0;
			b.zIndex = b.zIndex || 0;
			return b.zIndex - a.zIndex
		});
	};
	document.body.appendChild(renderer.view);
	ground.sprite.zIndex = 5;
	stage.addChild(ground.sprite)
	stage.updateLayersOrder();
	var texture = PIXI.Texture.fromImage('./images/bunny.png');
	var bunnies = [];
	function SpriteObject() {
		var bunny = new PIXI.Sprite(texture);
		bunny.anchor.x = 0.5;
		bunny.anchor.y = 0.5;
		bunny.position.x = 200;
		bunny.position.y = 150;
		bunny.zIndex = 5;
		stage.addChild(bunny);
		stage.updateLayersOrder();
		return bunny;
	};
	function PhysicsObject() {
		var x, y, scale;
		x = (Math.random() * window.innerWidth) + 1;
		y = (Math.random() * (window.innerHeight/2)) + 1;
		scale = (Math.random() * 20) + 20;
		var box = Bodies.rectangle(x, y, 27, 28);
		Body.setAngularVelocity(box, 0.1)
		//Body.applyForce(box, {x:x,y:y},{x:1,y:1});
		bodies.push(box);
		return box;
	};
	var createBunny = function() {
		return {
			body: PhysicsObject(),
			sprite: SpriteObject()
		};
	};
	for(var i=0; i < 300; i++) {
		bunnies.push(createBunny());
	}

	var startScreen = new PIXI.Graphics()
							.lineStyle(0)
							.beginFill('#ffffff',1)
							.drawRect(0,0,window.innerWidth,window.innerHeight)
							.endFill();
	startScreen.zIndex = 10;
	startScreen.position.x = 0;
	startScreen.position.y = 0;

	var startButton = new PIXI.Text('Start Game', { font: '35px Conductive', fill: 'black', align: 'center' });
	startButton.zIndex = 11;
	startButton.anchor.set(0.5);

	startButton.position.x = 100;
	startButton.position.y = 100;

	startButton // set the mousedown and touchstart callback...
        .on('mousedown', onButtonDown)
        .on('touchstart', onButtonDown)

        // set the mouseup and touchend callback...
        .on('mouseup', onButtonUp)
        .on('touchend', onButtonUp)
        .on('mouseupoutside', onButtonUp)
        .on('touchendoutside', onButtonUp)

        // set the mouseover callback...
        .on('mouseover', onButtonOver)

        // set the mouseout callback...
        .on('mouseout', onButtonOut)

        // you can also listen to click and tap events :
        .on('click', function(){console.log('click')})

	stage.addChild(startScreen);
	stage.addChild(startButton);

	stage.updateLayersOrder();



	animate();
	function animate() {
		requestAnimationFrame(animate);
		for(var b in bunnies) {
			var x = bunnies[b].body.position.x;
			var y = bunnies[b].body.position.y;
			x = Math.floor(x);
			y = Math.floor(y);
			bunnies[b].sprite.position.x = x;
			bunnies[b].sprite.position.y = y;
			//bunnies[b].sprite.rotation = Math.round(bunnies[b].body.angle* 10)/10;
			bunnies[b].sprite.rotation = bunnies[b].body.angle;
			if(bunnies[b].body.position.x > window.innerWidth
				|| bunnies[b].body.position.y > window.innerHeight
			 	|| bunnies[b].body.position.x < 0)
			{
				stage.removeChild(bunnies[b].sprite);
				World.remove(engine.world, bunnies[b].body);
				bunnies.splice(b,1);
			}
		}
		renderer.render(stage);
		//Engine.update(engine,1000/60,1);
	}
	World.add(engine.world, bodies);
	Engine.run(engine);

	function onButtonDown(){
	    this.isdown = true;
	    console.log('down')
	}
	function onButtonUp(){
	    this.isdown = false;
	    if (this.isOver){
	        console.log('over')
	    }else{
	        console.log('up')
	    }
	}
	function onButtonOver(){
	    this.isOver = true;
	    if (this.isdown){
	        return;
	    }
	    console.log('over')
	}
	function onButtonOut(){
	    this.isOver = false;
	    if (this.isdown){
	        return;
	    }
	    console.log('out');
	}


}
Start();
