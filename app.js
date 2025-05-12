// DOM Elements
const content = document.getElementById('content');
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const signoutBtn = document.getElementById('signoutBtn');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Navigation
document.getElementById('homeLink').addEventListener('click', () => loadPage('home'));
document.getElementById('marketplaceLink').addEventListener('click', () => loadPage('marketplace'));
document.getElementById('earnLink').addEventListener('click', () => loadPage('earn'));
document.getElementById('profileLink').addEventListener('click', () => loadPage('profile'));
document.getElementById('adminLink').addEventListener('click', () => loadAdminPanel());

// Auth Modal
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
});

signupBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Auth Forms
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authModal.style.display = 'none';
        updateUI();
    } catch (error) {
        alert(error.message);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(userCredential.user.uid).set({
            balance: 0,
            ownedCars: []
        });
        authModal.style.display = 'none';
        updateUI();
    } catch (error) {
        alert(error.message);
    }
});

// Auth State Observer
auth.onAuthStateChanged((user) => {
    updateUI();
});

signoutBtn.addEventListener('click', async () => {
    await auth.signOut();
    updateUI();
    loadPage('home');
});

function updateUI() {
    const user = auth.currentUser;
    if (user) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        signoutBtn.style.display = 'inline-block';
        document.getElementById('profileLink').style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        signoutBtn.style.display = 'none';
        document.getElementById('profileLink').style.display = 'none';
    }
}

async function loadPage(page) {
    switch(page) {
        case 'home':
            content.innerHTML = `
                <div class="hero-card">
                    <h1>🚗 Welcome to Car Marketplace</h1>
                    <p>Buy, earn, and showcase your dream garage.</p>
                    <button class="auth-btn" onclick="loadPage('marketplace')">Explore Cars</button>
                    <button class="auth-btn" onclick="loadPage('earn')">Earn Coins</button>
                </div>
            `;
            break;
        case 'marketplace':
            await loadMarketplace();
            break;
        case 'earn':
            await loadEarnPage();
            break;
        case 'profile':
            await loadProfile();
            break;
    }
}

async function loadMarketplace() {
    const cars = await db.collection('cars').get();
    content.innerHTML = `
        <div class="car-grid">
            ${cars.docs.map(doc => {
                const car = doc.data();
                return `
                    <div class="car-card">
                        <img src="${car.imageUrl}" alt="${car.name}" class="car-image">
                        <div class="car-info">
                            <h3>${car.name}</h3>
                            <p class="car-price">${car.price} coins</p>
                            <button onclick="purchaseCar('${doc.id}')" class="auth-btn">Purchase</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function loadEarnPage() {
    let balance = 0;
    if (auth.currentUser) {
        const doc = await db.collection('users').doc(auth.currentUser.uid).get();
        balance = doc.data()?.balance || 0;
    }

    coins = balance;

    const html = `
        <div class="earn-container">
            <h1>Earn Coins</h1>
            <div class="coins-display">Coins: <span id="coinCount">${coins}</span></div>
            <button class="click-button" onclick="earnCoin()">Click to Earn!</button>
        </div>
    `;
    content.innerHTML = html;
}

let coins = 0;

function earnCoin() {
    coins++;
    updateCoinDisplay();

    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(1)
        });
    }

    spawnCoinBurst();
}

function updateCoinDisplay() {
    const coinDisplay = document.getElementById('coinCount');
    if (coinDisplay) {
        coinDisplay.textContent = coins;
    }
}

function spawnCoinBurst() {
    for (let i = 0; i < 6; i++) {
        const coin = document.createElement('img');
        coin.src = 'https://cdn-icons-png.flaticon.com/512/138/138281.png';
        coin.className = 'coin-burst';
        coin.style.left = `${50 + Math.random() * 20 - 10}%`;
        coin.style.animationDelay = `${i * 0.1}s`;
        document.body.appendChild(coin);

        setTimeout(() => coin.remove(), 2000);
    }
}

async function loadProfile() {
    if (!auth.currentUser) {
        content.innerHTML = '<h1>Please log in to view your profile</h1>';
        return;
    }

    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    const userData = userDoc.data();

    content.innerHTML = `
        <div class="profile-container">
            <h1>Your Profile</h1>
            <p>Balance: ${userData.balance} coins</p>
            <h2>Your Cars</h2>
            <div class="car-grid">
                ${userData.ownedCars.map(car => `
                    <div class="car-card">
                        <img src="${car.imageUrl}" alt="${car.name}" class="car-image">
                        <div class="car-info">
                            <h3>${car.name}</h3>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function purchaseCar(carId) {
    if (!auth.currentUser) {
        alert('Please log in to purchase cars');
        return;
    }

    const carDoc = await db.collection('cars').doc(carId).get();
    const car = carDoc.data();
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    const userData = userDoc.data();

    if (userData.balance >= car.price) {
        try {
            await db.collection('users').doc(auth.currentUser.uid).update({
                balance: firebase.firestore.FieldValue.increment(-car.price),
                ownedCars: firebase.firestore.FieldValue.arrayUnion({
                    id: carId,
                    name: car.name,
                    imageUrl: car.imageUrl
                })
            });
            alert('Purchase successful!');
            loadProfile();
        } catch (error) {
            alert('Error purchasing car: ' + error.message);
        }
    } else {
        alert('Not enough coins!');
    }
}

async function loadAdminPanel() {
    if (!auth.currentUser) {
        content.innerHTML = '<h1>Please log in as admin</h1>';
        return;
    }
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    const userData = userDoc.data();
    if (!userData.isAdmin) {
        content.innerHTML = '<h1>Access denied. You are not an admin.</h1>';
        return;
    }
    content.innerHTML = `
        <div class="admin-panel">
            <h1>Add a Car</h1>
            <form id="adminForm" class="admin-form">
                <input type="text" id="carName" placeholder="Car Name" required>
                <input type="number" id="carPrice" placeholder="Price" required>
                <input type="file" id="carImage" accept="image/*" required>
                <button type="submit">Add Car</button>
            </form>
        </div>
    `;
    document.getElementById('adminForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('carName').value;
        const price = document.getElementById('carPrice').value;
        const imageFile = document.getElementById('carImage').files[0];
        await addCar(name, price, imageFile);
    });
}

async function addCar(name, price, imageFile) {
    try {
        const metadata = {
            contentType: imageFile.type,
            customMetadata: {
                'name': name,
                'price': price
            }
        };

        const ref = storage.ref('cars/' + imageFile.name);
        const snapshot = await ref.put(imageFile, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();

        await db.collection('cars').add({
            name: name,
            price: parseInt(price),
            imageUrl: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Car added successfully!');
        loadMarketplace();
    } catch (error) {
        alert('Error adding car: ' + error.message);
    }
}

// Start
loadPage('home');
