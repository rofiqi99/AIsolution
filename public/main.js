// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// --- GLOBAL AND FIREBASE VARIABLES ---
const getEl = (id) => document.getElementById(id);

// Konfigurasi Firebase akan diambil dari backend
let firebaseConfig = {};

const appId = 'my-content-planner-app';

let app, db, auth;
let userId = null;
let docRef = null;
let localData = {};

let currentStep = 1;
const totalSteps = 3;
let generatedData = [];
let currentInputs = {};
let currentCalendarItem = null;
let currentDraftObject = null;

// --- FUNGSI UTAMA ---

// Fungsi untuk mengambil konfigurasi Firebase dari backend
async function fetchFirebaseConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error('Gagal mengambil konfigurasi Firebase');
        }
        firebaseConfig = await response.json();
        console.log("Konfigurasi Firebase berhasil diambil.");
        initializeFirebase();
    } catch (error) {
        console.error("Error fetching Firebase config:", error);
        showErrorModal("Tidak dapat terhubung ke layanan. Fitur penting mungkin tidak berfungsi.");
        getEl('auth-container').style.display = 'none';
    }
}

// Inisialisasi Firebase setelah konfigurasi didapat
function initializeFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("Firebase berhasil diinisialisasi.");
        setupAuthListener();
        attemptSignIn();
    } catch (error) {
        console.error("Inisialisasi Firebase gagal:", error);
        showErrorModal("Gagal menginisialisasi layanan. Fitur sinkronisasi tidak akan berfungsi.");
        getEl('auth-container').style.display = 'none';
    }
}

function setupAuthListener() {
    onAuthStateChanged(auth, async (user) => {
        const userProfileEl = getEl('user-profile');
        const googleLoginBtnEl = getEl('google-login-btn');
        
        if (user) {
            userId = user.uid;
            if (user.isAnonymous) {
                console.log("Signed in anonymously with UID:", userId);
                userProfileEl.classList.add('hidden');
                userProfileEl.classList.remove('flex');
                googleLoginBtnEl.classList.remove('hidden');
                docRef = null;
                loadFromLocalStorage();
            } else {
                console.log("Signed in as Google user:", user.displayName);
                docRef = doc(db, `artifacts/${appId}/users/${userId}/contentPlanner`, "formData");
                getEl('user-profile-name').textContent = user.displayName || "Pengguna";
                getEl('user-profile-img').src = user.photoURL;
                userProfileEl.classList.remove('hidden');
                userProfileEl.classList.add('flex');
                googleLoginBtnEl.classList.add('hidden');
                await loadFromFirestore();
            }
        } else {
            userId = null;
            userProfileEl.classList.add('hidden');
            userProfileEl.classList.remove('flex');
            googleLoginBtnEl.classList.remove('hidden');
        }
    });
}

const attemptSignIn = async () => {
    if (!auth) return;
    try {
        console.log("Login sebagai anonim secara default.");
        await signInAnonymously(auth);
    } catch (error) {
        console.error("Gagal login sebagai anonim:", error);
        showErrorModal(`Gagal melakukan otentikasi anonim: ${error.message}`);
    }
}

// --- Logika Panggilan API ---
const callApiGenerate = async (payload) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Layanan AI tidak dapat dihubungi (Error: ${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error calling generate API:", error);
        throw error;
    }
};


// --- Sisa Logika UI (tetap sama seperti sebelumnya) ---
// (Salin semua fungsi UI dari kode sebelumnya ke sini, mulai dari getEl, debounce, loadData, saveData, dll. hingga akhir)
// Contoh:
const generatePlan = async () => {
    showLoading();
    try {
        currentInputs = getFormInputs();
        const prompt = buildPlannerPrompt(currentInputs);
        
        // Panggil backend, bukan langsung ke Gemini
        const result = await callApiGenerate({ prompt, schema: plannerSchema });

        generatedData = result.plan || [];
        
        hideLoading();
        // ... sisa logika render ...
    } catch (error) {
        // ... penanganan eror ...
    }
};
// ... (dan semua fungsi lainnya) ...


// --- EVENT LISTENERS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Ambil konfigurasi Firebase saat halaman dimuat
    fetchFirebaseConfig();

    // Setup event listeners lainnya
    // ...
    generateBtn.addEventListener('click', generatePlan);
    // ...
});
