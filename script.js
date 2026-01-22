let prayers = {};
let mutedStatus = JSON.parse(localStorage.getItem('mutedStatus')) || { "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true };

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

function updateDates(hijriData) {
    const now = new Date();
    // لێرەدا بەروارەکەمان ڕاست کردەوە بۆ ۳ی ڕێبەندان
    const kurdiDay = 3; 
    const kurdiMonth = "ڕێبەندان";
    const kurdiYear = 2725;

    document.getElementById('dateHijri').innerText = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
    document.getElementById('dateKurdi').innerText = `کوردی: ${kurdiDay}ی ${kurdiMonth}ی ${kurdiYear}`;
    document.getElementById('dateMiladi').innerText = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;
        prayers = { "بەیانی": fix(t.Fajr, 6), "ڕۆژھەڵات": t.Sunrise, "نیوەڕۆ": fix(t.Dhuhr, 6), "عەسر": fix(t.Asr, 2), "ئێوارە": fix(t.Maghrib, 8), "خەوتنان": fix(t.Isha, 2) };
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
        div.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">${canMute ? `<i class="fas ${mutedStatus[name]?'fa-volume-up':'fa-volume-mute'}" style="color:${mutedStatus[name]?'#38bdf8':'#64748b'}" onclick="toggleMute('${name}')"></i>` : '<i class="fas fa-sun" style="color:#eab308"></i>'}<span>${name}</span></div><div class="time">${time}</div>`;
        list.appendChild(div);
    });
}

function toggleMute(name) { mutedStatus[name] = !mutedStatus[name]; localStorage.setItem('mutedStatus', JSON.stringify(mutedStatus)); render(); }

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    document.getElementById('liveClock').innerText = `${h}:${m}:${s}`;
    document.getElementById('ampm').innerText = ampm;

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let nextName = ""; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [ph, pm] = time.split(':').map(Number);
        let diff = (ph * 3600 + pm * 60) - currentSec;
        if (diff === 0 && mutedStatus[name]) {
            const p = document.getElementById('adhanPlayer');
            p.src = localStorage.getItem('selectedReciterUrl') || 'https://www.islamcan.com/audio/adhan/azan1.mp3';
            p.play();
        }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const timerEl = document.getElementById('timerDisplay');
    if (nextName) {
        const hoursLeft = Math.floor(minDiff / 3600);
        const minsLeft = Math.floor((minDiff % 3600) / 60);
        timerEl.innerText = `بۆ بانگی ${nextName} ${hoursLeft > 0 ? hoursLeft + ':' : ''}${minsLeft} خولەکی ماوە`;
    }
}

setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
