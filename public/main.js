// File: public/main.js
// Firebase Imports
import { initializeApp } from "[https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js](https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js)";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "[https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js](https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js)";

// --- GLOBAL VARIABLES & DOM ELEMENTS ---
const getEl = (id) => document.getElementById(id);

let auth;
const googleLoginBtn = getEl('google-login-btn');
const logoutBtn = getEl('logout-btn');
const userProfile = getEl('user-profile');
const userProfileImg = getEl('user-profile-img');
const userProfileName = getEl('user-profile-name');
const generateBtn = getEl('generate-btn');
const promptInput = getEl('prompt-input');
const resultOutput = getEl('result-output');
const loadingIndicator = getEl('loading');


// --- CORE APPLICATION LOGIC ---

/**
 * Fetches Firebase config from our backend and initializes Firebase.
 */
async function initializeAppAndAuth() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error('Gagal mengambil konfigurasi dari server.');
        }
        const firebaseConfig = await response.json();
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        
        setupAuthListener();
        console.log("Firebase berhasil diinisialisasi.");

    } catch (error) {
        console.error("Initialization failed:", error);
        resultOutput.textContent = `Gagal memulai aplikasi: ${error.message}`;
    }
}

/**
 * Listens for changes in user's login state and updates the UI.
 */
function setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userProfile.classList.remove('hidden');
            userProfile.classList.add('flex');
            googleLoginBtn.classList.add('hidden');
            userProfileImg.src = user.photoURL;
            userProfileName.textContent = user.displayName;
        } else {
            userProfile.classList.add('hidden');
            userProfile.classList.remove('flex');
            googleLoginBtn.classList.remove('hidden');
        }
    });
}

/**
 * Handles the Google Login button click.
 */
async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Google gagal:", error);
        resultOutput.textContent = `Login Google gagal: ${error.message}`;
    }
}

/**
 * Handles the Logout button click.
 */
async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout gagal:", error);
    }
}

/**
 * Handles the "Buat Rencana!" button click, sending the prompt to our backend.
 */
async function handleGenerate() {
    const prompt = promptInput.value;
    if (!prompt) {
        resultOutput.textContent = "Prompt tidak boleh kosong.";
        return;
    }

    loadingIndicator.classList.remove('hidden');
    resultOutput.textContent = "";
    generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }
        
        resultOutput.textContent = result.text;

    } catch (error) {
        console.error("Gagal memanggil API Generate:", error);
        resultOutput.textContent = `Terjadi kesalahan: ${error.message}`;
    } finally {
        loadingIndicator.classList.add('hidden');
        generateBtn.disabled = false;
    }
}


// --- EVENT LISTENERS ---
googleLoginBtn.addEventListener('click', handleGoogleLogin);
logoutBtn.addEventListener('click', handleLogout);
generateBtn.addEventListener('click', handleGenerate);

// --- INITIALIZE THE APP ---
initializeAppAndAuth();