import * as cheerio from 'cheerio';
import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://getdaytrends.com/tr/turkey/');
    const $ = cheerio.load(res.data);
    const trends = [];

    $('#trends tbody tr').each((i, row) => {
        if (trends.length >= 10) return;

        const $row = $(row);
        const topic = $row.find('td:nth-child(2) a').text().trim();
        const tweets = $row.find('td:nth-child(3)').text().trim();

        if (topic) {
            trends.push({ rank: trends.length + 1, topic, tweets: tweets || '-' });
        }
    });

    if (trends.length === 0) {
        throw new Error('No Twitter trends found');
    }

    return trends;
}
