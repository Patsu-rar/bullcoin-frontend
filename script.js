const users = [
    {
        username: 'micro',
    },
    {
        username: 'chelik',
    },
    {
        username: 'chubrik',
    },
    {
        username: 'loh',
    },
    {
        username: 'qwerty',
    },
];

// const users = [];


let maxProgress = 50;
let currentProgress = 50;
let clickCount = 0;

const mainContainer = document.getElementById('main-container');

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const coin = document.getElementById('coin');
const clickCounter = document.getElementById('click-counter');

const menuItems = document.querySelectorAll('.menu-icon');
const contents = document.querySelectorAll('.content');

const refCounter = document.getElementById('ref-counter');
const refEmptyMessage = document.querySelector('.ref-empty');
const refList = document.querySelector('.ref-list');


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

    if (target === 'home-content') {
        mainContainer.style.backgroundImage = "url('./assets/images/home_background.png')";
        mainContainer.style.boxShadow = "none";
    } else {
        mainContainer.style.backgroundImage = "url('./assets/images/secondary_background.png')";
        mainContainer.style.boxShadow = "inset 0 0 0 1000px rgba(0,0,0,0.2)";
    }

    refList.replaceChildren();

    if (target === 'home-content') {

    } else if (target === 'tasks-content') {

    } else if (target === 'boosts-content') {

    } else if (target === 'ref-content') {
        // some api call(mock for now)
        if (users.length !== 0) {
            refList.style.display = 'flex';
            refEmptyMessage.style.display = 'none';
            refCounter.textContent = `${users.length} Referrals`

            for (let user of users) {
                const refListItem = document.createElement('div');
                const refListItemUsername = document.createElement('div');
                const refListItemBonus = document.createElement('div');

                refListItem.className = 'ref-list-item';
                refListItemUsername.className = 'ref-list-item-username';
                refListItemBonus.className = 'ref-list-item-bonus';

                refListItemBonus.textContent = '+5000';
                refListItemUsername.textContent = `${user.username}`;

                refListItem.append(refListItemUsername, refListItemBonus);
                refList.appendChild(refListItem);
            }
        } else {
            refList.style.display = 'none';
            refEmptyMessage.style.display = 'flex';
            refCounter.textContent = `${users.length} Referrals`
        }
    }

    document.getElementById(target).classList.add('active');
}

setInterval(recoverProgress, 1000);

menuItems.forEach(item => {
    item.addEventListener('click', handleMenuClick);
});

updateProgress();
