let prayerData = {};

// ١. مێنۆ
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// ٢. لۆژیکی کات و ساڵنامەی کوردی (Manual Logic for Kurdish Date)
function updateDates() {
    const now = new Date();
    
    // میلادی
    document.getElementById('miladiDate').innerText = `میلادی: ${now.toLocaleDateString('en-GB')}`;
    
    // کوردی - لۆژیکی ڕێبەندان
    const kurdishMonths = ["ڕێبەندان", "ڕەشەمێ", "خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان", "سەرماوەز", "بەفرانبار"];
    // ساڵی ٢٠٢٦ لە ساڵنامەی کوردی دەکاتە ٢٧٢٥/٢٧٢٦
    let kYear = 2725; 
    let kDay = 5; // بۆ ئەمڕۆ ٥ی ڕێبەندان
    document.getElementById('kurdishDate').innerText = `${kDay} ـی ڕێبەندانی ${kYear} کوردی`;
}

// ٣. زیادکردنی خولەکەکان (Adjustment Logic)
function adjustTime(timeStr, minutes) {
    let [h, m] = timeStr.split(':').map(Number);
    let d = new Date();
    d.setHours(h, m + minutes);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

async function fetchPrayers(city) {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`);
        const json = await res.json();
        const t = json.data.timings;

        // داتاکان بەپێی داواکارییەکەت
        prayerData = {
            "بەیانی": adjustTime(t.Fajr, 6),
            "ڕۆژهەڵاتن": adjustTime(t.Fajr, 73), // ١ سەعات و ١٣ دەقە دوای بەیانی
            "نیوەڕۆ": adjustTime(t.Dhuhr, 6),
            "عەسر": adjustTime(t.Asr, 2),
            "ئێوارە": adjustTime(t.Maghrib, 8),
            "خەوتنان": adjustTime(t.Isha, 2)
        };

        document.getElementById('hijriDate').innerText = `کۆچی: ${json.data.date.hijri.day} ${json.data.date.hijri.month.ar} ${json.data.date.hijri.year}`;
        renderCards();
    } catch (error) {
        console.error("Error fetching data");
    }
}

function renderCards() {
    const container = document.getElementById('prayerCards');
    container.innerHTML = "";
    Object.entries(prayerData).forEach(([name, time]) => {
        container.innerHTML += `
            <div class="prayer-card">
                <span class="p-name">${name}</span>
                <span class="p-time">${time}</span>
            </div>
        `;
    });
}

// ٤. لۆژیکی ماوەی بانگی داهاتوو (Countdown)
function updateUI() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('en-GB', { hour12: false });
    
    if (Object.keys(prayerData).length === 0) return;

    let nextTime = null, nextName = "";
    let minDiff = Infinity;

    Object.entries(prayerData).forEach(([name, time]) => {
        if(name === "ڕۆژهەڵاتن") return;
        const [h, m] = time.split(':').map(Number);
        const pDate = new Date(); pDate.setHours(h, m, 0);
        let diff = pDate - now;
        if (diff < 0) diff += 86400000;
        if (diff < minDiff) { minDiff = diff; nextName = name; }
    });

    const totalSec = Math.floor(minDiff / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    document.getElementById('nextPrayerCounter').innerHTML = 
        `<i class="fas fa-hourglass-half"></i> ماوە بۆ بانگی ${nextName}: <span>${hours}:${mins}:${secs}</span>`;
}

function playAdhan(url) {
    const player = document.getElementById('adhanPlayer');
    player.src = url;
    player.play();
}

function stopAdhan() { document.getElementById('adhanPlayer').pause(); }

function updateCity() { fetchPrayers(document.getElementById('citySelect').value); }

setInterval(updateUI, 1000);
updateDates();
fetchPrayers('Penjwin');
