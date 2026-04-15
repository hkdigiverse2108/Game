const CANVAS_WIDTH = 940,
  CANVAS_HEIGHT = window.innerHeight;

const nailImageWidth = NailImageHeight = 12.5;

const FrogPositionBottomOffset = 100,
  nearFrogDistance = 30,
  frogEatDistance = 20;

const gameOverDelay = 500;


document.body.style.margin = "0px";
document.body.style.padding = "0px";

const canvas = document.createElement('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.style.display = 'block';
canvas.style.margin = '0 auto';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');


const backgroundSound = new Audio('./sounds/main.mp3'),
  star1Sound = new Audio('./sounds/star_1.mp3'),
  star2Sound = new Audio('./sounds/star_2.mp3'),
  star3Sound = new Audio('./sounds/star_3.mp3'),
  ropeCutSound = new Audio('./sounds/cut.mp3'),
  sadSound = new Audio('./sounds/sad.mp3'),
  eatSound = new Audio('./sounds/eat.mp3');