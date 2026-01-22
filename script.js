let prayers = {};
// بارکردنی دۆخی دەنگ لە بیرگەی مۆبایلەکە
let mutedStatus = JSON.parse(localStorage.getItem('mutedStatus')) || { 
    "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true 
};

const adhanPlayer = document.getElementById('adhanPlayer');

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

function updateDates(hijriData) {
    const now = new Date();
    // جێگیرکردنی ۲ی ڕێبەندان بەپێی داواکاری تۆ
    document.getElementById('dateKurdi').innerText = `۲ی ڕێبەندانی ۲۷۲٥ی کوردی`;
    document.getElementById('dateMiladi').innerText = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    document.getElementById('dateHijri').innerText = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;

        // +1 دەقە بۆ عەسر، ئێوارە، و خەوتنان
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
    localStorage.setItem('mutedStatus', JSON.stringify(mutedStatus)); // سەیڤکردنی دۆخی دەنگ
    render();
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

        if (diff === 0 && !mutedStatus[name]) {
            adhanPlayer.src = document.getElementById('selectedReciter').value;
            adhanPlayer.play();
        }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
    });

    // کاتی ماوە بۆ بانگی داهاتوو
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
