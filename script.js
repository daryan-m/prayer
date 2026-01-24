const kuNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kuNums[m]);

let prayers = {};
let activePrayers = JSON.parse(localStorage.getItem('activePrayers')) || ["بەیانی", "نیوەڕۆ", "عەسر", "ئێوارە", "خەوتنان"];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// چاککردنی سیستەمی ئەکتیڤکردنی بانگەکان
function toggleActive(name) {
    if (activePrayers.includes(name)) {
        activePrayers = activePrayers.filter(p => p !== name);
    } else {
        activePrayers.push(name);
    }
    localStorage.setItem('activePrayers', JSON.stringify(activePrayers));
    render();
}

function handleAdhan(btn, url) {
    const audio = document.getElementById('adhanAudio');
    if (!audio.paused && audio.src === url) {
        audio.pause();
        btn.classList.replace('fa-stop-circle', 'fa-play-circle');
    } else {
        document.querySelectorAll('.play-btn').forEach(b => b.classList.replace('fa-stop-circle', 'fa-play-circle'));
        audio.src = url;
        audio.play();
        btn.classList.replace('fa-play-circle', 'fa-stop-circle');
    }
}

// ڕێکخستنی کاتژمێرەکان بۆ ئەوەی لە چەپەوە دەست پێ بکەن و نەجوڵێن
function formatKu(timeStr) {
    let [h, m] = timeStr.split(':').map(Number);
    let sfx = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    return `<span style="direction: ltr; display: inline-block;">${toKu(h12)} : ${toKu(m.toString().padStart(2,'0'))}</span> &nbsp;&nbsp; ${sfx}`;
}

async function fetchTimes(city) {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
    const data = await res.json();
    const t = data.data.timings;

    const adjust = (tm, mins) => {
        let [h, m] = tm.split(':').map(Number);
        let d = new Date(); d.setHours(h, m + mins);
        return d.getHours().toString().padStart(2,'0') + ":" + d.getMinutes().toString().padStart(2,'0');
    };

    prayers = {
        "بەیانی": adjust(t.Fajr, 6),
        "خۆرهەڵاتن": "07:02",
        "نیوەڕۆ": adjust(t.Dhuhr, 6),
        "عەسر": adjust(t.Asr, 2),
        "ئێوارە": adjust(t.Maghrib, 8),
        "خەوتنان": adjust(t.Isha, 2)
    };

    document.getElementById('hijriDate').innerText = `کۆچی : ${toKu(data.data.date.hijri.day)} ـی ${data.data.date.hijri.month.ar} ـی ${toKu(data.data.date.hijri.year)}`;
    document.getElementById('miladiDate').innerText = `میلادی : ${toKu(new Date().toLocaleDateString('en-GB'))}`;
    document.getElementById('kurdishDate').innerText = `کوردی : ${toKu("٥ ـی ڕێبەندانی ٢٧٢٥")}`;
    
    render();
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const isActive = activePrayers.includes(name);
        list.innerHTML += `
            <div class="prayer-row ${isActive ? '' : 'inactive'}" onclick="toggleActive('${name}')" style="cursor:pointer; opacity: ${isActive ? '1' : '0.5'}">
                <div class="p-name">
                    <i class="fas ${isActive ? 'fa-volume-up' : 'fa-volume-mute'}" style="color: ${isActive ? '#10b981' : '#64748b'}"></i>
                    &nbsp;&nbsp;<span>${name}</span>
                </div>
                <div class="p-time">${formatKu(time)}</div>
            </div>`;
    });
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let sfx = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    
    // کاتژمێر لە چەپەوە و جێگیر
    document.getElementById('liveClock').innerHTML = `
        <span style="direction: ltr; display: inline-block; min-width: 200px; text-align: center;">
            ${toKu(h12)} : ${toKu(now.getMinutes().toString().padStart(2,'0'))} : ${toKu(now.getSeconds().toString().padStart(2,'0'))}
        </span> 
        <span class="suffix">${sfx}</span>`;
    
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
        const hours = toKu(Math.floor(s/3600));
        const minutes = toKu(Math.floor((s%3600)/60));
        const seconds = toKu(s%60);
        
        // کاتی ماوە بە ڕەنگی سپی و کاتەکە گەورەتر و ڕەنگی جیاواز
        document.getElementById('countdown').innerHTML = `
            ماوە بۆ بانگی ${next} : 
            <span style="color: #22d3ee; font-size: 1.4rem; direction: ltr; display: inline-block;">
                ${hours} : ${minutes} : ${seconds}
            </span>`;
    }
}

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
