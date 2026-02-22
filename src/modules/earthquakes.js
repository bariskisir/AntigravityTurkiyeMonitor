import http from '../utils/http.js';
import { parseStringPromise } from 'xml2js';

const KOERI_24H_URL = 'http://www.koeri.boun.edu.tr/sismo/zeqmap/xmlt/son24saat.xml';

export async function fetch() {
    const res = await http.get(KOERI_24H_URL, { responseType: 'text', timeout: 10000 });
    const parsed = await parseStringPromise(res.data, { explicitArray: false });

    const items = [];
    const extract = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
            if (key.toLowerCase().includes('earthquake') || key.toLowerCase().includes('earhquake')) {
                const val = obj[key];
                if (Array.isArray(val)) items.push(...val);
                else items.push(val);
            } else {
                extract(obj[key]);
            }
        }
    };
    extract(parsed);

    const list = Array.isArray(items) ? items : [items];
    const earthquakes = [];

    for (const eq of list) {
        const attrs = eq.$ || eq;
        const mag = parseFloat(attrs.mag || attrs.magnitude || attrs.ML || attrs.Ml || attrs.Mw || attrs.MD || attrs.Md || '0');

        if (mag >= 4.0) {
            earthquakes.push({
                magnitude: mag,
                location: attrs.lokasyon || attrs.location || '-',
                depth: attrs.Depth || attrs.depth || attrs.derinlik || '-',
                time: attrs.name || attrs.tarih || attrs.date || attrs.Time || attrs.time || '-'
            });
        }
    }

    earthquakes.sort((a, b) => b.time.localeCompare(a.time));
    return earthquakes.slice(0, 5);
}
