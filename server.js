var express = require('express')
var app = express()
var server = require('http').Server(app)
var p2pserver = require('socket.io-p2p-server').Server
var io = require('socket.io')(server)
var p2pclients = require('socket.io-p2p-server').clients
app.use(express.static(__dirname+'/public'))

var waitingId;

io.use(p2pserver)

server.listen(3030, function() {
  console.log("Listening on 3030");
});

io.on('connection', function(socket) {
  var numClients = Object.keys(p2pclients).length
  if (numClients == 2) {
    socket.emit('initiator', 'true')
  }
})
