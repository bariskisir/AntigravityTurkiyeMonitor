#!/usr/bin/env node

import { Command } from 'commander';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from './runner.js';
import { formatOutput } from './formatter.js';

const program = new Command();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', 'log.txt');

function detectLanguage() {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ||
        process.env.LANG ||
        process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        os.platform();
    const lang = locale.toLowerCase().slice(0, 2);
    return (lang === 'tr' || lang === 'en') ? lang : 'en';
}

program
    .name('trmonitor')
    .description('A powerful CLI tool to monitor Turkiye agenda in real-time.')
    .version('1.0.4')
    .option('--lang <language>', 'Output language (tr or en)', detectLanguage())
    .option('--log', 'Show application logs')
    .action(async (options) => {
        if (options.log) {
            if (fs.existsSync(LOG_FILE)) {
                console.log(fs.readFileSync(LOG_FILE, 'utf8'));
            } else {
                console.log('No log file found.');
            }
            process.exit(0);
        }

        const lang = ['tr', 'en'].includes(options.lang) ? options.lang : 'en';

        try {
            const result = await run(lang);
            const output = formatOutput(result, lang);
            console.log(output);
        } catch (err) {
            console.error(`Fatal error: ${err.message}`);
            process.exit(1);
        }
    });

program.parse();
