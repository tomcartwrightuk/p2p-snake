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
  loadGame()
  singlePlayerGame()
})

p2psocket.on('initiator', function (msg) {
  initiator = true
})

p2psocket.on('ready', function () {
  resetGame()
  p2psocket.useSockets = false
  loadGame()
  snake1 = new Snake(initiator)
  snake2 = new Snake()
  snakeGame = new SnakeGame(p2psocket, initiator, [snake1, snake2])
})

p2psocket.on('disconnected-player', function () {
  resetGame()
  p2psocket._peers = {}
  singlePlayerGame()
})

function resetGame () {
  if (snakeGame) clearInterval(snakeGame.game_loop)
  snakeGame = undefined
  snake1 = undefined
  snake2 = undefined
}

function singlePlayerGame () {
  snake1 = new Snake(true)
  snakeGame = new SnakeGame(socket, true, [snake1])
}

function loadGame () {
  $('.intro').hide()
  $('#canvas-wrapper').show()
}
