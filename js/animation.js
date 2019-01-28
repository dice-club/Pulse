class Animation {

  constructor(position, spriteSheetSource, sheetWidth, sheetHeight, spriteWidth, spriteHeight, numSprites = -1, framesPerSprite = 3, scale = 1, repeat = false) {
    this.coordinates = new Vector(position.x, position.y);
    this.spriteSheet = new Image();
    this.spriteSheet.src = spriteSheetSource;
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.numSprites = numSprites;
    this.spriteCounter = 0;
    if (framesPerSprite <= 0) {
      this.framesPerSprite = 0;
    } else {
      this.framesPerSprite = framesPerSprite;
    }
    this.scale = scale;
    this.repeat = repeat;


    this.counter = 0;
    this.currentImagePosX = 0;
    this.currentImagePosY = 0;

    this.maxImagePosX = Math.floor(this.sheetWidth / this.spriteWidth);
    this.maxImagePosY = Math.floor(this.sheetHeight / this.spriteHeight);
  }

  update() {




    //update counter
    if (this.counter < this.framesPerSprite) {
      this.counter++;
    } else {
      this.counter = 0;

      //increment X position on sprite sheet
      if (this.currentImagePosX < this.maxImagePosX - 1) {
        this.spriteCounter++;
        this.currentImagePosX++;

        //if you get to the end from left to right, go down a row
      } else {
        this.currentImagePosX = 0;

        //increment Y position on sprite sheet
        if (this.currentImagePosY < this.maxImagePosY - 1) {
          this.spriteCounter++;
          this.currentImagePosY++;

          //if you get to the bottom right hand corner of sprite sheet, loop back to beginning
        } else {
          this.currentImagePosY = 0;

          //make repeat true if the spirte finishes 1 full animation (if numSprites is not defined)
          this.repeat = true;
        }
      }


      //if numSprites is defined, make sure you don't load more sprites than there are on the sheet
      if (this.numSprites != -1) {
        if (this.spriteCounter >= this.numSprites) {
          this.spriteCounter = 0;
          this.currentImagePosX = 0;
          this.currentImagePosY = 0;

          //make repeat true if the sprite finishes 1 full animation (if numSprites is defined)
          this.repeat = true;
        }
      }
    }
  }

  draw(context) {
    //display sprite
    context.drawImage(this.spriteSheet, //Sprite sheet source
      this.currentImagePosX * this.spriteWidth, //X Pos on sheet
      this.currentImagePosY * this.spriteHeight, //Y Pos on sheet
      this.spriteWidth, //Sprite width
      this.spriteHeight, //Sprite Height
      this.coordinates.x, //X Pos on canvas
      this.coordinates.y, //Y Pos on canvas
      this.spriteWidth * this.scale, //Width on screen
      this.spriteHeight * this.scale); //Height on screen
  }

}