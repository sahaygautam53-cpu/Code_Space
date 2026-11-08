const FIREBASE_DB_URL = 'https://sate-5a04f-default-rtdb.asia-southeast1.firebasedatabase.app/snippets';
const ADMIN_PASSWORD = 'admin123';

// 🔒 सिक्योर मर्चेंट वेरिएबल: यहाँ अपनी असली UPI ID डालें
const MERCHANT_UPI_ID = "UPI_ID"; 

// डिफ़ॉल्ट स्निपेट्स
let snippets = {
    1: {
        filename: 'appointment_form.html',
        title: 'Appointment Booking Form',
        price: '₹39',
        code: `<!-- PROTECTED SOURCE CODE -->\n<form id="appForm">\n  <input type="text" placeholder="Your Name" required>\n  <input type="date" required>\n  <input type="time" required>\n  <button type="submit">Book Slot</button>\n</form>`,
        preview: `<form style="display:flex; flex-direction:column; gap:10px; width:250px; text-align:left; background:#161b22; padding:20px; border-radius:10px; border:1px solid #30363d;" onsubmit="event.preventDefault(); alert('Appointment Booked!');">\n            <div style="font-size:0.9rem; font-weight:bold; color:#fff;">📅 Book Appointment</div>\n            <input type="text" placeholder="Your Name" style="padding:8px; border-radius:4px; border:1px solid #30363d; background:#0d1117; color:#fff; font-size:0.8rem; outline:none;">\n            <input type="date" style="padding:8px; border-radius:4px; border:1px solid #30363d; background:#0d1117; color:#fff; font-size:0.8rem; outline:none;">\n            <input type="time" style="padding:8px; border-radius:4px; border:1px solid #30363d; background:#0d1117; color:#fff; font-size:0.8rem; outline:none;">\n            <button type="submit" style="padding:9px; background:#2ea043; color:#fff; font-weight:bold; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Confirm Slot</button>\n        </form>`
    },
    2: {
        filename: 'dark_mode_toggle.js',
        title: 'Instant Dark Mode Script',
        price: '₹29',
        code: `// PROTECTED SOURCE CODE\nconst toggleBtn = document.querySelector('#theme-btn');\ntoggleBtn.addEventListener('click', () => {\n  document.body.classList.toggle('dark-theme');\n});`,
        preview: `<button onclick="alert('Theme toggled!')" style="padding:10px 18px; background:#bc8cff; color:#000; font-weight:bold; border:none; border-radius:20px; cursor:pointer; font-size:0.85rem;">🌙 Toggle Theme Switcher</button>`
    }
};

let currentActiveId = 1;

// Firebase से डेटा फेच करने का फंक्सन
async function syncFromFirebase() {
    try {
        const response = await fetch(`${FIREBASE_DB_URL}.json`);
        const data = await response.json();
        
        if (data) {
            const cleanedSnippets = {};
            let index = 1;
            Object.values(data).forEach(item => {
                if (item && item.filename) {
                    cleanedSnippets[index] = item;
                    index++;
                }
            });
            if (Object.keys(cleanedSnippets).length > 0) {
                snippets = cleanedSnippets;
            }
        } else {
            await fetch(`${FIREBASE_DB_URL}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(snippets)
            });
        }
    } catch (err) {
        console.error("Firebase fetch error, using fallback:", err);
    }
    
    renderSidebar();
    const firstKey = Object.keys(snippets)[0];
    if (firstKey) {
        loadSnippet(firstKey);
    }
}

function renderSidebar() {
    const container = document.getElementById('file-tree-container');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(snippets).forEach(id => {
        const item = snippets[id];
        const div = document.createElement('div');
        div.className = `file-item ${parseInt(id) === parseInt(currentActiveId) ? 'active' : ''}`;
        div.onclick = () => loadSnippet(id);
        div.innerHTML = `<span>📄</span> ${item.filename}`;
        container.appendChild(div);
    });
}

function loadSnippet(id) {
    currentActiveId = parseInt(id);
    const data = snippets[id];
    if (!data) return;
    
    renderSidebar();

    document.getElementById('tab-name').innerText = data.filename || '';
    document.getElementById('code-content').textContent = data.code || '';
    document.getElementById('snippet-title').innerText = data.title || '';
    document.getElementById('snippet-price').innerText = data.price || '₹0';
    document.getElementById('interactive-preview').innerHTML = data.preview || '';

    // जैसे ही स्निपेट लोड हो, पेमेंट लिंक्स को प्राइस के हिसाब से अपडेट कर दें
    updatePaymentLinks(data.price);
}

// 🚀 डायरेक्ट UPI टेलीपोर्टेशन लिंक्स सेट करने वाला फंक्शन
function updatePaymentLinks(priceStr) {
    const numericPrice = (priceStr || '0').replace(/[^0-9]/g, '');
    const merchantName = "CodeSpace";
    const note = "CodeSpace Snippet Purchase";

    // विभिन्न UPI Intents
    const universalUpiLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const gpayLink = `tez://upi/pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const phonepeLink = `phonepe://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const paytmLink = `paytmmp://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;

    // मॉडल के अंदर के एंकर (HREF) लिंक्स को अपडेट करना
    document.getElementById('pay-universal').href = universalUpiLink;
    document.getElementById('pay-gpay').href = gpayLink;
    document.getElementById('pay-phonepe').href = phonepeLink;
    document.getElementById('pay-paytm').href = paytmLink;
}

/* Panel Toggle System */
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle('collapsed');
    
    const leftHandle = panel.querySelector('.left-handle .handle-icon');
    const rightHandle = panel.querySelector('.right-handle .handle-icon');
    
    if (leftHandle) {
        leftHandle.innerText = panel.classList.contains('collapsed') ? '›' : '‹';
    }
    if (rightHandle) {
        rightHandle.innerText = panel.classList.contains('collapsed') ? '‹' : '›';
    }
}

function triggerAdminModal() {
    const enteredPass = prompt("🔑 Enter Admin Key:");
    if (enteredPass === ADMIN_PASSWORD) {
        document.getElementById('adminModal').style.display = 'flex';
    } else if (enteredPass !== null) {
        alert("❌ Incorrect Password");
    }
}

function closeAdminModal() { document.getElementById('adminModal').style.display = 'none'; }
function openPaymentModal() { document.getElementById('payModal').style.display = 'flex'; }
function closePaymentModal() { document.getElementById('payModal').style.display = 'none'; }

async function handleNewSnippetUpload(event) {
    event.preventDefault();
    
    const keys = Object.keys(snippets).map(Number);
    const nextId = keys.length > 0 ? Math.max(...keys) + 1 : 1;
    
    const newSnippet = {
        filename: document.getElementById('new-filename').value,
        title: document.getElementById('new-title').value,
        price: document.getElementById('new-price').value,
        code: document.getElementById('new-code').value,
        preview: document.getElementById('new-preview').value
    };

    snippets[nextId] = newSnippet;

    try {
        await fetch(`${FIREBASE_DB_URL}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(snippets)
        });
        alert("✅ Component Published & Synced Live!");
    } catch (err) {
        console.error("Firebase write error:", err);
        alert("⚠️ Saved locally, but cloud sync failed.");
    }

    event.target.reset();
    closeAdminModal();
    loadSnippet(nextId);
}

// ऐप स्टार्ट होते ही सिंकिंग चालू करें
syncFromFirebase();
