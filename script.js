const kuNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kuNums[m]);

let prayers = {};
let mutedPrayers = JSON.parse(localStorage.getItem('muted')) || [];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// Toggle Mute for each prayer
function toggleMute(name) {
    if (mutedPrayers.includes(name)) {
        mutedPrayers = mutedPrayers.filter(p => p !== name);
    } else {
        mutedPrayers.push(name);
    }
    localStorage.setItem('muted', JSON.stringify(mutedPrayers));
    render();
}

function formatKuTime(timeStr) {
    let [h, m] = timeStr.split(':').map(Number);
    let sfx = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    // LTR for numbers: H : M
    return `<span class="ltr-dir">${toKu(h12)} : ${toKu(m.toString().padStart(2,'0'))}</span> <span style="margin-right:10px">${sfx}</span>`;
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
    prayers = { "بەیانی": adjust(t.Fajr, 6), "خۆرهەڵاتن": "07:02", "نیوەڕۆ": adjust(t.Dhuhr, 6), "عەسر": adjust(t.Asr, 2), "ئێوارە": adjust(t.Maghrib, 8), "خەوتنان": adjust(t.Isha, 2) };
    document.getElementById('hijriDate').innerText = `کۆچی : ${toKu(data.data.date.hijri.day)} ـی ${data.data.date.hijri.month.ar} ـی ${toKu(data.data.date.hijri.year)}`;
    document.getElementById('miladiDate').innerText = `میلادی : ${toKu(new Date().toLocaleDateString('en-GB'))}`;
    document.getElementById('kurdishDate').innerText = toKu("کوردی : ٥ ـی ڕێبەندانی ٢٧٢٥");
    render();
}

function render() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayers).forEach(([name, time]) => {
        const isMuted = mutedPrayers.includes(name);
        list.innerHTML += `
            <div class="prayer-row ${isMuted ? 'muted' : ''}" onclick="toggleMute('${name}')">
                <div class="p-name">
                    <i class="fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} vol-icon"></i>
                    <span>${name}</span>
                </div>
                <div class="p-time">${formatKuTime(time)}</div>
            </div>`;
    });
}

function updateClock() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    let sfx = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    
    // Fixed clock to prevent jumping
    document.getElementById('liveClock').innerHTML = `
        <span class="ltr-dir" style="width:180px; justify-content:center;">
            ${toKu(h12)} : ${toKu(m.toString().padStart(2,'0'))} : ${toKu(s.toString().padStart(2,'0'))}
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
        const sec = Math.floor(minDiff / 1000);
        const hh = Math.floor(sec/3600), mm = Math.floor((sec%3600)/60), ss = sec%60;
        document.getElementById('countdown').innerHTML = `
            ماوە بۆ بانگی ${next} : 
            <span class="time-highlight ltr-dir">
                ${toKu(hh)} : ${toKu(mm.toString().padStart(2,'0'))} : ${toKu(ss.toString().padStart(2,'0'))}
            </span>`;
    }
}

function handlePreview(btn, url) {
    const audio = document.getElementById('adhanAudio');
    if (!audio.paused && audio.src === url) { audio.pause(); btn.classList.replace('fa-stop-circle', 'fa-play-circle'); }
    else { audio.src = url; audio.play(); btn.classList.replace('fa-play-circle', 'fa-stop-circle'); }
}

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
