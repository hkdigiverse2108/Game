class Candy {
  constructor(endPoint) {
    this.endPoint = endPoint;
    this.candyImage = new Image();
    this.candyImage.src = './images/candy.png';
    this.candyImageWidth = this.candyImageHeight = 100;
    this.radius = 25;
    this.hasEaten = false;
  }


  update() {
    this.x = this.endPoint.position.x;
    this.y = this.endPoint.position.y;
    this.draw();
  }

  draw() {
    if (!this.hasEaten) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(this.candyImage, this.x - this.candyImageWidth / 4,
        this.y - this.candyImageHeight / 4, this.candyImageWidth / 2, this.candyImageHeight / 2);

      ctx.restore();
    }
  }
}