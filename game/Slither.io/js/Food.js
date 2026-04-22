class Food{
	constructor(ctx, x, y){
		this.ctx = ctx;
		this.pos = new Point(x, y);
		this.sizeMin = 2;
		this.sizeMax = 6;
		this.mainColor = ut.randomColor();
		this.supportColor = ut.color(this.mainColor, 0.5);

		this.size = ut.random(this.sizeMin, this.sizeMax);
	}

	// draw in world-space coordinates; camera transform handled by Game
	draw(){
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillStyle = this.mainColor;
		this.ctx.beginPath();
		this.ctx.arc(parseInt(this.pos.x), parseInt(this.pos.y), this.size, 0, 2*Math.PI);
		this.ctx.fill();

		this.ctx.globalAlpha = 1;
		this.ctx.fillStyle = this.supportColor;
		this.ctx.beginPath();
		this.ctx.arc(parseInt(this.pos.x), parseInt(this.pos.y), this.size/2, 0, 2*Math.PI);
		this.ctx.fill();
	}

	die(){
		this.state = 1;
		var index = game.foods.indexOf(this);
		if(index !== -1) game.foods.splice(index, 1);
	}

}