import puppeteer from 'puppeteer';

let browser = null;
let browserPromise = null;

export async function getBrowser() {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        }).then(b => {
            browser = b;
            return b;
        });
    }
    return browserPromise;
}

export async function closeBrowser() {
    if (browser) {
        try {
            await browser.close();
        } catch (_) { }
        browser = null;
        browserPromise = null;
    }
}

export async function scrape(url, evaluateFn, waitSelector = null) {
    const b = await getBrowser();
    const page = await b.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        if (waitSelector) {
            await page.waitForSelector(waitSelector, { timeout: 15000 });
        }

        await new Promise(r => setTimeout(r, 1000));

        const result = await page.evaluate(evaluateFn);
        if (result === null || result === undefined) {
            throw new Error(`Scrape returned null or undefined for ${url}`);
        }
        return result;
    } finally {
        await page.close();
    }
}
