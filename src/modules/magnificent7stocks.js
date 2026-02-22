import { scrape } from '../utils/browser.js';

const MAG7 = [
    { slug: 'nvidia-corp', ticker: 'NVDA' },
    { slug: 'apple-computer-inc', ticker: 'AAPL' },
    { slug: 'google-inc', ticker: 'GOOGL' },
    { slug: 'microsoft-corp', ticker: 'MSFT' },
    { slug: 'amazon-com-inc', ticker: 'AMZN' },
    { slug: 'facebook-inc', ticker: 'META' },
    { slug: 'tesla-motors', ticker: 'TSLA' }
];

export async function fetch() {
    const results = [];

    for (const stock of MAG7) {
        try {
            const url = `https://www.investing.com/equities/${stock.slug}`;
            const data = await scrape(url, () => {
                const price = document.querySelector('[data-test="instrument-price-last"]')?.innerText?.trim();
                const changePercent = document.querySelector('[data-test="instrument-price-change-percent"]')?.innerText?.trim();
                if (price) return { price, changePercent };
                return null;
            }, '[data-test="instrument-price-last"]');

            if (data) {
                results.push({
                    ticker: stock.ticker,
                    price: data.price,
                    changePercent: data.changePercent || '-'
                });
            }
        } catch (_) {
            // skip failed stock
        }
    }

    if (results.length === 0) {
        throw new Error('No Magnificent 7 stock data found');
    }

    return results;
}
