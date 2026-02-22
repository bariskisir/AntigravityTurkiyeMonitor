import { scrape } from '../utils/browser.js';

export async function fetch() {
    const crypto = await scrape(
        'https://www.investing.com/crypto/currencies',
        () => {
            const data = [];
            const table = document.querySelector('table');
            if (!table) return [];

            const rows = table.querySelectorAll('tbody tr');
            for (const row of rows) {
                const cells = Array.from(row.querySelectorAll('td')).map(c => c.innerText.trim());
                if (cells.length < 6) continue;

                const nameText = cells[3];
                const price = cells[4];
                const changePercent = cells[5];

                if (nameText && price && price.includes('$')) {
                    const lines = nameText.split('\n').map(l => l.trim()).filter(Boolean);
                    const symbol = lines[1] || lines[0] || '';
                    data.push({ name: symbol, price, changePercent });
                }
                if (data.length >= 5) break;
            }
            return data;
        },
        'table'
    );

    if (!crypto || crypto.length === 0) {
        throw new Error('No crypto data found');
    }

    return crypto;
}
