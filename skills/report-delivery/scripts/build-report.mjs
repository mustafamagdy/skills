#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node build-report.mjs <report.json> [--out-dir <directory>] [--name <base-name>]');
}

function fail(message) {
  console.error(`Report build failed: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(argv.length === 0 ? 1 : 0);
  }
  const result = { input: argv[0], outDir: null, name: null };
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--out-dir' || value === '--name') {
      const next = argv[index + 1];
      if (!next) fail(`${value} needs a value`);
      if (value === '--out-dir') result.outDir = next;
      if (value === '--name') result.name = next;
      index += 1;
    } else {
      fail(`unknown argument ${value}`);
    }
  }
  return result;
}

function requireValue(condition, message) {
  if (!condition) fail(message);
}

function list(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function slugify(value) {
  const slug = String(value || 'delivery-report')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'delivery-report';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeMarkdown(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function normalizeColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#5B34DA';
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  }[extension] || 'application/octet-stream';
}

function imageSource(value, inputDir) {
  if (!value) fail('an image is missing its path');
  if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) return value;
  const absolute = path.resolve(inputDir, value);
  requireValue(fs.existsSync(absolute), `image not found: ${absolute}`);
  const bytes = fs.readFileSync(absolute);
  return `data:${mimeType(absolute)};base64,${bytes.toString('base64')}`;
}

function tableRows(table) {
  requireValue(Array.isArray(table.columns) && table.columns.length > 0, 'every table needs columns');
  requireValue(Array.isArray(table.rows), 'every table needs rows');
  const columns = table.columns.map((column) => {
    if (typeof column === 'string') return { key: column, label: column, width: null };
    requireValue(column && column.label, 'object columns need a label');
    return { key: column.key || column.label, label: column.label, width: column.width || null };
  });
  const rows = table.rows.map((row) => {
    if (Array.isArray(row)) return columns.map((_, index) => row[index] ?? '');
    requireValue(row && typeof row === 'object', 'table rows must be arrays or objects');
    return columns.map((column) => row[column.key] ?? '');
  });
  return { columns, rows };
}

function htmlTable(table) {
  const { columns, rows } = tableRows(table);
  const title = table.title ? `<h3>${escapeHtml(table.title)}</h3>` : '';
  const head = columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join('');
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
  return `${title}<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function markdownTable(table) {
  const { columns, rows } = tableRows(table);
  const output = [];
  if (table.title) output.push(`### ${table.title}`, '');
  output.push(`| ${columns.map((column) => escapeMarkdown(column.label)).join(' | ')} |`);
  output.push(`| ${columns.map(() => '---').join(' | ')} |`);
  for (const row of rows) output.push(`| ${row.map(escapeMarkdown).join(' | ')} |`);
  output.push('');
  return output.join('\n');
}

function htmlCallout(callout) {
  const tones = new Set(['green', 'amber', 'red', 'blue', 'neutral']);
  const tone = tones.has(String(callout.tone).toLowerCase()) ? String(callout.tone).toLowerCase() : 'neutral';
  return `<aside class="callout ${tone}"><strong>${escapeHtml(callout.label || 'Position')}</strong><span>${escapeHtml(callout.text || '')}</span></aside>`;
}

function markdownCallout(callout) {
  return `> **${callout.label || 'Position'}:** ${callout.text || ''}\n`;
}

function htmlMetrics(metrics) {
  if (!metrics.length) return '';
  return `<div class="metrics">${metrics.map((metric) => `<article class="metric"><div class="metric-value">${escapeHtml(metric.value)}</div><div class="metric-label">${escapeHtml(metric.label)}</div>${metric.detail ? `<div class="metric-detail">${escapeHtml(metric.detail)}</div>` : ''}${metric.source ? `<div class="metric-source">Source: ${escapeHtml(metric.source)}</div>` : ''}</article>`).join('')}</div>`;
}

function markdownMetrics(metrics) {
  if (!metrics.length) return '';
  const table = {
    columns: ['Measure', 'Value', 'Detail', 'Source'],
    rows: metrics.map((metric) => [metric.label, metric.value, metric.detail || '', metric.source || ''])
  };
  return markdownTable(table);
}

function htmlImages(images, inputDir) {
  return images.map((item) => `<figure><img src="${escapeHtml(imageSource(item.path, inputDir))}" alt="${escapeHtml(item.alt || item.caption || 'Report evidence')}" loading="eager">${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ''}</figure>`).join('');
}

function markdownImages(images) {
  return images.map((item) => `![${item.alt || item.caption || 'Report evidence'}](${item.path})${item.caption ? `\n\n*${item.caption}*` : ''}\n`).join('\n');
}

function sectionHtml(section, inputDir) {
  const output = [`<section class="report-section"><h2>${escapeHtml(section.title)}</h2>`];
  if (section.subtitle) output.push(`<p class="section-subtitle">${escapeHtml(section.subtitle)}</p>`);
  for (const callout of list(section.callouts)) output.push(htmlCallout(callout));
  output.push(htmlMetrics(list(section.metrics)));
  for (const paragraph of list(section.paragraphs)) output.push(`<p>${escapeHtml(paragraph)}</p>`);
  const bullets = list(section.bullets);
  if (bullets.length) output.push(`<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`);
  for (const table of list(section.tables)) output.push(htmlTable(table));
  output.push(htmlImages(list(section.images), inputDir));
  output.push('</section>');
  return output.join('\n');
}

function sectionMarkdown(section) {
  const output = [`## ${section.title}`, ''];
  if (section.subtitle) output.push(`*${section.subtitle}*`, '');
  for (const callout of list(section.callouts)) output.push(markdownCallout(callout), '');
  output.push(markdownMetrics(list(section.metrics)));
  for (const paragraph of list(section.paragraphs)) output.push(paragraph, '');
  const bullets = list(section.bullets);
  if (bullets.length) output.push(...bullets.map((bullet) => `- ${bullet}`), '');
  for (const table of list(section.tables)) output.push(markdownTable(table));
  output.push(markdownImages(list(section.images)));
  return output.join('\n');
}

function riskTable(risks) {
  return {
    title: 'Risks, dependencies and decisions',
    columns: [
      { label: 'Rating', width: 'xsmall' },
      { label: 'Item', width: 'medium' },
      { label: 'Impact', width: 'large' },
      { label: 'Owner', width: 'small' },
      { label: 'Action', width: 'large' },
      { label: 'Needed by', width: 'small' }
    ],
    rows: risks.map((risk) => [risk.rating, risk.item, risk.impact, risk.owner, risk.action, risk.neededBy || ''])
  };
}

function evidenceTable(evidence) {
  return {
    title: 'Evidence register',
    columns: [
      { label: 'Source', width: 'small' },
      { label: 'Verified statement', width: 'wide' },
      { label: 'Evidence type', width: 'medium' },
      { label: 'Reference', width: 'medium' },
      { label: 'As at', width: 'medium' }
    ],
    rows: evidence.map((item) => [item.source, item.statement, item.type, item.reference || '', item.asOf || ''])
  };
}

function metadata(report) {
  const period = report.period || {};
  return [
    ['Project', report.project || ''],
    ['Report type', report.type || 'Delivery report'],
    ['Audience', report.audience],
    ['Status date', report.statusDate],
    ['Timezone', report.timezone],
    ['Reporting period', period.label || ''],
    ['Period start', period.start || ''],
    ['Period end', period.end || '']
  ].filter(([, value]) => value);
}

function buildMarkdown(data) {
  const output = [`# ${data.report.title}`, ''];
  for (const [label, value] of metadata(data.report)) output.push(`**${label}:** ${value}  `);
  output.push('', '## Executive position', '');
  for (const paragraph of list(data.executiveSummary)) output.push(paragraph, '');
  for (const callout of list(data.callouts)) output.push(markdownCallout(callout), '');
  output.push(markdownMetrics(list(data.metrics)));
  for (const section of data.sections) output.push(sectionMarkdown(section));
  if (list(data.risks).length) output.push(`## ${riskTable(data.risks).title}`, '', markdownTable({ ...riskTable(data.risks), title: null }));
  if (list(data.evidence).length) output.push(`## ${evidenceTable(data.evidence).title}`, '', markdownTable({ ...evidenceTable(data.evidence), title: null }));
  return `${output.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function buildHtml(data, inputDir) {
  const report = data.report;
  const accent = normalizeColor(data.branding?.accent);
  const organization = data.branding?.organization || '';
  const logo = data.branding?.logo ? `<img class="logo" src="${escapeHtml(imageSource(data.branding.logo, inputDir))}" alt="${escapeHtml(organization || 'Organization logo')}">` : '';
  const meta = metadata(report).map(([label, value]) => `<div class="meta-label">${escapeHtml(label)}</div><div>${escapeHtml(value)}</div>`).join('');
  const contents = report.includeContents ? `<nav class="contents ${report.includeCover ? 'page-break-after' : ''}" aria-label="Table of contents"><h2>Contents</h2><ol>${data.sections.map((section) => `<li>${escapeHtml(section.title)}</li>`).join('')}${list(data.risks).length ? '<li>Risks, dependencies and decisions</li>' : ''}${list(data.evidence).length ? '<li>Evidence register</li>' : ''}</ol></nav>` : '';
  const coverClass = report.includeCover ? 'cover page-break-after' : 'cover compact';
  const body = data.sections.map((section) => sectionHtml(section, inputDir)).join('\n');
  const risks = list(data.risks).length ? `<section class="report-section"><h2>Risks, dependencies and decisions</h2>${htmlTable({ ...riskTable(data.risks), title: null })}</section>` : '';
  const evidence = list(data.evidence).length ? `<section class="report-section"><h2>Evidence register</h2>${htmlTable({ ...evidenceTable(data.evidence), title: null })}</section>` : '';
  const summary = list(data.executiveSummary).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const callouts = list(data.callouts).map(htmlCallout).join('');
  const css = `
    :root { --accent: ${accent}; --ink: #17202a; --muted: #5d6b7a; --navy: #10213c; --line: #d8dee8; --light: #f4f6f9; }
    * { box-sizing: border-box; }
    html { font-family: Inter, Aptos, Arial, sans-serif; color: var(--ink); background: white; }
    body { margin: 0; font-size: 10.5pt; line-height: 1.42; }
    main { max-width: 190mm; margin: 0 auto; padding: 15mm 14mm 18mm; }
    h1, h2, h3 { color: var(--navy); page-break-after: avoid; break-after: avoid; }
    h1 { font-size: 30pt; line-height: 1.05; margin: 16mm 0 5mm; }
    h2 { font-size: 18pt; margin: 9mm 0 3mm; padding-top: 1mm; }
    h3 { font-size: 12pt; margin: 5mm 0 2mm; color: var(--accent); }
    p { margin: 0 0 3mm; }
    ul { margin: 1mm 0 4mm 6mm; padding-left: 5mm; }
    li { margin: 0 0 1.4mm; }
    a { color: #1f5aa6; }
    .cover { min-height: 245mm; display: flex; flex-direction: column; justify-content: flex-start; }
    .cover.compact { min-height: auto; }
    .brand { color: var(--accent); font-weight: 700; letter-spacing: .04em; text-transform: uppercase; border-bottom: 2px solid var(--accent); padding-bottom: 3mm; }
    .logo { max-height: 18mm; max-width: 55mm; object-fit: contain; object-position: left center; margin-bottom: 3mm; }
    .subtitle { font-size: 14pt; color: var(--muted); margin-bottom: 10mm; }
    .metadata { display: grid; grid-template-columns: 38mm 1fr; border: 1px solid var(--line); margin-top: 7mm; }
    .metadata > div { padding: 3mm 4mm; border-bottom: 1px solid var(--line); }
    .metadata > div:nth-last-child(-n+2) { border-bottom: 0; }
    .meta-label { background: var(--light); color: var(--muted); font-weight: 700; }
    .contents { padding: 3mm 0 8mm; }
    .contents ol { columns: 2; column-gap: 15mm; padding-left: 7mm; }
    .section-subtitle { color: var(--muted); font-size: 11pt; margin-top: -1mm; }
    .callout { display: grid; grid-template-columns: max-content 1fr; gap: 4mm; margin: 4mm 0; padding: 4mm 5mm; border-left: 4px solid; break-inside: avoid; }
    .callout strong { text-transform: uppercase; }
    .callout.green { background: #e8f5f0; border-color: #13795b; }
    .callout.amber { background: #fff2d9; border-color: #b96a00; }
    .callout.red { background: #fdecec; border-color: #b42318; }
    .callout.blue { background: #eaf2fc; border-color: #1f5aa6; }
    .callout.neutral { background: var(--light); border-color: var(--muted); }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(38mm, 1fr)); gap: 2mm; margin: 4mm 0; }
    .metric { background: #f1edff; border-top: 3px solid var(--accent); padding: 4mm; min-height: 28mm; break-inside: avoid; }
    .metric-value { color: var(--accent); font-size: 22pt; font-weight: 800; }
    .metric-label { font-weight: 700; }
    .metric-detail, .metric-source { color: var(--muted); font-size: 8.5pt; margin-top: 1mm; }
    .table-wrap { overflow: hidden; margin: 3mm 0 5mm; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th { background: var(--navy); color: white; text-align: left; padding: 3mm; border: 1px solid #718096; }
    td { padding: 2.5mm 3mm; vertical-align: top; border: 1px solid var(--line); }
    tbody tr:nth-child(even) { background: var(--light); }
    figure { margin: 5mm 0; break-inside: avoid; text-align: center; }
    figure img { max-width: 100%; max-height: 150mm; object-fit: contain; }
    figcaption { color: var(--muted); font-style: italic; font-size: 9pt; margin-top: 2mm; }
    .report-section { break-inside: auto; }
    .page-break-after { break-after: page; page-break-after: always; }
    .footer { color: var(--muted); border-top: 1px solid var(--line); margin-top: 10mm; padding-top: 3mm; font-size: 8.5pt; }
    @page { size: A4; margin: 14mm; }
    @media screen { body { background: #e8ebf0; padding: 10mm 0; } main { background: white; box-shadow: 0 2px 12px rgba(0,0,0,.12); } }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } main { max-width: none; padding: 0; } }
  `;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(report.title)}</title><style>${css}</style></head>
<body><main>
<header class="${coverClass}">${logo}<div class="brand">${escapeHtml(organization || report.project || 'Delivery report')}</div><h1>${escapeHtml(report.title)}</h1><p class="subtitle">${escapeHtml(report.type || 'Delivery report')}</p><div class="metadata">${meta}</div></header>
${contents}
<section class="report-section"><h2>Executive position</h2>${summary}${callouts}${htmlMetrics(list(data.metrics))}</section>
${body}
${risks}
${evidence}
<footer class="footer">Status as at ${escapeHtml(report.statusDate)} | ${escapeHtml(report.timezone)}</footer>
</main></body></html>`;
}

function escapeXml(value) {
  return escapeHtml(value);
}

function fodtParagraph(value, style = 'Body') {
  return `<text:p text:style-name="${style}">${escapeXml(value)}</text:p>`;
}

function fodtTable(table, name) {
  const { columns, rows } = tableRows(table);
  const output = [];
  if (table.title) output.push(fodtParagraph(table.title, 'H2'));
  output.push(`<table:table table:name="${escapeXml(name)}" table:style-name="ReportTable">`);
  const columnStyles = new Set(['xsmall', 'small', 'medium', 'large', 'wide', 'label', 'value']);
  for (const column of columns) {
    const width = String(column.width || '').toLowerCase();
    const style = columnStyles.has(width) ? ` table:style-name="Column${width[0].toUpperCase()}${width.slice(1)}"` : '';
    output.push(`<table:table-column${style}/>`);
  }
  const repeatHeader = table.repeatHeader ?? rows.length > 4;
  if (repeatHeader) output.push('<table:table-header-rows>');
  output.push('<table:table-row table:style-name="RowKeep">');
  for (const column of columns) output.push(`<table:table-cell table:style-name="HeaderCell">${fodtParagraph(column.label, 'HeaderText')}</table:table-cell>`);
  output.push('</table:table-row>');
  if (repeatHeader) output.push('</table:table-header-rows>');
  rows.forEach((row, rowIndex) => {
    output.push('<table:table-row table:style-name="RowKeep">');
    row.forEach((cell) => output.push(`<table:table-cell table:style-name="${rowIndex % 2 ? 'AltCell' : 'BodyCell'}">${fodtParagraph(cell, 'CellText')}</table:table-cell>`));
    output.push('</table:table-row>');
  });
  output.push('</table:table>');
  return output.join('');
}

function fodtCallout(callout, name) {
  const tones = new Set(['green', 'amber', 'red', 'blue', 'neutral']);
  const tone = tones.has(String(callout.tone).toLowerCase()) ? String(callout.tone).toLowerCase() : 'neutral';
  const style = `Callout${tone[0].toUpperCase()}${tone.slice(1)}Cell`;
  return `<table:table table:name="${escapeXml(name)}" table:style-name="ReportTable"><table:table-column/><table:table-row><table:table-cell table:style-name="${style}"><text:p text:style-name="Body"><text:span text:style-name="Bold">${escapeXml(String(callout.label || 'Position').toUpperCase())}</text:span><text:span>  ${escapeXml(callout.text || '')}</text:span></text:p></table:table-cell></table:table-row></table:table>`;
}

function fodtMetrics(metrics, name) {
  if (!metrics.length) return '';
  const output = [`<table:table table:name="${escapeXml(name)}" table:style-name="ReportTable"><table:table-column table:number-columns-repeated="${metrics.length}"/><table:table-row table:style-name="RowKeep">`];
  for (const metric of metrics) {
    output.push(`<table:table-cell table:style-name="MetricCell">${fodtParagraph(metric.value, 'MetricValue')}${fodtParagraph(metric.label, 'MetricLabel')}${metric.detail ? fodtParagraph(metric.detail, 'MetricDetail') : ''}${metric.source ? fodtParagraph(`Source: ${metric.source}`, 'MetricDetail') : ''}</table:table-cell>`);
  }
  output.push('</table:table-row></table:table>');
  return output.join('');
}

function fodtImage(item, inputDir, index) {
  let source = item.path;
  if (!source) fail('an image is missing its path');
  let type;
  let base64;
  if (/^data:/i.test(source)) {
    const match = source.match(/^data:([^;,]+);base64,(.+)$/i);
    requireValue(match, 'FODT images supplied as data URLs must use base64');
    type = match[1];
    base64 = match[2];
  } else if (/^https?:\/\//i.test(source)) {
    return `${fodtParagraph(`[External image: ${source}]`, 'Muted')}${item.caption ? fodtParagraph(item.caption, 'Caption') : ''}`;
  } else {
    const absolute = path.resolve(inputDir, source);
    requireValue(fs.existsSync(absolute), `image not found: ${absolute}`);
    type = mimeType(absolute);
    base64 = fs.readFileSync(absolute).toString('base64');
  }
  const width = Number(item.widthCm || 16);
  const height = Number(item.heightCm || 9);
  requireValue(Number.isFinite(width) && width > 0, 'image widthCm must be a positive number');
  requireValue(Number.isFinite(height) && height > 0, 'image heightCm must be a positive number');
  return `<text:p text:style-name="Image"><draw:frame draw:style-name="ImageFrame" draw:name="Evidence${index}" text:anchor-type="as-char" svg:width="${width}cm" svg:height="${height}cm"><draw:image draw:mime-type="${escapeXml(type)}"><office:binary-data>${base64}</office:binary-data></draw:image></draw:frame></text:p>${item.caption ? fodtParagraph(item.caption, 'Caption') : ''}`;
}

function buildFodt(data, inputDir) {
  const report = data.report;
  const accent = normalizeColor(data.branding?.accent);
  const organization = data.branding?.organization || report.project || 'Delivery report';
  const output = [];
  let tableIndex = 0;
  let imageIndex = 0;
  const nextTable = (prefix) => `${prefix}${++tableIndex}`;

  output.push(fodtParagraph(organization.toUpperCase(), 'Brand'));
  output.push(fodtParagraph(report.title, 'Title'));
  output.push(fodtParagraph(report.type || 'Delivery report', 'Subtitle'));
  output.push(fodtTable({ columns: [{ label: 'Field', width: 'label' }, { label: 'Value', width: 'value' }], rows: metadata(report) }, nextTable('Metadata')));
  if (report.includeCover) output.push(fodtParagraph('', 'PageBreak'));

  if (report.includeContents) {
    output.push(fodtParagraph('Contents', 'H1'));
    const entries = [...data.sections.map((section) => section.title)];
    if (list(data.risks).length) entries.push('Risks, dependencies and decisions');
    if (list(data.evidence).length) entries.push('Evidence register');
    entries.forEach((entry, index) => output.push(fodtParagraph(`${index + 1}. ${entry}`, 'Contents')));
    output.push(fodtParagraph('', 'PageBreak'));
  }

  output.push(fodtParagraph('Executive position', 'H1'));
  for (const paragraph of list(data.executiveSummary)) output.push(fodtParagraph(paragraph));
  for (const callout of list(data.callouts)) output.push(fodtCallout(callout, nextTable('Callout')));
  output.push(fodtMetrics(list(data.metrics), nextTable('Metrics')));

  for (const section of data.sections) {
    output.push(fodtParagraph(section.title, 'H1'));
    if (section.subtitle) output.push(fodtParagraph(section.subtitle, 'Muted'));
    for (const callout of list(section.callouts)) output.push(fodtCallout(callout, nextTable('Callout')));
    output.push(fodtMetrics(list(section.metrics), nextTable('Metrics')));
    for (const paragraph of list(section.paragraphs)) output.push(fodtParagraph(paragraph));
    const bullets = list(section.bullets);
    if (bullets.length) {
      output.push('<text:list text:style-name="BulletList">');
      for (const bullet of bullets) output.push(`<text:list-item>${fodtParagraph(bullet)}</text:list-item>`);
      output.push('</text:list>');
    }
    for (const table of list(section.tables)) output.push(fodtTable(table, nextTable('Table')));
    for (const image of list(section.images)) output.push(fodtImage(image, inputDir, ++imageIndex));
  }

  if (list(data.risks).length) {
    output.push(fodtParagraph('Risks, dependencies and decisions', 'H1'));
    output.push(fodtTable({ ...riskTable(data.risks), title: null }, nextTable('Risks')));
  }
  if (list(data.evidence).length) {
    const evidenceContent = `${fodtParagraph('Evidence register', 'H1')}${fodtTable({ ...evidenceTable(data.evidence), title: null }, nextTable('Evidence'))}`;
    if (list(data.evidence).length <= 4) {
      output.push(`<table:table table:name="${nextTable('EvidenceSection')}" table:style-name="ReportTable"><table:table-column/><table:table-row table:style-name="RowKeep"><table:table-cell table:style-name="SectionCell">${evidenceContent}</table:table-cell></table:table-row></table:table>`);
    } else {
      output.push(evidenceContent);
    }
  }
  output.push(fodtParagraph(`Status as at ${report.statusDate} | ${report.timezone}`, 'Footer'));

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document office:version="1.3" office:mimetype="application/vnd.oasis.opendocument.text"
 xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
 xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
 xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
 xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">
<office:styles>
 <style:default-style style:family="paragraph"><style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.25cm" fo:line-height="115%"/><style:text-properties style:font-name="Arial" fo:font-family="Arial" fo:font-size="10.5pt" fo:color="#17202A"/></style:default-style>
 <style:style style:name="Body" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.28cm"/></style:style>
 <style:style style:name="Brand" style:family="paragraph"><style:paragraph-properties fo:border-bottom="0.04cm solid ${accent}" fo:padding-bottom="0.2cm" fo:margin-bottom="1.2cm"/><style:text-properties fo:color="${accent}" fo:font-weight="bold" fo:font-size="10pt"/></style:style>
 <style:style style:name="Title" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.8cm" fo:margin-bottom="0.3cm"/><style:text-properties fo:font-size="28pt" fo:font-weight="bold" fo:color="#10213C"/></style:style>
 <style:style style:name="Subtitle" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="1cm"/><style:text-properties fo:font-size="14pt" fo:color="#5D6B7A"/></style:style>
 <style:style style:name="H1" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.65cm" fo:margin-bottom="0.3cm" fo:padding-top="0.15cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="18pt" fo:font-weight="bold" fo:color="#10213C"/></style:style>
 <style:style style:name="H2" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.2cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="${accent}"/></style:style>
 <style:style style:name="Muted" style:family="paragraph"><style:text-properties fo:font-size="10pt" fo:color="#5D6B7A"/></style:style>
 <style:style style:name="Contents" style:family="paragraph"><style:paragraph-properties fo:margin-left="0.4cm" fo:margin-bottom="0.28cm"/><style:text-properties fo:font-size="11pt"/></style:style>
 <style:style style:name="CellText" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0cm"/><style:text-properties fo:font-size="8.5pt"/></style:style>
 <style:style style:name="HeaderText" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0cm"/><style:text-properties fo:font-size="8.5pt" fo:font-weight="bold" fo:color="#FFFFFF"/></style:style>
 <style:style style:name="MetricValue" style:family="paragraph"><style:text-properties fo:font-size="20pt" fo:font-weight="bold" fo:color="${accent}"/></style:style>
 <style:style style:name="MetricLabel" style:family="paragraph"><style:text-properties fo:font-size="10pt" fo:font-weight="bold"/></style:style>
 <style:style style:name="MetricDetail" style:family="paragraph"><style:text-properties fo:font-size="8pt" fo:color="#5D6B7A"/></style:style>
 <style:style style:name="Caption" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.35cm"/><style:text-properties fo:font-size="8.5pt" fo:font-style="italic" fo:color="#5D6B7A"/></style:style>
 <style:style style:name="Image" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.35cm" fo:margin-bottom="0.15cm"/></style:style>
 <style:style style:name="Footer" style:family="paragraph"><style:paragraph-properties fo:border-top="0.02cm solid #D8DEE8" fo:padding-top="0.2cm" fo:margin-top="0.8cm"/><style:text-properties fo:font-size="8pt" fo:color="#5D6B7A"/></style:style>
 <style:style style:name="PageBreak" style:family="paragraph"><style:paragraph-properties fo:break-before="page"/></style:style>
 <style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
 <text:list-style style:name="BulletList"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties text:space-before="0.6cm" text:min-label-width="0.6cm"/></text:list-level-style-bullet></text:list-style>
</office:styles>
<office:automatic-styles>
 <style:style style:name="ReportTable" style:family="table"><style:table-properties style:width="17cm" table:align="margins" fo:margin-top="0.2cm" fo:margin-bottom="0.4cm"/></style:style>
 <style:style style:name="ColumnXsmall" style:family="table-column"><style:table-column-properties style:column-width="1.3cm"/></style:style>
 <style:style style:name="ColumnSmall" style:family="table-column"><style:table-column-properties style:column-width="2cm"/></style:style>
 <style:style style:name="ColumnMedium" style:family="table-column"><style:table-column-properties style:column-width="3cm"/></style:style>
 <style:style style:name="ColumnLarge" style:family="table-column"><style:table-column-properties style:column-width="4.3cm"/></style:style>
 <style:style style:name="ColumnWide" style:family="table-column"><style:table-column-properties style:column-width="6cm"/></style:style>
 <style:style style:name="ColumnLabel" style:family="table-column"><style:table-column-properties style:column-width="3.8cm"/></style:style>
 <style:style style:name="ColumnValue" style:family="table-column"><style:table-column-properties style:column-width="12.8cm"/></style:style>
 <style:style style:name="RowKeep" style:family="table-row"><style:table-row-properties fo:keep-together="always"/></style:style>
 <style:style style:name="HeaderCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#10213C" fo:border="0.02cm solid #718096" fo:padding="0.22cm" style:vertical-align="middle"/></style:style>
 <style:style style:name="BodyCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#FFFFFF" fo:border="0.02cm solid #D8DEE8" fo:padding="0.2cm" style:vertical-align="top"/></style:style>
 <style:style style:name="AltCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#F4F6F9" fo:border="0.02cm solid #D8DEE8" fo:padding="0.2cm" style:vertical-align="top"/></style:style>
 <style:style style:name="SectionCell" style:family="table-cell"><style:table-cell-properties fo:border="none" fo:padding="0cm" style:vertical-align="top"/></style:style>
 <style:style style:name="MetricCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#F1EDFF" fo:border-top="0.08cm solid ${accent}" fo:border-left="0.02cm solid #FFFFFF" fo:border-right="0.02cm solid #FFFFFF" fo:border-bottom="0.02cm solid #FFFFFF" fo:padding="0.3cm" style:vertical-align="top"/></style:style>
 <style:style style:name="CalloutGreenCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#E8F5F0" fo:border-left="0.1cm solid #13795B" fo:padding="0.35cm"/></style:style>
 <style:style style:name="CalloutAmberCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#FFF2D9" fo:border-left="0.1cm solid #B96A00" fo:padding="0.35cm"/></style:style>
 <style:style style:name="CalloutRedCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#FDECEC" fo:border-left="0.1cm solid #B42318" fo:padding="0.35cm"/></style:style>
 <style:style style:name="CalloutBlueCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#EAF2FC" fo:border-left="0.1cm solid #1F5AA6" fo:padding="0.35cm"/></style:style>
 <style:style style:name="CalloutNeutralCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#F4F6F9" fo:border-left="0.1cm solid #5D6B7A" fo:padding="0.35cm"/></style:style>
 <style:style style:name="ImageFrame" style:family="graphic"><style:graphic-properties style:run-through="foreground" style:wrap="none" draw:ole-draw-aspect="1"/></style:style>
 <style:page-layout style:name="PageLayout"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" style:print-orientation="portrait" fo:margin-top="1.4cm" fo:margin-bottom="1.5cm" fo:margin-left="1.5cm" fo:margin-right="1.5cm"/></style:page-layout>
</office:automatic-styles>
<office:master-styles><style:master-page style:name="Standard" style:page-layout-name="PageLayout"/></office:master-styles>
<office:body><office:text>${output.join('')}</office:text></office:body>
</office:document>`;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(args.input);
requireValue(fs.existsSync(inputPath), `input not found: ${inputPath}`);
let data;
try {
  data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (error) {
  fail(`invalid JSON in ${inputPath}: ${error.message}`);
}

requireValue(data.schemaVersion === 1, 'schemaVersion must be 1');
requireValue(data.report && data.report.title, 'report.title is required');
requireValue(data.report.statusDate, 'report.statusDate is required');
requireValue(data.report.timezone, 'report.timezone is required');
requireValue(data.report.audience, 'report.audience is required');
requireValue(Array.isArray(data.sections), 'sections must be an array');
for (const section of data.sections) requireValue(section.title, 'every section needs a title');
for (const risk of list(data.risks)) {
  for (const field of ['rating', 'item', 'impact', 'owner', 'action']) requireValue(risk[field], `every risk needs ${field}`);
}
for (const item of list(data.evidence)) {
  for (const field of ['source', 'statement', 'type']) requireValue(item[field], `every evidence item needs ${field}`);
}

const inputDir = path.dirname(inputPath);
const outDir = path.resolve(args.outDir || inputDir);
const baseName = slugify(args.name || data.report.filename || `${data.report.statusDate}-${data.report.type || data.report.title}`);
fs.mkdirSync(outDir, { recursive: true });
const markdownPath = path.join(outDir, `${baseName}.md`);
const htmlPath = path.join(outDir, `${baseName}.html`);
const fodtPath = path.join(outDir, `${baseName}.fodt`);
fs.writeFileSync(markdownPath, buildMarkdown(data), 'utf8');
fs.writeFileSync(htmlPath, buildHtml(data, inputDir), 'utf8');
fs.writeFileSync(fodtPath, buildFodt(data, inputDir), 'utf8');
console.log(JSON.stringify({ markdown: markdownPath, html: htmlPath, fodt: fodtPath }, null, 2));
