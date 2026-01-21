async function getPrayerTimes(city) {
    const prayerTimesDiv = document.getElementById('prayerTimes');
    prayerTimesDiv.innerHTML = "چاوەڕێ بکە...";
    
    try {
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Iraq&method=3`;
        const response = await fetch(url);
        const data = await response.json();
        const t = data.data.timings;

        // کاتەکان بە زیادکردنی خولەکەکانەوە
        const fix = (time, min) => {
            let [h, m] = time.split(':').map(Number);
            let d = new Date();
            d.setHours(h);
            d.setMinutes(m + min);
            return d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
        };

        const html = `
            <div><span>بەیانی:</span> <span>${fix(t.Fajr, 6)}</span></div>
            <div><span>نیوەڕۆ:</span> <span>${fix(t.Dhuhr, 6)}</span></div>
            <div><span>عەسر:</span> <span>${fix(t.Asr, 2)}</span></div>
            <div><span>ئێوارە:</span> <span>${fix(t.Maghrib, 8)}</span></div>
            <div><span>خەوتنان:</span> <span>${fix(t.Isha, 2)}</span></div>
        `;
        prayerTimesDiv.innerHTML = html;
    } catch (e) {
        prayerTimesDiv.innerHTML = "هەڵە لە ئینتەرنێت!";
    }
}

document.getElementById('citySelect').onchange = (e) => getPrayerTimes(e.target.value);
window.onload = () => getPrayerTimes('Erbil');
