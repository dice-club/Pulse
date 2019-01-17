"use strict"

class Lander {

  constructor(x, y) {
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

    this.shape;
    this.generateDimensions();

    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;

    this.thrusterPower = 0.15;
    this.momentOfInertia = (.5 * this.mass * Math.pow(this.width/2, 2) );
    this.fuel = 3000;
    this.fillStyle = 'rgb(255, 255, 255)';

    // collision detection with ground
    this.impactGround = true; //true on first frame of touching ground
    this.touchingGround = false; //true if at least one vertex is touching the ground
    this.inGround = false; //true if two or more vertices are touching the ground; lander is then unable to move or take off again
    this.groundedVertexPositions = [];

    // sprite animation
    this.numImages = 3, this.currImage = 0;
    this.animationDirection = 1;
    this.thrustersOn = false;
    this.framesPerAnimation = 3; // change this to change the animation speed
    this.animationTimer = 0;
  }

  update() {
    if(this.inGround) {
      this.velocity.mult(0);
      this.acceleration.mult(0);
      this.angularVelocity = 0;
      this.angularAcceleration = 0;
    }

    // Translational motion
    this.velocity.add(this.acceleration);
    this.coordinates.add(this.velocity);
    this.shape.translate(this.velocity);
    this.acceleration.mult(0);

    // Rotational motion
    //this.angularAcceleration += ((-this.angularVelocity*.9)/this.momentOfInertia);
    this.angularAcceleration += (-this.angularVelocity*.05);
    this.angularVelocity += this.angularAcceleration;
    this.angle += this.angularVelocity;
    this.shape.rotate(this.angularVelocity);
    this.angularAcceleration *= 0;

    this.animate();

    if(this.touchingGround) {
      this.collideWithGround();
    }
    else {
      this.fillStyle = "rgb(0, 255, 0)";
      this.impactGround = true;
      this.groundedVertexPositions = [];
    }

    // if approaching the edge of the screen, move the screen
    let xDiff = 0.333 * WIDTH;
    let yDiff = 0.4 * HEIGHT;
    if(this.x < gameAreaOrigin.x + xDiff && this.velocity.x < 0 && gameAreaOrigin.x + this.velocity.x > 0) {
      gameAreaOrigin.add(new Vector(this.velocity.x, 0));
    }
    if(this.x > gameAreaOrigin.x + WIDTH - xDiff && this.velocity.x > 0 && gameAreaOrigin.x + WIDTH + this.velocity.x < OFFSCREEN_WIDTH) {
      gameAreaOrigin.add(new Vector(this.velocity.x, 0));
    }
    if(this.y < gameAreaOrigin.y + yDiff && this.velocity.y < 0 && gameAreaOrigin.y + this.velocity.y > 0) {
      gameAreaOrigin.add(new Vector(0, this.velocity.y));
    }
    if(this.y > gameAreaOrigin.y + HEIGHT - yDiff && this.velocity.y > 0 && gameAreaOrigin.y + HEIGHT + this.velocity.y < OFFSCREEN_HEIGHT) {
      gameAreaOrigin.add(new Vector(0, this.velocity.y));
    }
    
    // If offscreen, print coordinates
    if(this.x < -this.width || this.x > OFFSCREEN_WIDTH || this.y < -this.height || this.y > OFFSCREEN_HEIGHT) {
      console.log("Lander is offscreen at (" + Math.floor(this.x) + ", " + Math.floor(this.y) + ") with velocity x:" + Math.floor(this.velocity.x) + " y:" + Math.floor(this.velocity.y));
    }
  }

  showDeveloperStats(context) {
    context.save();

    // show shape
    this.shape.draw(context, this.fillStyle, true);

    // show big box
    context.strokeStyle = "pink";
    context.strokeRect(this.x + this.width/2 - this.boxRadius, this.y + this.height/2 - this.boxRadius, 2*this.boxRadius, 2*this.boxRadius);

    context.restore();
  }

  draw(context) {
    context.save();

    // draw lander image
    context.translate(this.coordinates.x + this.width/2, this.coordinates.y + this.height/2);
    context.rotate(this.angle);
    if(this.thrustersOn) {
      context.drawImage(this.landerThrusterSheet, this.currImage*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, -this.width/2, -this.height/2, this.width, this.height);
    } else {
      context.drawImage(this.landerStaticImage, -this.width/2, -this.height/2, this.width, this.height);
    }

    context.restore();
  }

  animate() {
    // Decrease timer
    this.animationTimer--;
    if(this.animationTimer > 0) {
      return;
    }
    this.animationTimer = this.framesPerAnimation;

    // Change sprite:
    // if thrusters are on, cycle through the images
    if(this.thrustersOn) {
      this.currImage += this.animationDirection;

      // switch animation direction back and forth
      if(this.currImage >= this.numImages - 1) {
        this.currImage = 2;
        this.animationDirection = -1;
      } else if(this.currImage <= 0) {
        this.currImage = 0;
        this.animationDirection = 1;
      }
    } else {
      this.currImage = 2; // when the thrusters first come on, the flame starts small
    }
  }

  collideWithGround() {
    this.fillStyle = "rgb(255, 0, 0)";
    // On first impact, bounce velocity
    if(this.impactGround) {
      let velMult = -0.2;
      this.velocity = new Vector(this.velocity.x*velMult, this.velocity.y*velMult);
      if(Math.abs(this.velocity.y) < 1) {
        this.velocity.mult(0);
      }
    }
    else if(this.velocity.y > 0) {
      this.velocity.mult(0);
    }
    this.impactGround = false;
    // If two or more vertices are touching the ground, the lander is static
    if(this.groundedVertexPositions.length >= 2 || this.groundedVertexPositions[0] == 0) {
      this.inGround = true;
      return;
    }
    // Apply torque on vertices
    let totalTorque = 0;
    for(let i = 0; i < this.shape.vertices.length; i++) {
      let vertex = this.shape.vertices[i];

      // If the vertex is not grounded, add torque
      if(!this.groundedVertexPositions.includes(i)) {
        let direction = new Vector(vertex.x, vertex.y);
        direction.sub(this.shape.centroid);
        let angle = direction.angle;
        let torque = direction.magnitude*Math.sin(angle);
        totalTorque += torque;
      }
    }
    if(Math.abs(totalTorque) < 1) totalTorque = 0;
    let clockwise = totalTorque > 0 ? true : false;
    let torqueMultiplier = Math.abs(totalTorque)*0.01;
    this.applyTorque(clockwise, torqueMultiplier);
  }

  generateDimensions() {
    this.width = 50;
    this.height = this.width * (this.spriteHeight / this.spriteWidth); // calculate height based on width and sprite size to not distort the image
    let xs = this.width*(3/42), xl = this.width*(11/42); //x-small and x-large
    let ys = this.height*(15/50), yl = this.height*(47/50); //y-small and y-large
    let vertices = [
      new Vector(this.x + this.width/2, this.y),
      new Vector(this.x + this.width - xl, this.y + ys),
      new Vector(this.x + this.width - xs, this.y + yl),
      new Vector(this.x + xs, this.y + yl),
      new Vector(this.x + xl, this.y + ys),
    ]; //pentagon
    this.shape = new Polygon(vertices);
    this.mass = 1; //equal to 1

    let maxDistance = 0;
    for(let vertex of this.shape.vertices) {
      let thisDistance = distance(vertex.x, vertex.y, this.shape.x, this.shape.y);
      if(thisDistance > maxDistance) {
        maxDistance = thisDistance;
      }
    }
    this.boxRadius = maxDistance;
  }

  applyForce(force) { // force need be a vector
    let appliedForce = new Vector(force.x, force.y);
    appliedForce.div(this.mass);
    this.acceleration.add(appliedForce);
  }

  applyTorque(clockwise, multiplier) {
    if(multiplier == undefined) multiplier = 1;
    if(clockwise) {
      this.angularAcceleration += 0.01 * multiplier;
    } else {
      this.angularAcceleration -= 0.01 * multiplier;
    }
  }

  applyThrusters() {
    let thrustForce = new Vector(this.thrusterPower * Math.cos(this.angle-(Math.PI/2)), this.thrusterPower * Math.sin(this.angle-(Math.PI/2)));

    this.thrustersOn = true;

    this.applyForce(thrustForce);
  }

  translate(translationVector) {
    this.coordinates.add(translationVector);
    this.shape.translate(translationVector);
  }

  get x() {
    return this.coordinates.x;
  }
  get y() {
    return this.coordinates.y;
  }

  toString() {
    return (`Acceleration: ${this.acceleration.toString()} \n Velocity: ${this.velocity.toString()} \n Location: ${this.coordinates.toString()}`);
  }
}
