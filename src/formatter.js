import chalk from 'chalk';
import { getTranslations } from './i18n.js';

export function formatOutput(result, lang) {
    const t = getTranslations(lang);
    const W = Math.floor((process.stdout.columns || 150) * 0.99);
    const COL_W = Math.floor((W - 4) / 3);
    const lines = [];

    const header = ` ${t.appTitle} | ${new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} `;
    lines.push(chalk.bold.cyan(header));
    lines.push(chalk.gray('═'.repeat(Math.min(W, 200))));

    const col1 = [];
    const col2 = [];
    const col3 = [];

    buildExchangeRates(col1, result.exchangeRates, t);
    buildStocks(col1, result.stocks, t);
    buildCrypto(col1, result.crypto, t);
    buildFuelPrices(col1, result.fuelPrices, t);
    buildTuikStats(col1, result.tuikStats, t);

    buildEconomicNews(col2, result.economicNews, t, COL_W);
    buildPolitics(col2, result.politics, t, COL_W);
    buildTwitterTrends(col2, result.twitterTrends, t, COL_W);

    buildEksiSozluk(col3, result.eksisozluk, t);
    buildYoutubeTrends(col3, result.youtubeTrends, t);
    buildWeather(col3, result.weather, t);
    buildEarthquakes(col3, result.earthquakes, t);

    const maxLen = Math.max(col1.length, col2.length, col3.length);
    const sep = chalk.gray(' ║ ');

    for (let i = 0; i < maxLen; i++) {
        const asciiPad = chalk.dim.gray(' ' + '· '.repeat(Math.floor((COL_W - 2) / 2)));
        const c1Str = col1[i] !== undefined ? col1[i] : asciiPad;
        const c2Str = col2[i] !== undefined ? col2[i] : asciiPad;
        const c3Str = col3[i] !== undefined ? col3[i] : asciiPad;

        const c1 = stripAndPad(c1Str, COL_W);
        const c2 = stripAndPad(c2Str, COL_W);
        const c3 = stripAndPad(c3Str, COL_W);
        lines.push(`${c1}${sep}${c2}${sep}${c3}`);
    }

    lines.push(chalk.gray('═'.repeat(Math.min(W, 200))));
    return lines.join('\n');
}

function stripAnsi(str) {
    return str.replace(/\u001b\[[0-9;]*m/g, '');
}

function visibleLength(str) {
    let len = stripAnsi(str).length;
    if (str.includes('⛽')) len += 1;
    if (str.includes('🏛️')) len -= 1;
    return len;
}

function stripAndPad(str, width) {
    const vis = visibleLength(str);
    if (vis >= width) {
        return truncateToWidth(str, width);
    }
    return str + ' '.repeat(width - vis);
}

function truncateToWidth(str, width) {
    const chars = [];
    let vis = 0;
    let inEsc = false;
    let escBuf = '';

    for (const ch of str) {
        if (ch === '\u001b') {
            inEsc = true;
            escBuf = ch;
            continue;
        }
        if (inEsc) {
            escBuf += ch;
            if (ch === 'm') {
                chars.push(escBuf);
                inEsc = false;
                escBuf = '';
            }
            continue;
        }
        if (vis >= width - 1) {
            chars.push('…');
            break;
        }
        chars.push(ch);
        vis++;
    }

    while (vis < width) {
        chars.push(' ');
        vis++;
    }

    return chars.join('');
}

function sectionHeader(title) {
    return chalk.dim.yellow(`▸ ${title}`);
}

function errorMessage(t) {
    return chalk.dim.red(`  ⚠ ${t.errorOccurred}`);
}

function colorizeValue(text) {
    if (!text || text === '-') return text || '-';
    const clean = String(text).replace(/[%,\s+()]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) return text;
    if (num > 0) return chalk.green(text.replace(/[()]/g, ''));
    if (num < 0) return chalk.red(text);
    return chalk.gray(text);
}

function truncate(str, len) {
    if (!str) return '-';
    if (str.length <= len) return str;
    return str.substring(0, len - 3) + '…';
}

function buildExchangeRates(col, data, t) {
    col.push(sectionHeader(t.sections.exchangeRates));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const r of data) {
        const pair = r.pair.padEnd(10);
        const last = (r.last || '-').padEnd(12);
        col.push(chalk.dim(` ${pair}${last}${colorizeValue(r.changePercent)}`));
    }
}

function buildStocks(col, data, t) {
    col.push(sectionHeader(t.sections.stocks));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const s of data) {
        const name = truncate(s.name, 17).padEnd(18);
        const last = (s.last || '-').padEnd(12);
        col.push(chalk.dim(` ${name}${last}${colorizeValue(s.changePercent)}`));
    }
}

function buildCrypto(col, data, t) {
    col.push(sectionHeader(t.sections.crypto));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const c of data) {
        const name = truncate(c.name, 16).padEnd(17);
        const price = c.price.padEnd(13);
        col.push(chalk.dim(` ${name}${price}${colorizeValue(c.changePercent)}`));
    }
}

function buildFuelPrices(col, data, t) {
    col.push(sectionHeader(t.sections.fuelPrices));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const f of data) {
        col.push(chalk.dim(` ${f.productName.padEnd(22)} ${f.amount} ₺`));
    }
}

function buildTuikStats(col, data, t) {
    col.push(sectionHeader(t.sections.tuikStats));
    if (!data) { col.push(errorMessage(t)); return; }
    if (data.cpi) {
        const period = formatPeriod(data.cpi.period, t);
        col.push(chalk.dim(` ${t.tuikCpiLabel}: %${data.cpi.value} (${period})`));
    }
    if (data.unemployment) {
        const period = formatPeriod(data.unemployment.period, t);
        col.push(chalk.dim(` ${t.tuikUnemploymentLabel}: %${data.unemployment.value} (${period})`));
    }
}

function buildEconomicNews(col, data, t, colW) {
    col.push(sectionHeader(t.sections.economicNews));
    if (!data) { col.push(errorMessage(t)); return; }
    data.forEach((n) => {
        const fullTitle = "- " + n.title;
        const maxPerLine = colW - 3;
        if (fullTitle.length > maxPerLine) {
            col.push(chalk.dim(` ${fullTitle.substring(0, maxPerLine)}`));
            col.push(chalk.dim(` ${truncate(fullTitle.substring(maxPerLine), maxPerLine)}`));
        } else {
            col.push(chalk.dim(` ${fullTitle}`));
        }
    });
}

function buildPolitics(col, data, t, colW) {
    col.push(sectionHeader(t.sections.politics));
    if (!data) { col.push(errorMessage(t)); return; }
    data.forEach((n) => {
        const fullTitle = "- " + n.title;
        const maxPerLine = colW - 3;
        if (fullTitle.length > maxPerLine) {
            col.push(chalk.dim(` ${fullTitle.substring(0, maxPerLine)}`));
            col.push(chalk.dim(` ${truncate(fullTitle.substring(maxPerLine), maxPerLine)}`));
        } else {
            col.push(chalk.dim(` ${fullTitle}`));
        }
    });
}

function buildEarthquakes(col, data, t) {
    col.push(sectionHeader(t.sections.earthquakes));
    if (!data) { col.push(errorMessage(t)); return; }
    if (data.length === 0) {
        col.push(chalk.dim.gray(`  ${t.noData}`));
    } else {
        for (const eq of data) {
            const magValue = eq.magnitude >= 5 ? chalk.red.bold(eq.magnitude.toFixed(1)) : chalk.yellow(eq.magnitude.toFixed(1));
            const locText = truncate(eq.location, 27).padEnd(28);
            const timeStr = eq.time.split(' ')[1] || eq.time;
            col.push(chalk.dim(` ${magValue}  ${locText}${truncate(timeStr, 16)}`));
        }
    }
}

function buildTwitterTrends(col, data, t, colW) {
    col.push(sectionHeader(t.sections.twitterTrends));
    if (!data) { col.push(errorMessage(t)); return; }
    const trendsStr = data.map(tr => tr.topic).join(' | ');
    let currentLine = '';
    const words = trendsStr.split(' ');

    for (const word of words) {
        if (currentLine.length + word.length + 1 > (colW - 2)) {
            col.push(chalk.dim(' ' + currentLine));
            currentLine = word;
        } else {
            currentLine += (currentLine.length === 0 ? '' : ' ') + word;
        }
    }
    if (currentLine) col.push(chalk.dim(' ' + currentLine));
}

function buildEksiSozluk(col, data, t) {
    col.push(sectionHeader(t.sections.eksisozluk));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const topic of data) {
        const title = truncate(topic.title, 45).padEnd(46);
        col.push(chalk.dim(` ${title}${topic.entries}`));
    }
}

function buildYoutubeTrends(col, data, t) {
    col.push(sectionHeader(t.sections.youtubeTrends));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const v of data) {
        col.push(chalk.dim(` ${truncate(v.title, 55)}`));
    }
}

function buildWeather(col, data, t) {
    col.push(sectionHeader(t.sections.weather));
    if (!data) { col.push(errorMessage(t)); return; }
    for (const w of data) {
        let vis = visibleLength(w.city);
        let cityStr = w.city + ' '.repeat(Math.max(1, 10 - vis));
        const tempStr = w.temp.padStart(4);
        const rangeStr = w.range.padStart(6);
        col.push(chalk.dim(` ${cityStr} ${tempStr} ${rangeStr} ${truncate(w.condition, 30)}`));
    }
}

function formatPeriod(dateStr, t) {
    if (!dateStr) return '-';
    const parts = dateStr.split('/');
    if (parts.length === 2) {
        const monthName = t.months[parseInt(parts[1])] || parts[1];
        return `${parts[0]} ${monthName}`;
    }
    return dateStr;
}
