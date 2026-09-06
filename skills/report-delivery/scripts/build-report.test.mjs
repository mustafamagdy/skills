#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildGanttSvg, validateGantt } from './gantt.mjs';
import { buildSprintLogSvg, validateSprintLog } from './sprint-log.mjs';

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
    evidence: [{ source: 'Build', statement: 'Four tests passed.', type: 'CI', reference: 'Build 1' }],
    schedule: {
      title: 'Example delivery schedule',
      subtitle: 'Two sprints | Status as at 3 September 2026',
      statusDate: '2026-09-03',
      statusPeriod: 2,
      periods: [
        { label: 'W1', date: '24 Aug' },
        { label: 'W2', date: '31 Aug' },
        { label: 'W3', date: '7 Sep' },
        { label: 'W4', date: '14 Sep' }
      ],
      phases: [
        { label: 'P1 Foundation', start: 1, end: 2, color: '#4E7FAF' },
        { label: 'P2 Delivery', start: 3, end: 4, color: '#173B61' }
      ],
      milestones: [
        { id: 'M1', label: 'Foundation ready', period: 2 },
        { id: 'M2', label: 'Release ready', period: 4 }
      ],
      workstreams: [
        {
          name: 'Platform foundation',
          items: [
            { id: '1.1', name: 'Provision the environment', start: 1, end: 2, status: 'complete', duration: '2w' },
            { id: '1.2', name: 'Complete the release path', start: 2, end: 4, status: 'active', duration: '3w', critical: true }
          ]
        }
      ],
      source: 'Approved delivery baseline and tracker status'
    },
    sprintLog: {
      title: 'Sprint delivery log',
      subtitle: 'Committed and current work | Status as at 3 September 2026',
      statusDate: '2026-09-03',
      sprints: [
        {
          name: 'Sprint 3',
          label: 'Foundation',
          shortName: 'S3',
          startDate: '23 Aug',
          endDate: '5 Sep 2026',
          items: [
            { id: 'S1', sprint: 'S3', module: 'Platform', name: 'Provision the environment', priority: 'Critical', points: 8, assignee: 'DevOps', status: 'Closed', notes: 'M2 Gate' }
          ]
        },
        {
          name: 'Sprint 4',
          label: 'Pilot path',
          shortName: 'S4',
          startDate: '6 Sep',
          endDate: '19 Sep 2026',
          items: [
            { id: 'S2', sprint: 'S4', module: 'Fuelling', name: 'Issue a payment token', priority: 'High', points: 5, assignee: 'Backend', status: 'Active', notes: 'M3 Gate' }
          ]
        }
      ],
      source: 'Tracker snapshot 123'
    }
  }, null, 2));
  const result = spawnSync(process.execPath, [path.join(here, 'build-report.mjs'), input, '--out-dir', temporary], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const markdown = fs.readFileSync(path.join(temporary, 'test-report.md'), 'utf8');
  const html = fs.readFileSync(path.join(temporary, 'test-report.html'), 'utf8');
  const fodt = fs.readFileSync(path.join(temporary, 'test-report.fodt'), 'utf8');
  const gantt = fs.readFileSync(path.join(temporary, 'test-report-gantt.svg'), 'utf8');
  const sprintLog = fs.readFileSync(path.join(temporary, 'test-report-sprint-log.svg'), 'utf8');
  assert.match(markdown, /# Test report/);
  assert.match(markdown, /\| Build \| Passed \|/);
  assert.match(html, /data:image\/svg\+xml;base64,/);
  assert.match(html, /Risks, dependencies and decisions/);
  assert.match(html, /Evidence register/);
  assert.match(html, /class="gantt-sheet"/);
  assert.match(html, /Sprint delivery log/);
  assert.match(html, /@page gantt/);
  assert.doesNotMatch(html, /TODO/);
  assert.match(fodt, /office:mimetype="application\/vnd\.oasis\.opendocument\.text"/);
  assert.match(fodt, /<office:binary-data>/);
  assert.match(fodt, /Risks, dependencies and decisions/);
  assert.match(fodt, /GanttPageLayout/);
  assert.match(fodt, /draw:mime-type="image\/svg\+xml"/);
  assert.match(fodt, /draw:name="SprintLog"/);
  assert.match(gantt, /Example delivery schedule/);
  assert.match(gantt, /Activity \/ Work Package/);
  assert.match(gantt, /Sprint 1/);
  assert.match(gantt, /stroke-dasharray="6 5"/);
  assert.match(gantt, /TODAY/);
  assert.match(gantt, /● 1\.2/);
  assert.doesNotThrow(() => validateGantt(JSON.parse(fs.readFileSync(input, 'utf8')).schedule));
  assert.throws(() => validateGantt({
    ...JSON.parse(fs.readFileSync(input, 'utf8')).schedule,
    workstreams: [{ name: 'Duplicate test', items: [
      { id: 'X', name: 'One', start: 1, end: 1, status: 'complete' },
      { id: 'X', name: 'Two', start: 2, end: 2, status: 'upcoming' }
    ] }]
  }), /duplicate schedule item id/);
  assert.match(buildGanttSvg(JSON.parse(fs.readFileSync(input, 'utf8')).schedule), /viewBox="0 0 1600 1131"/);
  assert.doesNotThrow(() => validateSprintLog(JSON.parse(fs.readFileSync(input, 'utf8')).sprintLog));
  assert.match(buildSprintLogSvg(JSON.parse(fs.readFileSync(input, 'utf8')).sprintLog), /User Story \/ Task/);
  assert.match(sprintLog, /Sprint 4 - Pilot path/);
  console.log('build-report tests passed');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
