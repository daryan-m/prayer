const citySelect = document.getElementById('citySelect');
const prayerTimesDiv = document.getElementById('prayerTimes');

// ناوی بانگەکان بە کوردی
const prayerNamesKu = {
    "Fajr": "بەیانی",
    "Sunrise": "ڕۆژھەڵات",
    "Dhuhr": "نیوەڕۆ",
    "Asr": "عەسر",
    "Maghrib": "ئێوارە",
    "Isha": "خەوتنان"
};

async function getPrayerTimes(city) {
    const country = "Iraq";
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=3`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const timings = data.data.timings;

        displayTimes(timings);
    } catch (error) {
        prayerTimesDiv.innerHTML = "<p>هەڵەیەک ڕوویدا لە وەرگرتنی زانیارییەکان</p>";
    }
}

function displayTimes(timings) {
    prayerTimesDiv.innerHTML = ""; // پاککردنەوەی ناوەڕۆکە کۆنەکە
    
    for (let [name, time] of Object.entries(timings)) {
        if (prayerNamesKu[name]) {
            const row = `
                <div>
                    <span class="prayer-name">${prayerNamesKu[name]}</span>
                    <span class="prayer-time">${time}</span>
                </div>
            `;
            prayerTimesDiv.innerHTML += row;
        }
    }
}

// کاتێک شارەکە دەگۆڕدرێت
citySelect.addEventListener('change', (e) => {
    getPrayerTimes(e.target.value);
});

// بانگکردنی فەرمانی یەکەمجار بۆ هەولێر
getPrayerTimes('Erbil');
