let newGame;
let background = new Background(new Vec2(0, 0))
let level1, level2;

let init = () => {
  level1 = {
    background: background,
    nails: [new Nail(new Vec2(CANVAS_WIDTH / 2 - nailImageWidth, 50))],
    ropes: [
      new Rope(new Vec2(CANVAS_WIDTH / 2, 50 + NailImageHeight), 15, 10)
    ],

    stars: [
      new Star(new Vec2(CANVAS_WIDTH / 2, 325), 0),
      new Star(new Vec2(CANVAS_WIDTH / 2, 395), 6),
      new Star(new Vec2(CANVAS_WIDTH / 2, 475), 12)
    ],

    frog: new Frog(new Vec2(CANVAS_WIDTH / 2, CANVAS_HEIGHT - FrogPositionBottomOffset)),
  }
  level1.candy = new Candy(level1.ropes[0].getRopeEnd());
  level1.inGameScore = new StarScore(new Vec2(50, 50), level1.stars);


  level2 = {
    background: background,
    nails: [
      new Nail(new Vec2(CANVAS_WIDTH / 3 - nailImageWidth, 100)),
      new Nail(new Vec2(CANVAS_WIDTH / 3 + CANVAS_WIDTH / 6 - nailImageWidth, 100)),
      new Nail(new Vec2(2 * CANVAS_WIDTH / 3 - nailImageWidth, 100))
    ],
    ropes: [
      new Rope(new Vec2(CANVAS_WIDTH / 3, 100 + NailImageHeight), 20, 10),
      new Rope(new Vec2(CANVAS_WIDTH / 3 + CANVAS_WIDTH / 6, 100 + NailImageHeight), 23, 10),
      new Rope(new Vec2(2 * CANVAS_WIDTH / 3, 100 + NailImageHeight), 35, 10)
    ],

    stars: [
      new Star(new Vec2(2 * CANVAS_WIDTH / 3, 325), 0),
      new Star(new Vec2(CANVAS_WIDTH / 2, 475), 6),
      new Star(new Vec2(2 * CANVAS_WIDTH / 3 - 50, 575), 12)
    ],

    frog: new Frog(new Vec2(2 * CANVAS_WIDTH / 3, CANVAS_HEIGHT - FrogPositionBottomOffset)),
  }
  level2.candy = new Candy(level2.ropes[0].getRopeEnd());
  level2.inGameScore = new StarScore(new Vec2(50, 50), level2.stars);
}


document.body.onload = (e) => {
  init();
  newGame = new Game(level1);
  backgroundSound.play().catch((e) => {
  })
}

// //Mousemove functions.
// canvas.addEventListener('mousemove', function (evt) {
//   mousePos = getMousePos(canvas, evt);
//   level1.ropes[0].position = new Vec2(mousePos.x, mousePos.y);
// }, false);

// function getMousePos(canvas, evt) {
//   var rect = canvas.getBoundingClientRect();
//   return {
//     x: evt.clientX - rect.left,
//     y: evt.clientY - rect.top
//   };
// }



