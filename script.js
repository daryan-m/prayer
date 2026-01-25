const kuNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kuNums[m]);

let prayers = {};
let activePrayers = ["بەیانی", "نیوەڕۆ", "عەسر", "ئێوارە", "خەوتنان"];
let tCount = 0;

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function openModal(id) {
    if(document.getElementById('sidebar').classList.contains('active')) toggleSidebar();
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- Prayer Times ---
async function fetchTimes(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;
        prayers = { "بەیانی": t.Fajr, "خۆرهەڵاتن": t.Sunrise, "نیوەڕۆ": t.Dhuhr, "عەسر": t.Asr, "ئێوارە": t.Maghrib, "خەوتنان": t.Isha };
        
        const hijri = data.data.date.hijri;
        document.getElementById('hijriDate').innerText = `کۆچی: ${toKu(hijri.day)}ی ${hijri.month.ar} ${toKu(hijri.year)}`;
        
        const now = new Date();
        document.getElementById('miladiDate').innerText = `میلادی: ${toKu(now.getDate())} / ${toKu(now.getMonth()+1)} / ${toKu(now.getFullYear())}`;
        
        render();
        updateCountdown();
    } catch (e) { console.error("Error fetching times"); }
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = Object.entries(prayers).map(([name, time]) => {
        const isActive = activePrayers.includes(name);
        let [h, m] = time.split(':');
        const ampm = h >= 12 ? "د.ن" : "پ.ن";
        h = h % 12 || 12;
        return `
            <div class="prayer-row ${isActive ? '' : 'inactive'}" onclick="toggleActive('${name}')">
                <span><i class="fas fa-volume-${isActive?'up':'mute'}"></i> ${name}</span>
                <div class="p-time"><span>${toKu(h)}:${toKu(m)}</span> <span style="color:var(--cyan)">${ampm}</span></div>
            </div>`;
    }).join('');
}

function toggleActive(name) {
    activePrayers = activePrayers.includes(name) ? activePrayers.filter(p => p !== name) : [...activePrayers, name];
    render();
}

function updateCity() {
    const city = document.getElementById('citySelect').value;
    fetchTimes(city);
}

// --- Live Clock ---
function updateClock() {
    const now = new Date();
    const ampm = now.getHours() >= 12 ? "د.ن" : "پ.ن";
    const h = now.getHours() % 12 || 12;
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('liveClock').innerHTML = `${toKu(h)}:${toKu(m)}:${toKu(s)} <span class="ampm-label">${ampm}</span>`;
    updateCountdown();
}

function updateCountdown() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let next = null;

    for (const [name, time] of Object.entries(prayers)) {
        if (activePrayers.includes(name) && name !== "خۆرهەڵاتن") {
            const [h, m] = time.split(':').map(Number);
            const prayerMins = h * 60 + m;
            if (prayerMins > currentMins) {
                next = { name, mins: prayerMins - currentMins };
                break;
            }
        }
    }

    const box = document.getElementById('countdown');
    if (next) {
        const h = Math.floor(next.mins / 60);
        const m = next.mins % 60;
        box.innerText = `ماوە بۆ ${next.name}: ${h > 0 ? toKu(h) + ' سەعات و ' : ''}${toKu(m)} خولەک`;
    } else {
        box.innerText = "هەموو بانگەکان تەواو بوون";
    }
}

// --- Features ---
function addTasbih() { tCount++; document.getElementById('modalTasbihDisplay').innerText = toKu(tCount); }
function resetTasbih() { tCount = 0; document.getElementById('modalTasbihDisplay').innerText = toKu(0); }

const dhikrData = {
    morning: { title: "بەیانیان", items: ["أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ (١ جار)", "آية الكرسي", "سورة الإخلاص (٣ جار)", "اللهم بك أصبحنا"] },
    evening: { title: "ئێواران", items: ["أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", "أعوذ بكلمات الله التامات (٣ جار)", "اللهم بك أمسينا"] }
};

function openDhikr() { openModal('dhikrOverlay'); showDhikrCategories(); }

function showDhikrCategories() {
    document.getElementById('dhikrTitle').innerText = "زیکرەکان";
    document.getElementById('dhikrBackBtn').style.display = "none";
    document.getElementById('dhikrBody').innerHTML = `
        <div class="menu-item-link" onclick="showZikrList('morning')">زیکرەکانی بەیانیان</div>
        <div class="menu-item-link" onclick="showZikrList('evening')">زیکرەکانی ئێواران</div>
    `;
}

function showZikrList(cat) {
    const data = dhikrData[cat];
    document.getElementById('dhikrTitle').innerText = data.title;
    document.getElementById('dhikrBackBtn').style.display = "block";
    document.getElementById('dhikrBody').innerHTML = data.items.map(z => `<div class="zikr-card">${z}</div>`).join('');
}

function openQibla() {
    openModal('qiblaOverlay');
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if(e.alpha) document.querySelector('.arrow').style.transform = `translateX(-50%) rotate(${e.alpha - 192}deg)`;
        });
    }
}

const events = [
    { name: "ڕەمەزانی پیرۆز", date: "2026-02-18" },
    { name: "جەژنی ڕەمەزان", date: "2026-03-20" },
    { name: "جەژنی قوربان", date: "2026-05-28" }
];

function renderEvents() {
    document.getElementById('eventCalendar').innerHTML = events.map(ev => `
        <div class="event-item"><span>${ev.name}</span><span>${toKu(ev.date)}</span></div>
    `).join('');
}

function setFullTheme(mode) {
    const colors = { cyan: '#22d3ee', green: '#10b981', gold: '#f59e0b' };
    document.documentElement.style.setProperty('--cyan', colors[mode]);
}

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
renderEvents();
