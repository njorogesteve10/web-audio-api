let audio1 = new Audio('letsgetit.m4a');
let audioCtx;
const file = document.getElementById('fileupload');
const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;

canvas.width = innerWidth;
canvas.height = innerHeight;

container.addEventListener('click', function() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized:', audioCtx);
    }

    audio1.play().catch(error => {
        console.error('Error playing audio:', error);
    });

    if (!audioSource) {
        audioSource = audioCtx.createMediaElementSource(audio1);
        analyser = audioCtx.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 512;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer(bufferLength, dataArray);
        requestAnimationFrame(animate);
    }

    animate();
});

file.addEventListener('change', function() {
    const files = this.files;
    if (files.length > 0) {
        const audioFile = URL.createObjectURL(files[0]);
        audio1.src = audioFile;
        audio1.load();
        audio1.play().catch(error => {
            console.error('Error playing uploaded audio:', error);
        });
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized:', audioCtx);
        }
        if (!audioSource) {
            audioSource = audioCtx.createMediaElementSource(audio1);
            analyser = audioCtx.createAnalyser();
            audioSource.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 512;
        }
    }
});

function drawVisualizer(bufferLength, dataArray) {
    const barWidth = canvas.width / bufferLength;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.5;
        const angle = (i / bufferLength) * Math.PI * 4;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        const hue = i * 360 / bufferLength;
        ctx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        ctx.fillRect(0, -radius, barWidth, barHeight);
        ctx.restore();
    }
}
