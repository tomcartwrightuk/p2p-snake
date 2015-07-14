var Socketiop2p = require('socket.io-p2p')
var io = require('socket.io-client')
var Snake = require('./snake');
var SnakeGame = require('./snake_game');
var $ = require('jquery');
var peerOpts = {numClients: 1}
var isMobile = require('./mobile_detect')
var LatencyCalc = require('./latency_calc');
var initiator
var latencyCalc
var snakeGame
var snake1
var snake2

var manager = io.Manager({ transports: ['websocket'] });
var socket = manager.socket('/')
var p2psocket = new Socketiop2p(peerOpts, socket)

if (isMobile()) {
  $('#mobile-controls').show();
}

socket.on('waiting', function (data) {
  console.log("Waiting");
  loadGame()
  singlePlayerGame()
})

p2psocket.on('begin-game', function(data) {
  resetGame()
  loadGame()
  initiator = data
  socket.off('message')
  snake1 = new Snake(initiator)
  snake2 = new Snake()
  snakeGame = new SnakeGame(p2psocket, initiator, [snake1, snake2])
  latencyCalc = new LatencyCalc(socket)
  latencyCalc.on('ping-update', function(data) {
    snakeGame.currentLatency = data
  })
})

p2psocket.on('ready', function () {
  p2psocket.usePeerConnection = true
  latencyCalc = new LatencyCalc(p2psocket)
  latencyCalc.on('ping-update', function(data) {
    snakeGame.currentLatency = data
  })
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
