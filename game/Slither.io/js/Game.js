class Game{
    constructor(ctxSnake, ctxFood, ctxHex){
        this.ctxSnake = ctxSnake;
        this.ctxFood = ctxFood;
        this.ctxHex = ctxHex;
        this.WORLD_SIZE = new Point(4000, 2000);
        this.SCREEN_SIZE = new Point(800, 400);
        this.world = new Point(-1200, -600);
        this.dpr = window.devicePixelRatio || 1;
        this.camera = new Point(this.world.x + this.WORLD_SIZE.x/2, this.world.y + this.WORLD_SIZE.y/2);
        this.desiredFoodCount = 600;
        this.spawnRadius = 1200;
        this.pruneRadius = 3000;
        this.snakes = [];
        this.foods = [];
        this.bricks = [];
    }

    // called from resize handler to update logical screen size
    onResize(w, h, dpr){
        this.SCREEN_SIZE = new Point(w, h);
        this.dpr = dpr || this.dpr;
        if(this.WORLD_SIZE.x < w) this.WORLD_SIZE.x = Math.max(this.WORLD_SIZE.x, w + 200);
        if(this.WORLD_SIZE.y < h) this.WORLD_SIZE.y = Math.max(this.WORLD_SIZE.y, h + 200);
    }

    init(){
        this.snakes[0] = new Snake(this.ctxSnake, "John", 0);
        for(var i=0; i<20; i++) this.addSnake(ut.randomName(), 100);
        this.generateFoods(800);
        // set camera to player start
        if(this.snakes[0]){
            this.camera.x = this.snakes[0].pos.x;
            this.camera.y = this.snakes[0].pos.y;
        }
    }

    draw(){
        if(this.snakes && this.snakes[0]){
            var target = this.snakes[0].pos;
            this.camera.x += (target.x - this.camera.x) * 0.12;
            this.camera.y += (target.y - this.camera.y) * 0.12;
        }

        // ...removed background fill (untransformed)...

        // camera transform in logical (CSS) pixels; contexts already scaled by DPR
        var tx = this.SCREEN_SIZE.x/2 - this.camera.x;
        var ty = this.SCREEN_SIZE.y/2 - this.camera.y;
        this.ctxHex.save(); this.ctxHex.translate(tx, ty);
        this.ctxFood.save(); this.ctxFood.translate(tx, ty);
        this.ctxSnake.save(); this.ctxSnake.translate(tx, ty);

        // world border (subtle)
        this.ctxHex.strokeStyle = "rgba(255,255,255,0.03)";
        this.ctxHex.lineWidth = 1;
        this.ctxHex.strokeRect(this.world.x, this.world.y, this.WORLD_SIZE.x, this.WORLD_SIZE.y);

        // draw foods
        for(var i=0;i<this.foods.length;i++) this.foods[i].draw();

        // update & draw snakes
        for(var i=0;i<this.snakes.length;i++){
            if(this.snakes[i].state === 0){
                if(i===0) this.snakes[i].move();
                else this.snakes[i].move(this.snakes[0]);
            } else if(typeof this.snakes[i].drawAfterMove === 'function'){
                this.snakes[i].drawAfterMove();
            }
        }

        // auto-respawn player if dead
        if(this.snakes[0] && this.snakes[0].state === 1){
            this.snakes[0].respawn();
        }

        // restore to screen space
        this.ctxHex.restore();
        this.ctxFood.restore();
        this.ctxSnake.restore();

        // UI
        this.drawScore();
        this.drawMap();

        // spawn/prune
        this.updateSpawning();

        // Debug overlay: show camera/player positions and counts
        try{
            this.ctxHex.save();
            this.ctxHex.setTransform(1,0,0,1,0,0);
            this.ctxHex.fillStyle = 'white';
            this.ctxHex.font = '12px Arial';
            var px = this.snakes && this.snakes[0] ? this.snakes[0].pos.x.toFixed(0) : 'na';
            var py = this.snakes && this.snakes[0] ? this.snakes[0].pos.y.toFixed(0) : 'na';
            var cx = this.camera ? this.camera.x.toFixed(0) : 'na';
            var cy = this.camera ? this.camera.y.toFixed(0) : 'na';
            // center marker
            this.ctxHex.beginPath();
            this.ctxHex.fillStyle = 'rgba(255,255,255,0.8)';
            this.ctxHex.arc(this.SCREEN_SIZE.x/2, this.SCREEN_SIZE.y/2, 4, 0, Math.PI*2);
            this.ctxHex.fill();
            this.ctxHex.restore();
        }catch(e){ /* ignore debug errors */ }
    }

    drawWorld(){
        // left intentionally minimal: world rendering done in draw() under camera transform
    }

    drawScore(){
        var start = new Point(20, 20);
        for (var i = 0; i < this.snakes.length; i++) {
            this.ctxSnake.fillStyle = this.snakes[i].mainColor;
            this.ctxSnake.font="bold 10px Arial";
            this.ctxSnake.fillText(this.snakes[i].name + ":" + this.snakes[i].score,
            start.x-5, start.y +i*15);
        }
    }

    drawMap(){
        var mapSize = new Point(100, 50);
        var start = new Point(20, this.SCREEN_SIZE.y-mapSize.y-10);
        this.ctxSnake.fillStyle = "white";
        this.ctxSnake.fillRect(start.x, start.y, mapSize.x,  mapSize.y);

        // draw players on minimap (normalized)
        for (var i = 0; i < this.snakes.length; i++) {
            var nx = (this.snakes[i].pos.x - this.world.x) / this.WORLD_SIZE.x;
            var ny = (this.snakes[i].pos.y - this.world.y) / this.WORLD_SIZE.y;
            var px = start.x + nx * mapSize.x;
            var py = start.y + ny * mapSize.y + 10;
            this.ctxSnake.fillStyle = this.snakes[i].mainColor;
            this.ctxSnake.beginPath();
            this.ctxSnake.arc(px, py, 2, 0, 2*Math.PI);
            this.ctxSnake.fill();
        }
    }

    addSnake(name, id){
        this.snakes.push(new SnakeAi(this.ctxSnake, name, id))
    }

    generateFoods(n){
        for(var i=0;i<n;i++){
            var fx = ut.random(Math.floor(this.world.x + 50), Math.floor(this.world.x + this.WORLD_SIZE.x - 50));
            var fy = ut.random(Math.floor(this.world.y + 50), Math.floor(this.world.y + this.WORLD_SIZE.y - 50));
            this.foods.push(new Food(this.ctxFood, fx, fy));
        }
    }

    updateSpawning(){
        if(!this.snakes || !this.snakes[0]) return;
        var player = this.snakes[0];
        
        // prune far foods
        for(var i=this.foods.length-1;i>=0;i--){
            var f = this.foods[i];
            if(ut.getDistance(f.pos, player.pos) > this.pruneRadius) this.foods.splice(i,1);
        }
        // spawn around player
        while(this.foods.length < this.desiredFoodCount){
            var angle = Math.random()*Math.PI*2;
            var r = ut.random(100, this.spawnRadius);
            var fx = Math.floor(player.pos.x + Math.cos(angle)*r);
            var fy = Math.floor(player.pos.y + Math.sin(angle)*r);
            this.foods.push(new Food(this.ctxFood, fx, fy));
        }
        
        // maintain minimum AI snakes (at least 15 total)
        var minAiSnakes = 15;
        while(this.snakes.length - 1 < minAiSnakes){ // -1 because index 0 is player
            this.addSnake(ut.randomName(), 100);
        }
    }

}
