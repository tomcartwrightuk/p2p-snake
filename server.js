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
  room.players++
  console.log("joined %s", room.name);
  console.log(rooms);
  socket.on('error', function (err) {
    console.log("Error %s", err);
  })

  p2pserver(socket, null, room)

  socket.on('disconnect', function () {
    delete clients[socket.id]
    removePlayerOrRoom(room)
    io.to(room.name).emit('disconnected-player')
    // Move opponents to new rooms
    var opponents = io.nsps['/'].adapter.rooms[room.name]
    if (opponents) {
      Object.keys(opponents).forEach(function (clientId, i) {
        room = findEmptyRoom()
        if (clients[clientId]) {
          clients[clientId].join(room.name)
        }
      })
    }
  })

  var numClients = Object.keys(io.nsps['/'].adapter.rooms[room.name]).length
  if (numClients == 2) {
    socket.emit('initiator', 'true')
  }
})

function findOrCreateRoom () {
  var lastRoom = findEmptyRoom()
  if (!lastRoom || lastRoom.full) {
    var room = {players: 0, name: hat()}
    rooms.push(room)
    return room
  }
  return lastRoom
}

function findEmptyRoom() {
  return rooms.filter(function(room) { return room.players === 1 })[0];
}

function removePlayerOrRoom (room) {
  var roomIdx = rooms.indexOf(room)
  rooms[roomIdx].players--
  if (rooms[roomIdx].players === 0) rooms.splice(room)
}
