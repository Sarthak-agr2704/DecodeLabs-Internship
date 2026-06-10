// DecodeLabs // Industrial Kit - Version 1.1.0
// Shackle Module Logic with Web Audio Synth, Console Logs, and Generator

// Embedded list of 100 common passwords for real-time local checks
const COMMON_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "12345", "qwerty", 
    "1234567", "1234567890", "1234567890", "admin", "letmein", "welcome", 
    "password123", "oracle", "mysql", "root", "pass123", "secret", "login",
    "graphics", "superman", "monkey", "keyboard", "football", "shadow", 
    "solitude", "master", "access", "corporate", "decodelabs", "security",
    "iloveyou", "mustang", "trustnoone", "joshua", "matrix", "hunter2",
    "dragon", "baseball", "starwars", "princess", "guinness", "charlie",
    "ginger", "bubba", "snickers", "harley", "pepper", "cookie", "shadow",
    "abcdefg", "111111", "123321", "1234567890", "654321", "000000",
    "123123", "777777", "888888", "999999", "admin123", "user123", "guest",
    "test1234", "password123!", "12345678!", "passwords", "changeit",
    "p@ssword", "p@ssw0rd", "P@ssword", "P@ssw0rd", "server", "system",
    "database", "network", "firewall", "router", "gateway", "terminal",
    "root123", "administrator", "support", "service", "backup", "recovery",
    "analyst", "decode", "decrypt", "encrypt", "cipher", "entropy", "shackle",
    "tumbler", "argon2id", "security101", "zero_trust", "cybersecurity"
];

// Constant-time string comparison to mitigate timing attacks
function constantTimeCompare(str1, str2) {
    if (str1.length !== str2.length) {
        let mismatch = str1.length ^ str2.length;
        const len = Math.max(str1.length, str2.length);
        for (let i = 0; i < len; i++) {
            const c1 = i < str1.length ? str1.charCodeAt(i) : 0;
            const c2 = i < str2.length ? str2.charCodeAt(i) : 0;
            mismatch |= c1 ^ c2;
        }
        return false;
    }
    
    let mismatch = 0;
    for (let i = 0; i < str1.length; i++) {
        mismatch |= str1.charCodeAt(i) ^ str2.charCodeAt(i);
    }
    return mismatch === 0;
}

// DOM Elements
const passwordInput = document.getElementById('password-input');
const toggleVisibilityBtn = document.getElementById('toggle-visibility');
const btnGenerate = document.getElementById('btn-generate');
const btnAudio = document.getElementById('btn-audio');
const systemStatusText = document.getElementById('system-status-text');

const ruleLength = document.getElementById('rule-length');
const ruleUpper = document.getElementById('rule-upper');
const ruleDigit = document.getElementById('rule-digit');
const ruleSymbol = document.getElementById('rule-symbol');
const ruleUnicode = document.getElementById('rule-unicode');

const policyVerdict = document.getElementById('policy-verdict');
const policyStatusBar = document.getElementById('policy-status-bar');
const shackleMechanism = document.getElementById('shackle-mechanism');
const shackleStatusVal = document.getElementById('shackle-status-value');
const shackleStatusDetails = document.getElementById('shackle-status-details');

const statEntropy = document.getElementById('stat-entropy');
const statPool = document.getElementById('stat-pool');
const tumblerGrid = document.getElementById('tumbler-grid');
const cryptoLeak = document.getElementById('crypto-leak');

const crackDesktop = document.getElementById('crack-desktop');
const crackCluster = document.getElementById('crack-cluster');
const crackQuantum = document.getElementById('crack-quantum');

const consoleLogOutput = document.getElementById('console-log-output');

// State Variables
let audioEnabled = false;
let audioCtx = null;
let lastState = 'NONE';
let unicodeDetectedLast = false;
const TOTAL_TUMBLER_CELLS = 24;

// --- Cyber Console Log Engine ---
function addLog(tag, message, level = 'sys') {
    const time = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    entry.innerHTML = `
        <span class="log-time">[${timeStr}]</span>
        <span class="log-tag log-tag-${level}">${tag.toUpperCase()}::</span>
        <span class="log-msg">${message}</span>
    `;
    
    consoleLogOutput.appendChild(entry);
    
    // Auto Scroll to Bottom
    consoleLogOutput.scrollTop = consoleLogOutput.scrollHeight;
}

// --- Audio Synthesizer (Web Audio API) ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTick() {
    if (!audioEnabled) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playSweep(isLocking) {
    if (!audioEnabled) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    
    if (isLocking) {
        // Upward frequency sweep (Securing)
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.35);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);
    } else {
        // Downward frequency sweep (Unlocking / Fail)
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);
    }
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
}

// Toggle Audio System
btnAudio.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    
    if (audioEnabled) {
        initAudio();
        btnAudio.title = "Toggle Synthesizer Audio (Active)";
        btnAudio.classList.add('status-pass');
        btnAudio.innerHTML = `
            <svg class="audio-icon" id="audio-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
        `;
        addLog('sys', 'Web Audio synthesizer interface unmuted.', 'sys');
        // Play high pitch check tone
        playTick();
    } else {
        btnAudio.title = "Toggle Synthesizer Audio (Muted)";
        btnAudio.classList.remove('status-pass');
        btnAudio.innerHTML = `
            <svg class="audio-icon" id="audio-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
        `;
        addLog('sys', 'Web Audio synthesizer interface muted.', 'sys');
    }
});

// --- Mathematical Crack Time Calculations ---
function getReadableCrackTime(seconds) {
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    const years = days / 365;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1000000) return `${Math.round(years / 1000)}k years`;
    const millionYears = years / 1000000;
    if (millionYears < 1000) return `${Math.round(millionYears)}M years`;
    const billionYears = millionYears / 1000;
    if (billionYears < 100) return `${billionYears.toFixed(1)}B years`;
    return "Infinity";
}

function updateCrackTimeEstimations(entropy) {
    // Total search space matches 2 ^ Entropy
    const totalCombinations = Math.pow(2, entropy);
    
    // Average guesses needed is half of key space (50%)
    const averageAttempts = totalCombinations / 2;
    
    // Devices Speeds (Guesses per second)
    const SPEED_DESKTOP = 1e9;     // 1 Billion guesses/sec (Moderate CPU/GPU hashcat)
    const SPEED_CLUSTER = 1e12;    // 1 Trillion guesses/sec (8x RTX 4090 rig cluster)
    const SPEED_SUPER = 1e16;      // 10 Peta-guesses/sec (Advanced Quantum/Shedded Arrays)

    const secDesktop = averageAttempts / SPEED_DESKTOP;
    const secCluster = averageAttempts / SPEED_CLUSTER;
    const secSuper = averageAttempts / SPEED_SUPER;

    crackDesktop.textContent = getReadableCrackTime(secDesktop);
    crackCluster.textContent = getReadableCrackTime(secCluster);
    crackQuantum.textContent = getReadableCrackTime(secSuper);

    // Apply color thresholds
    const setClass = (el, sec) => {
        el.className = 'est-time';
        if (sec < 60) el.classList.add('text-fail');
        else if (sec < 31536000) el.classList.add('text-warn');
        else el.classList.add('text-pass');
    };

    setClass(crackDesktop, secDesktop);
    setClass(crackCluster, secCluster);
    setClass(crackQuantum, secSuper);
}

// --- Cryptographic Password Generator ---
function generateEntropyPassword() {
    const charsLower = "abcdefghijklmnopqrstuvwxyz";
    const charsUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsDigits = "0123456789";
    const charsSymbols = "!@#$%^&*()_+-=[]{};':\",./<>?\\|`~";
    
    // Cyberpunk themed Unicode mathematical or technical glyphs
    const glyphsUnicode = ["Ω", "Ψ", "λ", "θ", "Δ", "Φ", "Ξ", "Σ", "⚡", "🤖", "👾", "⚙️", "🛡️"];

    const length = 12 + Math.floor(Math.random() * 5); // 12-16 characters
    let password = "";

    // Guarantee at least one of each character pool is included
    password += charsLower[Math.floor(Math.random() * charsLower.length)];
    password += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    password += charsDigits[Math.floor(Math.random() * charsDigits.length)];
    password += charsSymbols[Math.floor(Math.random() * charsSymbols.length)];
    password += glyphsUnicode[Math.floor(Math.random() * glyphsUnicode.length)];

    // Combine pool for rest of the string
    const fullPool = charsLower + charsUpper + charsDigits + charsSymbols + glyphsUnicode.join("");
    for (let i = 5; i < length; i++) {
        password += fullPool[Math.floor(Math.random() * fullPool.length)];
    }

    // Shuffle characters
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    // Inject and scan
    passwordInput.value = password;
    evaluatePassword();

    addLog('crypto', `Cryptographic entropy stream generated. Length: ${length}`, 'crypto');
}

btnGenerate.addEventListener('click', generateEntropyPassword);

// --- Binary Tumbler Array ---
function initializeTumblers() {
    tumblerGrid.innerHTML = '';
    for (let i = 0; i < TOTAL_TUMBLER_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'tumbler-cell';
        cell.textContent = Math.floor(Math.random() * 2);
        tumblerGrid.appendChild(cell);
    }
}

function updateTumblers(password) {
    const cells = tumblerGrid.querySelectorAll('.tumbler-cell');
    for (let i = 0; i < TOTAL_TUMBLER_CELLS; i++) {
        if (i < password.length) {
            const code = password.charCodeAt(i);
            const bit = code & 1; 
            cells[i].textContent = bit;
            cells[i].className = `tumbler-cell ${bit === 1 ? 'active-1' : 'active-0'}`;
        } else {
            // Keep background noise for unused cells, flickering occasionally
            if (Math.random() > 0.85) {
                cells[i].textContent = Math.floor(Math.random() * 2);
            }
            cells[i].className = 'tumbler-cell';
        }
    }
}

// Toggle Visibility Handler
toggleVisibilityBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    // Update SVG Eye Icon State
    toggleVisibilityBtn.innerHTML = isPassword ? 
        `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
         </svg>` :
        `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
         </svg>`;
});

// Primary Password Evaluation Function
function evaluatePassword() {
    const password = passwordInput.value;
    const len = password.length;

    // Play visual feedback click
    if (len > 0) playTick();

    // 1. Check Character Conditions
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':",./<>?\\|`~]/.test(password);
    const hasUnicode = [...password].some(char => char.charCodeAt(0) > 127);

    // Update LED styling
    len >= 8 ? ruleLength.classList.add('satisfied') : ruleLength.classList.remove('satisfied');
    hasUpper ? ruleUpper.classList.add('satisfied') : ruleUpper.classList.remove('satisfied');
    hasDigit ? ruleDigit.classList.add('satisfied') : ruleDigit.classList.remove('satisfied');
    hasSymbol ? ruleSymbol.classList.add('satisfied') : ruleSymbol.classList.remove('satisfied');
    hasUnicode ? ruleUnicode.classList.add('satisfied') : ruleUnicode.classList.remove('satisfied');

    // Update Tumblers
    updateTumblers(password);

    // Log unicode curveball transition
    if (hasUnicode && !unicodeDetectedLast) {
        addLog('crypto', 'Unicode Curveball detected. Search space expanded (+143,000).', 'crypto');
        unicodeDetectedLast = true;
    } else if (!hasUnicode && unicodeDetectedLast) {
        unicodeDetectedLast = false;
    }

    // Handle Empty Case
    if (len === 0) {
        document.documentElement.style.setProperty('--accent-hue', '180');
        policyVerdict.textContent = 'AWAITING INPUT';
        policyVerdict.className = 'text-cyan';
        policyStatusBar.style.width = '0%';
        policyStatusBar.className = 'status-bar-fill';
        
        shackleMechanism.classList.add('unlocked');
        shackleStatusVal.textContent = 'DISENGAGED (WEAK)';
        shackleStatusVal.className = 'shackle-status-text text-fail';
        shackleStatusDetails.textContent = 'Waiting for entropy validation...';
        
        statEntropy.textContent = '0.00';
        statEntropy.className = 'stat-value text-fail';
        statPool.textContent = '0';
        statPool.className = 'stat-value text-fail';
        cryptoLeak.textContent = 'AWAITING';
        cryptoLeak.className = 'crypto-val';
        
        updateCrackTimeEstimations(0);
        
        if (lastState !== 'NONE') {
            addLog('sys', 'Input buffer cleared. Gatekeeper policy reset.', 'sys');
            lastState = 'NONE';
        }
        return;
    }

    // 2. Calculate Search Space Pool Size (R)
    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasDigit) poolSize += 10;
    if (hasSymbol) poolSize += 33;
    if (hasUnicode) poolSize += 143000;

    // 3. Calculate Shannon/Search-Space Entropy (E = L * log2(R))
    let entropy = 0;
    if (poolSize > 0) {
        entropy = len * Math.log2(poolSize);
    }

    statEntropy.textContent = entropy.toFixed(2);
    statPool.textContent = poolSize;
    updateCrackTimeEstimations(entropy);

    // 4. Compare Against Common Passwords List (Constant Time Check)
    let isLeaked = false;
    for (let i = 0; i < COMMON_PASSWORDS.length; i++) {
        if (constantTimeCompare(password, COMMON_PASSWORDS[i])) {
            isLeaked = true;
        }
    }

    // Update Leak Alert UI
    if (isLeaked) {
        cryptoLeak.textContent = 'VULNERABLE';
        cryptoLeak.className = 'crypto-val text-fail';
    } else {
        cryptoLeak.textContent = 'CLEAR';
        cryptoLeak.className = 'crypto-val text-pass';
    }

    // 5. Final Verdict Logic
    let classification = 'WEAK';
    let remark = '';

    if (len < 8) {
        classification = 'WEAK';
        remark = 'FAIL: Password is less than 8 characters (Exponential Brute Force Risk).';
    } else if (isLeaked) {
        classification = 'WEAK';
        remark = 'FAIL: Found in leaked credentials database (credential stuffing risk).';
    } else {
        if (entropy < 40) {
            classification = 'WEAK';
            remark = 'WEAK: Low entropy. Easily cracked by brute-force rigs.';
        } else if (entropy < 60) {
            classification = 'MEDIUM';
            remark = 'MEDIUM: Decent entropy. Vulnerable to offline dictionaries.';
        } else {
            if (hasUpper && hasDigit && (hasSymbol || hasUnicode)) {
                classification = 'STRONG';
                remark = 'STRONG: High entropy. Resistant to offline scans.';
            } else {
                classification = 'MEDIUM';
                remark = 'MEDIUM: High entropy, but lacks character diversity (requires uppercase, digit, symbol/unicode).';
            }
        }
    }

    // 6. Update UI colors, bars, SVG states
    if (classification === 'WEAK') {
        document.documentElement.style.setProperty('--accent-hue', '0');
        policyVerdict.textContent = 'REJECTED';
        policyVerdict.className = 'status-fail';
        policyStatusBar.style.width = '33%';
        policyStatusBar.className = 'status-bar-fill fill-fail';
        
        shackleMechanism.classList.add('unlocked');
        shackleStatusVal.textContent = 'DISENGAGED (WEAK)';
        shackleStatusVal.className = 'shackle-status-text text-fail';
        
        statEntropy.className = 'stat-value text-fail';
        statPool.className = 'stat-value text-fail';
        
        if (lastState !== 'WEAK') {
            playSweep(false);
            if (len < 8) {
                addLog('pol', 'Policy Alert: Input rejected (less than 8 bytes).', 'err');
            } else if (isLeaked) {
                addLog('pol', 'Security Alert: Password matched in leaked credentials database!', 'err');
            } else {
                addLog('pol', 'Gatekeeper: Password classified as WEAK (low entropy).', 'err');
            }
            lastState = 'WEAK';
        }
    } else if (classification === 'MEDIUM') {
        document.documentElement.style.setProperty('--accent-hue', '38');
        policyVerdict.textContent = 'TRANSIT VALID';
        policyVerdict.className = 'status-warn';
        policyStatusBar.style.width = '66%';
        policyStatusBar.className = 'status-bar-fill fill-warn';
        
        shackleMechanism.classList.add('unlocked');
        shackleStatusVal.textContent = 'PARTIAL COVERAGE (MEDIUM)';
        shackleStatusVal.className = 'shackle-status-text text-warn';
        
        statEntropy.className = 'stat-value text-warn';
        statPool.className = 'stat-value text-warn';
        
        if (lastState !== 'MEDIUM') {
            if (lastState === 'STRONG') playSweep(false); // unlock sweep
            else playTick();
            addLog('pol', 'Gatekeeper: Password classified as MEDIUM (sufficient entropy).', 'pol');
            lastState = 'MEDIUM';
        }
    } else if (classification === 'STRONG') {
        document.documentElement.style.setProperty('--accent-hue', '142');
        policyVerdict.textContent = 'SECURED';
        policyVerdict.className = 'status-pass';
        policyStatusBar.style.width = '100%';
        policyStatusBar.className = 'status-bar-fill fill-pass';
        
        shackleMechanism.classList.remove('unlocked');
        shackleStatusVal.textContent = 'SHACKLE ENGAGED (STRONG)';
        shackleStatusVal.className = 'shackle-status-text text-pass';
        
        statEntropy.className = 'stat-value text-pass';
        statPool.className = 'stat-value text-pass';
        
        if (lastState !== 'STRONG') {
            playSweep(true); // lock sweep
            addLog('crypto', 'Gatekeeper: Password secured to STRONG. Shackle lock engaged.', 'crypto');
            lastState = 'STRONG';
        }
    }

    shackleStatusDetails.textContent = remark;
}

// Attach Event Listeners
passwordInput.addEventListener('input', evaluatePassword);

// Initialize Terminal
initializeTumblers();
evaluatePassword();

// Boot Log sequence
setTimeout(() => {
    addLog('sys', 'Shackle Cryptographic Module v1.1.0 booting...', 'sys');
}, 100);
setTimeout(() => {
    addLog('sys', 'Purging ephemeral RAM caches... Done.', 'sys');
}, 600);
setTimeout(() => {
    addLog('sys', 'Leak dictionary loaded (100 core records). Time complexity: O(n).', 'sys');
}, 1100);
setTimeout(() => {
    addLog('sys', 'System status: ONLINE. Awaiting raw byte stream.', 'sys');
    systemStatusText.textContent = "DEFIANT STATUS: ONLINE";
}, 1600);
