"use strict"
class Lander {

  constructor(x, y){
    // image data
    this.landerThrusterSheet = new Image();
    this.landerThrusterSheet.src = "images/landerThrusterSheet.png";
    this.landerStaticImage = new Image();
    this.landerStaticImage.src = "images/landerStaticImage.png";
    this.spriteWidth = 42, this.spriteHeight = 50;

    // vector quantities
    this.coordinates = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);

    // scalar quantities
    this.mass = 1;
    this.width = 50;
    this.height = this.width * (this.spriteHeight / this.spriteWidth); // calculate height based on width and sprite size to not distort the image

    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;

    this.thrusters = 0.15;
    this.momentOfInertia = (.5 * this.mass * Math.pow(this.width/2, 2));
    this.fuel = 3000;
    this.fillStyle = 'rgb(255, 255, 255)';

    // sprite animation
    this.numImages = 3, this.currImage = 0;
    this.animationDirection = 1;
    this.thrustersOn = false;
    this.framesPerAnimation = 2; // change this to change the animation speed
    this.animationTimer = 0;
  }

  applyForce(force){ // force need be a vector
    this.acceleration.add(force);
  }

  applyTorque(clockwise){
    if (clockwise) {
      this.angularAcceleration += 0.01;
    } else {
      this.angularAcceleration -= 0.01;
    }
  }

  applyThrusters(){
    let thrustForce = new Vector(this.thrusters * Math.cos(this.angle-(Math.PI/2)), this.thrusters * Math.sin(this.angle-(Math.PI/2)));

    this.thrustersOn = true;

    this.acceleration.add(thrustForce)
  }

  update() {
    // Translational motion
    this.velocity.add(this.acceleration);
    this.coordinates.add(this.velocity);

    this.acceleration.mult(0);

    // Rotational motion
    //this.angularAcceleration += ((-this.angularVelocity*.9)/this.momentOfInertia);
    this.angularAcceleration += (-this.angularVelocity*.05);


    this.angularVelocity += this.angularAcceleration;
    this.angle += this.angularVelocity;

    this.angularAcceleration *= 0;

    // Animate through sprite sheets
    this.animationTimer--;
    if(this.animationTimer <= 0) {
      this.animationTimer = this.framesPerAnimation;
      this.animate();
    }
  }

  showRect() {
    contextGA.fillStyle = this.fillStyle;

    contextGA.save();
    contextGA.translate(this.coordinates.x + this.width/2, this.coordinates.y + this.height/2);
    contextGA.rotate(this.angle);
    contextGA.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    contextGA.restore();

    contextGA.fillStyle = "Tomato";
    contextGA.fillRect(this.x, this.y, 4, 4);
    contextGA.fillStyle = "yellow";
    contextGA.fillRect(this.x + this.width, this.y + this.height, 4, 4);

    contextGA.fillStyle = "#000000";
  }

  showSprite() {
    contextGA.save();
    contextGA.translate(this.coordinates.x + this.width/2, this.coordinates.y + this.height/2);
    contextGA.rotate(this.angle);
    if(this.thrustersOn) {
      contextGA.drawImage(this.landerThrusterSheet, this.currImage*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, -this.width/2, -this.height/2, this.width, this.height);
    }
    else {
      contextGA.drawImage(this.landerStaticImage, -this.width/2, -this.height/2, this.width, this.height);
    }
    contextGA.restore();
  }

  // private
  animate() {
    // if thrusters are on, cycle through the images
    if(this.thrustersOn) {
      // console.log("animating thrusters; currImage: " + this.currImage + ", animationDirection: " + this.animationDirection + ", numImages: " + this.numImages);
      this.currImage += this.animationDirection;

      // switch animation direction back and forth
      if(this.currImage >= this.numImages - 1) {
        this.currImage = 2;
        this.animationDirection = -1;
      }
      else if(this.currImage <= 0) {
        this.currImage = 0;
        this.animationDirection = 1;
      }
    }
    else {
      this.currImage = 2; // when the thrusters first come on, the flame starts small
    }
  }

  get x(){
    return this.coordinates.x;
  }

  get y(){
    return this.coordinates.y;
  }

  // set fillStyle(newStyle){
  //   if (typeof newStyle == 'string') {
  //     this.fillStyle = newStyle;
  //   }
  // }

  toString(){
    return (`Acceleration: ${this.acceleration.toString()} \n Velocity: ${this.velocity.toString()} \n Location: ${this.coordinates.toString()}`);

  }

}
