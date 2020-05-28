console.log(`Made by: Jenesh`)
const playBtn = document.querySelector('#img-gong')
const stopBtn = document.querySelector('#stop-gong')
const audio = document.querySelector('#audio')
const box = document.querySelector('#box')

playBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    audio.play();
    confetti.remove();
    confetti.gradient = true;
    confetti.speed = 4;
    confetti.start(100000, 500);
    box.classList.add('shake');
})

stopBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    audio.pause();
    confetti.remove();
    box.classList.remove('shake');
})
