let prayers = {};

// زۆرکردن لە بێدەنگکردن بۆ یەکەمجار
if (!localStorage.getItem('force_mute_v5')) {
    const defaultMuted = { "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false };
    localStorage.setItem('p_mutedStatus', JSON.stringify(defaultMuted));
    localStorage.setItem('force_mute_v5', 'true');
}

let mutedStatus = JSON.parse(localStorage.getItem('p_mutedStatus')) || { "بەیانی": false, "نیوەڕۆ": false, "عەسر": false, "ئێوارە": false, "خەوتنان": false };

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

function updateDates(hijriData) {
    const now = new Date();
    // بەرواری کوردی جێگیر کرا لەسەر ٣ی ڕێبەندان
    const kurdiDay = 3; 
    const kurdiMonth = "ڕێبەندان";
    const kurdiYear = 2725;

    if(document.getElementById('dateHijri')) {
        document.getElementById('dateHijri').innerText = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
        document.getElementById('dateKurdi').innerText = `کوردی: ${kurdiDay}ی ${kurdiMonth}ی ${kurdiYear}`;
        document.getElementById('dateMiladi').innerText = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    }
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;
        prayers = { 
            "بەیانی": fix(t.Fajr, 6), "ڕۆژھەڵات": t.Sunrise, "نیوەڕۆ": fix(t.Dhuhr, 6), 
            "عەسر": fix(t.Asr, 2), "ئێوارە": fix(t.Maghrib, 8), "خەوتنان": fix(t.Isha, 2) 
        };
        updateDates(data.data.date.hijri);
        render();
    } catch (e) { console.error("Error fetching data:", e); }
}

function render() {
    const list = document.getElementById('prayerList');
    if(!list) return;
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const canMute = name !== "ڕۆژھەڵات";
        const div = document.createElement('div');
        div.className = 'prayer-row';
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <i class="fas ${canMute ? (mutedStatus[name] ? 'fa-volume-up' : 'fa-volume-mute') : 'fa-sun'}" 
                   style="color:${canMute ? (mutedStatus[name] ? '#38bdf8' : '#64748b') : '#eab308'}" 
                   ${canMute ? `onclick="toggleMute('${name}')"` : ''}></i>
                <span style="font-size:1.1rem">${name}</span>
            </div>
            <div class="time">${time}</div>
        `;
        list.appendChild(div);
    });
}

function toggleMute(name) { 
    mutedStatus[name] = !mutedStatus[name]; 
    localStorage.setItem('p_mutedStatus', JSON.stringify(mutedStatus)); 
    render(); 
}

function updateClock() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes().toString().padStart(2, '0'), s = now.getSeconds().toString().padStart(2, '0');
    const ampmText = h >= 12 ? 'PM' : 'AM';
    let hDisplay = h % 12 || 12;
    
    if(document.getElementById('liveClock')) {
        document.getElementById('liveClock').innerText = `${hDisplay}:${m}:${s}`;
        document.getElementById('ampm').innerText = ampmText;
    }

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let nextName = "", minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [ph, pm] = time.split(':').map(Number);
        let pSec = ph * 3600 + pm * 60;
        let diff = pSec - currentSec;
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextName = name; }
        
        if (diff === 0 && mutedStatus[name]) {
            const p = document.getElementById('adhanPlayer');
            p.src = localStorage.getItem('selectedReciterUrl') || 'https://www.islamcan.com/audio/adhan/azan1.mp3';
            p.play();
        }
    });

    const timerEl = document.getElementById('timerDisplay');
    if (timerEl && nextName) {
        const hL = Math.floor(minDiff / 3600), mL = Math.floor((minDiff % 3600) / 60);
        timerEl.innerText = `بۆ بانگی ${nextName} ${hL > 0 ? hL + ' کاتژمێر و ' : ''}${mL} خولەک ماوە`;
    }
}

document.getElementById('citySelect').addEventListener('change', (e) => fetchPrayers(e.target.value));
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
