const citySelect = document.getElementById('citySelect');
const prayerTimesDiv = document.getElementById('prayerTimes');

const prayerNamesKu = {
    "Fajr": "بەیانی",
    "Sunrise": "ڕۆژھەڵات",
    "Dhuhr": "نیوەڕۆ",
    "Asr": "عەسر",
    "Maghrib": "ئێوارە",
    "Isha": "خەوتنان"
};

// فەرمان بۆ زیادکردنی خولەک بۆ کاتەکان
function addMinutes(timeStr, minutesToAdd) {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':').map(Number);
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + minutesToAdd);
    
    return date.getHours().toString().padStart(2, '0') + ":" + 
           date.getMinutes().toString().padStart(2, '0');
}

async function getPrayerTimes(city) {
    prayerTimesDiv.innerHTML = "<p>خەریکە کاتەکان وەردەگیرێن...</p>";
    const country = "Iraq";
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=3`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        let timings = data.data.timings;

        // --- جێبەجێکردنی گۆڕانکارییەکان بەپێی داواکارییەکەت ---
        timings.Fajr = addMinutes(timings.Fajr, 6);      // بەیانی +٦
        timings.Dhuhr = addMinutes(timings.Dhuhr, 6);    // نیوەڕۆ +٦
        timings.Asr = addMinutes(timings.Asr, 2);        // عەسر +٢
        timings.Maghrib = addMinutes(timings.Maghrib, 8); // ئێوارە +٨
        timings.Isha = addMinutes(timings.Isha, 2);      // خەوتنان +٢
        
        // Sunrise (ڕۆژهەڵات) وەک خۆی دەمێنێتەوە و دەستکاری ناکرێت

        displayTimes(timings);
    } catch (error) {
        prayerTimesDiv.innerHTML = "<p>هەڵەیەک ڕوویدا لە وەرگرتنی زانیارییەکان</p>";
    }
}

function displayTimes(timings) {
    prayerTimesDiv.innerHTML = ""; 
    Object.keys(prayerNamesKu).forEach(key => {
        const row = document.createElement('div');
        row.innerHTML = `
            <span class="prayer-name">${prayerNamesKu[key]}</span>
            <span class="prayer-time">${timings[key]}</span>
        `;
        prayerTimesDiv.appendChild(row);
    });
}

citySelect.addEventListener('change', (e) => {
    getPrayerTimes(e.target.value);
});

// کاتی کردنەوەی سایتەکە
window.onload = () => {
    getPrayerTimes(citySelect.value);
};
