let prayers = {};
// بە زۆر ناچارکردنی بێدەنگی لە یەکەمجاردا
if (!localStorage.getItem('init_v10')) {
    localStorage.setItem('p_mutedStatus', JSON.stringify({ "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false }));
    localStorage.setItem('init_v10', 'true');
}

let mutedStatus = JSON.parse(localStorage.getItem('p_mutedStatus'));

const fixTime = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;
        
        prayers = { 
            "بەیانی": fixTime(t.Fajr, 6), 
            "ڕۆژھەڵات": t.Sunrise, 
            "نیوەڕۆ": fixTime(t.Dhuhr, 6), 
            "عەسر": fixTime(t.Asr, 2), 
            "ئێوارە": fixTime(t.Maghrib, 8), 
            "خەوتنان": fixTime(t.Isha, 2) 
        };

        // نیشاندانی بەروارەکان
        document.getElementById('dateHijri').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        document.getElementById('dateKurdi').innerText = `کوردی: ٣ی ڕێبەندی ٢٧٢٥`;
        document.getElementById('dateMiladi').innerText = `میلادی: ${new Date().toLocaleDateString()}`;
        
        renderList();
    } catch (e) { console.log(e); }
}

function renderList() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const isMuted = mutedStatus[name];
        list.innerHTML += `
            <div class="prayer-row">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${canMute ? (isMuted ? 'fa-volume-up' : 'fa-volume-mute') : 'fa-sun'}" 
                       style="color:${canMute ? (isMuted ? '#38bdf8' : '#64748b') : '#eab308'}; cursor:pointer;"
                       onclick="${canMute ? `toggleMute('${name}')` : ''}"></i>
                    <span>${name}</span>
                </div>
                <div class="time">${time}</div>
            </div>`;
    });
}

function toggleMute(name) {
    mutedStatus[name] = !mutedStatus[name];
    localStorage.setItem('p_mutedStatus', JSON.stringify(mutedStatus));
    renderList();
}

function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(' ')[0];
    document.getElementById('ampm').innerText = now.getHours() >= 12 ? 'PM' : 'AM';

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let next = null; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [h, m] = time.split(':').map(Number);
        let diff = (h * 3600 + m * 60) - currentSec;
        if (diff > 0 && diff < minDiff) { minDiff = diff; next = name; }
        if (diff === 0 && mutedStatus[name]) {
            let audio = document.getElementById('adhanPlayer');
            audio.src = "https://www.islamcan.com/audio/adhan/azan1.mp3";
            audio.play();
        }
    });

    if (next) {
        let mLeft = Math.floor(minDiff / 60);
        document.getElementById('timerDisplay').innerText = `بۆ بانگی ${next} ${mLeft} خولەک ماوە`;
    }
}

setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
