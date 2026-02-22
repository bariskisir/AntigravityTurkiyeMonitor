import * as cheerio from 'cheerio';
import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://www.bloomberght.com/haberler');
    const $ = cheerio.load(res.data);
    const headlines = [];
    const seen = new Set();

    $('a').each((_, el) => {
        if (headlines.length >= 6) return;

        const $a = $(el);
        const href = $a.attr('href') || '';

        if (!href || href === '/' || href === '#' || href.includes('javascript')) return;
        if (href.includes('/kategori') || href.includes('/etiket') || href === '/haberler') return;

        const isNewsUrl = /^\/[a-z0-9-]+-\d{5,}$/.test(href) || (href.includes('bloomberght.com/') && /\d{5,}$/.test(href));
        if (!isNewsUrl) return;

        let title = $a.text().trim();
        title = title.replace(/^HABERLER\s*/i, '').replace(/^Haberler\s*/i, '').trim();

        if (!title || title.length < 20) return;
        if (seen.has(title)) return;

        seen.add(title);
        headlines.push({
            title,
            url: href.startsWith('http') ? href : `https://www.bloomberght.com${href}`
        });
    });

    if (headlines.length === 0) {
        throw new Error('No economic news found');
    }

    return headlines;
}
