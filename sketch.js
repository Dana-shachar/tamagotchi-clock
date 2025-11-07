let clock;

 //==================== START OF CLASS ====================
class Clock {
  constructor(cols, rows, cellSize) {
    //grid properties
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.grid = this.createGrid();

    this.mood = "happy";
    this.feedCount = 0;
    this.lastFeedTime = millis();
    this.stressedStartTime = null;
  }

  createGrid() {
    let grid = [];

    //initialize grid
    for (let i = 0; i < this.cols; i++) {
      grid[i] = [];
      for (let j = 0; j < this.rows; j++) {
        grid[i][j] = color(255);
      }
    }
    return grid;
    }

  drawGrid() {
    fill(this.drawMood());
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        rect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  clockHand(angle){
    //center of the clock hand
    let cx = 8;
    let cy = 8;
    let length = 7
    let positions = [];
    //calculate hand positions along the clock hand
    for (let r = 0; r < length; r++) {
      let x = Math.round(cx + r * cos(angle));
      let y = Math.round(cy + r * sin(angle));
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

  // this is a method to draw a minimal line length using Bresenham's algorithm for the clock hand
  bresenhamLine(x0, y0, x1, y1) {
    let positions = [];
  
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
  
    while (true) {
      if (x0 >= 0 && x0 < this.cols && y0 >= 0 && y0 < this.rows) {
        positions.push({ x: x0, y: y0 });
      }
  
      if (x0 === x1 && y0 === y1) break;
  
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return positions;
  }

  drawHand(angle){
    let cx = 8;
    let cy = 8;
    length = 7;

    let x1 = Math.round(cx + length * cos(angle));
    let y1 = Math.round(cy + length * sin(angle));

    let positions = this.bresenhamLine(cx, cy, x1, y1);    // draw minimal clock hand using Bresenham's algorithm
    fill(0);

    for (let pos of positions) {
      rect(pos.x * this.cellSize, pos.y * this.cellSize, this.cellSize, this.cellSize);
    }
  }

  updateMood() {
    let now = millis();

    // Reset feed count every minute if happy
    if (this.mood === "happy" && now - this.lastFeedTime > 5000) {
      if (this.feedCount < 6) {
        this.mood = "stressed";
        this.stressedStartTime = now;
        this.feedCount = 0;
      } else {
        this.feedCount = 0;
        this.lastFeedTime = now;
      }
    }

    // Handle stressed mode
    if (this.mood === "stressed") {
      if (now - this.stressedStartTime > 30000) {
        if (this.feedCount < 6) {
          this.mood = "dead";
        } else {
          this.mood = "happy";
          this.feedCount = 0;
          this.lastFeedTime = now;
          this.stressedStartTime = null;
        }
      }
    }
    // handle dead mode
  }

  feed() {
    this.feedCount++;
    this.updateMood();

    // reset stressed timer if fed while stressed
    if (this.mood === "stressed") {
      this.stressedStartTime = null;
    }
    this.updateMood();
  }

  drawMood(){
  // set color based on mood
    if (this.mood === "happy") {
      return color(0, 255, 100); // green
    } else if (this.mood === "stressed") {
      return color(255, 165, 0); // orange
    } else if (this.mood === "dead") {
      return color(255, 0, 0); // red
    } else {
      return color(100); // fallback gray if mood is undefined
    }
  }

  reset() {
    if (this.mood === "dead") {
      this.mood = "happy";
      this.feedCount = 0;
      this.lastFeedTime = millis();
      this.stressedStartTime = null;
    }
  }
}

  //==================== END OF CLASS ====================

  //==================== P5 FUNCTIONS ====================

function setup() {
  createCanvas(320, 320);
  angleMode(DEGREES);
  clock = new Clock(16, 16, 20);

  let feedButton = createButton("Feed Me");
  feedButton.parent(document.body);
  feedButton.mousePressed(() => clock.feed());

  let resetButton = createButton("Reset");
  resetButton.parent(document.body);
  resetButton.mousePressed(() => clock.reset());
}

function draw() {
  background(0);
  clock.updateMood();
  clock.drawGrid();

  let angle = map(second(), 0, 60, 0, 360);
  clock.drawHand(angle);
}