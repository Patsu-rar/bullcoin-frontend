const BACKEND_URL = 'https://bullcoin.fun:4050';

const loader = document.querySelector('.loader');
const menuWrapper = document.querySelector('.menu');

const coinIcon = document.createElement('img');
coinIcon.src = './assets/images/bullcoin_icon.png';

const body = document.querySelector('body');

const mainContainer = document.getElementById('main-container');
const mobileCaution = document.querySelector('.mobile-caution');

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

let tasks;
let boosters;
let referralsList;

let maxEnergy;
let currentEnergy;
let clickCount;
let tapBotInterval;
let onlineTapBotCounter;
let onlineEnergyCounter;

setInterval(() => {
    let storageUser = JSON.parse(localStorage.getItem('user'));
    if (storageUser) {
        const updateBody = {
            points: storageUser.points,
            current_energy: storageUser.current_energy,
            boosters: [
                {
                    "title": "Tap Bot",
                    "lastUpdated": storageUser.boosters[3].lastUpdated
                }
            ],
        }
        updateUser(updateBody);
    }
}, 15000);

function isMobileDevice() {
    const U = Telegram.WebApp.platform;
    return U === "android" || U === "ios";
}

async function resetDailyBoosters() {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}/reset_daily_boosters`, {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    } catch (error) {
        console.error('Error resetting the boosters:', error);
    }
}

function initData() {
    let storageUser = JSON.parse(localStorage.getItem('user'));

    clickCount = storageUser.points;

    const loginTime = +localStorage.getItem('loginTime');
    currentEnergy = storageUser.current_energy;
    maxEnergy = storageUser.max_energy;

    coin.src = `assets/images/bull_icon_${getIconLevel(storageUser.points)}.png`;

    if (!loginTime) {
        localStorage.setItem('loginTime', `${Date.now()}`);
    } else {
        const previousLoginDay = new Date(loginTime).getDate();
        const currentDay = new Date().getDate();

        if (currentDay !== previousLoginDay) {
            storageUser.daily_boosters_usage['Full Tank'] = 3;
            storageUser.daily_boosters_usage['Tapping Guru'] = 3;
            resetDailyBoosters();
        }

        onlineEnergyCounter = +localStorage.getItem('onlineEnergyCounter');

        if (!onlineEnergyCounter) {
            onlineEnergyCounter = 0;
        }

        currentEnergy += Math.floor(((Date.now() - loginTime) / 1000) - onlineEnergyCounter) * storageUser.boosters[2].level;

        onlineEnergyCounter = 0;
        localStorage.setItem('onlineEnergyCounter', '0');
        if (currentEnergy >= maxEnergy) {
            if (storageUser.boosters[3].bought === true) {
                const elapsedTime = Math.min(Date.now() - storageUser.boosters[3].lastUpdated,
                    12 * 60 * 60 * 1000);

                storageUser.boosters[3].lastUpdated = Date.now();

                const energyPerSecond = storageUser.boosters[2].level;
                const maxEnergyTimeInSeconds = Math.floor((currentEnergy - maxEnergy) / energyPerSecond);

                const validWorkTimeInSeconds = Math.min(maxEnergyTimeInSeconds, elapsedTime / 1000);
                const pointsPerClick = storageUser.boosters[0].level;

                onlineTapBotCounter = +localStorage.getItem('onlineTapBotCounter');

                const earnedPoints = Math.floor(validWorkTimeInSeconds * pointsPerClick);

                clickCount += Math.max(0, earnedPoints);
                storageUser.points = clickCount;
            }

            currentEnergy = maxEnergy;
            storageUser.current_energy = currentEnergy;

            localStorage.setItem('user', JSON.stringify(storageUser));
            localStorage.setItem('onlineTapBotCounter', '0');
            onlineTapBotCounter = 0;
        }
        localStorage.setItem('loginTime', `${Date.now()}`);
    }

    renderBoostersList(storageUser.boosters);

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

async function updateUser(updateData) {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            console.error('Error upgrading a booster:', response.statusText);
        }

        const data = await response.json();
        console.log('Success:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showLoader();

    if (!isMobileDevice()) {
        hideLoader();
        mainContainer.style.display = 'none';
        mobileCaution.style.display = 'flex';
    } else {
        async function fetchUserData() {
            try {
                let storageUser = JSON.parse(localStorage.getItem('user'));

                const params = new URLSearchParams(Telegram.WebApp.initData);
                const userData = JSON.parse(params.get('user'));
                const telegramId = userData.id;
                const response = await fetch(BACKEND_URL + `/user/${telegramId}`);

                const data = await response.json();

                if (storageUser && storageUser.telegram_id !== data.telegram_id) {
                    localStorage.removeItem('user');
                    storageUser = undefined;
                }

                if (storageUser) {
                    if (data.points < storageUser.points) {
                        data.points = storageUser.points;
                    }

                    if (data.current_energy < storageUser.current_energy) {
                        data.current_energy = storageUser.current_energy;
                    }

                    if (data.referrals_given.length > storageUser.referrals_given.length) {
                        storageUser.points += 5000 * (data.referrals_given.length - storageUser.referrals_given.length);
                        clickCount = storageUser.points;
                        storageUser.invited_count = data.referrals_given.length;
                        storageUser.referrals_given.push({
                            'points_awarded': 5000,
                            'referee_id': data.referrals_given[data.referrals_given.length - 1].referee_id,
                            'referral_id': data.referrals_given[data.referrals_given.length - 1].referral_id
                        });
                    }
                }

                localStorage.setItem('user', JSON.stringify(data));

                hideLoader();
                contents.item(0).classList.add('active');
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }



        fetchUserData().then(() => {
            let storageUser = JSON.parse(localStorage.getItem('user'));
            initTg();
            initData(storageUser);
            hideLoader();
            contents.item(0).classList.add('active');
        });
    }
});

async function upgradeBooster(boosterName) {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}/upgrade_booster`, {
            method: 'POST',
            body: JSON.stringify({
                booster_name: boosterName,
                current_score: storageUser.points,
                lastUpdated: storageUser.boosters[3].lastUpdated
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
        } else {
            const refContentCounter = document.querySelectorAll('.coin-counter')[3];

            if (referralsList) {
                refContentCounter.textContent = `${referralsList.length} Friends`
            } else {
                refContentCounter.textContent = '0 Friends';
            }
            adjustFontSize(refContentCounter);
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
                    'Are you sure you want to buy Tap Bot? You have to buy it only once. ' +
                    'It will click whenever the energy is full maximum for 12 hours.',
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
            if (boost.title === 'Recharging Speed' && boost.level === 5) {
                boostItemPrice.textContent = 'Max level';
                upgradeBoosterIcon.style.display = 'none';
            } else {
                boostItemPrice.textContent = boost.price + ' | ' + boost.level + ' level';
            }

            boostPriceWrapper.append(counterIcon, boostItemPrice);
        } else {
            if (boost.bought && !tapBotInterval) {
                upgradeBoosterIcon.style.display = 'none';

                tapBotInterval = setInterval(function () {
                    const storageUser = JSON.parse(localStorage.getItem('user'));

                    if (currentEnergy === maxEnergy) {
                        clickCount += storageUser.boosters[0].level;
                        storageUser.points = clickCount;
                        onlineTapBotCounter += storageUser.boosters[0].level;
                        storageUser.boosters[3].lastUpdated = Date.now();

                        localStorage.setItem('onlineTapBotCounter', onlineTapBotCounter);

                        for (let [i, el] of clickCounter.entries()) {
                            el.replaceChildren();
                            if (i !== 3) {
                                const counterIcon = document.createElement('img');
                                const counterTitle = document.createElement('div');

                                counterIcon.src = './assets/images/bullcoin_icon.png';
                                counterTitle.textContent = `${clickCount}`;

                                counterIcon.className = 'main-coin-icon';

                                el.append(counterIcon, counterTitle);
                            } else {
                                const refContentCounter = document.querySelectorAll('.coin-counter')[3];

                                if (referralsList) {
                                    refContentCounter.textContent = `${referralsList.length} Friends`
                                } else {
                                    refContentCounter.textContent = '0 Friends';
                                }
                                adjustFontSize(refContentCounter);
                            }
                        }
                    }

                    localStorage.setItem('user', JSON.stringify(storageUser));

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
                    if (storageUser.points >= 1000000) {
                        storageUser.boosters[3].bought = true;
                        storageUser.boosters[3].lastUpdated = Date.now();

                        storageUser.points -= 1000000;
                        clickCount -= 1000000;

                        for (let [i, el] of clickCounter.entries()) {
                            el.replaceChildren();
                            if (i !== 3) {
                                const counterIcon = document.createElement('img');
                                const counterTitle = document.createElement('div');

                                counterIcon.src = './assets/images/bullcoin_icon.png';
                                counterTitle.textContent = `${clickCount}`;

                                counterIcon.className = 'main-coin-icon';

                                el.append(counterIcon, counterTitle);
                            } else {
                                const refContentCounter = document.querySelectorAll('.coin-counter')[3];

                                if (referralsList) {
                                    refContentCounter.textContent = `${referralsList.length} Friends`
                                } else {
                                    refContentCounter.textContent = '0 Friends';
                                }
                                adjustFontSize(refContentCounter);
                            }
                        }

                        localStorage.setItem('user', JSON.stringify(storageUser));

                        renderBoostersList(storageUser.boosters);

                        upgradeBooster(boosterName);
                    } else {
                        Telegram.WebApp.showPopup(
                            {
                                title: 'Alert',
                                message: 'Sorry, you don\'t have enough points.',
                                buttons: [
                                    {id: 'close', text: 'Close', type: 'close'},
                                ]
                            }, () => {});
                    }

                    hideLoader();
                    contents.item(2).classList.add('active');
                } else {
                    const booster = storageUser.boosters.find(booster => booster.title === boosterName);
                    if (storageUser.points > booster.price) {
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
                        Telegram.WebApp.showPopup(
                            {
                                title: 'Alert',
                                message: 'Sorry, you don\'t have enough points.',
                                buttons: [
                                    {id: 'close', text: 'Close', type: 'close'},
                                ]
                            }, () => {});
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
            return 'max';
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

function getIconLevel(points) {
    if (points < 1_000_000) return 1;
    if (points < 3_000_000) return 2;
    if (points < 5_000_000) return 3;
    if (points < 10_000_000) return 4;
    if (points < 20_000_000) return 5;
    if (points < 40_000_000) return 6;
    if (points < 60_000_000) return 7;
    if (points < 80_000_000) return 8;
    return 9;
}

function decreaseEnergy(event) {
    event.stopPropagation();
    event.preventDefault();
    let storageUser = JSON.parse(localStorage.getItem('user'));

    for (let touch of event.changedTouches) {
        if (currentEnergy >= 1) {
            const isTappingGuruActive = JSON.parse(localStorage.getItem('isTappingGuruActive'));
            let calculatedScore = storageUser.boosters[0].level;

            if ((currentEnergy - calculatedScore) >= 0) {
                if (!isTappingGuruActive) {
                    currentEnergy -= calculatedScore;
                } else {
                    calculatedScore *= 5;
                }

                clickCount += calculatedScore;
                showFloatingNumber(touch, calculatedScore);

                const rect = coin.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * 20;
                const rotateY = ((x / rect.width) - 0.5) * (-20);

                coin.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                setTimeout(() => {
                    coin.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
                }, 100);

                storageUser.points = clickCount;
                storageUser.current_energy = currentEnergy;

                localStorage.setItem('user', `${JSON.stringify(storageUser)}`);
                localStorage.setItem('lastClickTime', `${new Date().toUTCString()}`);
            }
        }
    }
    coin.src = `assets/images/bull_icon_${getIconLevel(storageUser.points)}.png`;
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
    }
    storageUser.current_energy = currentEnergy;
    localStorage.setItem('onlineEnergyCounter', `${onlineEnergyCounter += 1}`)
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

function renderTasksList(tasks, target) {
    refTaskList.replaceChildren();
    specialTaskList.replaceChildren();

    const storageUser = JSON.parse(localStorage.getItem('user'));

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
            taskBonus.textContent = task.reward;
            taskButton.textContent = 'Claim';
            taskButton.type = 'button';

            taskButton.disabled = task.needed_invitations > storageUser.invited_count || task.completed;

            if (task.completed) {
                taskButton.textContent = 'Claimed';
            }

            taskButton.addEventListener('click', () => {
                completeTask(task.task_id).then(() => {
                    showLoader();
                    getUserTasksList().then(res => {
                        tasks = res;

                        tasksNavigationItems[1].classList.add('active');
                        taskListContents[1].classList.add('active');

                        clickCount += task.reward;
                        storageUser.points = clickCount;
                        storageUser.tasks = tasks;

                        localStorage.setItem('user', JSON.stringify(storageUser));

                        renderTasksList(storageUser.tasks, 'ref-tasks');

                        for (let [i, el] of clickCounter.entries()) {
                            el.replaceChildren();
                            if (i !== 3) {
                                const counterIcon = document.createElement('img');
                                const counterTitle = document.createElement('div');

                                counterIcon.src = './assets/images/bullcoin_icon.png';
                                counterTitle.textContent = `${clickCount}`;

                                counterIcon.className = 'main-coin-icon';

                                el.append(counterIcon, counterTitle);
                            } else {
                                const refContentCounter = document.querySelectorAll('.coin-counter')[3];

                                if (referralsList) {
                                    refContentCounter.textContent = `${referralsList.length} Friends`
                                } else {
                                    refContentCounter.textContent = '0 Friends';
                                }
                                adjustFontSize(refContentCounter);
                            }
                        }

                        hideLoader();
                        contents.item(1).classList.add('active');
                    });
                });
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
    } else if (target === 'special-tasks') {
        for (let task of tasks.special) {
            const taskListItem = document.createElement('div');

            const taskRightSide = document.createElement('div');
            const taskIcon = document.createElement('img');
            const taskTitle = document.createElement('div');
            const taskBonus = document.createElement('div');
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
                if (task.completed) {
                    taskButton.className = 'ref-btn';
                    taskButton.textContent = 'Claimed';
                    taskButton.type = 'button';
                    taskButton.disabled = true;
                } else {
                    taskButton.className = 'ref-btn';
                    taskButton.textContent = 'Claim';
                    taskButton.type = 'button';
                    taskButton.addEventListener('click', () => {
                        completeTask(task.task_id).then(() => {
                            showLoader();
                            getUserTasksList().then(res => {
                                tasks = res;

                                tasksNavigationItems[0].classList.add('active');
                                taskListContents[0].classList.add('active');

                                clickCount += task.reward;
                                storageUser.points = clickCount;
                                storageUser.tasks = tasks;

                                localStorage.setItem('user', JSON.stringify(storageUser));

                                renderTasksList(storageUser.tasks, 'special-tasks');

                                for (let [i, el] of clickCounter.entries()) {
                                    el.replaceChildren();
                                    if (i !== 3) {
                                        const counterIcon = document.createElement('img');
                                        const counterTitle = document.createElement('div');

                                        counterIcon.src = './assets/images/bullcoin_icon.png';
                                        counterTitle.textContent = `${clickCount}`;

                                        counterIcon.className = 'main-coin-icon';

                                        el.append(counterIcon, counterTitle);
                                    } else {
                                        const refContentCounter = document.querySelectorAll('.coin-counter')[3];

                                        if (referralsList) {
                                            refContentCounter.textContent = `${referralsList.length} Friends`
                                        } else {
                                            refContentCounter.textContent = '0 Friends';
                                        }
                                        adjustFontSize(refContentCounter);
                                    }
                                }

                                hideLoader();
                                contents.item(1).classList.add('active');
                            });
                        });
                    });
                }
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
    }
}

function handleTasksClick(event) {
    const target = event.target.getAttribute('data-target');

    refTaskList.replaceChildren();
    specialTaskList.replaceChildren();

    tasksNavigationItems.forEach(item => {
        item.classList.remove('active');
    });

    taskListContents.forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(target).classList.add('active');

    const storageUser = JSON.parse(localStorage.getItem('user'));
    renderTasksList(storageUser.tasks, target);
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

async function completeTask(task_id) {
    try {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(BACKEND_URL + `/user/${storageUser.telegram_id}/complete_task`, {
            method: 'POST',
            body: JSON.stringify({
                task_id: task_id,
                current_score: storageUser.points
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    } catch (error) {
        console.error('Error completing the task:', error);
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
        body.style.backgroundImage = "url('./assets/images/home_background.png')";
        body.style.boxShadow = "none";
    } else {
        body.style.backgroundImage = "url('./assets/images/secondary_background.png')";
        body.style.boxShadow = "inset 0 0 0 1000px rgba(0,0,0,0.2)";
    }

    refList.replaceChildren();

    if (target === 'home-content') {
        const homeContentCounter = document.querySelectorAll('.coin-counter')[0];

        adjustFontSize(homeContentCounter);
    } else if (target === 'tasks-content') {
        const tasksContentCounter = document.querySelectorAll('.coin-counter')[1];
        adjustFontSize(tasksContentCounter);
        showLoader();
        getUserTasksList().then(res => {
            tasks = res;

            tasksNavigationItems[0].classList.add('active');
            taskListContents[0].classList.add('active');

            storageUser.tasks = tasks;

            localStorage.setItem('user', JSON.stringify(storageUser));

            renderTasksList(storageUser.tasks, 'special-tasks');

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
                refContentCounter.textContent = `${referralsList.length} Friends`
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
                refContentCounter.textContent = '0 Friends';
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
