# Webrtc-powered Snake

This rack-app powers a one-on-one snake game that is played over a webrtc peer connection.

To boot up, run:

`thin start -R config.ru`

The javascript comes pre-compiled in the public folder but if you would like to play around with it, you will need node.js or io.js installed (sorry).
With that installed, run:

```
npm install
watchify lib/js -o public/bundle.js
```
