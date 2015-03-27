var Snake = function(initiator) {
  this.initiator = initiator;
  this.score = 0;
}

Snake.prototype.createSnake = function () {
  var length = 5; //Length of the snake
  this.snake_arr = [];
  console.log("cretae nakse initiator %s", this.initiator);
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
  
module.exports = Snake
