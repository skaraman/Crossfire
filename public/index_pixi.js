
function Start() {
	function Animate() {
		this.callbacks = [callback1];
	}
	Animate.prototype.animate = function animate() {
		var z = fps.getFPS();
		if(document.querySelector("#fps"))
			document.querySelector("#fps").innerHTML = z;
		requestAnimationFrame(animator.animate);
		if(animator.callbacks){
			for(var c in animator.callbacks){
				animator.callbacks[c]();
			}
		}
		renderer.render(stage);
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
		Body = Matter.Body;
	// create a Matter.js engine
	// engine render object
	//var matterRender = {render: {element: document.body,controller: Matter.Render,options: {width:window.innerWidth,height:(window.innerHeight/2)-5}}}
	var engine = Engine.create(/*matterRender*/);
	var renderer = new PIXI.autoDetectRenderer(window.innerWidth, (window.innerHeight/*/2*/)/*-5*/,{
		backgroundColor : 0x9977ff,
		resolution: res
	});
	var gameSize = {w:renderer.width/res,h:renderer.height/res}
	//renderer.roundPixels = true;
	var im = renderer.plugins.interaction;
	var stage = new PIXI.Container();
	var bgT = new PIXI.Texture.fromImage('./images/winter2.jpg');
	var bgSprite = new PIXI.Sprite(bgT);
	bgSprite.position.x = 0;
	bgSprite.position.y = window.innerHeight-512;
	stage.addChild(bgSprite);
	var ground = {
		body: Bodies.rectangle(renderer.width/res, (renderer.height/2)-5, renderer.width, 60, { isStatic: true}),
		sprite: new PIXI.Graphics()
				.lineStyle(1, 0x000000, 1)
				.beginFill(0x676767, 1)
				.drawRect(-1, gameSize.h-30, gameSize.w+1, 30)
				.endFill()
	};
	/*stage.updateLayersOrder = function () {
		stage.children.sort(function(a,b) {
			a.zIndex = a.zIndex || 0;
			b.zIndex = b.zIndex || 0;
			return b.zIndex - a.zIndex
		});
	};*/
	document.body.appendChild(renderer.view);
	//ground.sprite.zIndex = 1;
	stage.addChild(ground.sprite);
	//stage.updateLayersOrder();
	World.add(engine.world,ground.body);
	var texture = PIXI.Texture.fromImage('./images/bunny.png');
	var bunnies = [];
	var bodies = [];
	function SpriteObject() {
		var bunny = new PIXI.Sprite(texture);
		bunny.anchor.x = 0.5;
		bunny.anchor.y = 0.5;
		bunny.position.x = 200;
		bunny.position.y = 150;
		//bunny.zIndex = 1;
		stage.addChild(bunny);
		//stage.updateLayersOrder();
		return bunny;
	};
	function PhysicsObject() {
		var x, y, scale;
		x = (Math.random() * window.innerWidth) + 1;
		y = (Math.random() * (window.innerHeight/2)) + 1;
		scale = (Math.random() * 20) + 20;
		var box = Bodies.rectangle(x, y, 27, 28);
		//Body.setAngularVelocity(box, 0.1)
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
	for(var i=0; i < 50; i++) {
		bunnies.push(createBunny());
	}
	var animator = new Animate();
	animator.animate();
	World.add(engine.world, bodies);
	Engine.run(engine);
	function callback1(){
		for(var b in bunnies) {
			var x = bunnies[b].body.position.x;
			var y = bunnies[b].body.position.y;
			//x = Math.floor(x);
			//y = Math.floor(y);
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
Start();
