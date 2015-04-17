var $ = require('jquery');
/*
* Snake game code inspired from
* http://thecodeplayer.com/walkthrough/html5-game-tutorial-make-a-snake-game-using-html5-canvas-jquery
* and butchered appropriately.
* Works by drawing a canvas, and rendering blocks of width cw in loopTime ms intervals
*
* Two player game works by
* - initiating peer is time keeper, every loopTime ms they send state of snake and food and recieve state of other snake
* - on receiving data from other player, the client paints the canvas
*/

var SnakeGame = function(snake1, snake2, initiator, socket) {
  // Canvas stuff
  var self = this;
  this.canvas = $("#canvas")[0];
  this.ctx = canvas.getContext("2d");
  this.w = $(window).width() - 30
  this.h = Math.round(this.w / 2)
  canvas.width = this.w
  canvas.height = this.h
  this.snake1 = snake1;
  this.snake2 = snake2;
  this.initiator = initiator;
  this.socket = socket;
  this.socket.on('message', function(msg) {
    if (msg.type === 'snake_arr') {
      self.snake2.snake_arr = msg.data
      self.snake2.score = msg.score
      self.food = msg.food
      if (!self.initiator) self.paint();
    }
  })
  this.cw = this.w / 40;
  this.loopTime = 150;
  this.d;
  this.food;

  this.init = function() {
    // TODO move to snake module
    self.d = "right"; //default direction
    self.snake1.createSnake();

    // paint every 60ms
    if (self.initiator) {
      self.createFood(); //Now we can see the food particle
      if (typeof self.game_loop != "undefined") clearInterval(self.game_loop);
      self.game_loop = setInterval(
        self.paint.bind(self)
      , self.loopTime);
    }
  }
  this.init();
  this.setupKeyListeners();
}

SnakeGame.prototype.createFood = function() {
  this.food = {
    x: Math.round(Math.random()*(this.w - this.cw) / this.cw),
    y: Math.round(Math.random()*(this.h - this.cw) / this.cw),
  };
}

SnakeGame.prototype.paint = function() {
  // To avoid the snake trail paint background every frame
  this.ctx.fillStyle = "black";
  this.ctx.fillRect(0, 0, this.w, this.h);

  // get reference to head cell
  var nx = this.snake1.snake_arr[0].x;
  var ny = this.snake1.snake_arr[0].y;

  // These were the position of the head cell.
  // increment it to get the new head position
  if (this.d == "right") nx++;
  else if(this.d == "left") nx--;
  else if(this.d == "up") ny--;
  else if(this.d == "down") ny++;

  // This will restart the game if the snake hits the wall or it's body
  if (nx == -1 || nx == this.w / this.cw || ny == -1 || ny == this.h / this.cw || this.check_collision(nx, ny, this.snake1.snake_arr) || this.check_collision(nx, ny, this.snake2.snake_arr)) {
    this.init();
    return;
  }

  // Logic for snaking eating food
  // If the new head position matches with that of the food,
  // Create a new head instead of moving the tail
  if (nx == this.food.x && ny == this.food.y) {
    var tail = {x: nx, y: ny}; // this is a new head
    this.snake1.score++;
    // Create new food
    this.createFood();
  } else {
    var tail = this.snake1.snake_arr.pop(); //pops out the last cell
    tail.x = nx; tail.y = ny;
  }

  this.snake1.snake_arr.unshift(tail); //puts back the tail as the first cell

  this.socket.emit('message', {type: 'snake_arr', data: this.snake1.snake_arr, score: this.snake1.score, food: this.food})
  this.paintOpponent();
  for (var i = 0; i < this.snake1.snake_arr.length; i++) {
    var c = this.snake1.snake_arr[i];
    this.paint_cell(c.x, c.y);
  }

  // Paint food
  this.paint_cell(this.food.x, this.food.y);
  // Paint score
  var score_text = "YOU: " + this.snake1.score + "                 THEM: " + this.snake2.score;
  this.ctx.font = "18px sans-serif"
  this.ctx.fillStyle = "#BBBBBB"
  this.ctx.fillText(score_text, 15, this.h-15);
}

SnakeGame.prototype.paintOpponent = function() {
  for (var i = 0; i < this.snake2.snake_arr.length; i++) {
    var c = this.snake2.snake_arr[i];
    this.paint_cell(c.x, c.y, true);
  }
}

SnakeGame.prototype.paint_cell = function(x, y, op) {
  this.ctx.fillStyle = '#7ed321';
  if (op !== undefined) this.ctx.fillStyle = '#ff004c';
  this.ctx.fillRect(x * this.cw, y * this.cw, this.cw, this.cw);
  this.ctx.strokeStyle = this.ctx.fillStyle;
  this.ctx.strokeRect(x * this.cw, y * this.cw, this.cw, this.cw);
}

SnakeGame.prototype.check_collision = function(x, y, array) {
  //This function will check if the provided x/y coordinates exist
  //in an array of cells or not
  var arr = array || []
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].x == x && arr[i].y == y) return true;
  }
  return false;
}

SnakeGame.prototype.setupKeyListeners = function() {
  var self = this;
  $(document).keydown(function(e) {
    var key = e.which;
    if (key == "37" && self.d != "right") self.d = "left";
    else if (key == "38" && self.d != "down") self.d = "up";
    else if (key == "39" && self.d != "left") self.d = "right";
    else if (key == "40" && self.d != "up") self.d = "down";
  })
}
module.exports = SnakeGame;
