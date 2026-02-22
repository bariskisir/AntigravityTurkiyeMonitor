import { scrape } from '../utils/browser.js';

export async function fetch() {
    const result = await scrapeInvesting();

    if (result.length === 0) {
        throw new Error('No exchange rate data found');
    }

    const order = ['USD/TRY', 'EUR/TRY', 'GBP/TRY', 'GAU/TRY', 'EUR/USD'];
    result.sort((a, b) => {
        let idxA = order.indexOf(a.pair);
        let idxB = order.indexOf(b.pair);
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        return idxA - idxB;
    });

    return result;
}

async function scrapeInvesting() {
    const results = [];
    const pairs = [
        { name: 'USD/TRY', slug: 'usd-try' },
        { name: 'EUR/TRY', slug: 'eur-try' },
        { name: 'GBP/TRY', slug: 'gbp-try' },
        { name: 'GAU/TRY', slug: 'gau-try' },
        { name: 'EUR/USD', slug: 'eur-usd' }
    ];

    const promises = pairs.map(pair => {
        return scrape(
            `https://www.investing.com/currencies/${pair.slug}`,
            () => {
                const last = document.querySelector('[data-test="instrument-price-last"]')?.innerText?.trim();
                const cp = document.querySelector('[data-test="instrument-price-change-percent"]')?.innerText?.trim();
                if (last) return { last, changePercent: cp || '-' };
                return null;
            },
            '[data-test="instrument-price-last"]'
        ).then(data => data ? { pair: pair.name, ...data } : null).catch(() => null);
    });

    const data = await Promise.all(promises);
    data.forEach(d => { if (d) results.push(d); });

    return results;
}
