const FIREBASE_DB_URL = 'https://sate-5a04f-default-rtdb.asia-southeast1.firebasedatabase.app/snippets';
const ADMIN_PASSWORD = 'admin123';

// 🔒 Secure Merchant UPI ID
const MERCHANT_UPI_ID = "adityashrivastav392@oksbi"; 

// 🔥 Clean state (No hardcoded sample data, strictly fetched from Firebase)
let snippets = {};
let currentActiveId = null;

// Fetch and sync data from Firebase
async function syncFromFirebase() {
    try {
        const response = await fetch(`${FIREBASE_DB_URL}.json`);
        const data = await response.json();
        
        if (data) {
            snippets = data;
        } else {
            snippets = {};
        }
    } catch (err) {
        console.error("Firebase fetch error:", err);
        snippets = {};
    }
    
    renderSidebar();
    const keys = Object.keys(snippets);
    if (keys.length > 0) {
        loadSnippet(keys[0]);
    } else {
        // Empty state if firebase is blank
        document.getElementById('tab-name').innerText = "No files found";
        document.getElementById('code-content').textContent = "// Please upload via admin panel";
        document.getElementById('snippet-title').innerText = "No Component Available";
        document.getElementById('snippet-price').innerText = "₹0";
        document.getElementById('interactive-preview').innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#8b949e; font-family:sans-serif; font-size:0.85rem; text-align:center; padding:20px;">No code snippets published yet.<br>Click v1.0.4-sys to add.</div>';
    }
}

function renderSidebar() {
    const container = document.getElementById('file-tree-container');
    if (!container) return;
    container.innerHTML = '';
    
    const keys = Object.keys(snippets);
    if (keys.length === 0) {
        container.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted); padding:5px;">No repository files</div>';
        return;
    }
    
    keys.forEach(id => {
        const item = snippets[id];
        if (!item) return;
        const div = document.createElement('div');
        div.className = `file-item ${parseInt(id) === parseInt(currentActiveId) ? 'active' : ''}`;
        div.onclick = () => loadSnippet(id);
        div.innerHTML = `<span>📄</span> ${item.filename || 'untitled.html'}`;
        container.appendChild(div);
    });
}

function loadSnippet(id) {
    currentActiveId = id;
    const data = snippets[id];
    if (!data) return;
    
    renderSidebar();

    document.getElementById('tab-name').innerText = data.filename || '';
    document.getElementById('code-content').textContent = data.code || '';
    document.getElementById('snippet-title').innerText = data.title || '';
    document.getElementById('snippet-price').innerText = data.price || '₹0';

    // 🚀 Render Real Code inside Phone Mockup Screen via Iframe
    const previewContainer = document.getElementById('interactive-preview');
    previewContainer.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
    iframe.sandbox = 'allow-scripts allow-forms allow-same-origin';
    iframe.srcdoc = data.code || '';
    
    previewContainer.appendChild(iframe);

    // Update payment links with the correct price and secure UPI ID
    updatePaymentLinks(data.price);
}

// 🚀 Direct UPI Teleportation Link Generator
function updatePaymentLinks(priceStr) {
    const numericPrice = (priceStr || '0').replace(/[^0-9]/g, '');
    const merchantName = "CodeSpace";
    const note = "CodeSpace Snippet Purchase";

    const universalUpiLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const gpayLink = `tez://upi/pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const phonepeLink = `phonepe://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;
    const paytmLink = `paytmmp://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${numericPrice}&cu=INR&tn=${encodeURIComponent(note)}`;

    const payUniversal = document.getElementById('pay-universal');
    const payGpay = document.getElementById('pay-gpay');
    const payPhonepe = document.getElementById('pay-phonepe');
    const payPaytm = document.getElementById('pay-paytm');

    if (payUniversal) payUniversal.href = universalUpiLink;
    if (payGpay) payGpay.href = gpayLink;
    if (payPhonepe) payPhonepe.href = phonepeLink;
    if (payPaytm) payPaytm.href = paytmLink;
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
        code: document.getElementById('new-code').value
    };

    snippets[nextId] = newSnippet;

    try {
        await fetch(`${FIREBASE_DB_URL}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(snippets)
        });
        alert("✅ Real Code Published & Synced to Firebase!");
    } catch (err) {
        console.error("Firebase write error:", err);
        alert("⚠️ Saved locally, but cloud sync failed.");
    }

    event.target.reset();
    closeAdminModal();
    loadSnippet(nextId);
}

// Initialize application sync on startup
syncFromFirebase();
