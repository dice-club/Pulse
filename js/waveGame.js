"use strict"

function startWaveGame() {
  // change scene to game screen
  changeScene("gameArea");

  // Start playing audio
  audioContext.resume();
  audioElement.play();

  // initialize variables
  changeOffscreenDimensions(1, 2);
  gameAreaOrigin = new Vector(0, 0);
  probe = new Lander(gameAreaOrigin.x + WIDTH / 2, gameAreaOrigin.y + 0.03 * HEIGHT);
  trebleWaves = [];
  maxTrebleWaves = 0;
  bassWaves = [];
  maxBassWaves = 20;
  asteroids = [];
  maxAsteroids = 0;
  bullets = [];
  animations = [];
  stars = [];
  for (let i = 0; i < starsPerScreen * totalScreens; i++) {
    let x = randomValue(0, OFFSCREEN_WIDTH);
    let y = randomValue(0, terrain.highestGround);
    let r = randomValue(0.1, 5);
    stars[i] = new Star(x, y, r);
  }
  frameCounter = 0;

  // loop play
  loop = setInterval(playWaveGame, MS_PER_FRAME);
}

function playWaveGame() {
  // Check array keys for input
  applyKeyboardInput();

  // Update everything
  frameCounter++;
  updateWaves();
  updateAsteroids();
  updateAnimations();
  updateBullets();
  if (probe.groundState != probe.IN_GROUND) probe.applyForce(GRAVITY);
  probe.update();

  audioAnalysis();

  collisionDetectionWaves();

  drawEverythingWaves();
  // show developer-intended hitboxes and additional stuff
  if (DEV_MODE) showDeveloperStats();

  // check end states
  if(safeLanding) {
    safeLandingTimer--;
    console.log("safeLanding", safeLandingTimer);
    if(safeLandingTimer <= 0) {
      safeLanding = false;
      safeLandingTimer = safeLandingTimerMax;
      clearInterval(loop);
      changeScene("successScreen");
    }
  }
  if(badLanding) {
    badLandingTimer--;
    console.log("badLanding", badLandingTimer);
    if(badLandingTimer <= 0) {
      badLanding = false;
      badLandingTimer = badLandingTimerMax;
      clearInterval(loop);
      changeScene("gameOverScreen");
    }
  }

  // draw onto game area
  contextGA.fillStyle = "#555";
  contextGA.fillRect(0, 0, WIDTH, HEIGHT);
  contextGA.drawImage(canvasOffscreen, gameAreaOrigin.x, gameAreaOrigin.y, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
}