let prayers = {};

if (!localStorage.getItem('app_v12_final')) {
    localStorage.setItem('p_mutedStatus', JSON.stringify({ 
        "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false 
    }));
    localStorage.setItem('app_v12_final', 'true');
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

        document.getElementById('dateHijri').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        document.getElementById('dateMiladi').innerText = `میلادی: ${new Date().toLocaleDateString()}`;
        
        renderList();
    } catch (e) { console.error("Error:", e); }
}

function renderList() {
    const list = document.getElementById('prayerList');
    if (!list) return;
    
    let htmlContent = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const isMuted = mutedStatus[name];
        
        htmlContent += `
            <div class="prayer-row">
                <div style="display:flex; align-items:center; gap:12px;">
                    <i class="fas ${canMute ? (isMuted ? 'fa-volume-up' : 'fa-volume-mute') : 'fa-sun'}" 
                       style="color:${canMute ? (isMuted ? '#38bdf8' : '#64748b') : '#eab308'}; cursor:pointer; font-size:1.2rem;"
                       onclick="handleToggle('${name}')"></i>
                    <span style="font-size:1.1rem;">${name}</span>
                </div>
                <div class="time">${time}</div>
            </div>`;
    });
    list.innerHTML = htmlContent;
}

window.handleToggle = function(name) {
    mutedStatus[name] = !mutedStatus[name];
    localStorage.setItem('p_mutedStatus', JSON.stringify(mutedStatus));
    renderList();
};

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes().toString().padStart(2, '0');
    let s = now.getSeconds().toString().padStart(2, '0');
    let ampm = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12 || 12;
    
    if(document.getElementById('liveClock')){
        document.getElementById('liveClock').innerText = `${h12}:${m}:${s}`;
        document.getElementById('ampm').innerText = ampm;
    }

    const currentSec = h * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let next = null; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [ph, pm] = time.split(':').map(Number);
        let pSec = ph * 3600 + pm * 60;
        let diff = pSec - currentSec;
        
        if (diff <= 0) diff += 24 * 3600;

        if (diff < minDiff) { minDiff = diff; next = name; }
        
        if (diff === 24 * 3600 && mutedStatus[name]) {
            const audio = document.getElementById('adhanPlayer');
            audio.src = localStorage.getItem('selectedReciterUrl') || "https://www.islamcan.com/audio/adhan/azan1.mp3";
            audio.play().catch(e => console.log("Play error:", e));
        }
    });

    if (next && document.getElementById('timerDisplay')) {
        let hoursLeft = Math.floor(minDiff / 3600);
        let minsLeft = Math.floor((minDiff % 3600) / 60);
        
        let timerText = "";
        if(hoursLeft > 0) {
            timerText += hoursLeft + " کاتژمێر و ";
        }
        timerText += minsLeft + " خولەک ماوە بۆ بانگی " + next;
        
        document.getElementById('timerDisplay').innerText = timerText;
    }
}

document.getElementById('citySelect').addEventListener('change', (e) => fetchPrayers(e.target.value));
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
