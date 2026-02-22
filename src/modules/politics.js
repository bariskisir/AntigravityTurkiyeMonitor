import * as cheerio from 'cheerio';
import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://www.sondakika.com/siyaset/');
    const $ = cheerio.load(res.data);
    const headlines = [];
    const seen = new Set();

    $('a').each((_, el) => {
        if (headlines.length >= 5) return;

        const $a = $(el);
        const href = $a.attr('href') || '';
        const title = $a.text().trim();

        if (!href.includes('/haber/') && !href.includes('/politika/')) return;
        if (!title || title.length < 20) return;
        if (seen.has(title)) return;

        seen.add(title);
        headlines.push({
            title,
            url: href.startsWith('http') ? href : `https://www.sondakika.com${href}`
        });
    });

    if (headlines.length === 0) {
        throw new Error('No politics news found');
    }

    return headlines;
}
