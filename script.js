let prayers = {};
let mutedStatus = { "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true };
const adhanPlayer = document.getElementById('adhanPlayer');

// فەنکشنی ڕێکخستنی کات
const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

// بەرواری کوردی
function getKurdiDate() {
    const now = new Date();
    const kurdishMonths = ["خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمێ"];
    return `${now.getDate()}ی ${kurdishMonths[now.getMonth()]}ی ${now.getFullYear() + 700} کوردی`;
}

async function fetchPrayers(city) {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
    const data = await res.json();
    const t = data.data.timings;

    prayers = {
        "بەیانی": fix(t.Fajr, 6),
        "ڕۆژھەڵات": t.Sunrise,
        "نیوەڕۆ": fix(t.Dhuhr, 6),
        "عەسر": fix(t.Asr, 2),
        "ئێوارە": fix(t.Maghrib, 8),
        "خەوتنان": fix(t.Isha, 2)
    };

    document.getElementById('dateHijri').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
    document.getElementById('dateMiladi').innerText = "میلادی: " + new Date().toLocaleDateString('ku-IQ');
    document.getElementById('dateKurdi').innerText = getKurdiDate();
    render();
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const isMuteSupported = name !== "ڕۆژھەڵات";
        const div = document.createElement('div');
        div.className = 'prayer-row';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                ${isMuteSupported ? `<i class="fas ${mutedStatus[name] ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon ${mutedStatus[name] ? '' : 'on'}" onclick="toggleMute('${name}')"></i>` : '<i class="fas fa-sun" style="color:#eab308"></i>'}
                <span>${name}</span>
            </div>
            <div class="time">${time}</div>
        `;
        list.appendChild(div);
    });
}

function toggleMute(name) {
    mutedStatus[name] = !mutedStatus[name];
    render();
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    document.getElementById('liveClock').innerText = timeStr;

    // کاونتداون و پشکنینی کاتی بانگ
    let nextName = ""; let nextDiff = Infinity;
    const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [h, m] = time.split(':').map(Number);
        let prayerTotalSec = h * 3600 + m * 60;
        
        let diff = prayerTotalSec - currentTotalSec;
        
        // ئەگەر کاتی بانگ هات و سامت نەبوو
        if (diff === 0 && !mutedStatus[name]) {
            playAdhan();
        }

        if (diff > 0 && diff < nextDiff) {
            nextDiff = diff;
            nextName = name;
        }
    });

    if (nextName) {
        const h = Math.floor(nextDiff / 3600);
        const m = Math.floor((nextDiff % 3600) / 60);
        const s = nextDiff % 60;
        document.getElementById('timerDisplay').innerText = `بۆ بانگی ${nextName}: ${h}:${m}:${s}`;
    } else {
        document.getElementById('timerDisplay').innerText = "چاوەڕێی بانگی بەیانی...";
    }
}

function playAdhan() {
    const reciter = document.getElementById('reciterSelect').value;
    adhanPlayer.src = reciter;
    adhanPlayer.play();
}

document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);
setInterval(updateClock, 1000);
window.onload = () => fetchPrayers('Penjwin');
