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

server.listen(3030, function() {
  console.log("Listening on 3030");
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

  function p2pSocket (socket, room, next) {
    var connectedClients = clients
    if (room) {
      io.to(room).emit('connected_peer', socket.id)
      connectedClients = io.nsps['/'].adapter.rooms[room.name]
    }
    socket.emit('numClients', Object.keys(connectedClients).length - 1)
    clients[socket.id] = socket

    socket.on('disconnect', function () {
      delete clients[socket.id]
      debug('Client gone (id=' + socket.id + ').')
    })

    socket.on('offers', function (data) {
      // send offers to everyone in a given room
      Object.keys(connectedClients).forEach(function (clientId, i) {
        var client = clients[clientId]
        if (client !== socket) {
          var offerObj = data.offers[i]
          var emittedOffer = {fromPeerId: socket.id, offerId: offerObj.offerId, offer: offerObj.offer}
          debug('Emitting offer: %s', JSON.stringify(emittedOffer))
          client.emit('offer', emittedOffer)
        }
      })
    })

    socket.on('peer-signal', function (data) {
      var toPeerId = data.toPeerId
      var client = clients[toPeerId]
      client.emit('peer-signal', data)
    })
    typeof next === 'function' && next()
  }
  p2pSocket(socket, room)

  var numClients = Object.keys(io.nsps['/'].adapter.rooms[room.name]).length
  if (numClients == 2) {
    socket.emit('initiator', 'true')
  }
})
