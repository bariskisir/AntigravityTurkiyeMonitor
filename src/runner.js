import cliProgress from 'cli-progress';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AgendaResult from './models/AgendaResult.js';
import { getTranslations } from './i18n.js';
import { closeBrowser } from './utils/browser.js';

import * as exchangeRatesModule from './modules/exchangeRates.js';
import * as stocksModule from './modules/stocks.js';
import * as cryptoModule from './modules/crypto.js';
import * as fuelPricesModule from './modules/fuelPrices.js';
import * as tuikStatsModule from './modules/tuikStats.js';
import * as economicNewsModule from './modules/economicNews.js';
import * as twitterTrendsModule from './modules/twitterTrends.js';
import * as politicsModule from './modules/politics.js';
import * as eksisozlukModule from './modules/eksisozluk.js';
import * as earthquakesModule from './modules/earthquakes.js';
import * as youtubeTrendsModule from './modules/youtubeTrends.js';
import * as weatherModule from './modules/weather.js';
import * as magnificent7stocksModule from './modules/magnificent7stocks.js';

const MODULES = [
    { key: 'exchangeRates', loader: exchangeRatesModule, section: 'exchangeRates' },
    { key: 'stocks', loader: stocksModule, section: 'stocks' },
    { key: 'crypto', loader: cryptoModule, section: 'crypto' },
    { key: 'fuelPrices', loader: fuelPricesModule, section: 'fuelPrices' },
    { key: 'tuikStats', loader: tuikStatsModule, section: 'tuikStats' },
    { key: 'economicNews', loader: economicNewsModule, section: 'economicNews' },
    { key: 'twitterTrends', loader: twitterTrendsModule, section: 'twitterTrends' },
    { key: 'politics', loader: politicsModule, section: 'politics' },
    { key: 'eksisozluk', loader: eksisozlukModule, section: 'eksisozluk' },
    { key: 'earthquakes', loader: earthquakesModule, section: 'earthquakes' },
    { key: 'youtubeTrends', loader: youtubeTrendsModule, section: 'youtubeTrends' },
    { key: 'weather', loader: weatherModule, section: 'weather' },
    { key: 'magnificent7stocks', loader: magnificent7stocksModule, section: 'magnificent7stocks' }
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', 'log.txt');

function logError(moduleName, error) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${moduleName}] ${error}\n`;
    try {
        fs.appendFileSync(LOG_FILE, message, 'utf8');
    } catch (e) { }
}

export async function run(lang) {
    const t = getTranslations(lang);
    const resultData = {};

    const bar = new cliProgress.SingleBar({
        format: `${chalk.cyan('{bar}')} | {percentage}% | {value}/{total} | ${chalk.yellow('{module}')}`,
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
        clearOnComplete: true
    }, cliProgress.Presets.shades_grey);

    console.log(chalk.bold.cyan(`${t.fetchingModule}...`));
    bar.start(MODULES.length, 0, { module: '...' });

    let count = 0;
    const tasks = MODULES.map(async (def) => {
        try {
            resultData[def.key] = await def.loader.fetch(lang);
        } catch (err) {
            resultData[def.key] = null;
            logError(def.key, err.message || String(err));
        } finally {
            count++;
            bar.update(count, { module: t.sections[def.section] || def.key });
        }
    });

    await Promise.all(tasks);
    bar.stop();
    console.log(chalk.green(`✓ ${t.moduleComplete}`));

    await closeBrowser();

    return new AgendaResult(resultData);
}
