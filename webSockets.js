const WebSocket = require('ws')

const sendTo = (socket, data) => {
  socket.send(JSON.stringify(data))
}

function heartbeat() {
  this.isAlive = true;
}
/**
 * Web Socket Server setup
 */
const init = (server) => {
  var wss = new WebSocket.Server({ server })

  wss.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', heartbeat)

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

  const interval = setInterval(() => {
    console.log(wss.clients.size, 'clients connected')
    wss.clients.forEach(client => {
      if (!client.isAlive) {
        console.log('client.isAlive', client.isAlive, 'terminating -->')
        return client.terminate()
      }
      client.isAlive = false
      client.ping()
    })
  }, 1000 * 30)

  wss.on('close', (e) => {
    console.log('Connection closed', e)
    clearInterval(interval)
  })
}



module.exports = {
  init
}
