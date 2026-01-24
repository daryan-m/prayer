const kurdishNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kurdishNums[m]);

let prayers = {};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function formatTimeKu(timeStr) {
    let [h, m] = timeStr.split(':').map(Number);
    let suffix = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    return `${toKu(h12)}:${toKu(m.toString().padStart(2,'0'))} ${suffix}`;
}

function adjust(time, mins) {
    let [h, m] = time.split(':').map(Number);
    let d = new Date(); d.setHours(h, m + mins);
    return d.getHours().toString().padStart(2,'0') + ":" + d.getMinutes().toString().padStart(2,'0');
}

async function fetchTimes(city) {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
    const data = await res.json();
    const t = data.data.timings;

    prayers = {
        "بەیانی": adjust(t.Fajr, 6),
        "خۆرهەڵاتن": "07:02", // جێگیر وەک داوات کردبوو
        "نیوەڕۆ": adjust(t.Dhuhr, 6),
        "عەسر": adjust(t.Asr, 2),
        "ئێوارە": adjust(t.Maghrib, 8),
        "خەوتنان": adjust(t.Isha, 2)
    };

    // Dates
    document.getElementById('hijriDate').innerText = toKu(`${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`);
    document.getElementById('miladiDate').innerText = toKu(new Date().toLocaleDateString('en-GB'));
    document.getElementById('kurdishDate').innerText = toKu("٥ی ڕێبەندانی ٢٧٢٥");
    
    render();
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        list.innerHTML += `
            <div class="prayer-row">
                <div class="p-left"><i class="fas fa-volume-mute"></i> <span>${name}</span></div>
                <div class="p-time">${formatTimeKu(time)}</div>
            </div>`;
    });
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let suffix = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    document.getElementById('liveClock').innerHTML = `${toKu(h12)}:${toKu(now.getMinutes().toString().padStart(2,'0'))}:${toKu(now.getSeconds().toString().padStart(2,'0'))} <small>${suffix}</small>`;
    
    // Countdown Logic
    if(Object.keys(prayers).length > 0) {
        let minDiff = Infinity, next = "";
        Object.entries(prayers).forEach(([n, t]) => {
            if(n === "خۆرهەڵاتن") return;
            const [ph, pm] = t.split(':').map(Number);
            const pDate = new Date(); pDate.setHours(ph, pm, 0);
            let diff = pDate - now; if(diff < 0) diff += 86400000;
            if(diff < minDiff) { minDiff = diff; next = n; }
        });
        const s = Math.floor(minDiff / 1000);
        document.getElementById('countdown').innerText = toKu(`ماوە بۆ بانگی ${next}: ${Math.floor(s/3600)}:${Math.floor((s%3600)/60)}:${s%60}`);
    }
}

function previewAdhan(url) {
    const a = document.getElementById('adhanAudio');
    a.src = url; a.play();
}

function updateCity() { fetchTimes(document.getElementById('citySelect').value); }

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
