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

const boosters = [
    {
        title: 'Multitap',
        price: 500,
        level: 1,
        imgRef: 'bullcoin_icon.png'
    },
    {
        title: 'Energy Limit',
        price: 500,
        level: 1,
        imgRef: 'energy.png'
    },
    {
        title: 'Recharging Speed',
        price: 500,
        level: 1,
        imgRef: 'recharging.png'
    },
    {
        title: 'Tap Bot',
        price: 500,
        level: 1,
        imgRef: 'tapbot.png'
    },
]

let tasks;
let boostsLoaded = false;

let maxProgress = 50;
let currentProgress;
let clickCount;

let storageScore = +localStorage.getItem('score');
let storageProgress = +localStorage.getItem('progress');

let now = new Date();
let utcTime = now.toUTCString();
let localTime = now.toLocaleString();

if (storageScore) {
    clickCount = storageScore;
} else {
    clickCount = 0;
}

if (storageScore) {
    currentProgress = storageProgress;
} else {
    currentProgress = 0;
}

const test = document.getElementById('test');
if (localStorage.getItem('closedTime')) {
    test.innerHTML = localStorage.getItem('closedTime');
}


function initTg() {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        if (!Telegram.WebApp.isExpanded) {
            Telegram.WebApp.expand();
        }
        Telegram.WebApp.onEvent('viewportChanged', function () {
            let inputField = document.getElementById("inputField");
            if (inputField) {
                inputField.focus();
            }
        });

        Telegram.WebApp.onEvent('close', function () {
            localStorage.setItem('closedTime', `${new Date().toUTCString()}`);
        })
    } else {
        console.log('Telegram WebApp is undefined, retrying…');
        setTimeout(initTg, 100);
    }
}

initTg()

const coinIcon = document.createElement('img');
coinIcon.src = './assets/images/bullcoin_icon.png';

const mainContainer = document.getElementById('main-container');

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const coin = document.getElementById('coin');
const clickCounter = document.querySelectorAll('.coin-counter');

for (let el of clickCounter) {
    const counterIcon = document.createElement('img');
    const counterTitle = document.createElement('div');

    counterIcon.src = './assets/images/bullcoin_icon.png';
    counterTitle.textContent = `${clickCount}`;

    counterIcon.className = 'main-coin-icon';

    el.append(counterIcon, counterTitle);
}

adjustFontSize(clickCounter[0]);

const tasksNavigationItems = document.querySelectorAll('.navigation-item');
const taskListContents = document.querySelectorAll('.tasks-list-content');
const specialTaskList = document.getElementById('special-tasks');
const refTaskList = document.getElementById('ref-tasks');

const boostersList = document.querySelector('.general-boosters-list');

const refEmptyMessage = document.querySelector('.ref-empty');
const refList = document.querySelector('.ref-list');

const menuItems = document.querySelectorAll('.menu-icon');
const contents = document.querySelectorAll('.content');

function updateProgress() {
    progressBar.style.width = (currentProgress / maxProgress) * 100 + '%';
    progressText.textContent = currentProgress + '/' + maxProgress;
}

function adjustFontSize(el) {
    let fontSize = parseInt(window.getComputedStyle(el).fontSize);
    let imageWidth;
    let refWrapper = document.querySelector('.ref-wrapper');

    if (el.id !== 'ref-counter') {
        imageWidth = parseInt(el.getElementsByTagName('img')[0].width);
    }

    while (el.scrollWidth > window.innerWidth - 60 && fontSize > 10) {
        fontSize--;
        el.style.fontSize = `${fontSize}px`;
        el.style.left = `${el.scrollWidth * 0.5 - refWrapper.clientWidth * 0.5}px`;

        if (el.id !== 'ref-counter' && imageWidth > 30) {
            imageWidth--;
            el.getElementsByTagName('img')[0].style.width = `${imageWidth}px`;
        }
    }
}

function decreaseProgress(event) {
    event.stopPropagation();

    for (let touch of event.changedTouches) {
        if (currentProgress > 0) {
            currentProgress--;
            clickCount++;
            showFloatingNumber(touch);
            localStorage.setItem('score', `${clickCount}`);
            localStorage.setItem('progress', `${currentProgress}`);
        }
    }
    updateProgress();
    for (let el of clickCounter) {
        el.replaceChildren();

        const counterTitle = document.createElement('div');
        const counterIcon = document.createElement('img');

        counterIcon.src = './assets/images/bullcoin_icon.png';
        counterTitle.textContent = `${clickCount}`;

        counterIcon.className = 'main-coin-icon';

        el.append(counterIcon, counterTitle);
    }
    adjustFontSize(clickCounter[0]);
}

function recoverProgress() {
    if (currentProgress < maxProgress) {
        currentProgress++;
        localStorage.setItem('progress', currentProgress)
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

function copyToClipboard() {
    const link = document.querySelector('.ref-url');
    const copyBtn = document.querySelector('.ref-btn');

    navigator.clipboard.writeText(link.textContent).then(() => {
        copyBtn.textContent = 'Copied';
        copyBtn.disabled = true;

        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.disabled = false;
        }, 2000);
    }).catch(err => {
        console.log('Failed to copy the link.');
    });
}

function handleTasksClick(event) {
    const target = event.target.getAttribute('data-target');

    tasksNavigationItems.forEach(item => {
        item.classList.remove('active');
    });

    taskListContents.forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(target).classList.add('active');

    if (target === 'ref-tasks') {
        for (let task of tasks.referral) {
            const taskListItem = document.createElement('div');

            const taskRightSide = document.createElement('div');
            const taskIcon = document.createElement('img');
            const taskTitle = document.createElement('div');
            const taskBonus = document.createElement('div');
            const taskButton = document.createElement('button');
            const taskInfoWrapper = document.createElement('div');
            const bonusWrapper = document.createElement('div');
            const counterIcon = document.createElement('img');

            counterIcon.className = 'main-coin-icon';
            taskListItem.className = 'task-list-item';
            taskInfoWrapper.className = 'task-info-wrapper';
            taskIcon.className = 'task-list-icon';
            taskTitle.className = 'task-list-title';
            taskBonus.className = 'task-list-bonus';
            taskButton.className = 'ref-btn';

            taskIcon.src = './assets/images/task_icon.png';
            taskTitle.textContent = task.title;
            taskBonus.textContent = task.bonus;
            taskButton.textContent = 'Claim';
            taskButton.type = 'button';

            if (task.invited < task.goal) {
                taskButton.disabled = true;
            } else {
                taskButton.disabled = false;
            }

            taskRightSide.style.display = 'flex';
            taskRightSide.style.alignItems = 'center';

            bonusWrapper.style.display = 'flex';
            bonusWrapper.style.alignItems = 'center';
            bonusWrapper.style.gap = '3px';

            counterIcon.src = './assets/images/bullcoin_icon.png';
            counterIcon.style.width = '15px';

            bonusWrapper.append(counterIcon, taskBonus)
            taskInfoWrapper.append(taskTitle, bonusWrapper);
            taskRightSide.append(taskIcon, taskInfoWrapper);
            taskListItem.append(taskRightSide, taskButton);
            taskListContents[1].appendChild(taskListItem);
        }
    }
}

function handleMenuClick(event) {
    const target = event.target.getAttribute('data-target');

    contents.forEach(content => {
        content.classList.remove('active');
    });

    tasksNavigationItems.forEach(item => {
        item.classList.remove('active');
    });

    taskListContents.forEach(content => {
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
        const homeContentCounter = document.querySelectorAll('.coin-counter')[0];

        adjustFontSize(homeContentCounter);
    } else if (target === 'tasks-content') {
        const tasksContentCounter = document.querySelectorAll('.coin-counter')[1];

        tasksNavigationItems[0].classList.add('active');
        taskListContents[0].classList.add('active');

        // api call for tasks
        if (!tasks) {
            tasks = {
                special: [
                    {
                        title: 'Subscribe to Telegram channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to Twitter channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to Instagram channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to TikTok channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to TikTok channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to TikTok channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to TikTok channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                    {
                        title: 'Subscribe to TikTok channel',
                        url: 'https://telegram.telegram.org',
                        bonus: 200000
                    },
                ],
                referral: [
                    {
                        title: 'Invite 1 friend',
                        invited: 1,
                        goal: 1,
                        bonus: 2500
                    },
                    {
                        title: 'Invite 3 friends',
                        invited: 1,
                        goal: 3,
                        bonus: 50000
                    },
                    {
                        title: 'Invite 10 friends',
                        invited: 1,
                        goal: 10,
                        bonus: 200000
                    },
                    {
                        title: 'Invite 25 friends',
                        invited: 1,
                        goal: 25,
                        bonus: 250000
                    },
                    {
                        title: 'Invite 50 friends',
                        invited: 1,
                        goal: 50,
                        bonus: 300000
                    },
                    {
                        title: 'Invite 100 friends',
                        invited: 1,
                        goal: 100,
                        bonus: 500000
                    },
                    {
                        title: 'Invite 500 friends',
                        invited: 1,
                        goal: 500,
                        bonus: 2000000
                    },
                    {
                        title: 'Invite 1000 friends',
                        invited: 1,
                        goal: 1000,
                        bonus: 2500000
                    },
                    {
                        title: 'Invite 10000 friends',
                        invited: 1,
                        goal: 10000,
                        bonus: 10000000
                    },
                    {
                        title: 'Invite 100000 friends',
                        invited: 1,
                        goal: 100000,
                        bonus: 100000000
                    }
                ]
            };

            for (let task of tasks.special) {
                const taskListItem = document.createElement('div');

                const taskRightSide = document.createElement('div');
                const taskIcon = document.createElement('img');
                const taskTitle = document.createElement('div');
                const taskBonus = document.createElement('div');
                const taskRedirectIcon = document.createElement('div');
                const taskInfoWrapper = document.createElement('div');
                const counterIcon = document.createElement('img');
                const bonusWrapper = document.createElement('div');

                counterIcon.className = 'main-coin-icon';
                taskListItem.className = 'task-list-item';
                taskInfoWrapper.className = 'task-info-wrapper';
                taskIcon.className = 'task-list-icon';
                taskTitle.className = 'task-list-title';
                taskBonus.className = 'task-list-bonus';
                taskRedirectIcon.className = 'task-list-redirect-icon';

                taskIcon.src = './assets/images/task_icon.png';
                taskTitle.textContent = task.title;
                taskBonus.textContent = task.bonus;
                taskRedirectIcon.textContent = '>';

                taskRightSide.style.display = 'flex';
                taskRightSide.style.alignItems = 'center';

                bonusWrapper.style.display = 'flex';
                bonusWrapper.style.alignItems = 'center';
                bonusWrapper.style.gap = '3px';

                counterIcon.src = './assets/images/bullcoin_icon.png';
                counterIcon.style.width = '15px';

                bonusWrapper.append(counterIcon, taskBonus)
                taskInfoWrapper.append(taskTitle, bonusWrapper);
                taskRightSide.append(taskIcon, taskInfoWrapper);
                taskListItem.append(taskRightSide, taskRedirectIcon);
                taskListContents[0].appendChild(taskListItem);
            }
        }

        adjustFontSize(tasksContentCounter);
    } else if (target === 'boosts-content') {
        const boostsContentCounter = document.querySelectorAll('.coin-counter')[2];

        adjustFontSize(boostsContentCounter);

        if (boostsLoaded === false) {
            for (let boost of boosters) {
                const boostItem = document.createElement('div');
                const boostItemIcon = document.createElement('img');
                const boostItemTitle = document.createElement('div');
                const boostItemPrice = document.createElement('div');

                boostItem.className = 'boost-list-item';
                boostItemIcon.className = 'boost-item-icon';
                boostItemTitle.className = 'boost-item-title';
                boostItemPrice.className = 'boost-item-price';

                boostItemIcon.src = `./assets/images/${boost.imgRef}`;
                boostItemTitle.textContent = boost.title;
                boostItemPrice.textContent = boost.price + ' | ' + boost.level + ' level';

                boostItem.append(boostItemIcon, boostItemTitle, boostItemPrice);
                boostersList.appendChild(boostItem);
            }
            boostsLoaded = true;
        }
    } else if (target === 'ref-content') {
        // some api call(mock for now)
        const refContentCounter = document.querySelectorAll('.coin-counter')[3];

        if (users.length !== 0) {
            refList.style.display = 'flex';
            refEmptyMessage.style.display = 'none';
            refContentCounter.textContent = `${users.length} Referrals`
            adjustFontSize(refContentCounter);

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
            refContentCounter.textContent = `${users.length} Referrals`
        }
    }

    document.getElementById(target).classList.add('active');
}

setInterval(recoverProgress, 1000);

menuItems.forEach(item => {
    item.addEventListener('click', handleMenuClick);
});

tasksNavigationItems.forEach(item => {
    item.addEventListener('click', handleTasksClick);
})

updateProgress();
