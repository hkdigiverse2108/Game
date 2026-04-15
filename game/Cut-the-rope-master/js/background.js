class Background {
  constructor(position, source) {
    this.x = position.x;
    this.y = position.y;
    this.backgroundImage = new Image();
    this.backgroundImage.src = './images/background.png';
  }

  draw() {
    ctx.beginPath();
    ctx.drawImage(this.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
