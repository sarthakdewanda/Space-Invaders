let xShip;
let bullets;
let aliens;
let stars = [];
const maxStars = 1000;

let speed = 2.5;
let alienSize = 25;

let startTime;
let gameStatus = "Playing"; // Added a game status variable

let spaceKeyPressed = false;

let timer = 0; // Initialize the timer
let isPaused = false; // Variable to track pause state

function setup() {
    let canvas = createCanvas(800, 600); // Create a canvas
    canvas.parent('gameCanvas'); // Attach the canvas to the HTML element with id "gameCanvas"
    enter(); // Initialize the game

    window.addEventListener('keydown', keyPressed);
    window.addEventListener('keyup', keyReleased);
}


function enter() {
  aliens = [];
  bullets = [];
  createAliens(aliens);
  xShip = width / 2;

  if (stars.length === 0) {
    createStars(stars); // Create stars
  

  startTime = millis(); // Initialize startTime to the current time
  gameStatus = "Playing"; // Set the initial game status
  timer = 0; // Reset the timer to 0 when entering a new game
  isPaused = false; // Reset the pause state
}

function draw() {
  background("black");

  displayStars(stars);

  if (gameStatus === "Playing") {
      // Check if the "P" key is held down
      if (keyIsDown(80)) { // 80 is the keyCode for "P"
          isPaused = !isPaused; // Toggle pause state
      }

      if (!isPaused) {
          displayShip();
          displayAliens(aliens);
          displayBullets(bullets);
          displayStats();

          checkKeys();
          updateAliens(aliens);
          updateBullets(bullets);
          updateStars(stars);

          timer = getElapsedSeconds();

          // Check if any alien has reached the bottom
          for (let i = 0; i < aliens.length; i++) {
              if (aliens[i].y >= height - alienSize) {
                  showScene("Game Over");
                  break;
              }
          }
      } else {
          // Display "Paused" at the center of the screen when the game is paused
          textSize(36);
          textAlign(CENTER, CENTER);
          fill("white");
          text("Paused", width / 2, height / 2);
      }

      // Center the timer text
      textSize(16);
      textAlign(CENTER, TOP);
      fill("white");
      text("Time: " + timer.toFixed(1) + "s", width / 2, 10);
  } else if (gameStatus === "Game Over") {
      // Display "Game Over" message and restart instructions
      fill("white");
      textSize(36);
      textAlign(CENTER, CENTER);
      text("Game Over", width / 2, height / 2);
      textSize(16);
      text("Press 'R' to restart", width / 2, height / 2 + 40);
  }
}

function keyPressed() {
  if (keyCode === 80) { // Check if the 'P' key is pressed for pause
      isPaused = !isPaused; // Toggle pause state
  }
  if (keyCode === 82) { // Check if the 'R' key is pressed
      enter(); // Restart the game
  }
}

function keyReleased() {
  // You can leave this function empty for now if you don't need it
}

function displayStats() {
  noStroke();
  fill("white");

  if (gameStatus !== "Game Over") {
    // Display instructions and aliens left in the top bar
    textSize(12);
    textAlign(LEFT);
    text("Use LEFT and RIGHT arrow keys to move ship. SPACE to fire", 10, 12);
    text("Aliens left: " + aliens.length, width - 120, 12);
  }
}

function createStars(ar) {
  for (let i = 0; i < maxStars; i++) {
      let star = { x: random(width), y: random(height) };
      ar.push(star);
  }
}

function updateStars(ar) {
  for (let i = 0; i < ar.length; i++) {
    ar[i].y++;

    if (ar[i].y > height) {
      ar[i].y = 0;
    }
  }
}

function displayStars(ar) {
  stroke("white");

  for (let i = 0; i < ar.length; i++) {
    point(ar[i].x, ar[i].y);
  }
}

function createAliens(arAliens) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      let alien = { x: 30 + col * 30, y: 30 + row * 30 };
      arAliens.push(alien);
    }
  }
}

function displayAliens(arAliens) {
  for (let i = 0; i < arAliens.length; i++) {
    let alien = arAliens[i];
    displayAlien(i, alien.x, alien.y);
  }
}

function updateAliens(arAliens) {
  let changeDir = false;

  for (let i = 0; i < arAliens.length; i++) {
    let alien = arAliens[i];

    alien.x += speed;

    if (alien.x > width || alien.x < 0) {
      moveAliensDown(arAliens);
      changeDir = true;
    }
  }

  if (changeDir) {
    speed *= -1;
  }
}

function moveAliensDown(arAliens) {
  for (let i = 0; i < arAliens.length; i++) {
    let alien = arAliens[i];
    alien.y += 10;

    if (alien.y > height - 40) {
      showScene("Status", -1);
    }
  }
}

function displayAlien(no, x, y) {
  let d = sin(frameCount * 0.1 * no);

  noStroke();
  fill("white");
  rect(x + d - alienSize / 2, y + d - alienSize / 2, alienSize, alienSize);

  fill("#101010");
  rect(x - 8, y - 5, 5, 5);
  rect(x + 3, y - 5, 5, 5);

  rect(x - 5, y + 5, 10, 3);
}

function findHitAlien(bullet) {
  for (let i = 0; i < aliens.length; i++) {
    let alien = aliens[i];

    if (collisionPointRect(bullet.x, bullet.y, alien.x, alien.y, alienSize, alienSize))
      return i;
  }

  return -1;
}

function createBullet(arBullets) {
  let bullet = { x: xShip + 20, y: height - 25 };
  arBullets.push(bullet);

  return bullet;
}

function displayBullet(bullet) {
  fill("white");
  ellipse(bullet.x, bullet.y, 10);
}

function displayBullets(arBullets) {
  for (let i = 0; i < arBullets.length; i++) {
    let bullet = arBullets[i];
    displayBullet(bullet);
  }
}

function updateBullets(arBullets) {
  for (let i = arBullets.length - 1; i >= 0; i--) {
    let bullet = arBullets[i];
    bullet.y -= 10;

    if (bullet.y < 0) {
      arBullets.splice(i, 1);
    }

    let hitAlienIndex = findHitAlien(bullet);
    if (hitAlienIndex !== -1) {
      aliens.splice(hitAlienIndex, 1);
      arBullets.splice(i, 1);

      if (aliens.length === 0) {
        let seconds = getElapsedSeconds();
        showScene("Status", seconds);
      }
    }
  }
}

function checkKeys() {
  if (keyIsDown(LEFT_ARROW) && xShip > 0) {
    xShip -= 3;
  }

  if (keyIsDown(RIGHT_ARROW) && xShip < width - 40) {
    xShip += 3;
  }

  if (keyIsDown(32) && !spaceKeyPressed) {
    createBullet(bullets);
    spaceKeyPressed = true;
  }

  if (!keyIsDown(32)) {
    spaceKeyPressed = false;
  }
}

function displayShip() {
  noFill();
  stroke("white"); // Add this line to draw the ship outline
  rect(xShip, height - 20, 40, 10);
  triangle(xShip, height - 20, xShip + 20, height - 30, xShip + 40, height - 20);
}

function getElapsedSeconds() {
  let elapsedMillis = millis() - startTime;
  let elapsedSeconds = elapsedMillis / 1000;
  return elapsedSeconds;
}


function collisionPointRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  );
}

function showScene(sceneName, seconds) {
  // Define your scene transition logic here.
  // You can switch scenes based on `sceneName` and use `seconds` if needed.
  if (sceneName === "Status") {
    // Handle the "Status" scene transition
    // You can set the game status to "Game Over" here
    gameStatus = "Game Over"; // Set the game status to "Game Over"
  } else if (sceneName === "AnotherScene") {
    // Handle another scene transition
  }
}
