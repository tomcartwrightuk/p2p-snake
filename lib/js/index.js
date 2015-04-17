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

socket.on('connect', function (data) {
  $('.intro').hide()
  $('#canvas').show()
  snake1 = new Snake(initiator)
  snake2 = new Snake()
  snakeGame = new SnakeGame(snake1, snake2, true, socket)
})

p2psocket.on('initiator', function (msg) {
  initiator = true
})

p2psocket.on('ready', function () {
  p2psocket.useSockets = false
  $('.intro').hide()
  $('#canvas').show()
  snake1 = new Snake(initiator)
  snake2 = new Snake()
  snakeGame = new SnakeGame(snake1, snake2, initiator, p2psocket)
})

p2psocket.on('disconnected-player', function () {
  clearInterval(snakeGame.game_loop)
  snakeGame = undefined
  snake1 = undefined
  snake2 = undefined
  initiator = undefined
  p2psocket._peers = {}
  $('.intro').show()
  $('#canvas').hide()
})
