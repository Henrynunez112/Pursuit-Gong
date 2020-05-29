console.log(`Made by: Jenesh & Alejo`)
const gong = document.querySelector('#img-gong')
const welcomeScreen = document.querySelector('#welcome-screen')
const gongScreen = document.querySelector('#gong-screen')
const stopBtn = document.querySelector('#stop-gong')
const startBtn = document.querySelector('#start')
const audio = document.querySelector('#audio')

// Gong Screen should start hidden
gongScreen.classList.add("hidden");

// Required for Safari since audio playback
// needs to be initiated by a user event
// i.e. if we don't initiate the audio by the user
// clicking a button first, programmatically playing the audio
// on response to a websocket message won't work.
// https://stackoverflow.com/questions/12804028/safari-with-audio-tag-not-working
const initiateAudio = () => {
  audio.muted = true;
  audio.play()
}

const playAudio = () => {
  audio.currentTime = 0;
  audio.muted = false;
  audio.play()
}

const ringGongEffect = () => {
  playAudio()
  confetti.gradient = true;
  confetti.speed = 4;
  confetti.start(100000, 500);
  gong.classList.add('shake');
}

const launchQuestionnaire = () => {
  let ringer = window.confirm('Are you a Fellow that will ring the Gong today?\nYes = [OK]\nNo  = [Cancel]')
  if (ringer) {
    let fellowName = window.prompt('Type your name')
    if (fellowName) {
      let password = window.prompt('What is the secret password?')
      if (password) {
        sendToSocket({
          type: "VERIFY_FELLOW",
          password,
          fellowName
        })
        localStorage.setItem('fellowName', fellowName)
        localStorage.setItem('password', password)
      }
    }
  }
}

startBtn.addEventListener('click', () => {
  initiateAudio()
  launchQuestionnaire()
  welcomeScreen.classList.add("hidden")
  gongScreen.classList.remove("hidden");
})

gong.addEventListener('click', () => {
  const fellowName = localStorage.getItem('fellowName')
  const password = localStorage.getItem('password')
  if (fellowName && password) {
    sendToSocket({
      type: "REQUEST_GONG_RING",
      fellowName,
      password
    })
  } else {
    alert("You can't ring the gong")
  }
})

stopBtn.addEventListener('click', () => {
  audio.currentTime = 0;
  audio.pause();
  confetti.remove();
  gong.classList.remove('shake');
})

let ws = new WebSocket(`ws://${location.host}`)

const sendToSocket = (payload) => {
  let data = JSON.stringify(payload)
  ws.send(data)
}

ws.onmessage = (e) => {
  const { type, message } = JSON.parse(e.data)

  console.log(type, message)
  switch (type) {
    case "ALLOW_GONG_RING":
      ringGongEffect()
      break;
    case "REJECT_FELLOW":
    case "DENY_GONG_RING":
      // window.alert(message)
      alert("You can't ring the gong. Wait for somebody to ring it")
  }
}

ws.onerror = (e) => {
  window.alert('WebSocket error: Please refresh the page')
  console.log('WebSocket error', e)
}

ws.onopen = (e) => {
  console.log('WebSocket connection stablished', e)
}

ws.onclose = (e) => {
  window.alert('WebSocket Connection Closed: Please refresh the page')
  console.log('WebSocket connection closed', e)
  ws = null
}
