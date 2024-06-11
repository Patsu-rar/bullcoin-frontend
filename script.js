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

let tasks;

// const users = [];

let maxProgress = 50;
let currentProgress = 50;
let clickCount = 9999999999999;

const mainContainer = document.getElementById('main-container');

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const coin = document.getElementById('coin');
const clickCounter = document.querySelectorAll('.coin-counter');

for (let el of clickCounter) {
    el.textContent = `${clickCount}`;
}

adjustFontSize(clickCounter[0]);

const tasksNavigationItems = document.querySelectorAll('.navigation-item');
const taskListContents = document.querySelectorAll('.tasks-list-content');
const specialTaskList = document.getElementById('special-tasks');
const refTaskList = document.getElementById('ref-tasks');

const menuItems = document.querySelectorAll('.menu-icon');
const contents = document.querySelectorAll('.content');

const refEmptyMessage = document.querySelector('.ref-empty');
const refList = document.querySelector('.ref-list');


function updateProgress() {
    progressBar.style.width = (currentProgress / maxProgress) * 100 + '%';
    progressText.textContent = currentProgress + '/' + maxProgress;
}

function adjustFontSize(el) {
    let fontSize = parseInt(window.getComputedStyle(el).fontSize);

    while (el.scrollWidth > 340 && fontSize > 10) {
        fontSize--;
        el.style.fontSize = `${fontSize}px`;
    }
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
    for (let el of clickCounter) {
        el.textContent = `${clickCount}`;
    }
    adjustFontSize(clickCounter[0]);
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
                        bonus: 2500
                    },
                    {
                        title: 'Invite 3 friends',
                        invited: 1,
                        bonus: 50000
                    },
                    {
                        title: 'Invite 10 friends',
                        invited: 1,
                        bonus: 200000
                    },
                    {
                        title: 'Invite 25 friends',
                        invited: 1,
                        bonus: 250000
                    },
                    {
                        title: 'Invite 50 friends',
                        invited: 1,
                        bonus: 300000
                    },
                    {
                        title: 'Invite 100 friends',
                        invited: 1,
                        bonus: 500000
                    },
                    {
                        title: 'Invite 500 friends',
                        invited: 1,
                        bonus: 2000000
                    },
                    {
                        title: 'Invite 1000 friends',
                        invited: 1,
                        bonus: 2500000
                    },
                    {
                        title: 'Invite 10000 friends',
                        invited: 1,
                        bonus: 10000000
                    },
                    {
                        title: 'Invite 100000 friends',
                        invited: 1,
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

                taskInfoWrapper.append(taskTitle, taskBonus);
                taskRightSide.append(taskIcon, taskInfoWrapper);
                taskListItem.append(taskRightSide, taskRedirectIcon);
                taskListContents[0].appendChild(taskListItem);
            }
        }

        adjustFontSize(tasksContentCounter);
    } else if (target === 'boosts-content') {
        const boostsContentCounter = document.querySelectorAll('.coin-counter')[2];

        adjustFontSize(boostsContentCounter);
    } else if (target === 'ref-content') {
        // some api call(mock for now)
        const refContentCounter = document.querySelectorAll('.coin-counter')[3];

        if (users.length !== 0) {
            refList.style.display = 'flex';
            refEmptyMessage.style.display = 'none';
            refContentCounter.textContent = `${users.length} Referralsssssssss`
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
