let prayerTimes = {};
let isMuted = false;

// --- حیسابکردنی بەرواری کوردی (سادە کراوە) ---
function getKurdiDate() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear() - 621;
    const months = ["خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمێ"];
    // لێرەدا تەنها وەک نموونە دانراوە، بۆ وردی زیاتر پێویستی بە کتێبخانەی جیاوازە
    return `${day}ی ${months[month-1]}ی ${year + 2700}ی کوردی`;
}

function updateUI() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});
    document.getElementById('dateMiladi').innerText = "میلادی: " + now.toLocaleDateString('ku-IQ');
    document.getElementById('dateKurdi').innerText = getKurdiDate();
    
    findNextPrayer();
}

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
};

async function getData(city) {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
    const data = await res.json();
    const t = data.data.timings;

    prayerTimes = {
        "بەیانی": fix(t.Fajr, 6),
        "ڕۆژھەڵات": t.Sunrise,
        "نیوەڕۆ": fix(t.Dhuhr, 6),
        "عەسر": fix(t.Asr, 2),
        "ئێوارە": fix(t.Maghrib, 8),
        "خەوتنان": fix(t.Isha, 2)
    };

    document.getElementById('dateHijri').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
    renderPrayers();
}

function renderPrayers() {
    const list = document.getElementById('prayerList');
    list.innerHTML = "";
    Object.entries(prayerTimes).forEach(([name, time]) => {
        const div = document.createElement('div');
        div.className = 'prayer-row';
        div.innerHTML = `
            <div class="name">
                <i class="fas fa-volume-up vol-icon ${isMuted ? '' : 'on'}" onclick="isMuted=!isMuted; renderPrayers()"></i>
                ${name}
            </div>
            <div class="time">${time}</div>
        `;
        list.appendChild(div);
    });
}

function findNextPrayer() {
    // لێرەدا بەراوردی کات دەکەین بۆ کاونتداون (کورتکراوەتەوە)
    document.getElementById('countdown').innerText = "کات ماوە بۆ بانگی داهاتوو";
}

document.getElementById('citySelect').onchange = (e) => getData(e.target.value);
setInterval(updateUI, 1000);
window.onload = () => getData('Penjwin');
