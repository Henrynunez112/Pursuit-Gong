console.log(`Made by: Jenesh`)
const gong = document.querySelector('#img-gong')
const welcomeScreen = document.querySelector('#welcome-screen')
const gongScreen = document.querySelector('#gong-screen')
const stopBtn = document.querySelector('#stop-gong')
const startBtn = document.querySelector('#start')
const audio = document.querySelector('#audio')

// Gong Screen should start hidden
gongScreen.hidden = true;

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

startBtn.addEventListener('click', () => {
  initiateAudio()
  welcomeScreen.hidden = true;
  gongScreen.hidden = false;
})

gong.addEventListener('click', () => {
  sendToSocket({ fellowName: 'Alejo', password: "1234" })
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
  const data = JSON.parse(e.data)

  console.log(e)
  switch (data.message) {
    case "ALLOW_RING_GONG":
      ringGongEffect()
      break;
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
