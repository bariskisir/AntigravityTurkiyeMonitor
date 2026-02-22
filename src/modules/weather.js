import { scrape } from '../utils/browser.js';

export async function fetch() {
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Çanakkale', 'Bursa', 'Antalya', 'Adana'];

    const scrapeCity = async (city) => {
        try {
            const url = `https://www.mgm.gov.tr/tahmin/il-ve-ilceler.aspx?il=${encodeURIComponent(city)}`;
            const data = await scrape(url, () => {
                const row = document.querySelector('#_4_5gunluk table tbody tr');
                if (!row) return null;
                const tds = row.querySelectorAll('td');
                if (tds.length < 5) return null;

                const condition = tds[1].querySelector('img')?.getAttribute('title') || 'Bilinmiyor';
                const min = tds[2].innerText.trim();
                const max = tds[3].innerText.trim();

                return { condition, min, max };
            }, '#_4_5gunluk table tbody tr');

            if (data) {
                const condLower = data.condition.toLowerCase();
                let emoji = '⛅';
                if (condLower.includes('açık') || condLower.includes('güneş')) emoji = '☀️';
                else if (condLower.includes('yağmur') || condLower.includes('sağanak')) emoji = '🌧️';
                else if (condLower.includes('kar')) emoji = '❄️';
                else if (condLower.includes('sis')) emoji = '🌫️';
                else if (condLower.includes('fırtına')) emoji = '⛈️';
                else if (condLower.includes('bulut')) emoji = '⛅';

                return {
                    city: city,
                    condition: `${emoji} ${data.condition}`,
                    range: `${data.max}°C ${data.min}°C`
                };
            }
        } catch (e) {
            return null;
        }
    };

    const results = [];
    for (const city of cities) {
        const res = await scrapeCity(city);
        if (res) results.push(res);
    }

    if (results.length === 0) {
        throw new Error('No weather data found');
    }

    return results;
}
