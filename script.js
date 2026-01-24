const kuNums = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
const toKu = (n) => String(n).replace(/[0-9]/g, m => kuNums[m]);

let prayers = {};
// موکەبەرەکان لە سەرەتادا هەموویان ناچالاکن (لیستەکە بەتاڵە)
let activePrayers = []; 

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function toggleActive(name) {
    if (activePrayers.includes(name)) {
        activePrayers = activePrayers.filter(p => p !== name);
    } else {
        activePrayers.push(name);
    }
    render();
}

function formatKu(timeStr) {
    let [h, m] = timeStr.split(':').map(Number);
    let sfx = h >= 12 ? "د.ن" : "پ.ن";
    let h12 = h % 12 || 12;
    // لێرەدا کاتەکەمان خستە پێش پ.ن/د.ن بۆ ئەوەی بکەوێتە لای ڕاست
    let formattedTime = toKu(h12) + " : " + toKu(m.toString().padStart(2,'0'));
    return `<span style="unicode-bidi: bidi-override; direction: ltr;">${formattedTime}</span> <span style="color: #94a3b8; font-size: 0.9rem;">${sfx}</span>`;
}


async function fetchTimes(city) {
    try {
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
    } catch (e) { console.error("Error fetching times"); }
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
    
    // کاتژمێری سەرەکی بە شێوازی h:m:s لە چەپەوە
    let timeStr = toKu(h12) + " : " + toKu(now.getMinutes().toString().padStart(2,'0')) + " : " + toKu(now.getSeconds().toString().padStart(2,'0'));
    document.getElementById('liveClock').innerHTML = `
        <span style="unicode-bidi: bidi-override; direction: ltr; display: inline-block;">${timeStr}</span> 
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
        let h_rem = Math.floor(s/3600);
        let m_rem = Math.floor((s%3600)/60);
        let s_rem = s%60;
        
        // کاتی ماوە بە شێوازی h:m:s لە چەپەوە
        let countdownStr = toKu(h_rem) + " : " + toKu(m_rem.toString().padStart(2,'٠')) + " : " + toKu(s_rem.toString().padStart(2,'٠'));
        
        document.getElementById('countdown').innerHTML = `
            ماوە بۆ بانگی ${next} : 
            <span style="color: #22d3ee; font-size: 1.4rem; unicode-bidi: bidi-override; direction: ltr; display: inline-block;">
                ${countdownStr}
            </span>`;
    }
}

function updateCity() {
    const city = document.getElementById('citySelect').value;
    fetchTimes(city);
}

setInterval(updateClock, 1000);
fetchTimes('Penjwin');
