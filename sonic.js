
// resize image to 1050x350
// board
let board;
let boardWidth = 1050;
let boardHeight = 350;
let context;

// background
let bgImg;
let bgX = 0;
let bgSpeed = 2.5;

// sonic
let sonicWidth = 88;
let sonicHeight = 94;
let sonicX = 50;
let sonicY = 212;
let sonicImg;

let gameOverAudio;
let coinAudio;
let mainTheme;
let wonSound;
let jumpAudio;

let sonic = {
  x: sonicX,
  y: sonicY,
  width: sonicWidth,
  height: sonicHeight,
  coins: 0
};

// obstacle
let obstaclesArray = [];
// coins
let coinArray = [];

let obstacle1Width = 60;
let obstacle2Width = 69;
let obstacle3Width = 102;

let obstacleHeight = 70;
let obstacleX = 1050;
let obstacleY = 234;

let obstacle1Img;
let obstacle2Img;
let obstacle3Img;
let coinImg;

// physics
let velocityX = -8; // obstacle moving left speed
let velocityY = 0;
let gravity = 0.8;

let gameOver = false;
let won = false;
let score = 0;

// Sonic spritesheet
let sonicSpritesheet;
let frameWidth = 150;
let frameHeight = 183;
let frameCount = 8;
let frameInterval = 4; // Speed of animation, decrease for faster animation
let currentFrame = 0;
let frameCounter = 0;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;

  context = board.getContext("2d"); // used for drawing on the board

  gameOverAudio = document.getElementById("gameOverAudio");

  coinAudio = document.getElementById("coinAudio");

  mainTheme = document.getElementById("mainTheme");

  wonSound = document.getElementById("wonAudio");

  jumpAudio = document.getElementById("jumpAudio");

  //eventListener auto play music restriction bug
  //can't remove this function
  //as soon as the user input a key, it will start playing the main theme

  document.addEventListener("keydown", function () {
    mainTheme.play();
    mainTheme.volume = 0.1;
  });

  bgImg = new Image();
  bgImg.src = "./img/bg.jpg";

  sonicImg = new Image();
  sonicImg.src = "./img/sonic.png";
  sonicImg.onload = function () {
    context.drawImage(sonicImg, sonic.x, sonic.y, sonic.width, sonic.height);
  };

  obstacle1Img = new Image();
  obstacle1Img.src = "./img/obstacle1.png";

  obstacle2Img = new Image();
  obstacle2Img.src = "./img/obstacle2.png";

  obstacle3Img = new Image();
  obstacle3Img.src = "./img/obstacle3.png";

  coinImg = new Image();
  coinImg.src = "./img/coin.png";

  sonicSpritesheet = new Image();
  sonicSpritesheet.src = "./img/sonic.png";
  sonicSpritesheet.onload = function () {
    animateSprite(); // function recalled to start animating the Sonic spritesheet
  };

  requestAnimationFrame(update);
  setInterval(placeObstacle, 1000); // 1000 milliseconds = 1 second
  setInterval(placeCoin, 2000); // Place a coin every 3 seconds or may be 2
  document.addEventListener("keydown", moveSonic);
};
function update() {
  requestAnimationFrame(update);

  if (gameOver || won) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  // Background
  bgX -= bgSpeed;
  if (bgX <= -boardWidth) {
    bgX = 0;
  }
  context.drawImage(bgImg, bgX, 0);
  context.drawImage(bgImg, bgX + boardWidth, 0);

  // Sonic
  velocityY += gravity;
  sonic.y = Math.min(sonic.y + velocityY, sonicY); // apply gravity to current sonic.y, making sure it doesn't exceed the ground

  // Update current frame
  if (frameCounter % frameInterval === 0) {
    currentFrame = (currentFrame + 1) % frameCount;
  }
  frameCounter++;

  // Calculate the position of the current frame in the spritesheet
  const frameX = currentFrame * frameWidth;

  // the current frame from the spritesheet
  context.drawImage(
    sonicImg,
    frameX,
    0,
    frameWidth,
    frameHeight,
    sonic.x,
    sonic.y,
    sonic.width,
    sonic.height
  );

  // Obstacle
  for (let i = 0; i < obstaclesArray.length; i++) {
    let obstacle = obstaclesArray[i];
    obstacle.x += velocityX;
    context.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    if (detectCollision(sonic, obstacle)) {
      gameOver = true;
      mainTheme.pause();
      gameOverAudio.play();
      sonicSpritesheet.src = "./img/sonic-dead.png";
      sonicSpritesheet.onload = function () {
        
        //removed bg and replaced + sonic-dead
        context.clearRect(sonic.x, sonic.y, sonic.width, sonic.height);
        context.drawImage(bgImg, bgX, 0);
        context.drawImage(bgImg, bgX + boardWidth, 0);
        context.drawImage(sonicSpritesheet, sonic.x, sonic.y, sonic.width, sonic.height);

        context.fillStyle = "black";
          context.font = "bold 60px Copperplate, Papyrus, fantasy";
          context.fillText("Game Over", 400, 200);

      };
    }
  }

  // Coins detecCollision (a,b)
  for (let i = 0; i < coinArray.length; i++) {
    let coin = coinArray[i];
    coin.x += velocityX;
    context.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);

    if (detectCollision(sonic, coin)) {
      coinArray.splice(i, 1);
      sonic.coins++;
      coinAudio.play(); // Play coin sound

      // with this code I tried to make him won---------
      if (sonic.coins == 23) {
        won = true;
        sonic.y ;
        mainTheme.pause();
        wonSound.play();
      
        // Create a new image element for the won state
        var sonicWonImg = new Image();
        sonicWonImg.src = "./img/sonic-won.png";
        sonicWonImg.onload = function() {
          context.clearRect(sonic.x, sonic.y, sonic.width, sonic.height);
          context.drawImage(bgImg, bgX, 0);
          context.drawImage(bgImg, bgX + boardWidth, 0);
          context.drawImage(sonicWonImg, sonic.x + 275, sonic.y + 65, sonic.width, sonic.height);

          context.fillStyle = "black";
          context.font = "bold 30px Copperplate, Papyrus, fantasy";
          context.fillText("Total Score " + score, 425, 200);
          context.fillText("Coins Earned "+ sonic.coins, 425,250);
        };
      }
    }
  }


  // Score
  context.fillStyle = "orange";
  context.font = "bold 34px Copperplate, Papyrus, fantasy";
  score++;
  context.fillText(score, 5, 30);

  // Coin count
  context.fillText("Coins earned: " + sonic.coins, 700, 30);
}

function moveSonic(e) {
  if (gameOver) {
    return;
  }

  if ((e.code == "Space" || e.code == "ArrowUp") && sonic.y == sonicY) {
    //jump
    velocityY = -15;
    jumpAudio.play();
  } else if (e.code == "ArrowDown" && sonic.y == sonicY) {
  }
}

function placeObstacle() {
  if (gameOver) {
    return;
  }

  // Place obstacle
  let obstacle = {
    img: null,
    x: obstacleX,
    y: obstacleY,
    width: null,
    height: obstacleHeight,
  };

  let placeObstacleChance = Math.random(); // 0 - 0.9999...

  if (placeObstacleChance > 0.9) {
    // 10% you get obstacle3
    obstacle.img = obstacle3Img;
    obstacle.width = obstacle3Width;
    obstaclesArray.push(obstacle);
  } else if (placeObstacleChance > 0.7) {
    // 30% you get obstacle2
    obstacle.img = obstacle2Img;
    obstacle.width = obstacle2Width;
    obstaclesArray.push(obstacle);
  } else if (placeObstacleChance > 0.5) {
    // 50% you get obstacle1
    obstacle.img = obstacle1Img;
    obstacle.width = obstacle1Width;
    obstaclesArray.push(obstacle);
  }

  if (obstaclesArray.length > 5) {
    obstaclesArray.shift();
  }
}

// Place coin function
function placeCoin() {
  if (gameOver) {
    return;
  }

  let coin = {
    x: obstacleX,
    y: obstacleY - 80,
    width: 40,
    height: 40,
  };

  coinArray.push(coin);
}

// sonic/obstacle //sonic/coin
function detectCollision(a, b) {
  return (
    a.x + 7 < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x + 8 && // a's top right corner passes b's top left corner
    a.y + 7 < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y + 8 // a's bottom left corner passes b's top left corner
  );
}
