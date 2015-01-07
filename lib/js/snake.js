var $ = require('jquery');

/* 
* Snake game code inspired from
* http://thecodeplayer.com/walkthrough/html5-game-tutorial-make-a-snake-game-using-html5-canvas-jquery
* and butchered appropriately.
* Works by drawing a canvas, and rendering blocks of width cw in 60ms intervals
*/

var Snake = function() {
  // Canvas stuff
  var self = this;
  this.canvas = $("#canvas")[0];
  this.ctx = canvas.getContext("2d");
  this.w = $("#canvas").width();
  this.h = $("#canvas").height();
  
  // Lets save the cell width in a variable for easy control
  this.cw = 10;
  this.d;
  this.food;
  this.score;
  
  this.snake_array;
  
  this.init = function() {
    self.d = "right"; //default direction
    self.createSnake();
    self.createFood(); //Now we can see the food particle
    self.score = 0;
    
    // paint every 60ms
    if (typeof game_loop != "undefined") clearInterval(game_loop);
    game_loop = setInterval(self.paint.bind(self), 60);
  }
  this.init();
  this.setupKeyListeners();
}
  
Snake.prototype.createSnake = function () {
  var length = 5; //Length of the snake
  this.snake_array = []; //Empty array to start with
  for(var i = length-1; i >= 0; i--) {
    //This will create a horizontal snake starting from the top left
    this.snake_array.push({x: i, y:0});
  }
}
  
Snake.prototype.createFood = function() {
  this.food = {
    x: Math.round(Math.random()*(this.w - this.cw) / this.cw), 
    y: Math.round(Math.random()*(this.h - this.cw) / this.cw), 
  };
}
  
Snake.prototype.paint = function() {
  // To avoid the snake trail paint background every frame
  this.ctx.fillStyle = "white";
  this.ctx.fillRect(0, 0, this.w, this.h);
  this.ctx.strokeStyle = "black";
  this.ctx.strokeRect(0, 0, this.w, this.h);
  
  // The movement code for the snake to come here.
  // Pop out the tail cell and place it infront of the head cell
  var nx = this.snake_array[0].x;
  var ny = this.snake_array[0].y;

  // These were the position of the head cell.
  // increment it to get the new head position
  if (this.d == "right") nx++;
  else if(this.d == "left") nx--;
  else if(this.d == "up") ny--;
  else if(this.d == "down") ny++;
  
  // This will restart the game if the snake hits the wall or it's body
  if (nx == -1 || nx == this.w / this.cw || ny == -1 || ny == this.h / this.cw || this.check_collision(nx, ny, this.snake_array)) {
    this.init();
    return;
  }
  
  // Logic for snaking eating food
  // If the new head position matches with that of the food,
  // Create a new head instead of moving the tail
  if (nx == this.food.x && ny == this.food.y) {
    var tail = {x: nx, y: ny};
    this.score++;
    // Create new food
    this.createFood();
  } else {
    var tail = this.snake_array.pop(); //pops out the last cell
    tail.x = nx; tail.y = ny;
  }
  
  this.snake_array.unshift(tail); //puts back the tail as the first cell
  
  for (var i = 0; i < this.snake_array.length; i++) {
    var c = this.snake_array[i];
    this.paint_cell(c.x, c.y);
  }
  
  // Paint food
  this.paint_cell(this.food.x, this.food.y);
  // Paint score
  var score_text = "Score: " + this.score;
  this.ctx.fillText(score_text, 5, this.h-5);
}
  
Snake.prototype.paint_cell = function(x, y) {
  this.ctx.fillStyle = "blue";
  this.ctx.fillRect(x * this.cw, y * this.cw, this.cw, this.cw);
  this.ctx.strokeStyle = "white";
  this.ctx.strokeRect(x * this.cw, y * this.cw, this.cw, this.cw);
}
  
Snake.prototype.check_collision = function(x, y, array) {
  //This function will check if the provided x/y coordinates exist
  //in an array of cells or not
  for (var i = 0; i < array.length; i++) {
    if (array[i].x == x && array[i].y == y) return true;
  }
  return false;
}

Snake.prototype.setupKeyListeners = function() {
  var self = this;
  $(document).keydown(function(e) {
    var key = e.which;
    if (key == "37" && self.d != "right") self.d = "left";
    else if (key == "38" && self.d != "down") self.d = "up";
    else if (key == "39" && self.d != "left") self.d = "right";
    else if (key == "40" && self.d != "up") self.d = "down";
  })
}
module.exports = Snake;
