const BACKEND_URL = 'http://127.0.0.1:5000';

const loader = document.querySelector('.loader');
const menuWrapper = document.querySelector('.menu');

const coinIcon = document.createElement('img');
coinIcon.src = './assets/images/bullcoin_icon.png';

const mainContainer = document.getElementById('main-container');

const energyBar = document.getElementById('progress-bar');
const energyBarText = document.getElementById('progress-text');

const coin = document.getElementById('coin');
const clickCounter = document.querySelectorAll('.coin-counter');

const tasksNavigationItems = document.querySelectorAll('.navigation-item');
const taskListContents = document.querySelectorAll('.tasks-list-content');
const specialTaskList = document.getElementById('special-tasks');
const refTaskList = document.getElementById('ref-tasks');

const boostersList = document.querySelector('.general-boosters-list');
const tapGuruCounter = document.getElementById('tapping-guru-counter');
const fullTankCounter = document.getElementById('full-tank-counter');

const refEmptyMessage = document.querySelector('.ref-empty');
const refList = document.querySelector('.ref-list');
const refUrl = document.querySelector('.ref-url');

const menuItems = document.querySelectorAll('.menu-icon');
const contents = document.querySelectorAll('.content');

// ************************** Set these from endpoint **************************
let tasks;
let boosters;
let referralsList;
let boostsLoaded = false;

let maxEnergy;
let currentEnergy;
let clickCount;
let tapBotInterval;
let calculatedTime;

// ************************** Set from endpoint **************************

function initData(storageUser) {
    clickCount = storageUser.points;

    const loginTime = localStorage.getItem('loginTime');
    currentEnergy = storageUser.current_energy;
    maxEnergy = storageUser.max_energy;

    if (!loginTime) {
        localStorage.setItem('loginTime', Date.now());
    } else {
        currentEnergy += Math.floor((Date.now() - loginTime) / 1000) * storageUser.boosters[2].level;
        if (currentEnergy >= maxEnergy) {
            currentEnergy = maxEnergy;
            storageUser.current_energy = currentEnergy;

            if (storageUser.boosters[3].endTime) {
                clickCount += Math.floor((Date.now() - loginTime) / 1000) * storageUser.boosters[0].level;
                storageUser.points = clickCount;
            }

            localStorage.setItem('user', JSON.stringify(storageUser));
        }
        localStorage.setItem('loginTime', Date.now());
    }

    if (storageUser.boosters[3].endTime) {
        renderBoostersList(storageUser.boosters);
    }

    for (let el of clickCounter) {
        el.replaceChildren();

        const counterIcon = document.createElement('img');
        const counterTitle = document.createElement('div');

        counterIcon.src = './assets/images/bullcoin_icon.png';
        counterTitle.textContent = `${clickCount}`;

        counterIcon.className = 'main-coin-icon';

        el.append(counterIcon, counterTitle);
    }

    energyBarText.textContent = currentEnergy + '/' + maxEnergy;
    fullTankCounter.textContent = storageUser.daily_boosters_usage['Full Tank'] + '/3';
    tapGuruCounter.textContent = storageUser.daily_boosters_usage['Tapping Guru'] + '/3';

    adjustFontSize(clickCounter[0]);
    localStorage.setItem('isTappingGuruActive', 'false');

    tasks = storageUser.tasks;
    boosters = storageUser.boosters;
    referralsList = storageUser.referralsGiven;
    refUrl.textContent = storageUser.ref_link;
}

function showLoader() {
    contents.forEach(content => {
        content.classList.remove('active');
    });
    loader.style.visibility = 'visible';
    menuWrapper.style.visibility = 'hidden';
}

function hideLoader() {
    loader.style.visibility = 'hidden';
    menuWrapper.style.visibility = 'visible';
}

function initTg() {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        if (!Telegram.WebApp.isExpanded) {
            Telegram.WebApp.expand();
        }
    } else {
        console.log('Telegram WebApp is undefined, retrying…');
        setTimeout(initTg, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    async function fetchUserData() {
        try {
            showLoader();
            initTg();
            // const params = new URLSearchParams(Telegram.WebApp.initData);
            // const userData = JSON.parse(params.get('user'));
            // telegramId = userData.id;
            // console.log(userData);
            // const response = await fetch(BACKEND_URL + `/user/${telegramId}`);
            const response = await fetch(BACKEND_URL + `/user/550066310`);
            const data = await response.json();

            localStorage.setItem('user', JSON.stringify(data));

            hideLoader();
            contents.item(0).classList.add('active');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    let storageUser = JSON.parse(localStorage.getItem('user'));

    if (!storageUser) {
        showLoader();
        fetchUserData().then(() => {
            storageUser = JSON.parse(localStorage.getItem('user'));
            initData(storageUser);
            hideLoader();
            contents.item(0).classList.add('active');
        });
    } else {
        showLoader();
        initData(storageUser);
        setTimeout(() => {
            hideLoader();
            contents.item(0).classList.add('active');
        }, 2000);
    }
});

async function upgradeBooster(boosterName) {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}/upgrade_booster`, {
            method: 'POST',
            body: JSON.stringify({
                booster_name: boosterName,
                current_score: storageUser.points
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    } catch (error) {
        console.error('Error upgrading a booster:', error);
    }
}

async function useDailyBooster(boosterName) {
    try {
        showLoader();
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}/use_booster`, {
            method: 'POST',
            body: JSON.stringify({
                booster_name: boosterName,
                current_score: storageUser.points
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        hideLoader();
        contents.item(0).classList.add('active');
    } catch (error) {
        console.error('Error using a daily booster:', error);
    }
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function renderBoostersList(boosters) {
    boostersList.innerHTML = '';
    const storageUser = JSON.parse(localStorage.getItem('user'));

    for (let [i, el] of clickCounter.entries()) {
        el.replaceChildren();
        if (i !== 3) {
            const counterIcon = document.createElement('img');
            const counterTitle = document.createElement('div');

            counterIcon.src = './assets/images/bullcoin_icon.png';
            counterTitle.textContent = `${clickCount}`;

            counterIcon.className = 'main-coin-icon';

            el.append(counterIcon, counterTitle);
        }
    }

    for (let boost of boosters) {
        const boostItem = document.createElement('div');
        const boostItemIcon = document.createElement('img');
        const boostItemTitle = document.createElement('div');
        const boostItemPrice = document.createElement('div');
        const boostInfoWrapper = document.createElement('div');
        const leftSideWrapper = document.createElement('div');
        const upgradeBoosterIcon = document.createElement('div');
        let boostPriceWrapper = document.createElement('div');
        const counterIcon = document.createElement('img');

        boostItem.className = 'boost-list-item';
        boostItemIcon.className = 'boost-item-icon';
        boostItemTitle.className = 'boost-item-title';
        boostItemPrice.className = 'boost-item-price';
        counterIcon.className = 'main-coin-icon';

        boostItemIcon.src = `./assets/images/${boost.imgRef}`;
        boostItemTitle.textContent = boost.title;

        boostPriceWrapper.style.display = 'flex';
        boostPriceWrapper.style.alignItems = 'center';
        boostPriceWrapper.style.gap = '3px';

        counterIcon.src = './assets/images/bullcoin_icon.png';
        counterIcon.style.width = '15px';
        upgradeBoosterIcon.textContent = '+';

        boostInfoWrapper.style.display = 'flex';
        boostInfoWrapper.style.flexDirection = 'column';
        boostInfoWrapper.style.gap = '1%';

        upgradeBoosterIcon.style.fontSize = '34px';
        upgradeBoosterIcon.style.fontWeight = '700';

        if (boost.title === 'Tap Bot') {
            upgradeBoosterIcon.addEventListener('click', () =>
                showConfirmationPopup(
                    'Buy Tap Bot',
                    'Are you sure you want to buy Tap Bot?',
                    boost.title,
                    boost.level,
                    boost.price));
        } else {
            upgradeBoosterIcon.addEventListener('click', () =>
                showConfirmationPopup(
                    'Upgrade booster',
                    'Are you sure you want to upgrade this booster?',
                    boost.title,
                    boost.level,
                    boost.price));
        }

        leftSideWrapper.style.display = 'flex';
        leftSideWrapper.style.alignItems = 'center';
        leftSideWrapper.style.gap = '3%';

        if (boost.level) {
            boostItemPrice.textContent = boost.price + ' | ' + boost.level + ' level';
            boostPriceWrapper.append(counterIcon, boostItemPrice);
        } else {
            if (boost.endTime && !tapBotInterval) {
                upgradeBoosterIcon.style.display = 'none';

                tapBotInterval = setInterval(function () {
                    const storageUser = JSON.parse(localStorage.getItem('user'));
                    let now = new Date().getTime();

                    calculatedTime = new Date(storageUser.boosters[3].endTime).getTime()
                        - new Date(storageUser.boosters[3].lastUpdated).getTime();

                    if (calculatedTime < 0) {
                        boostItemPrice.textContent = boost.price;
                        boostPriceWrapper.replaceChildren();
                        boostPriceWrapper.append(counterIcon, boostItemPrice);
                        storageUser.boosters[3].lastUpdated = null;
                        storageUser.boosters[3].endTime = null;
                        localStorage.setItem('user', JSON.stringify(storageUser));
                        upgradeBoosterIcon.style.display = 'block';
                        clearInterval(tapBotInterval);
                    } else {
                        const tapBotCounterText = document.createElement('div');
                        tapBotCounterText.textContent = formatTime(calculatedTime / 1000);

                        if (currentEnergy === maxEnergy) {
                            clickCount += storageUser.boosters[0].level;
                            storageUser.points = clickCount;

                            for (let [i, el] of clickCounter.entries()) {
                                el.replaceChildren();
                                if (i !== 3) {
                                    const counterIcon = document.createElement('img');
                                    const counterTitle = document.createElement('div');

                                    counterIcon.src = './assets/images/bullcoin_icon.png';
                                    counterTitle.textContent = `${clickCount}`;

                                    counterIcon.className = 'main-coin-icon';

                                    el.append(counterIcon, counterTitle);
                                }
                            }

                            storageUser.boosters[3].lastUpdated = new Date(now);
                        }

                        boostPriceWrapper.textContent = tapBotCounterText.textContent;
                        localStorage.setItem('user', `${JSON.stringify(storageUser)}`);
                    }
                }.bind(this), 1000);
            } else {
                boostItemPrice.textContent = boost.price;
                boostPriceWrapper.append(counterIcon, boostItemPrice)
            }
        }

        boostInfoWrapper.append(boostItemTitle, boostPriceWrapper);
        leftSideWrapper.append(boostItemIcon, boostInfoWrapper);
        boostItem.append(leftSideWrapper, upgradeBoosterIcon);
        boostersList.appendChild(boostItem);
    }
}

function showConfirmationPopup(title, message, boosterName, boosterLevel = 0, boosterPrice = 0) {
    Telegram.WebApp.showPopup(
        {
            title,
            message,
            buttons: [
                {id: 'cancel', text: 'Cancel', type: 'close'},
                {id: 'ok', text: 'Confirm', type: 'ok'}
            ]
        },
        (buttonId) => {
            if (buttonId === 'ok') {
                let storageUser = JSON.parse(localStorage.getItem('user'));
                contents.forEach(content => {
                    content.classList.remove('active');
                });
                showLoader();
                if (boosterName === 'Tapping Guru') {
                    if (storageUser.daily_boosters_usage["Tapping Guru"] !== 0) {
                        storageUser.daily_boosters_usage["Tapping Guru"] -= 1;
                        localStorage.setItem('isTappingGuruActive', 'true');
                        useDailyBooster(boosterName);
                        setTimeout(() => localStorage.setItem('isTappingGuruActive', 'false'), 20000);
                        localStorage.setItem('user', `${JSON.stringify(storageUser)}`);
                        tapGuruCounter.textContent = storageUser.daily_boosters_usage['Tapping Guru'] + '/3';
                        hideLoader();
                        contents.item(0).classList.add('active');
                    } else {
                        Telegram.WebApp.showAlert('You have reached the maximum number of uses for today.');
                        hideLoader();
                        contents.item(2).classList.add('active');
                    }
                } else if (boosterName === 'Full Tank') {
                    if (storageUser.daily_boosters_usage["Full Tank"] !== 0) {
                        storageUser.current_energy = storageUser.max_energy;
                        storageUser.daily_boosters_usage["Full Tank"] -= 1;
                        useDailyBooster(boosterName);
                        localStorage.setItem('user', `${JSON.stringify(storageUser)}`);
                        fullTankCounter.textContent = storageUser.daily_boosters_usage['Full Tank'] + '/3';
                        currentEnergy = maxEnergy;
                        updateEnergy();
                        hideLoader();
                        contents.item(0).classList.add('active');
                    } else {
                        Telegram.WebApp.showAlert('You have reached the maximum number of uses for today.');
                        hideLoader();
                        contents.item(2).classList.add('active');
                    }
                } else if (boosterName === 'Tap Bot') {
                    if (storageUser.points >= 200000) {
                        storageUser.boosters[3].lastUpdated = Date.now();

                        const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000;
                        storageUser.boosters[3].endTime = Date.now() + twelveHoursInMilliseconds;

                        localStorage.setItem('user', JSON.stringify(storageUser));

                        renderBoostersList(storageUser.boosters);
                    }

                    hideLoader();
                    contents.item(2).classList.add('active');
                } else {
                    const booster = storageUser.boosters.find(booster => booster.title === boosterName);
                    if (storageUser.points > booster.price) {
                        showLoader();

                        if (boosterName === 'Energy Limit') {
                            storageUser.max_energy += 500;
                            maxEnergy = storageUser.max_energy;
                            localStorage.setItem('user', JSON.stringify(storageUser));
                        }

                        upgradeBooster(boosterName).then(() => {
                            const calculatedPrice = calculate_upgrade_price(boosterName, boosterLevel + 1);

                            booster.level += 1;
                            booster.price = calculate_upgrade_price(boosterName, boosterLevel + 2);
                            storageUser.points -= calculatedPrice;
                            clickCount = storageUser.points;
                            localStorage.setItem('user', JSON.stringify(storageUser));
                            renderBoostersList(storageUser.boosters);
                            hideLoader();
                            contents.item(2).classList.add('active');
                        });
                    } else {

                    }

                    hideLoader();
                    contents.item(2).classList.add('active');
                }

            } else {
                // pass
            }
        }
    );
}

function calculate_upgrade_price(boosterName, level) {
    if (boosterName === 'Recharging Speed') {
        if (level === 2) {
            return 2000;
        } else if (level === 3) {
            return 10000;
        } else if (level === 4) {
            return 100000;
        } else if (level === 5) {
            return 250000;
        } else {
            return null;
        }
    } else {
        if (2 <= level <= 8) {
            return 200 * (2 ** (level - 2));
        } else if (9 <= level <= 13) {
            return 50000 * (2 ** (level - 9))
        } else {
            return 300000 + 100000 * (level - 13);
        }
    }
}

function updateEnergy() {
    energyBar.style.width = (currentEnergy / maxEnergy) * 100 + '%';
    energyBarText.textContent = currentEnergy + '/' + maxEnergy;
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

function decreaseEnergy(event) {
    event.stopPropagation();
    event.preventDefault();

    for (let touch of event.changedTouches) {
        if (currentEnergy > 0) {
            let storageUser = JSON.parse(localStorage.getItem('user'));
            const isTappingGuruActive = JSON.parse(localStorage.getItem('isTappingGuruActive'));
            let calculatedScore = storageUser.boosters[0].level;
            if (!isTappingGuruActive) {
                currentEnergy -= calculatedScore;
            } else {
                calculatedScore *= 5;
            }
            clickCount += calculatedScore;
            showFloatingNumber(touch, calculatedScore);

            storageUser.points = clickCount;
            storageUser.current_energy = currentEnergy;

            localStorage.setItem('user', `${JSON.stringify(storageUser)}`);
            localStorage.setItem('lastClickTime', `${new Date().toUTCString()}`);
        }
    }
    updateEnergy();
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

function recoverEnergy() {
    const storageUser = JSON.parse(localStorage.getItem('user'));
    const calculatedEnergy = storageUser.boosters[2].level;
    currentEnergy += calculatedEnergy;
    if (currentEnergy > maxEnergy) {
        currentEnergy = maxEnergy;
        renderBoostersList(storageUser.boosters);
    }
    storageUser.current_energy = currentEnergy;
    localStorage.setItem('user', JSON.stringify(storageUser));
    updateEnergy();
}

function showFloatingNumber(touch, number) {
    const floatingNumber = document.createElement('div');
    floatingNumber.className = 'floating-number';
    floatingNumber.textContent = `+${number}`;
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

function redirectToChannel(channelUsername) {
    const channelLink = `https://t.me/${channelUsername}`;
    Telegram.WebApp.openTelegramLink(channelLink);
}

function handleTasksClick(event) {
    const target = event.target.getAttribute('data-target');

    refTaskList.replaceChildren();

    tasksNavigationItems.forEach(item => {
        item.classList.remove('active');
    });

    taskListContents.forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(target).classList.add('active');

    if (target === 'ref-tasks') {
        const storageUser = JSON.parse(localStorage.getItem('user'));

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
            taskBonus.textContent = task.reward;
            taskButton.textContent = 'Claim';
            taskButton.type = 'button';

            taskButton.disabled = task.needed_invitations > storageUser.invited_count || task.completed;

            taskButton.addEventListener('click', () => {

            });

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

async function getReferralsList() {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/referrals/${storageUser.telegram_id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function getUserTasksList() {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/tasks/${storageUser.telegram_id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function handleMenuClick(event) {
    const target = event.target.getAttribute('data-target');
    const storageUser = JSON.parse(localStorage.getItem('user'));

    clickCounter.forEach((el, i) => {
        el.replaceChildren();

        const counterTitle = document.createElement('div');
        const counterIcon = document.createElement('img');

        counterIcon.src = './assets/images/bullcoin_icon.png';
        counterTitle.textContent = `${storageUser.points}`;

        counterIcon.className = 'main-coin-icon';

        el.append(counterIcon, counterTitle);
        adjustFontSize(clickCounter[i]);
    });


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
        specialTaskList.replaceChildren();
        showLoader();
        getUserTasksList().then(res => {
            tasks = res;

            tasksNavigationItems[0].classList.add('active');
            taskListContents[0].classList.add('active');

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
                const taskButton = document.createElement('button');

                counterIcon.className = 'main-coin-icon';
                taskListItem.className = 'task-list-item';
                taskInfoWrapper.className = 'task-info-wrapper';
                taskIcon.className = 'task-list-icon';
                taskTitle.className = 'task-list-title';
                taskBonus.className = 'task-list-bonus';

                if (task.subscribed) {
                    taskButton.className = 'ref-btn';
                    taskButton.textContent = 'Claim';
                    taskButton.type = 'button';
                    taskButton.addEventListener('click', () => {
                        console.log(1)
                    });
                } else {
                    taskButton.className = 'task-list-redirect-icon';
                    taskButton.textContent = '>';
                    taskButton.type = 'button';
                    taskButton.addEventListener('click', () => {
                        Telegram.WebApp.openTelegramLink(task.task_url);
                    });
                }

                taskIcon.src = './assets/images/task_icon.png';
                taskTitle.textContent = task.title;
                taskBonus.textContent = task.reward;

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
                taskListContents[0].appendChild(taskListItem);
            }

            adjustFontSize(tasksContentCounter);

            hideLoader();
            contents.item(1).classList.add('active');
        });


    } else if (target === 'boosts-content') {
        const boostsContentCounter = document.querySelectorAll('.coin-counter')[2];

        adjustFontSize(boostsContentCounter);

        if (!tapBotInterval) {
            renderBoostersList(storageUser.boosters);
        }
    } else if (target === 'ref-content') {
        const refContentCounter = document.querySelectorAll('.coin-counter')[3];

        getReferralsList().then((res) => {
            showLoader();
            referralsList = res;
            const storageUser = JSON.parse(localStorage.getItem('user'));

            if (referralsList && referralsList.length !== 0) {
                if (referralsList.length > storageUser.referrals_given.length) {
                    storageUser.points += 5000 * (referralsList.length - storageUser.referrals_given.length);
                    clickCount = storageUser.points;
                    storageUser.invited_count = referralsList.length;
                    storageUser.referrals_given.push({
                        'points_awarded': 5000,
                        'referee_id': res.referee_id,
                        'referral_id': res.referral_id
                    });

                    localStorage.setItem('user', JSON.stringify(storageUser));
                }

                refList.style.display = 'flex';
                refEmptyMessage.style.display = 'none';
                refContentCounter.textContent = `${referralsList.length} Referrals`
                adjustFontSize(refContentCounter);

                for (let user of referralsList) {
                    const refListItem = document.createElement('div');
                    const refListItemUsername = document.createElement('div');
                    const refListItemBonus = document.createElement('div');

                    refListItem.className = 'ref-list-item';
                    refListItemUsername.className = 'ref-list-item-username';
                    refListItemBonus.className = 'ref-list-item-bonus';

                    refListItemBonus.textContent = `+${user.points_awarded}`;
                    refListItemUsername.textContent = `${user.username}`;

                    refListItem.append(refListItemUsername, refListItemBonus);
                    refList.appendChild(refListItem);
                }
            } else {
                refList.style.display = 'none';
                refEmptyMessage.style.display = 'flex';
                refContentCounter.textContent = '0 Referrals';
            }

            hideLoader();
            contents.item(3).classList.add('active');
        });
    }

    document.getElementById(target).classList.add('active');
}

setInterval(recoverEnergy, 1000);

menuItems.forEach(item => {
    item.addEventListener('click', handleMenuClick);
});

tasksNavigationItems.forEach(item => {
    item.addEventListener('click', handleTasksClick);
})

updateEnergy();
