let prayers = {};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// زیادکردنی دەقە بۆ کاتەکان
function addMinutes(timeStr, mins) {
    let [h, m] = timeStr.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m + mins);
    return date.getHours().toString().padStart(2,'0') + ":" + date.getMinutes().toString().padStart(2,'0');
}

// مێژووی کوردی (ڕێبەندان)
function getKurdishDate() {
    const months = ["چوارشەممە", "ڕێبەندان", "ڕەشەمێ", "خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز"];
    // لێرەدا بە نموونە ۵ی ڕێبەندان دانراوە، دەتوانیت لۆژیکی ساڵنامە لێرە دابنێیت
    return "۵ ـی ڕێبەندانی ۲۷۲٥";
}

async function getPrayerData(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;

        // دەستکاری کاتەکان بەپێی داواکاری تۆ
        prayers = {
            "بەیانی": addMinutes(t.Fajr, 6),
            "ڕۆژهەڵاتن": addMinutes(t.Fajr, 73), // ١ سەعات و ١٣ دەقە دوای بەیانی
            "نیوەڕۆ": addMinutes(t.Dhuhr, 6),
            "عەسر": addMinutes(t.Asr, 2),
            "ئێوارە": addMinutes(t.Maghrib, 8),
            "خەوتنان": addMinutes(t.Isha, 2)
        };

        document.getElementById('hijriDate').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        document.getElementById('miladiDate').innerText = `میلادی: ${new Date().toLocaleDateString('en-GB')}`;
        document.getElementById('kurdishDate').innerText = `کوردی: ${getKurdishDate()}`;

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

function previewAdhan() {
    const audio = document.getElementById('player');
    audio.src = document.getElementById('adhanSelect').value;
    audio.play();
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('ampm').innerText = h >= 12 ? 'PM' : 'AM';
    document.getElementById('liveClock').innerText = `${h % 12 || 12}:${m}:${s}`;
    
    // کاتی ماوە (Countdown)
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
