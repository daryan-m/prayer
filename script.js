let prayers = {};

// Resetکردنی زانیارییە کۆنەکان بۆ ئەوەی بێدەنگ بن
if (!localStorage.getItem('app_v11_fix')) {
    localStorage.setItem('p_mutedStatus', JSON.stringify({ 
        "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false 
    }));
    localStorage.setItem('app_v11_fix', 'true');
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
    } catch (e) { console.error("Error fetching data:", e); }
}

function renderList() {
    const list = document.getElementById('prayerList');
    if (!list) return;
    
    let htmlContent = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const isMuted = mutedStatus[name]; // ئەگەر false بێت واتە بێدەنگە
        
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

// ناوی فەنکشنەکە گۆڕدرا بۆ ئەوەی کێشەی تێ نەکەوێت
window.handleToggle = function(name) {
    mutedStatus[name] = !mutedStatus[name];
    localStorage.setItem('p_mutedStatus', JSON.stringify(mutedStatus));
    renderList();
};

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [time, ampm] = timeStr.split(' ');
    
    document.getElementById('liveClock').innerText = time;
    document.getElementById('ampm').innerText = ampm;

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let next = null; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [ph, pm] = time.split(':').map(Number);
        let diff = (ph * 3600 + pm * 60) - currentSec;
        if (diff > 0 && diff < minDiff) { minDiff = diff; next = name; }
        
        if (diff === 0 && mutedStatus[name]) {
            const audio = document.getElementById('adhanPlayer');
            audio.src = "https://www.islamcan.com/audio/adhan/azan1.mp3";
            audio.play().catch(e => console.log("Audio play blocked"));
        }
    });

    if (next) {
        let mLeft = Math.floor(minDiff / 60);
        document.getElementById('timerDisplay').innerText = `بۆ بانگی ${next} ${mLeft} خولەک ماوە`;
    }
}

document.getElementById('citySelect').addEventListener('change', (e) => fetchPrayers(e.target.value));
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
