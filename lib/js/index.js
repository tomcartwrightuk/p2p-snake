var Socketiop2p = require('socket.io-p2p')
var io = require('socket.io-client')
var Snake = require('./snake');
var SnakeGame = require('./snake_game');
var $ = require('jquery');
var peerOpts = {numClients: 1}
var initiator

var manager = io.Manager();
var socket = manager.socket('/')
var p2psocket = new Socketiop2p(peerOpts, socket)

p2psocket.on('initiator', function (msg) {
  initiator = true
})

p2psocket.on('ready', function () {
  p2psocket.useSockets = false
  $('.intro').hide()
  var snake1 = new Snake(initiator)
  var snake2 = new Snake()
  var snakegame = new SnakeGame(snake1, snake2, initiator, p2psocket)
})
