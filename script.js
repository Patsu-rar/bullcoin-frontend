import { Vibrate } from "nativescript-vibrate";

let maxProgress = 50;
let currentProgress = 50;
let clickCount = 0;
let vibrator = new Vibrate();

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const coin = document.getElementById('coin');
const clickCounter = document.getElementById('click-counter');
const menuItems = document.querySelectorAll('.menu-icon');
const contents = document.querySelectorAll('.content');

function updateProgress() {
    progressBar.style.width = (currentProgress / maxProgress) * 100 + '%';
    progressText.textContent = currentProgress + '/' + maxProgress;
}

function decreaseProgress(event) {
    event.stopPropagation();
    for (let touch of event.changedTouches) {
        if (currentProgress > 0) {
            currentProgress--;
            clickCount++;
            showFloatingNumber(touch);
        }
    }
    updateProgress();
    clickCounter.textContent = `${clickCount}`;
    vibrator.vibrate(1000);
}

function recoverProgress() {
    if (currentProgress < maxProgress) {
        currentProgress++;
        updateProgress();
    }
}

function showFloatingNumber(touch) {
    const floatingNumber = document.createElement('div');
    floatingNumber.className = 'floating-number';
    floatingNumber.textContent = '+1';
    document.body.appendChild(floatingNumber);

    const rect = coin.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    floatingNumber.style.left = `${rect.left + x}px`;
    floatingNumber.style.top = `${rect.top + y}px`;

    setTimeout(() => {
        floatingNumber.remove();
    }, 2000);
}

function handleMenuClick(event) {
    const target = event.target.getAttribute('data-target');

    contents.forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(target).classList.add('active');
}

setInterval(recoverProgress, 1000);

// coin.addEventListener('touchstart', (event) => {
//     event.preventDefault();
//     for (let touch of event.changedTouches) {
//         decreaseProgress(touch);
//     }
// }, { passive: false });

menuItems.forEach(item => {
    item.addEventListener('click', handleMenuClick);
});

updateProgress();
