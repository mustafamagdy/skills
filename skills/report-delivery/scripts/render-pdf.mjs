#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

function fail(message) {
  console.error(`PDF render failed: ${message}`);
  process.exit(2);
}

if (process.argv.length < 4 || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: node render-pdf.mjs <report.html> <report.pdf>');
  process.exit(process.argv.length < 4 ? 1 : 0);
}

const input = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
if (!fs.existsSync(input)) fail(`input not found: ${input}`);
fs.mkdirSync(path.dirname(output), { recursive: true });

const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
const candidates = [
  process.env.REPORT_BROWSER,
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'microsoft-edge',
  'google-chrome',
  'chromium',
  'chromium-browser',
  path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
].filter(Boolean);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'report-browser-'));
let lastError = '';
let rendered = false;
try {
  for (const browser of candidates) {
    const result = spawnSync(browser, [
      '--headless=new',
      '--disable-gpu',
      `--user-data-dir=${profile}`,
      '--no-pdf-header-footer',
      '--print-to-pdf-no-header',
      `--print-to-pdf=${output}`,
      pathToFileURL(input).href
    ], { encoding: 'utf8', timeout: 120000 });
    if (result.error?.code === 'ENOENT') continue;
    if (result.status === 0 && fs.existsSync(output) && fs.statSync(output).size > 0) {
      rendered = true;
      break;
    }
    lastError = result.stderr || result.stdout || result.error?.message || `exit ${result.status}`;
  }
} finally {
  fs.rmSync(profile, { recursive: true, force: true });
}

if (rendered) {
  console.log(output);
  process.exit(0);
}
fail(`Chrome, Edge or Chromium was not available or could not print. Set REPORT_BROWSER to its executable path. ${lastError}`.trim());
