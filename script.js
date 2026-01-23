let prayers = {};
let mutedStatus = JSON.parse(localStorage.getItem('p_mutedStatus')) || { "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false };
let deferredPrompt;

// Sidebar Functions
window.toggleMenu = () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
};

window.showSubMenu = (id) => {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.setReciter = (r) => {
    localStorage.setItem('selectedReciterUrl', `https://www.islamcan.com/audio/adhan/${r.value}`);
};

window.showAbout = () => {
    alert("ئەپی کاتەکانی بانگ\nگەشەپێدەر: داریان\nوەشان: 1.0.0");
};

// Install Logic
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installBtnRow');
    if (btn) btn.style.display = 'flex';
});

window.installPWA = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        document.getElementById('installBtnRow').style.display = 'none';
    }
};

// Data Fetching
async function fetchPrayers(city) {
    const cached = localStorage.getItem(`prayers_${city}`);
    if (cached) useData(JSON.parse(cached));

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        localStorage.setItem(`prayers_${city}`, JSON.stringify(data.data));
        useData(data.data);
    } catch (e) { console.log("Offline Mode"); }
}

function useData(data) {
    const t = data.timings;
    const fix = (time, min) => {
        let [h, m] = time.split(':').map(Number);
        let d = new Date(); d.setHours(h); d.setMinutes(m + min);
        return d.toTimeString().slice(0, 5);
    };
    prayers = { "بەیانی": fix(t.Fajr, 6), "ڕۆژھەڵات": t.Sunrise, "نیوەڕۆ": fix(t.Dhuhr, 6), "عەسر": fix(t.Asr, 2), "ئێوارە": fix(t.Maghrib, 8), "خەوتنان": fix(t.Isha, 2) };
    document.getElementById('dateHijri').innerText = `کۆچی: ${data.date.hijri.day} ${data.date.date.hijri?.month.ar || data.date.hijri.month.ar} ${data.date.hijri.year}`;
    document.getElementById('dateMiladi').innerText = `میلادی: ${new Date().toLocaleDateString('ku-IQ')}`;
    renderList();
}

function renderList() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const isMuted = mutedStatus[name];
        list.innerHTML += `<div class="prayer-row">
            <div style="display:flex; align-items:center; gap:12px;">
                <i class="fas ${canMute ? (isMuted ? 'fa-volume-up' : 'fa-volume-mute') : 'fa-sun'}" 
                   style="color:${canMute ? (isMuted ? '#38bdf8' : '#64748b') : '#eab308'}; cursor:pointer;"
                   onclick="handleToggle('${name}')"></i>
                <span class="prayer-name">${name}</span>
            </div>
            <div class="time">${time}</div>
        </div>`;
    });
}

window.handleToggle = (name) => {
    mutedStatus[name] = !mutedStatus[name];
    localStorage.setItem('p_mutedStatus', JSON.stringify(mutedStatus));
    renderList();
};

function updateClock() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    document.getElementById('liveClock').innerText = `${h % 12 || 12}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    document.getElementById('ampm').innerText = h >= 12 ? 'PM' : 'AM';

    const currentSec = h * 3600 + m * 60 + s;
    let next = null, minDiff = Infinity;
    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [ph, pm] = time.split(':').map(Number);
        let diff = (ph * 3600 + pm * 60) - currentSec;
        if (diff <= 0) diff += 24 * 3600;
        if (diff < minDiff) { minDiff = diff; next = name; }
        if (diff === 24 * 3600 && mutedStatus[name]) {
            const audio = document.getElementById('adhanPlayer');
            audio.src = localStorage.getItem('selectedReciterUrl') || "https://www.islamcan.com/audio/adhan/azan1.mp3";
            audio.play();
        }
    });
    if (next) {
        let hL = Math.floor(minDiff / 3600), mL = Math.floor((minDiff % 3600) / 60);
        document.getElementById('timerDisplay').innerText = `${hL > 0 ? hL + " کاتژمێر و " : ""}${mL} خولەک ماوە بۆ بانگی ${next}`;
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
        reg.onupdatefound = () => {
            const worker = reg.installing;
            worker.onstatechange = () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) document.getElementById('update-toast').classList.add('show');
            };
        };
    });
}

document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
