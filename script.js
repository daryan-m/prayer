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
    document.getElementById('dateMiladi').innerText = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
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
                ${canMute ? `<i class="fas ${mutedStatus[name] ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon ${mutedStatus[name] ? '' : 'on'}" style="color:${mutedStatus[name] ? '#64748b' : '#38bdf8'}" onclick="toggleMute('${name}')"></i>` : '<i class="fas fa-sun" style="color:#eab308"></i>'}
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
    const hStr = now.getHours().toString().padStart(2, '0');
    const mStr = now.getMinutes().toString().padStart(2, '0');
    const sStr = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('liveClock').innerText = `${hStr}:${mStr}:${sStr}`;

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let nextName = ""; let minDiff = Infinity;

    // دۆزینەوەی بانگی داهاتوو
    const prayerEntries = Object.entries(prayers).filter(([n]) => n !== "ڕۆژھەڵات");
    
    prayerEntries.forEach(([name, time]) => {
        let [h, m] = time.split(':').map(Number);
        let pSec = h * 3600 + m * 60;
        let diff = pSec - currentSec;

        if (diff === 0) {
            const player = document.getElementById('adhanPlayer');
            if (!mutedStatus[name]) {
                player.src = localStorage.getItem('selectedReciterUrl');
                player.play();
            }
        }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const timerEl = document.getElementById('timerDisplay');
    if (nextName) {
        const h = Math.floor(minDiff / 3600);
        const m = Math.floor((minDiff % 3600) / 60);
        const s = minDiff % 60;
        timerEl.innerText = `بۆ بانگی ${nextName}: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    } else {
        timerEl.innerText = "چاوەڕێی بانگی بەیانی...";
    }
}

document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
