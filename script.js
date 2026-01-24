let prayers = {};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// زیادکردنی دەقە بۆ کاتەکان (لۆژیکی چاککراو)
function addMins(timeStr, mins) {
    if(!timeStr) return "--:--";
    let [h, m] = timeStr.split(':').map(Number);
    let d = new Date();
    d.setHours(h, m + mins);
    return d.getHours().toString().padStart(2,'0') + ":" + d.getMinutes().toString().padStart(2,'0');
}

// حیسابکردنی ساڵی کوردی (ڕێبەندان ٢٧٢٥)
function updateKurdishDate() {
    const d = new Date();
    // لۆژیکی سادە بۆ ساڵی کوردی (ساڵی ئێستا + ٧٠٠)
    let kYear = d.getFullYear() + 700; 
    // بۆ کانوونی دووەم (ڕێبەندان)
    document.getElementById('kurdishDate').innerText = `کوردی: ۵ ـی ڕێبەندانی ${kYear}`;
}

async function getPrayerData(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;

        // جێگیرکردنی کاتە زیادکراوەکان
        prayers = {
            "بەیانی": addMins(t.Fajr, 6),
            "ڕۆژهەڵاتن": addMins(t.Fajr, 73),
            "نیوەڕۆ": addMins(t.Dhuhr, 6),
            "عەسر": addMins(t.Asr, 2),
            "ئێوارە": addMins(t.Maghrib, 8),
            "خەوتنان": addMins(t.Isha, 2)
        };

        document.getElementById('hijriDate').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        document.getElementById('miladiDate').innerText = `میلادی: ${d.toLocaleDateString('en-GB')}`;
        updateKurdishDate();
        renderList();
    } catch (e) { console.log("Error Fetching Data"); }
}

function renderList() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        list.innerHTML += `<div class="prayer-row"><span>${name}</span><span style="color:#38bdf8; font-weight:bold;">${time}</span></div>`;
    });
}

function playAdhan(url) {
    const audio = document.getElementById('player');
    audio.pause(); // وەستاندنی دەنگی پێشوو
    audio.src = url;
    audio.play();
}

function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('en-GB', {hour12:false});
    
    if (Object.keys(prayers).length > 0) {
        let minDiff = Infinity, next = "";
        Object.entries(prayers).forEach(([n, t]) => {
            if(n === "ڕۆژهەڵاتن") return;
            const [ph, pm] = t.split(':').map(Number);
            const pDate = new Date(); pDate.setHours(ph, pm, 0);
            let d = pDate - now; if(d < 0) d += 86400000;
            if(d < minDiff) { minDiff = d; next = n; }
        });
        const sec = Math.floor(minDiff / 1000);
        document.getElementById('timeLeft').innerText = `ماوە بۆ ${next}: ${Math.floor(sec/3600)}:${Math.floor((sec%3600)/60)}:${sec%60}`;
    }
}

function changeCity() { getPrayerData(document.getElementById('citySelect').value); }
setInterval(updateClock, 1000);
getPrayerData('Penjwin');
