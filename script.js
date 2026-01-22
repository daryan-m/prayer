let prayers = {};
// بارکردنی دۆخی دەنگی بانگەکان (بێدەنگ یان نا)
let mutedStatus = JSON.parse(localStorage.getItem('mutedStatus')) || { 
    "بەیانی": true, "نیوەڕۆ": true, "عەسر": true, "ئێوارە": true, "خەوتنان": true 
};

const adhanPlayer = document.getElementById('adhanPlayer');

// فەنکشن بۆ ڕێکخستنی کاتەکان (زیادکردنی خولەک)
const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.toTimeString().slice(0, 5);
};

// فەنکشنی ئەژمارکردنی بەرواری کوردی و میلادی و کۆچی
function updateDates(hijriData) {
    const now = new Date();
    
    // میلادی
    const miladiStr = `میلادی: ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    
    // کۆچی
    const hijriStr = `کۆچی: ${hijriData.day} ${hijriData.month.ar} ${hijriData.year}`;
    
    // ئەژمارکردنی بەرواری کوردی (بۆ ساڵی ۲۷۲٥)
    const kMonths = ["خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمێ"];
    
    // هاوکێشەیەکی سادە بۆ گۆڕینی میلادی بۆ کوردی (نێزیکەیی)
    let kYear = now.getFullYear() + 700;
    let kMonth = "";
    let kDay = now.getDate();
    
    // لێرەدا ڕێبەندان جێگیر دەکەین بۆ نموونە یان بەپێی مانگی ئێستا
    // بۆ ئەوەی بە تەواوی ڕێبەندانی ئێستا بێت:
    const month = now.getMonth(); // 0=Jan, 1=Feb...
    if (month === 0) kMonth = kMonths[10]; // January -> ڕێبەندان
    else if (month === 1) kMonth = kMonths[11]; // February -> ڕەشەمێ
    else kMonth = kMonths[month]; // ئەوانی تر بەپێی ڕیزبەندی

    const kurdiStr = `کوردی: ${kDay}ی ${kMonth}ی ${kYear}`;

    document.getElementById('dateHijri').innerText = hijriStr;
    document.getElementById('dateKurdi').innerText = kurdiStr;
    document.getElementById('dateMiladi').innerText = miladiStr;
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;

        // کاتەکان بە دەستکارییەوە
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
    } catch (e) {
        console.error("هەڵە لە وەرگرتنی داتا:", e);
    }
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
                ${canMute ? `<i class="fas ${mutedStatus[name] ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon" 
                style="color:${mutedStatus[name] ? '#64748b' : '#38bdf8'}" onclick="toggleMute('${name}')"></i>` : 
                '<i class="fas fa-sun" style="color:#eab308"></i>'}
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
    
    // کاتژمێری ١٢ سەعاتی
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    document.getElementById('liveClock').innerText = `${hours}:${minutes}:${seconds} ${ampm}`;

    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let nextName = ""; let minDiff = Infinity;

    Object.entries(prayers).forEach(([name, time]) => {
        if (name === "ڕۆژھەڵات") return;
        let [h, m] = time.split(':').map(Number);
        let pSec = h * 3600 + m * 60;
        let diff = pSec - currentSec;

        // کاتی لێدانی بانگ
        if (diff === 0 && !mutedStatus[name]) {
            const player = document.getElementById('adhanPlayer');
            player.src = localStorage.getItem('selectedReciterUrl') || 'https://www.islamcan.com/audio/adhan/azan1.mp3';
            player.play();
        }

        if (diff > 0 && diff < minDiff) { 
            minDiff = diff; 
            nextName = name; 
        }
    });

    // نووسینی کاتی ماوە بەو شێوازەی داوات کردبوو
    const timerEl = document.getElementById('timerDisplay');
    if (nextName) {
        const h = Math.floor(minDiff / 3600);
        const m = Math.floor((minDiff % 3600) / 60);
        
        let text = "";
        if (h > 0) {
            text = `بۆ بانگی ${nextName} ${h}:${m.toString().padStart(2, '0')} کاتژمێر ماوە`;
        } else {
            text = `بۆ بانگی ${nextName} ${m} خولەکی ماوە`;
        }
        timerEl.innerText = text;
    } else {
        timerEl.innerText = "چاوەڕێی بانگی بەیانی...";
    }
}

// گۆڕینی شار
document.getElementById('citySelect').onchange = (e) => fetchPrayers(e.target.value);

// دەستپێکردنی کاتژمێر و وەرگرتنی داتا
setInterval(updateClock, 1000);
fetchPrayers('Penjwin');
