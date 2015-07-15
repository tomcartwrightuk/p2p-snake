var $ = require('jquery');
var Sniffr = require('sniffr');
var s = new Sniffr();
s.sniff(navigator.useragent);
var browser = s.browser.name;
var controls = require('./controls');
controls.setup();

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

var SnakeGame = function(socket, initiator, snakes) {
  // Canvas stuff
  var self = this;
  this.snakes = snakes
  this.mySnake = snakes[0]
  this.mySnake.setMySnakeColor()
  this.canvas = $("#canvas")[0];
  this.ctx = canvas.getContext("2d");
  this.initiator = initiator || false;
  this.setupCanvas();
  this.socket = socket;
  this.socket.on('message', function(msg) {
    if (msg.type === 'snake_arr') {
      self.snakes[1].snake_arr = msg.data
      self.snakes[1].score = msg.score
      self.food = msg.food
      if (!self.initiator) self.paint();
    }
  })
  this.loopTime = 100;
  this.food;
  this.currentLatency = '--';

  this.init = function() {
    // TODO move to snake module
    controls.reset();
    self.mySnake.createSnake();

    // paint every loopTime ms
    if (self.initiator) {
      self.createFood(); //Now we can see the food particle
      if (typeof self.game_loop != "undefined") clearInterval(self.game_loop);
      self.game_loop = setInterval(
        self.paint.bind(self)
      , self.loopTime);
    }
  }
  this.showIntro = function(players, cb) {
    this.resetCanvas()
    this.ctx.fillStyle = "#DDDDDD"
    this.ctx.font = "bold 14px sans-serif"
    if (players) {
      var text = 'OPPONENT JOINED. STARTING IN:'
      var textOffset = (this.w / 2) - (this.ctx.measureText(text).width / 2)
      this.ctx.fillText(text, textOffset, (this.h / 2) - 72)
      this.setupBoldText()
      this.changeCount(5)
      setTimeout(function() {
        cb()
      }, 3750)
    } else {
      this.practiseText()
      cb()
    }
  }
  this.showIntro(this.snakes.length > 1, this.init);
  this.setupLatencyCalc();
  this.setupKeyListeners();
  window.onresize = this.setupCanvas.bind(this)
}

SnakeGame.prototype.createFood = function() {
  this.food = {
    x: Math.round(Math.random()*(this.w - this.cw) / this.cw),
    y: Math.round(Math.random()*(this.h - this.cw) / this.cw),
  };
}

SnakeGame.prototype.paint = function() {
  this.resetCanvas()
  // get reference to head cell
  var nx = this.mySnake.headCell().x;
  var ny = this.mySnake.headCell().y;

  // These were the position of the head cell.
  // increment it to get the new head position
  var direction = controls.direction
  if (direction == "right") nx++;
  else if(direction == "left") nx--;
  else if(direction == "up") ny--;
  else if(direction == "down") ny++;

  // This will restart the game if the snake hits the wall or it's body
  if (this.collisionOccurred(nx, ny)) {
    this.init();
    return;
  }

  // Logic for snaking eating food
  // If the new head position matches with that of the food,
  // Create a new head instead of moving the tail
  if (nx == this.food.x && ny == this.food.y) {
    var tail = {x: nx, y: ny}; // this is a new head
    this.mySnake.score++;
    // Create new food
    this.createFood();
  } else {
    var tail = this.mySnake.snake_arr.pop(); //pops out the last cell
    tail.x = nx; tail.y = ny;
  }

  this.mySnake.snake_arr.unshift(tail); //puts back the tail as the first cell

  this.socket.emit('message', {
    type: 'snake_arr',
    data: this.mySnake.snake_arr,
    score: this.mySnake.score,
    food: this.food
  })
  this.paintSnakes(this.snakes);

  // Paint food
  this.paint_cell(this.food.x, this.food.y);
  // Paint score
  var score_text = "YOU: " + this.mySnake.score
  this.setupBottomText()
  this.ctx.fillText(score_text, 15, this.h-15);
  if (this.snakes.length === 1) this.practiseText()
  var textWidth = this.ctx.measureText(score_text).width
  if (this.snakes.length > 1) {
    var opponent_score =  "THEM: " + this.snakes[1].score;
    this.ctx.fillText(opponent_score, textWidth + 60, this.h-15);
    var statusBarText = 'initiator: ' + this.initiator + '     UA: ' +
      browser + '     PING ' + this.currentLatency + ' ms' + '     P2P: ' +
      this.socket.usePeerConnection;
    var statusBarTextWidth = this.ctx.measureText(statusBarText).width + 15;
    this.ctx.fillText(statusBarText, this.w - statusBarTextWidth, this.h-15);
  }
}

SnakeGame.prototype.paintSnakes = function(snakes) {
  // iterate over all snakes apart from your own
  for (var i = 0; i < snakes.length; i++) {
    this.paintSnake(snakes[i])
  }
}

SnakeGame.prototype.paintSnake = function (snake) {
  var arr = snake.snake_arr
  for (var i = 0; i < arr.length; i++) {
    var c = arr[i];
    this.paint_cell(c.x, c.y, snake.color);
  }
}

SnakeGame.prototype.paint_cell = function(x, y, color) {
  this.ctx.fillStyle = color;
  this.ctx.fillRect(x * this.cw, y * this.cw, this.cw, this.cw);
  this.ctx.strokeStyle = this.ctx.fillStyle;
  this.ctx.strokeRect(x * this.cw, y * this.cw, this.cw, this.cw);
}

SnakeGame.prototype.checkCollision = function(x, y, array) {
  //This function will check if the provided x/y coordinates exist
  //in an array of cells or not
  var arr = array || []
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].x == x && arr[i].y == y) return true;
  }
  return false;
}

SnakeGame.prototype.setupKeyListeners = function() {
}

SnakeGame.prototype.collisionOccurred = function(nx, ny) {
  if (nx == -1 ||
      nx == Math.round(this.w / this.cw) ||
      ny == -1 ||
      ny == Math.round(this.h / this.cw) ||
      this.checkSnakeCollisions(nx, ny))
  {
    return true
  }
}

SnakeGame.prototype.checkSnakeCollisions = function(nx, ny) {
  if (this.snakes.length > 1) {
    if (this.checkCollision(nx, ny, this.snakes[1].snake_arr)) return true
  }
}

SnakeGame.prototype.resetCanvas = function () {
  // To avoid the snake trail paint background every frame
  this.ctx.fillStyle = "black";
  this.ctx.fillRect(0, 0, this.w, this.h);
}

SnakeGame.prototype.changeCount = function (count) {
  var self = this
  if (count === 0) {
    return
  } else {
    var countWidth = this.ctx.measureText(count).width
    var xPos = (this.w / 2) - (countWidth / 2)
    var yPos = (this.h / 2) - 24
    this.ctx.fillStyle = "black"
    this.ctx.fillRect(xPos, yPos - 35, 50, 50);
    this.ctx.fillStyle = "#DDDDDD"
    this.ctx.fillText(count, xPos, yPos)
    setTimeout(function() {
      self.changeCount(count - 1)
    }, 750)
  }
}

SnakeGame.prototype.practiseText = function () {
  this.setupBottomText()
  this.renderIntroText('WAITING FOR OPPONENT - PRACTISE!')
}

SnakeGame.prototype.renderIntroText = function (text, offset) {
  var textOffset = this.w - (this.ctx.measureText(text).width + 15)
  this.ctx.fillText(text, textOffset, this.h - 15)
}

SnakeGame.prototype.setupBottomText = function () {
  this.ctx.font = "14px sans-serif"
  this.ctx.fillStyle = "#BBBBBB"
}

SnakeGame.prototype.setupBoldText = function () {
  this.ctx.fillStyle = "#DDDDDD"
  this.ctx.font = "bold 48px sans-serif"
}

SnakeGame.prototype.setupLatencyCalc = function () {
  var self = this
}

SnakeGame.prototype.setupCanvas = function () {
  this.w = $(window).width() - 30
  this.h = Math.round(this.w / 2)
  this.canvas.width = this.w
  this.canvas.height = this.h
  this.cw = this.w / 40;
}

module.exports = SnakeGame;
