class Game {
  constructor(level) {
    this.background = level.background;
    this.nails = level.nails;
    this.ropes = level.ropes;
    this.stars = level.stars;
    this.candy = level.candy;
    this.frog = level.frog;
    this.inGameScore = level.inGameScore;
    this.gameOver = new GameOver();

    this.isGameOver = false;
    this.isCandyNearFrog = false;
    this.isMouthOpen = false;
    this.hasEaten = false;
    this.isSad = false;

    this.isCutting = false;

    this.attachRopes();
    this.ropeCutEvenetListener();
    this.gameLoop();
  }

  attachRopes() {
    if (this.ropes.length > 1) {
      this.ropes.forEach((rope, index) => {
        if (index > 0) {
          rope.attach(this.ropes[0].getRopeEnd())
        }
      })
    }
  }

  ropeCutEvenetListener() {
    canvas.addEventListener('mousedown', (e) => {
      this.isCutting = true;
    })
    canvas.addEventListener('mouseup', (e) => {
      this.isCutting = false;
    })
    canvas.addEventListener('mousemove', (e) => {
      if (this.isCutting) {
        for (let rope of this.ropes) {
          rope.checkRopesIntersection(e.layerX, e.layerY);
        }
      }
    })
  }

  updateAll() {
    for (let rope of this.ropes) {
      rope.updatePoints();
      for (let rigidConstraint = 0; rigidConstraint < 5; rigidConstraint++) //more loops = more precision, but worse performance
      {
        rope.updateConstraints();
      }
    }

    for (let star of this.stars) {
      star.update();
      this.starCollisionDetection(star);
      star.drawDisappearStar();
    }
    this.candyNearFrogDetection();
    this.candy.update();
    this.inGameScore.updateStarScore();
    if (this.isGameOver) {
      this.gameOver.curtainCloseAnimation();
    }
  }

  drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.background.draw();
    for (let nail of this.nails) {
      nail.draw();
    }
    for (let rope of this.ropes) {
      rope.render();
    }
    this.frog.drawFrogImage();
    this.inGameScore.drawGameStarScore('ingame');
  }

  gameLoop() {
    this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));
    this.drawAll();
    this.updateAll();
  }

  starCollisionDetection(star) {
    if (this.candy.endPoint.position.x < star.position.x + star.spriteWidth &&
      this.candy.endPoint.position.x + this.candy.candyImageWidth / 2 > star.position.x &&
      this.candy.endPoint.position.y < star.position.y + star.singleSpriteHeight &&
      this.candy.endPoint.position.y + this.candy.candyImageHeight / 2 > star.position.y) {
      star.starDisappearAnimation();
    }
  }

  // getIndexOfStar(star){
  //   return stars.indexOf(star);
  // }

  candyNearFrogDetection() {
    if (!this.isCandyNearFrog) {
      if (this.candy.endPoint.position.x < this.frog.position.x + this.frog.spriteWidth &&
        this.candy.endPoint.position.x + this.candy.candyImageWidth / 2 > this.frog.position.x - nearFrogDistance &&
        this.candy.endPoint.position.y < this.frog.position.y + this.frog.singleSpriteHeight &&
        this.candy.endPoint.position.y + this.candy.candyImageHeight / 2 > this.frog.position.y - nearFrogDistance) {
        this.isCandyNearFrog = true;
        this.frog.setFrogStatus('mouthopen');
        this.isMouthOpen = true;
      }
    }
    if (this.isMouthOpen) {
      if (!(this.candy.endPoint.position.x < this.frog.position.x + this.frog.spriteWidth &&
        this.candy.endPoint.position.x + this.candy.candyImageWidth / 2 > this.frog.position.x - nearFrogDistance &&
        this.candy.endPoint.position.y < this.frog.position.y + this.frog.singleSpriteHeight &&
        this.candy.endPoint.position.y + this.candy.candyImageHeight / 2 > this.frog.position.y - nearFrogDistance)) {
        this.isCandyNearFrog = false;
        this.frog.setFrogStatus('mouthclose');
        this.isMouthOpen = false;
      }
    }
    if (!this.hasEaten) {
      if (this.candy.endPoint.position.x < this.frog.position.x + this.frog.spriteWidth - frogEatDistance &&
        this.candy.endPoint.position.x + this.candy.candyImageWidth / 2 > this.frog.position.x - frogEatDistance &&
        this.candy.endPoint.position.y < this.frog.position.y + this.frog.singleSpriteHeight &&
        this.candy.endPoint.position.y + this.candy.candyImageHeight / 2 > this.frog.position.y + frogEatDistance) {
        this.hasEaten = true;
        this.frog.setFrogStatus('chew');
        this.candy.hasEaten = true;
        this.isMouthOpen = false;
        setTimeout(() => {
          this.isGameOver = true;
        }, this.frog.numOfRows * this.frog.animationSpeed - gameOverDelay);
      }

      if (!this.isSad)
        if (this.candy.endPoint.position.y > this.frog.position.y + this.frog.singleSpriteHeight / 2) {
          this.frog.setFrogStatus('sad');
          this.isSad = true;
          setTimeout(() => {
            this.isGameOver = true;
          }, this.frog.numOfRows * this.frog.animationSpeed - gameOverDelay);
        }
    }

  }
}