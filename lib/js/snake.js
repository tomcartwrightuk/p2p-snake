var Snake = function(initiator) {
  this.initiator = initiator;
  this.score = 0;
}

Snake.prototype.createSnake = function () {
  var length = 5; //Length of the snake
  this.snake_arr = [];
  for(var i = length-1; i >= 0; i--) {
    //This will create a horizontal snake starting from the top left
    if (this.initiator) {
      this.snake_arr.push({x: i, y:0});
    } else {
      this.snake_arr.push({x: i, y: 49})
    }
  }
}
  
module.exports = Snake
