var canvas = document.getElementById("canvasSnake");
var canvasFood = document.getElementById("canvasFood");
var canvasHex = document.getElementById("canvasHex");
var ctxSnake = canvas.getContext("2d");
var ctxFood = canvasFood.getContext("2d");
var ctxHex = canvasHex.getContext("2d");
var ut = new Util();
var mouseDown = false, cursor = new Point(0, 0);
var game; // created when start() runs after scripts load

function resizeCanvases(){
	var dpr = window.devicePixelRatio || 1;
	var w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	var h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	// set CSS sizes (logical pixels)
	[canvasHex, canvasFood, canvas].forEach(function(c){
		c.style.width = w + 'px';
		c.style.height = h + 'px';
		c.width = Math.floor(w * dpr);
		c.height = Math.floor(h * dpr);
	});

	// Ensure drawing uses logical coordinates (CSS pixels)
	[ctxHex, ctxFood, ctxSnake].forEach(function(ctx){
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	});

	// If Game has any resize hooks, call them (best effort)
	if(typeof game !== 'undefined' && typeof game.onResize === 'function'){
		game.onResize(w, h, dpr);
	}
}

// Pointer events handle mouse + touch uniformly
canvas.addEventListener('pointerdown', function(e){
	mouseDown = true;
	canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
	cursor = ut.getMousePos(canvas, e);
	// convert screen cursor to world coordinates using camera
	if(game.camera){
		var worldCursor = new Point(cursor.x + game.camera.x - game.SCREEN_SIZE.x/2,
									cursor.y + game.camera.y - game.SCREEN_SIZE.y/2);
	} else var worldCursor = cursor;
	if(game.snakes && game.snakes[0]){
		var ang = ut.getAngle(game.snakes[0].arr[0], worldCursor);
		game.snakes[0].changeAngle(ang);
	}
	e.preventDefault();
});

canvas.addEventListener('pointermove', function(e){
	if(!mouseDown) return;
	cursor = ut.getMousePos(canvas, e);
	if(game.camera){
		var worldCursor = new Point(cursor.x + game.camera.x - game.SCREEN_SIZE.x/2,
									cursor.y + game.camera.y - game.SCREEN_SIZE.y/2);
	} else var worldCursor = cursor;
	if(game.snakes && game.snakes[0]){
		var ang = ut.getAngle(game.snakes[0].arr[0], worldCursor);
		game.snakes[0].changeAngle(ang);
	}
	e.preventDefault();
});

canvas.addEventListener('pointerup', function(e){
	mouseDown = false;
	try{ canvas.releasePointerCapture && canvas.releasePointerCapture(e.pointerId); }catch(err){}
	e.preventDefault();
});
canvas.addEventListener('pointercancel', function(e){ mouseDown = false; });

function start(){
	resizeCanvases();
	if(typeof Game === 'undefined'){
		console.error('Game class is not defined. Ensure js/Game.js is loaded before script.js');
		return;
	}
	game = new Game(ctxSnake, ctxFood, ctxHex);
	game.init();
	update();
}

var updateId, previousDelta = 0, fpsLimit = 30;
function update(currentDelta){
	updateId = requestAnimationFrame(update);
	var delta = currentDelta - previousDelta;
	if (fpsLimit && delta < 1000 / fpsLimit) return;
	previousDelta = currentDelta;

	var dpr = window.devicePixelRatio || 1;
	var logicalW = canvas.width / dpr;
	var logicalH = canvas.height / dpr;

	// clear in logical (CSS) pixels because contexts are transformed
	ctxFood.clearRect(0, 0, logicalW, logicalH);
	ctxSnake.clearRect(0, 0, logicalW, logicalH);
	ctxHex.clearRect(0, 0, logicalW, logicalH);

	game.draw();
}

window.addEventListener('resize', function(){
	// debounce quick resizes
	clearTimeout(window._resizeTimeout);
	window._resizeTimeout = setTimeout(function(){ resizeCanvases(); }, 50);
});

// Prevent page scrolling on touch gestures
window.addEventListener('touchmove', function(e){ e.preventDefault(); }, {passive:false});

start();






