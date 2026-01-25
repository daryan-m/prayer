const kuNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kuNums[m]);

let prayers = {};
let activePrayers = ["بەیانی", "نیوەڕۆ", "عەسر", "ئێوارە", "خەوتنان"];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function openModal(id) {
    if(document.getElementById('sidebar').classList.contains('active')) toggleSidebar();
    document.getElementById(id).style.display = 'flex';
    if(id === 'dhikrOverlay') showDhikrCategories();
    if(id === 'eventOverlay') renderEvents();
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- لۆژیکی کاتەکان ---
async function fetchTimes(city) {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
    const data = await res.json();
    const t = data.data.timings;
    prayers = { "بەیانی": t.Fajr, "خۆرهەڵاتن": t.Sunrise, "نیوەڕۆ": t.Dhuhr, "عەسر": t.Asr, "ئێوارە": t.Maghrib, "خەوتنان": t.Isha };
    render();
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = Object.entries(prayers).map(([name, time]) => {
        const isActive = activePrayers.includes(name);
        const [h, m] = time.split(':');
        const h12 = h % 12 || 12;
        const sfx = h >= 12 ? "د.ن" : "پ.ن";
        return `
            <div class="prayer-row ${isActive ? '' : 'inactive'}" onclick="toggleActive('${name}')">
                <span><i class="fas fa-volume-${isActive?'up':'mute'}"></i> ${name}</span>
                <div class="p-time"><span>${toKu(h12)}:${toKu(m)}</span> <span style="color:#94a3b8">${sfx}</span></div>
            </div>`;
    }).join('');
}

function toggleActive(name) {
    activePrayers = activePrayers.includes(name) ? activePrayers.filter(p => p !== name) : [...activePrayers, name];
    render();
}

function updateClock() {
    const now = new Date();
    const timeStr = `${toKu(now.getHours()%12||12)} : ${toKu(now.getMinutes().toString().padStart(2,'0'))} : ${toKu(now.getSeconds().toString().padStart(2,'0'))}`;
    document.getElementById('liveClock').innerText = timeStr;
}

// --- تەسبیح و زیکر و تیم ---
let tCount = 0;
function addTasbih() { tCount++; document.getElementById('modalTasbihDisplay').innerText = toKu(tCount); }
function resetTasbih() { tCount = 0; document.getElementById('modalTasbihDisplay').innerText = toKu(0); }

function setFullTheme(mode) {
    const themes = {
        cyan: {color:'#22d3ee', bg:'#020617', card:'#0f172a'},
        green: {color:'#10b981', bg:'#062c1e', card:'#0a3d2e'},
        gold: {color:'#f59e0b', bg:'#2d1a05', card:'#432808'}
    };
    const t = themes[mode];
    document.documentElement.style.setProperty('--cyan', t.color);
    document.documentElement.style.setProperty('--bg', t.bg);
    document.documentElement.style.setProperty('--card', t.card);
}

// لۆژیکی زیکرەکان و بۆنەکان (بەکورتی لێرەدا دایبنێ)
function showDhikrCategories() {
    document.getElementById('dhikrTitle').innerText = "زیکرەکان";
    document.getElementById('dhikrBody').innerHTML = `<div class="menu-item-link" onclick="showZList('بەیانیان')">زیکری بەیانیان</div><div class="menu-item-link" onclick="showZList('ئێواران')">زیکری ئێواران</div>`;
}
function showZList(name) {
    document.getElementById('dhikrTitle').innerText = name;
    document.getElementById('dhikrBackBtn').style.display = "block";
    document.getElementById('dhikrBody').innerHTML = `<div style="padding:10px; background:#1e293b; border-radius:10px">اللهم بك أصبحنا...</div>`;
}

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
