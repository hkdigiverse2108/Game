class Nail {
  constructor(position) {
    this.x = position.x;
    this.y = position.y;
    this.nailImage = new Image();
    this.nailImage.src = './images/pin.png';
  }

  draw() {
    ctx.beginPath();
    ctx.drawImage(this.nailImage, this.x, this.y, this.nailImage.width, this.nailImage.height);
    ctx.closePath();
  }

  getNailCenter() {
    this.nailImage.onload = (e) => {
      let center = {
        x: this.nailImage.width / 2,
        y: this.nailImage.height / 2
      };
      return center;
    }
  }
}