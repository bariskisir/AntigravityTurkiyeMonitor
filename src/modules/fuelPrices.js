import * as cheerio from 'cheerio';
import http from '../utils/http.js';

const WANTED = ['V/Max Kurşunsuz 95', 'V/Max Diesel', 'PO/gaz Otogaz'];

export async function fetch() {
    const res = await http.get('https://www.petrolofisi.com.tr/akaryakit-fiyatlari');
    const $ = cheerio.load(res.data);
    const results = [];

    const headers = [];
    $('table.table-prices thead th').each((_, th) => {
        headers.push($(th).text().trim());
    });

    const row = $('tr[data-disctrict-name="ISTANBUL (AVRUPA)"]').first();

    if (row.length && headers.length > 1) {
        row.find('td').each((i, td) => {
            const colName = headers[i] || '';
            if (WANTED.includes(colName)) {
                const price = $(td).find('span.with-tax').text().trim();
                if (price) {
                    results.push({
                        productName: colName,
                        amount: parseFloat(price.replace(',', '.'))
                    });
                }
            }
        });
    }

    if (results.length === 0) {
        $('li').each((_, el) => {
            const text = $(el).text().trim();
            if (!text.startsWith('ISTANBUL (AVRUPA)')) return;

            $(el).find('div.mt-2').each((_, div) => {
                const label = $(div).find('.text-primary').text().trim();
                if (WANTED.includes(label)) {
                    const priceMatch = $(div).text().match(/([\d.]+)\s*TL/);
                    if (priceMatch) {
                        results.push({
                            productName: label,
                            amount: parseFloat(priceMatch[1].replace(',', '.'))
                        });
                    }
                }
            });
        });
    }

    if (results.length === 0) {
        throw new Error('No fuel price data found');
    }

    return results;
}
