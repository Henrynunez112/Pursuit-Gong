#!/usr/bin/env node

// Load env variables
require('dotenv').config()

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('backend:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Web Socket Server setup
 */
var WebSocket = require('ws')
var wss = new WebSocket.Server({ server })

const sendTo = (socket, data) => {
  socket.send(JSON.stringify(data))
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const { type, fellowName, password } = JSON.parse(data)
    const gongPassword = process.env.GONG_PASSWORD
    console.log('received ->', type, fellowName, password)
    switch (type) {
      case "VERIFY_FELLOW":
        if (password === gongPassword) {
          sendTo(ws, {
            type: "WELCOME_FELLOW",
            message: `Congratulations ${fellowName}. The gong is enabled for you if you click it it will ring.`
          })
        } else {
          sendTo(ws, {
            type: "REJECT_FELLOW",
            message: `😥️ It seems like you don't know the password ${fellowName}. Make sure to check for spelling mistakes. Try again by refreshing the page. As last resort contact Alejo.`
          })
        }
        break;
      case "REQUEST_GONG_RING":
        if (password === gongPassword) {
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              sendTo(client, {
                type: 'ALLOW_GONG_RING',
                message: `Congratulations ${fellowName}🎉. There's and exciting career a head of you!`
              })
            }
          })
        } else {
          sendTo(ws, {
            type: 'DENY_GONG_RING',
            message: `Oh no! ${fellowName} you must have had a wrong password`
          })
        }
        break;
      default:
        break;
    }
  })

  sendTo(ws, { message: 'CLIENT_CONNECTED' })
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
