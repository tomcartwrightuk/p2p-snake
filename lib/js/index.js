var Peer = require('simple-peer');
var port = location.port;
var host = location.hostname + (port ? ":" + port : "");
var ws = new WebSocket("ws://" + host);
var peer, peerId;
var Snake = require('./snake');
var SnakeGame = require('./snake_game');
var initiator;

ws.onmessage = function(event) {
  var msg = JSON.parse(event.data);
  if (msg.type === 'peer') {
    console.log('Peer found');
    initiator = msg.data.initiator;
    peerId = msg.data.to_peer_id
    peer = new Peer(msg.data)
    setupListeners(peer)
  } else if (msg.type == 'signal') {
    peer.signal(msg.data.signal_data) 
  }
}

ws.onopen = function(event) {
  console.log('Connection opened');
  ws.send(JSON.stringify({type: 'peer'}))
}

function setupListeners (peer) {
  peer.on('signal', function(data) {
    ws.send(JSON.stringify({type: 'signal', data: {to_peer_id: peerId, signal_data: data}}));
  });

  peer.on('ready', function() {
    console.log('I am ready');
    var snake1 = new Snake(initiator)
    var snake2 = new Snake()
    var snakegame = new SnakeGame(snake1, snake2, initiator, peer);
  });
}
