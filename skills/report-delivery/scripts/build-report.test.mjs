#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'report-build-test-'));
try {
  const image = path.join(temporary, 'evidence.svg');
  fs.writeFileSync(image, '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="#13795b"/></svg>');
  const input = path.join(temporary, 'input.json');
  fs.writeFileSync(input, JSON.stringify({
    schemaVersion: 1,
    report: {
      title: 'Test report',
      type: 'Weekly status',
      project: 'Example',
      audience: 'Client',
      statusDate: '2026-09-03',
      timezone: 'Asia/Riyadh',
      period: { label: 'Sprint 3', start: '2026-08-23', end: '2026-09-05' },
      filename: 'test-report',
      includeCover: true,
      includeContents: true
    },
    executiveSummary: ['The period completed successfully.'],
    metrics: [{ value: '4 / 4', label: 'Tests passed', source: 'Build 1' }],
    sections: [{
      title: 'Evidence',
      paragraphs: ['The evidence is inspectable.'],
      tables: [{ columns: ['Item', 'State'], rows: [['Build', 'Passed']] }],
      images: [{ path: './evidence.svg', alt: 'Green evidence block', caption: 'Real test fixture.' }]
    }],
    risks: [{ rating: 'Green', item: 'No open risk', impact: 'None', owner: 'Team', action: 'Monitor' }],
    evidence: [{ source: 'Build', statement: 'Four tests passed.', type: 'CI', reference: 'Build 1' }]
  }, null, 2));
  const result = spawnSync(process.execPath, [path.join(here, 'build-report.mjs'), input, '--out-dir', temporary], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const markdown = fs.readFileSync(path.join(temporary, 'test-report.md'), 'utf8');
  const html = fs.readFileSync(path.join(temporary, 'test-report.html'), 'utf8');
  const fodt = fs.readFileSync(path.join(temporary, 'test-report.fodt'), 'utf8');
  assert.match(markdown, /# Test report/);
  assert.match(markdown, /\| Build \| Passed \|/);
  assert.match(html, /data:image\/svg\+xml;base64,/);
  assert.match(html, /Risks, dependencies and decisions/);
  assert.match(html, /Evidence register/);
  assert.doesNotMatch(html, /TODO/);
  assert.match(fodt, /office:mimetype="application\/vnd\.oasis\.opendocument\.text"/);
  assert.match(fodt, /<office:binary-data>/);
  assert.match(fodt, /Risks, dependencies and decisions/);
  console.log('build-report tests passed');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
