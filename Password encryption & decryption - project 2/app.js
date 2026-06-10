/**
 * DecodeLabs Cryptographic Engine - Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const shiftSlider = document.getElementById('shift-slider');
  const shiftValue = document.getElementById('shift-value');
  const shiftDec = document.getElementById('shift-dec');
  const shiftInc = document.getElementById('shift-inc');
  
  const plaintextInput = document.getElementById('plaintext-input');
  const ciphertextInput = document.getElementById('ciphertext-input');
  const plaintextCount = document.getElementById('plaintext-count');
  const ciphertextCount = document.getElementById('ciphertext-count');
  
  const clearPlaintext = document.getElementById('clear-plaintext');
  const clearCiphertext = document.getElementById('clear-ciphertext');
  
  const encryptingArrow = document.querySelector('.encrypting-arrow');
  const decryptingArrow = document.querySelector('.decrypting-arrow');
  
  const pickerWrapper = document.getElementById('picker-wrapper');
  
  // Pipeline Visual Values
  const valCharIn = document.getElementById('val-char-in');
  const valAsciiIn = document.getElementById('val-ascii-in');
  const valIndexIn = document.getElementById('val-index-in');
  const valFormulaBase = document.getElementById('val-formula-base');
  const valShiftOut = document.getElementById('val-shift-out');
  const valFormulaShift = document.getElementById('val-formula-shift');
  const valWrapOut = document.getElementById('val-wrap-out');
  const valFormulaWrap = document.getElementById('val-formula-wrap');
  const valAsciiOut = document.getElementById('val-ascii-out');
  const valFormulaDenorm = document.getElementById('val-formula-denorm');
  const valCharOut = document.getElementById('val-char-out');
  
  // Tabs Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Brute Force Table Body
  const bruteTableBody = document.querySelector('#brute-table-body tbody');
  
  // Frequency Analysis Canvas
  const canvas = document.getElementById('freq-chart');
  const ctx = canvas.getContext('2d');
  
  // State variables
  let currentShift = parseInt(shiftSlider.value, 10);
  let activeTraceIndex = 0; // Index of character being traced in the pipeline
  let lastActiveInput = 'plaintext'; // Tracks whether user last edited plain or cipher text
  
  // Common English words for brute-force analysis
  const commonEnglishWords = ['the', 'and', 'ing', 'her', 'hat', 'his', 'tha', 'ere', 'for', 'you', 'was', 'with', 'this', 'that', 'have'];
  
  // Core Cryptographic Algorithms
  function encryptCaesar(text, shift) {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      // Uppercase letters (65 - 90)
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
      }
      // Lowercase letters (97 - 122)
      else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
      }
      // Numbers, punctuation, and spaces remain unchanged
      return char;
    }).join('');
  }
  
  function decryptCaesar(text, shift) {
    return encryptCaesar(text, -shift);
  }
  
  // UI Actions & Synchronization
  function updateShift(val) {
    currentShift = Math.max(0, Math.min(25, val));
    shiftSlider.value = currentShift;
    shiftValue.textContent = currentShift;
    
    // Trigger encryption/decryption based on last edited source
    if (lastActiveInput === 'plaintext') {
      const plain = plaintextInput.value;
      ciphertextInput.value = encryptCaesar(plain, currentShift);
    } else {
      const cipher = ciphertextInput.value;
      plaintextInput.value = decryptCaesar(cipher, currentShift);
    }
    
    updateCryptoArrows();
    updateCharacterCounts();
    updateAnalysis();
  }
  
  function updateCryptoArrows() {
    if (lastActiveInput === 'plaintext') {
      encryptingArrow.classList.add('active');
      decryptingArrow.classList.remove('active');
    } else {
      encryptingArrow.classList.remove('active');
      decryptingArrow.classList.add('active');
    }
  }
  
  function updateCharacterCounts() {
    plaintextCount.textContent = plaintextInput.value.length;
    ciphertextCount.textContent = ciphertextInput.value.length;
  }
  
  // Traces standard shifting math for the chosen token index
  function renderMathPipeline() {
    const text = plaintextInput.value;
    pickerWrapper.innerHTML = '';
    
    if (!text) {
      pickerWrapper.innerHTML = '<span class="picker-placeholder">Enter text to start mathematical tracing...</span>';
      resetPipelineNodes();
      return;
    }
    
    // Render pickable tokens
    for (let i = 0; i < Math.min(text.length, 30); i++) {
      const token = document.createElement('span');
      token.classList.add('picker-token');
      
      const char = text[i];
      if (char === ' ') {
        token.textContent = '␣';
      } else {
        token.textContent = char;
      }
      
      if (i === activeTraceIndex) {
        token.classList.add('active');
      }
      
      // If it's punctuation, spaces, or numbers, visually indicate it
      const code = char.charCodeAt(0);
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (!isLetter) {
        token.classList.add('special');
      }
      
      token.addEventListener('click', () => {
        activeTraceIndex = i;
        renderMathPipeline();
      });
      pickerWrapper.appendChild(token);
    }
    
    if (activeTraceIndex >= text.length) {
      activeTraceIndex = 0;
    }
    
    const char = text[activeTraceIndex];
    if (!char) {
      resetPipelineNodes();
      return;
    }
    
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    const isLetter = isUpper || isLower;
    
    valCharIn.textContent = char === ' ' ? 'Space' : char;
    valAsciiIn.textContent = code;
    
    if (isLetter) {
      const base = isUpper ? 65 : 97;
      const baseChar = isUpper ? 'A' : 'a';
      const index = code - base;
      
      valIndexIn.textContent = index;
      valFormulaBase.textContent = `ord('${char}') - ${base} (${baseChar})`;
      
      const shifted = index + currentShift;
      valShiftOut.textContent = shifted;
      valFormulaShift.textContent = `Index(${index}) + Key(${currentShift})`;
      
      const wrapped = (shifted % 26 + 26) % 26;
      valWrapOut.textContent = wrapped;
      valFormulaWrap.textContent = `Shifted(${shifted}) % 26`;
      
      const finalAscii = wrapped + base;
      valAsciiOut.textContent = finalAscii;
      valFormulaDenorm.textContent = `Wrapped(${wrapped}) + ${base} (${baseChar})`;
      
      const finalChar = String.fromCharCode(finalAscii);
      valCharOut.textContent = finalChar;
      
      // Make sure warning glows are styled
      document.querySelectorAll('.node-box').forEach(n => n.classList.remove('neon-border', 'neon-border-amber', 'neon-border-green'));
      document.getElementById('node-input').querySelector('.node-box').classList.add('neon-border');
      document.getElementById('node-wrap').querySelector('.node-box').classList.add('neon-border-amber');
      document.getElementById('node-output').querySelector('.node-box').classList.add('neon-border-green');
    } else {
      // Bypasses encryption math
      valIndexIn.textContent = 'N/A';
      valFormulaBase.textContent = 'Bypassed (Not Letter)';
      
      valShiftOut.textContent = 'N/A';
      valFormulaShift.textContent = 'No shift applied';
      
      valWrapOut.textContent = 'N/A';
      valFormulaWrap.textContent = 'No wrap needed';
      
      valAsciiOut.textContent = code;
      valFormulaDenorm.textContent = 'ASCII Unchanged';
      
      valCharOut.textContent = char;
      
      document.querySelectorAll('.node-box').forEach(n => n.classList.remove('neon-border', 'neon-border-amber', 'neon-border-green'));
    }
  }
  
  function resetPipelineNodes() {
    valCharIn.textContent = '-';
    valAsciiIn.textContent = '-';
    valIndexIn.textContent = '-';
    valFormulaBase.textContent = '-';
    valShiftOut.textContent = '-';
    valFormulaShift = '-';
    valWrapOut.textContent = '-';
    valFormulaWrap = '-';
    valAsciiOut.textContent = '-';
    valFormulaDenorm.textContent = '-';
    valCharOut.textContent = '-';
    document.querySelectorAll('.node-box').forEach(n => n.classList.remove('neon-border', 'neon-border-amber', 'neon-border-green'));
  }
  
  // Frequency Analysis Chart Renderer
  function renderFrequencyChart() {
    const ptText = plaintextInput.value;
    const ctText = ciphertextInput.value;
    
    const ptFreqs = new Array(26).fill(0);
    const ctFreqs = new Array(26).fill(0);
    
    let ptLettersCount = 0;
    let ctLettersCount = 0;
    
    // Count frequencies
    for (let char of ptText.toUpperCase()) {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        ptFreqs[code - 65]++;
        ptLettersCount++;
      }
    }
    
    for (let char of ctText.toUpperCase()) {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        ctFreqs[code - 65]++;
        ctLettersCount++;
      }
    }
    
    // Normalize percentages
    const ptPct = ptFreqs.map(count => ptLettersCount > 0 ? (count / ptLettersCount) * 100 : 0);
    const ctPct = ctFreqs.map(count => ctLettersCount > 0 ? (count / ctLettersCount) * 100 : 0);
    
    const maxPct = Math.max(...ptPct, ...ctPct, 10); // Minimum 10% height scale
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const paddingLeft = 30;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;
    
    const chartWidth = canvas.width - paddingLeft - paddingRight;
    const chartHeight = canvas.height - paddingTop - paddingBottom;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(canvas.width - paddingRight, y);
      ctx.stroke();
      
      // Draw grid labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Outfit';
      const val = (maxPct - (maxPct / 4) * i).toFixed(1);
      ctx.fillText(val + '%', 2, y + 3);
    }
    
    // Draw Bars
    const barSpacing = chartWidth / 26;
    const innerBarWidth = barSpacing * 0.35;
    
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      const x = paddingLeft + i * barSpacing + barSpacing * 0.15;
      
      // Plaintext Bar
      const ptBarHeight = (ptPct[i] / maxPct) * chartHeight;
      const ptY = paddingTop + chartHeight - ptBarHeight;
      
      ctx.fillStyle = 'rgba(0, 242, 254, 0.65)';
      ctx.fillRect(x, ptY, innerBarWidth, ptBarHeight);
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, ptY, innerBarWidth, ptBarHeight);
      
      // Ciphertext Bar
      const ctBarHeight = (ctPct[i] / maxPct) * chartHeight;
      const ctY = paddingTop + chartHeight - ctBarHeight;
      
      ctx.fillStyle = 'rgba(248, 87, 166, 0.65)';
      ctx.fillRect(x + innerBarWidth, ctY, innerBarWidth, ctBarHeight);
      ctx.strokeStyle = '#f857a6';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + innerBarWidth, ctY, innerBarWidth, ctBarHeight);
      
      // X Axis Letter labels
      ctx.fillStyle = '#8a99ad';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(letter, x + innerBarWidth * 0.5, canvas.height - 8);
    }
  }
  
  // Real-time Brute Force Solver
  function renderBruteForceSolver() {
    const cipherText = ciphertextInput.value;
    bruteTableBody.innerHTML = '';
    
    if (!cipherText) {
      bruteTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty-table-msg">Enter a ciphertext message to test key space recovery.</td>
        </tr>
      `;
      return;
    }
    
    for (let shift = 1; shift <= 25; shift++) {
      const candidateText = decryptCaesar(cipherText, shift);
      
      // Basic English Matching heuristic
      let matchCount = 0;
      const lowerCandidate = candidateText.toLowerCase();
      
      commonEnglishWords.forEach(word => {
        // Look for common words bounded by space, boundary, or punctuation
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(lowerCandidate)) {
          matchCount++;
        }
      });
      
      // Determine rating
      let assessment = '<span class="assessment-badge badge-unknown">Unlikely</span>';
      if (matchCount >= 2 || (cipherText.length < 15 && matchCount >= 1)) {
        assessment = '<span class="assessment-badge badge-match">⚠️ Matches English</span>';
      }
      
      // Truncate candidate text for table formatting
      let displayCandidate = candidateText;
      if (displayCandidate.length > 55) {
        displayCandidate = displayCandidate.substring(0, 52) + '...';
      }
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 700; color: #f857a6;">Shift -${shift}</td>
        <td title="${candidateText}">${escapeHtml(displayCandidate)}</td>
        <td>${assessment}</td>
      `;
      
      // Make it clickable to apply this shift to the enclave
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        updateShift(shift);
      });
      
      bruteTableBody.appendChild(row);
    }
  }
  
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  // Core analysis runner
  function updateAnalysis() {
    renderMathPipeline();
    renderFrequencyChart();
    renderBruteForceSolver();
  }
  
  // Event Listeners
  plaintextInput.addEventListener('input', () => {
    lastActiveInput = 'plaintext';
    ciphertextInput.value = encryptCaesar(plaintextInput.value, currentShift);
    updateCryptoArrows();
    updateCharacterCounts();
    updateAnalysis();
  });
  
  ciphertextInput.addEventListener('input', () => {
    lastActiveInput = 'ciphertext';
    plaintextInput.value = decryptCaesar(ciphertextInput.value, currentShift);
    updateCryptoArrows();
    updateCharacterCounts();
    updateAnalysis();
  });
  
  // Clear buttons
  clearPlaintext.addEventListener('click', () => {
    plaintextInput.value = '';
    ciphertextInput.value = '';
    activeTraceIndex = 0;
    updateCharacterCounts();
    updateAnalysis();
  });
  
  clearCiphertext.addEventListener('click', () => {
    plaintextInput.value = '';
    ciphertextInput.value = '';
    activeTraceIndex = 0;
    updateCharacterCounts();
    updateAnalysis();
  });
  
  // Slider triggers
  shiftSlider.addEventListener('input', (e) => {
    updateShift(parseInt(e.target.value, 10));
  });
  
  shiftDec.addEventListener('click', () => {
    updateShift(currentShift - 1);
  });
  
  shiftInc.addEventListener('click', () => {
    updateShift(currentShift + 1);
  });
  
  // Tabs Navigation Binding
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all buttons & panes
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Activate clicked tab
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');
      
      // If switching to Frequency tab, force chart redraw in case of sizing shifts
      if (targetTab === 'freq-tab') {
        renderFrequencyChart();
      }
    });
  });
  
  // Initialize state
  updateShift(3);
});
