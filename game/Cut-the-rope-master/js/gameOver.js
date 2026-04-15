class GameOver {
  constructor() {
    this.curtainTopImage = new Image();
    this.curtainTopImage.src = './images/curtainTop.png';
    this.curtainBottomImage = new Image();
    this.curtainBottomImage.src = './images/curtainBottom.png';
    this.button = new Image();
    this.button.src = './images/buttons.png';
    this.dy = 0;
    this.isCurtainClosed = false;

    this.buttonOffsetFromCentre = 100;

    this.replayButtonIndex = 0;
    this.nextButtonIndex = 0;

    this.loadCutTheRopeFont();
    this.loadImages();
    this.loadButtonImage();
    this.updateButtonHover();
    this.updateButtonClick();

  }

  loadCutTheRopeFont() {
    let font = new FontFace('GooddP', 'url(./fonts/GOODDP.TTF)');
    font.load().then((loaded_face) => {
      document.fonts.add(loaded_face);
      document.body.style.fontFamily = '"GooddP", Arial';
    }).catch(function (error) {
      // error occurred
    });
  }

  loadImages() {
    this.curtainImageList = [this.curtainBottomImage, this.curtainTopImage];
    for (let curtain of this.curtainImageList) {
      curtain.onload = (e) => {
        this.spriteWidth = this.curtainTopImage.width;
        this.spriteHeight = this.curtainTopImage.height;
      };
    }
  }

  loadButtonImage() {
    this.buttonSpriteRow = 2;
    this.button.onload = (e) => {
      this.buttonWidth = this.button.width;
      this.buttonTotalHeight = this.button.height;
      this.buttonHeight = this.buttonTotalHeight / this.buttonSpriteRow;
    }
  }

  updateCurtainSpeed() {
    this.dy += 8;
    if (this.dy > CANVAS_HEIGHT / 2) {
      this.dy = CANVAS_HEIGHT / 2;
      this.isCurtainClosed = true;
    }
  }

  drawCurtain() {
    ctx.beginPath();
    ctx.drawImage(this.curtainTopImage, 0, -CANVAS_HEIGHT / 2 + this.dy, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.drawImage(this.curtainBottomImage, 0, CANVAS_HEIGHT - this.dy, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.closePath();
  }

  curtainCloseAnimation() {
    this.updateCurtainSpeed();
    this.drawCurtain();
    if (this.isCurtainClosed) {
      this.displayScoreBoard();
      newGame.inGameScore.loadGameOverScore();
      newGame.inGameScore.drawGameStarScore('gameover');
    }
  }

  displayScoreBoard() {
    this.textStatus();
    this.drawButtons();
  }

  updateButtonHover() {
    canvas.addEventListener('mousemove', (e) => {
      if (e.layerX >= CANVAS_WIDTH / 3 - this.buttonWidth / 2 &&
        e.layerX <= CANVAS_WIDTH / 3 + this.buttonWidth / 2 &&
        e.layerY >= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre &&
        e.layerY <= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre + this.buttonHeight) {
        this.replayButtonIndex = 1;
      } else {
        this.replayButtonIndex = 0;
      }
      if (e.layerX >= (CANVAS_WIDTH / 3) * 2 - this.buttonWidth / 2 &&
        e.layerX <= (CANVAS_WIDTH / 3) * 2 + this.buttonWidth / 2 &&
        e.layerY >= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre &&
        e.layerY <= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre + this.buttonHeight) {
        this.nextButtonIndex = 1;
      } else {
        this.nextButtonIndex = 0;
      }
    })
  }

  updateButtonClick() {
    canvas.addEventListener('click', (e) => {
      if (e.layerX >= CANVAS_WIDTH / 3 - this.buttonWidth / 2 &&
        e.layerX <= CANVAS_WIDTH / 3 + this.buttonWidth / 2 &&
        e.layerY >= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre &&
        e.layerY <= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre + this.buttonHeight && newGame.isGameOver) {
        init();
        // newGame = new Game(level1);
        location.reload();
      }
      if (e.layerX >= (CANVAS_WIDTH / 3) * 2 - this.buttonWidth / 2 &&
        e.layerX <= (CANVAS_WIDTH / 3) * 2 + this.buttonWidth / 2 &&
        e.layerY >= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre &&
        e.layerY <= CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre + this.buttonHeight) {
        init();
        newGame = new Game(level2);
      }
    })
  }

  textStatus() {
    ctx.beginPath();
    ctx.font = '50px GooddP';
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    switch (newGame.inGameScore.getStarScore()) {
      case 1:
        this.scoreText = 'Good!';
        break;
      case 2:
        this.scoreText = 'Great!'
        break;
      case 3:
        this.scoreText = 'Excellent!'
        break;

      default:
        this.scoreText = 'Sad'
        break;
    }
    ctx.strokeText(`${this.scoreText}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 150);
    ctx.fillText(`${this.scoreText}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 150);
    ctx.closePath();
  }

  drawButtons() {
    ctx.beginPath();
    ctx.font = '38px GooddP';
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;

    ctx.drawImage(this.button, 0, this.replayButtonIndex * this.buttonHeight, this.buttonWidth, this.buttonHeight,
      CANVAS_WIDTH / 3 - this.buttonWidth / 2, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre, this.buttonWidth, this.buttonHeight);
    ctx.strokeText(`Replay`, CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre * 1.4);
    ctx.fillText(`Replay`, CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre * 1.4);

    if (newGame.inGameScore.index > 0) {
      ctx.drawImage(this.button, 0, this.nextButtonIndex * this.buttonHeight, this.buttonWidth, this.buttonHeight,
        (CANVAS_WIDTH / 3) * 2 - this.buttonWidth / 2, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre, this.buttonWidth, this.buttonHeight);
      ctx.strokeText(`Next Level`, (CANVAS_WIDTH / 3) * 2, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre * 1.4);
      ctx.fillText(`Next Level`, (CANVAS_WIDTH / 3) * 2, CANVAS_HEIGHT / 2 + this.buttonOffsetFromCentre * 1.4);
    }
  }

}