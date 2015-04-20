var Snake = function(initiator) {
  this.initiator = initiator;
  this.score = 0;
  this.snake_arr = [];
  this.color = '#7ed321'
}

Snake.prototype.createSnake = function () {
  var length = 5; //Length of the snake
  this.snake_arr = [];
  this.resetScore();
  for(var i = length-1; i >= 0; i--) {
    if (this.initiator) {
      // Creates a horizontal snake starting from the top left
      this.snake_arr.push({x: i, y:0});
    } else {
      // Creates a horizontal snake starting from the bottom left
      this.snake_arr.push({x: i, y: 19})
    }
  }
}

Snake.prototype.resetScore = function () {
  this.score = 0
}

Snake.prototype.setMySnakeColor = function (mySnake) {
  this.color = '#ff004c'
}

Snake.prototype.headCell = function () {
  return {x: this.snake_arr[0].x, y: this.snake_arr[0].y};
}

module.exports = Snake
