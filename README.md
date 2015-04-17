# Webrtc-powered Snake

This node app powers a one-on-one snake game that is played over a socket.io or socket.io-p2p connection.

To boot up, run:

`node server.js`

The javascript comes pre-compiled in the public folder but if you would like to play around with it run.

```
watchify lib/js/index.js -o public/bundle.js
```
