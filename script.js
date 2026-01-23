let prayers = {};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function showAbout() {
    alert("ئەپی کاتەکانی بانگ\nگەشەپێدەر: داریان\nوەشان: 1.3.0");
}

function previewAdhan() {
    const audio = document.getElementById('player');
    audio.src = "https://www.islamcan.com/audio/adhan/azan1.mp3";
    audio.play().catch(e => alert("ئینتەرنێت پێویستە بۆ دەنگەکە"));
}

async function getPrayerData(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const data = await res.json();
        const t = data.data.timings;
        
        // ڕێکخستنی مێژووەکان
        document.getElementById('hijriDate').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        
        const d = new Date();
        document.getElementById('miladiDate').innerText = `میلادی: ${d.toLocaleDateString('en-GB')}`;
        
        const kurdishOption = { day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('kurdishDate').innerText = `کوردی: ${d.toLocaleDateString('ku-IQ', kurdishOption)}`;

        // تەنها ٥ کاتە سەرەکییەکە هەڵدەبژێرین
        prayers = { 
            "بەیانی": t.Fajr, 
            "نیوەڕۆ": t.Dhuhr, 
            "عەسر": t.Asr, 
            "مەغریب": t.Maghrib, 
            "عیشا": t.Isha 
        };
        renderList();
    } catch (e) {
        console.log("هەڵە لە وەرگرتنی زانیارییەکان");
    }
}

function renderList() {
    const list = document.getElementById('prayerList');
    if(!list) return;
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        list.innerHTML += `<div class="prayer-row"><span>${name}</span><span style="color:#38bdf8; font-weight:bold; font-family:monospace;">${time}</span></div>`;
    });
}

function calculateCountdown() {
    if (Object.keys(prayers).length === 0) return;
    const now = new Date();
    let minDiff = Infinity;
    let nextName = "";

    Object.entries(prayers).forEach(([name, time]) => {
        const [h, m] = time.split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0);
        let diff = pDate - now;
        if (diff < 0) diff += 24 * 60 * 60 * 1000;
        if (diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const sTotal = Math.floor(minDiff / 1000);
    const h = Math.floor(sTotal / 3600);
    const m = Math.floor((sTotal % 3600) / 60);
    const s = sTotal % 60;
    document.getElementById('timeLeft').innerText = `ماوە بۆ بانگی ${nextName}: ${h}:${m}:${s}`;
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('ampm').innerText = h >= 12 ? 'PM' : 'AM';
    document.getElementById('liveClock').innerText = `${h % 12 || 12}:${m}:${s}`;
    calculateCountdown();
}

function changeCity() {
    getPrayerData(document.getElementById('citySelect').value);
}

setInterval(updateClock, 1000);
getPrayerData('Penjwin');
