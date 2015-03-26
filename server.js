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

var waitingId;
var rooms = []
var clients = {}

// io.use(p2pserver)

server.listen(port, function() {
  console.log("Listening on %s", port);
});

io.on('connection', function(socket) {
  var lastRoom = rooms[rooms.length - 1]
  // (no rooms exists, room exists is full), room exists needs joining
  if (!lastRoom || lastRoom.full) {
    // create new room
    var room = {full: false, name: hat()}
    rooms.push(room)
  } else {
    var room = lastRoom
    rooms[rooms.length - 1].full = true
  }
  socket.join(room.name)
  socket.on('error', function (err) {
    console.log("Error %s", err);
  })

  p2pserver(socket, null, room)

  var numClients = Object.keys(io.nsps['/'].adapter.rooms[room.name]).length
  if (numClients == 2) {
    socket.emit('initiator', 'true')
  }
})
