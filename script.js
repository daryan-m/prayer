let isMuted = false;
let prayerData = {};

function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('en-GB');
    
    // نوێکردنەوەی بەرواری میلادی
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateGregorian').innerText = "میلادی: " + now.toLocaleDateString('ku-IQ', options);
    
    setTimeout(updateClock, 1000);
}

const fix = (time, min) => {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h); d.setMinutes(m + min);
    return d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
};

async function getPrayerTimes(city) {
    try {
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`;
        const response = await fetch(url);
        const data = await response.json();
        const t = data.data.timings;
        
        // حیساباتی خۆت
        prayerData = {
            "بەیانی": fix(t.Fajr, 6),
            "ڕۆژھەڵات": t.Sunrise, // وەک خۆی
            "نیوەڕۆ": fix(t.Dhuhr, 6),
            "عەسر": fix(t.Asr, 2),
            "ئێوارە": fix(t.Maghrib, 8),
            "خەوتنان": fix(t.Isha, 2)
        };

        document.getElementById('dateHijri').innerText = `کۆچی: ${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;
        displayTimes();
    } catch (e) { console.log(e); }
}

function displayTimes() {
    const container = document.getElementById('prayerTimes');
    container.innerHTML = "";
    
    Object.entries(prayerData).forEach(([name, time]) => {
        const row = document.createElement('div');
        row.className = 'time-row';
        row.innerHTML = `
            <div class="prayer-info">
                <i class="fas fa-volume-up mute-btn ${isMuted ? '' : 'active'}" onclick="toggleMute(this)"></i>
                <span>${name}</span>
            </div>
            <div class="time-val">${time}</div>
        `;
        container.appendChild(row);
    });
}

function toggleMute(el) {
    isMuted = !isMuted;
    displayTimes(); // ڕیفریشکردنی ئایکۆنەکان
}

// لێرەدا دەتوانیت فەرمانی لێدانی دەنگی بانگ زیاد بکەیت ئەگەر کاتەکە یەکسان بوو

document.getElementById('citySelect').onchange = (e) => getPrayerTimes(e.target.value);
window.onload = () => {
    updateClock();
    getPrayerTimes('Penjwin');
};
