class StarScore {
  constructor(position, stars) {
    this.position = position;
    this.result = [];
    this.stars = stars;
    this.ingamestarScoreImage = new Image();
    this.ingamestarScoreImage.src = './images/inGameScore.png';
    this.gameoverScoreImage = new Image();
    this.gameoverScoreImage.src = './images/gameOverStarScore.png';
    this.loadStarScore();
    this.index = this.getStarScore();

    this.spritePadding = 15;
  }

  loadStarScore() {
    this.ingamestarScoreImage.onload = (e) => {
      this.numOfRows = 4;
      this.spriteWidth = this.ingamestarScoreImage.width;
      this.spriteHeight = this.ingamestarScoreImage.height;
      this.singleSpriteHeight = this.spriteHeight / this.numOfRows;
    }
  }

  loadGameOverScore() {
    this.numOfRows = 4;
    this.spriteWidth = this.gameoverScoreImage.width;
    this.spriteHeight = this.gameoverScoreImage.height;
    this.singleSpriteHeight = this.spriteHeight / this.numOfRows;
  }

  getStarScore() {
    this.result = this.stars.filter((star) => {
      return star.hasDisappeared === true;
    });
    return this.result.length;
  }

  updateStarScore() {
    this.index = this.getStarScore();
  }

  drawGameStarScore(scoreStatus) {
    ctx.beginPath();
    switch (scoreStatus.toLowerCase()) {
      case 'gameover':
        ctx.drawImage(this.gameoverScoreImage, 0, this.index * this.singleSpriteHeight, this.spriteWidth, this.singleSpriteHeight,
          CANVAS_WIDTH / 2 - this.spriteWidth / 2 - this.spritePadding, CANVAS_HEIGHT / 2 - this.singleSpriteHeight / 2 - this.spritePadding,
          this.spriteWidth, this.singleSpriteHeight);
        break;

      case 'ingame':
        ctx.drawImage(this.ingamestarScoreImage, 0, this.index * this.singleSpriteHeight, this.spriteWidth, this.singleSpriteHeight,
          this.position.x - this.spritePadding, this.position.y - this.spritePadding,
          this.spriteWidth, this.singleSpriteHeight);
        break;

      default:
        ctx.drawImage(this.ingamestarScoreImage, 0, this.index * this.singleSpriteHeight, this.spriteWidth, this.singleSpriteHeight,
          this.position.x - this.spritePadding, this.position.y - this.spritePadding,
          this.spriteWidth, this.singleSpriteHeight);
    }
    ctx.closePath();

  }

}