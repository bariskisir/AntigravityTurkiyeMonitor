import * as cheerio from 'cheerio';
import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://yttrendz.com/youtube-trends/turkey');
    const $ = cheerio.load(res.data);
    const videos = [];

    $('.feed-box-wp .feed-box').each((_, box) => {
        if (videos.length >= 5) return;

        const $box = $(box);
        const rank = $box.find('.feed-count span').text().trim();
        const titleEl = $box.find('.feed-title a').first();
        const title = titleEl.attr('title') || titleEl.text().trim();
        const videoId = titleEl.attr('data-videoid') || '';

        const viewsText = $box.find('.feed-view-figure').first().text().trim();
        const channel = $box.find('.feed-author').first().text().replace('Upload by :', '').replace('Upload by:', '').trim();
        const date = $box.find('.feed-date').first().text().replace('on ', '').trim();

        if (title) {
            videos.push({
                rank: parseInt(rank) || videos.length + 1,
                title,
                views: viewsText || '-',
                channel: channel || '-',
                date: date || '-',
                videoId
            });
        }
    });

    if (videos.length === 0) {
        throw new Error('No YouTube trends found');
    }

    return videos;
}
