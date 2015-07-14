require('newrelic')
var port = process.env.PORT || 3030
var express = require('express')
var app = express()
var server = require('http').Server(app)
var p2pserver = require('socket.io-p2p-server').Server
var io = require('socket.io')(server)
var p2pclients = require('socket.io-p2p-server').clients
var debug = require('debug')
var hat = require('hat')
app.use(express.static(__dirname+'/public'))

var rooms = []
var clients = {}

server.listen(port, function() {
  console.log("Listening on %s", port);
});

io.on('connection', function(socket) {
  clients[socket.id] = socket
  var room = findOrCreateRoom()
  socket.join(room.name)
  room.playerCount++
  room.players.push(socket)

  socket.on('error', function (err) {
    console.log("Error %s", err);
  })

  p2pserver(socket, null, room)

  socket.on('disconnect', function () {
    room.players.splice(room.players.indexOf(socket), 1)
    removeRoom(room)
    io.to(room.name).emit('disconnected-player')

    // Move opponents to new rooms
    // var opponents = findOpponents(room.name, socket)
    Object.keys(room.players).forEach(function (clientId, i) {
      room = findReadyRoom()
      if (clients[clientId] && room) {
        clients[clientId].join(room.name)
      }
    })
  })

  socket.on('message', function (data) {
    var players = room.players.filter(function (player) {
      return player !== socket
    })
    players.forEach(function (player) {
      player.emit('message', data)
    })
  })

  socket.on('ping', function (data) {
    var players = room.players.filter(function (player) {
      return player !== socket
    })
    players.forEach(function (player) {
      player.emit('ping', data)
    })
  })

  socket.on('pong', function (data) {
    var players = room.players.filter(function (player) {
      return player !== socket
    })
    players.forEach(function (player) {
      player.emit('pong', data)
    })
  })

  if (room.playerCount === 1) {
    console.log("Waiting player");
    socket.emit('waiting')
  } else {
    socket.emit('begin-game', true)
    var players = room.players.filter(function (player) {
      return player !== socket
    })
    players.forEach(function (player) {
      player.emit('begin-game', false)
    })
  }
})

function findOrCreateRoom () {
  var lastRoom = findReadyRoom ()
  if (!lastRoom || lastRoom.full) {
    var room = {players: [], playerCount: 0, name: hat()}
    return addRoom(room)
  }
  return lastRoom
}

function findReadyRoom () {
  return rooms.filter(function(room) { return room.playerCount === 1 })[0];
}

function removeRoom (room) {
  room.playerCount--
  if (room.playerCount === 0) rooms.splice(rooms.indexOf(room), 1)
}

function addRoom (room) {
  return rooms[rooms.push(room) - 1]
}

function findOpponents (room_name, socket) {
  var players = socket.adapter.rooms[room_name]
  console.log('PLayser: %s', JSON.stringify(players))
  var o;
  if (players) {
    var o = Object.keys(players).filter(function(player) {
      return player !== socket.id
    })
  }
  return o
}
