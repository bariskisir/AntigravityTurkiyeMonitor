import * as cheerio from 'cheerio';
import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://eksisozluk.com/basliklar/gundem');
    const $ = cheerio.load(res.data);
    const topics = [];

    $('ul.topic-list li a').each((_, el) => {
        const $a = $(el);
        const fullText = $a.text().trim();
        const entryCount = $a.find('small').text().trim();
        const title = fullText.replace(entryCount, '').trim();
        const href = $a.attr('href') || '';

        const idMatch = href.match(/--(\d+)/);
        const topicId = idMatch ? parseInt(idMatch[1]) : 0;

        if (title) {
            topics.push({
                title,
                entries: entryCount || '-',
                url: `https://eksisozluk.com${href}`,
                topicId
            });
        }
    });

    if (topics.length === 0) {
        throw new Error('No Ekşi Sözlük topics found');
    }

    topics.sort((a, b) => b.topicId - a.topicId);
    return topics.slice(0, 5).map(({ title, entries, url }) => ({ title, entries, url }));
}
