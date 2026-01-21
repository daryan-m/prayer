let prayers = {};
let mutedStatus = { "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true };
const adhanPlayer = document.getElementById('adhanPlayer');

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

function updateDates(hijriData) {
    const now = new Date();
    const kurdishMonths = ["خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمێ"];
    
    // لێرەدا ڕۆژەکە بە وردی حیساب دەکەین (بۆ ئەوەی ببێتە ٣ی ڕێبەندان)
    const kDay = now.getDate(); 
    const kurdiDateStr = `${kDay}ی ${kurdishMonths[now.getMonth()]}ی ٢٧٢٥ی کوردی`;
    document.getElementById('dateKurdi').innerText = kurdiDateStr;

    // میلادی بە شێوازی داواکراو
    const miladiStr = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    document.getElementById('dateMiladi').innerText = miladiStr;

    document.getElementById('dateHijri').innerText = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;

        prayers = {
            "بەیانی": fix(t.Fajr, 6),
            "ڕۆژھەڵات": t.Sunrise,
            "نیوەڕۆ": fix(t.Dhuhr, 6),
            "عەسر": fix(t.Asr, 1), 
            "ئێوارە": fix(t.Maghrib, 7),
            "خەوتنان": fix(t.Isha, 1)
        };

        updateDates(data.data.date.hijri);
        render();
    } catch (e) { console.error(e); }
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const div = document.createElement('div');
        div.className = 'prayer-row';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                ${canMute ? `<i class="fas ${mutedStatus[name] ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon ${mutedStatus[name] ? '' : 'on'}" onclick="toggleMute('${name}')"></i>` : '<i class="fas fa-sun" style="color:#eab308"></i>'}
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

// چاککردنی کۆتایی بۆ دەنگەکە (لێدان و وەستان)
function testAdhan() {
    const reciter = document.getElementById('reciterSelect').value;
    const btn = document.querySelector('.test-btn');
    
    // ئەگەر دەنگەکە خەریکی لێدانە، بەتەواوی بیوەستێنە
    if (!adhanPlayer.paused) {
        adhanPlayer.pause();
        adhanPlayer.currentTime = 0; // گەڕانەوە بۆ چرکەی سفر
        btn.innerHTML = 'تاقیکردنەوەی دەنگ <i class="fas fa-play"></i>';
    } else {
        // ئەگەر وەستاوە، لێی بدە
        adhanPlayer.src = reciter;
        adhanPlayer.play().catch(err => alert("تکایە یەک کلیک لە لاپەڕەکە بکە و دواتر تاقی بکەرەوە"));
        btn.innerHTML = 'ڕاگرتنی دەنگ <i class="fas fa-stop"></i>';
    }
}

function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toTimeString().slice(0, 8);
    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    let nextName = ""; let minDiff = Infinity;
    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [h, m] = time.split(':').map(Number);
        let diff = (h * 3600 + m * 60) - currentSec;

        // لێدانی بانگ کاتێک کاتەکە دەبێتە سفر
        if (diff === 0 && !mutedStatus[name]) {
            adhanPlayer.src = document.getElementById('reciterSelect').value;
            adhanPlayer.play();
        }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const timerEl = document.getElementById('timerDisplay');
    if (nextName) {
        const h = Math.floor(minDiff / 3600);
        const m = Math.floor((minDiff % 3600) / 60);
        const s = minDiff % 60;
        timerEl.innerText = `بۆ بانگی ${nextName}: ${h}:${m}:${s}`;
    } else {
        timerEl.innerText = "چاوەڕێی بانگی بەیانی...";
    }
}

document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);
setInterval(updateClock, 1000);
window.onload = () => fetchPrayers('Penjwin');
