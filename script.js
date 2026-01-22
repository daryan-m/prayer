let prayers = {};
let mutedStatus = JSON.parse(localStorage.getItem('mutedStatus')) || { 
    "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true 
};

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

function updateDates(hijriData) {
    const now = new Date();
    document.getElementById('dateHijri').innerText = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
    document.getElementById('dateKurdi').innerText = `۲ی ڕێبەندان`;
    document.getElementById('dateMiladi').innerText = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
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
            "عەسر": fix(t.Asr, 2), 
            "ئێوارە": fix(t.Maghrib, 8),
            "خەوتنان": fix(t.Isha, 2)
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
                ${canMute ? `<i class="fas ${mutedStatus[name] ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon" style="color:${mutedStatus[name] ? '#64748b' : '#38bdf8'}" onclick="toggleMute('${name}')"></i>` : '<i class="fas fa-sun" style="color:#eab308"></i>'}
                <span>${name}</span>
            </div>
            <div class="time">${time}</div>
        `;
        list.appendChild(div);
    });
}

function toggleMute(name) {
    mutedStatus[name] = !mutedStatus[name];
    localStorage.setItem('mutedStatus', JSON.stringify(mutedStatus));
    render();
}

function updateClock() {
    const now = new Date();
    
    // کاتژمێری ١٢ کاتژمێری
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // ئەگەر 0 بوو بیکە بە 12
    document.getElementById('liveClock').innerText = `${hours}:${minutes}:${seconds} ${ampm}`;

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let nextName = ""; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [h, m] = time.split(':').map(Number);
        let pSec = h * 3600 + m * 60;
        let diff = pSec - currentSec;

        if (diff === 0 && !mutedStatus[name]) {
            const player = document.getElementById('adhanPlayer');
            player.src = localStorage.getItem('selectedReciterUrl') || 'https://www.islamcan.com/audio/adhan/azan1.mp3';
            player.play();
        }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const timerEl = document.getElementById('timerDisplay');
    if (nextName) {
        const h = Math.floor(minDiff / 3600);
        const m = Math.floor((minDiff % 3600) / 60);
        
        let timeStr = "";
        if (h > 0) {
            timeStr = `${h}:${m.toString().padStart(2, '0')} کاتژمێری ماوە`;
        } else {
            timeStr = `${m} خولەکی ماوە`;
        }
        timerEl.innerText = `بۆ بانگی ${nextName} ${timeStr}`;
    } else {
        timerEl.innerText = "چاوەڕێی بانگی بەیانی...";
    }
}

document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
