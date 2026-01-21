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

async function getPrayerTimes(city) {
    // نیشاندانی نامەی چاوەڕێ بکە تا کاتەکان دێن
    prayerTimesDiv.innerHTML = "<p style='color: #2c3e50;'>خەریکە کاتەکان وەردەگیرێن...</p>";
    
    const country = "Iraq";
    // بەکارهێنانی https بۆ دڵنیایی لە کارکردن لەسەر گیتهەب
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=3`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            displayTimes(data.data.timings);
        } else {
            prayerTimesDiv.innerHTML = "<p>نەتوانرا زانیارییەکان وەرگیرێن</p>";
        }
    } catch (error) {
        console.error("Error:", error);
        prayerTimesDiv.innerHTML = "<p>تکایە پەیوەندی ئینتەرنێتەکەت بپشکنە</p>";
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

// گوێگرتن لە گۆڕانکاری شارەکان
citySelect.addEventListener('change', (e) => {
    getPrayerTimes(e.target.value);
});

// بانگکردنی یەکەمجار بۆ هەولێر کاتێک سایتەکە دەکرێتەوە
window.onload = () => {
    getPrayerTimes('Erbil');
};
