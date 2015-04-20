var Socketiop2p = require('socket.io-p2p')
var io = require('socket.io-client')
var Snake = require('./snake');
var SnakeGame = require('./snake_game');
var $ = require('jquery');
var peerOpts = {numClients: 1}
var initiator
var snakeGame
var snake1
var snake2

var manager = io.Manager();
var socket = manager.socket('/')
var p2psocket = new Socketiop2p(peerOpts, socket)

socket.on('waiting', function (data) {
  snake1 = new Snake(initiator)
  snakeGame = new SnakeGame(socket, true, [snake1])
})

p2psocket.on('initiator', function (msg) {
  initiator = true
})

p2psocket.on('ready', function () {
  resetGame()
  p2psocket.useSockets = false
  snake1 = new Snake(initiator)
  snake2 = new Snake()
  snakeGame = new SnakeGame(p2psocket, initiator, [snake1, snake2])
})

p2psocket.on('disconnected-player', function () {
  resetGame()
  p2psocket._peers = {}
})

function resetGame () {
  if (snakeGame) clearInterval(snakeGame.game_loop)
  snakeGame = undefined
  snake1 = undefined
  snake2 = undefined
}

CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
  var lines = text.split("\n");

  for (var i = 0; i < lines.length; i++) {
    var words = lines[i].split(' ');
    var line = '';
    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = this.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }

    this.fillText(line, x, y);
    y += lineHeight;
  }
}
