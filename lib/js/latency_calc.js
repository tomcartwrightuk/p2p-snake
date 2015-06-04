var Emitter = require('component-emitter')
var hat = require('hat')
var _ = require('underscore')

var LatencyCalc = function(socket) {
  var self = this
  this.pongs = {}
  this.pings = {}
  this.socket = socket
  socket.on('pong', function(data) {
    self.addPong(data)
  })
  socket.on('ping', function(data) {
    self.createPong(data)
  })
  setInterval(function() {
    self.createPing()
  }, 500)
}

LatencyCalc.prototype.addPong = function(data) {
  var self = this
  var timeInMs = Date.now()
  this.pongs[data] = timeInMs
  var numPongs = Object.keys(this.pongs).length
  if (numPongs === 10) {
    var totalTime = _.reduce(this.pongs, function (total, pong, key) {
                      if (self.pings[key] !== undefined) {
                        return total + (pong - self.pings[key])
                      } else {
                        return total
                      }
                    }, 0);
    var avTime = ((totalTime / numPongs) / 2).toFixed(2)
    this.pings = {}
    this.pongs = {}
    this.emit('ping-update', avTime)
  }
}

LatencyCalc.prototype.createPing = function() {
  var id = hat(64)
  var timeInMs = Date.now()
  this.pings[id] = timeInMs
  this.socket.emit('ping', id)
}

LatencyCalc.prototype.createPong = function (data) {
  this.socket.emit('pong', data)
}

Emitter(LatencyCalc.prototype)

module.exports = LatencyCalc
