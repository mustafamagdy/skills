const STATUS_COLORS = {
  complete: '#4E7FAF',
  active: '#173B61',
  upcoming: '#D2AA2E',
  hypercare: '#6C97BF'
};

const COLORS = {
  navy: '#102746',
  muted: '#607086',
  grid: '#D7E0EA',
  group: '#E9EEF4',
  band: '#F0F4F8',
  gold: '#D4AF37',
  red: '#C62828',
  redLight: '#FCE9E8',
  white: '#FFFFFF'
};

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeColor(value, fallback) {
  const color = String(value ?? '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : fallback;
}

function fitText(value, maxChars) {
  const text = String(value ?? '');
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function validateRange(value, minimum, maximum, label) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}`);
  }
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateGantt(schedule) {
  if (!schedule || typeof schedule !== 'object') throw new Error('schedule must be an object');
  if (!schedule.title) throw new Error('schedule.title is required');
  if (!schedule.statusDate) throw new Error('schedule.statusDate is required');
  if (!isIsoDate(schedule.statusDate)) throw new Error('schedule.statusDate must be an ISO date in YYYY-MM-DD format');
  if (!Array.isArray(schedule.periods) || schedule.periods.length < 2) {
    throw new Error('schedule.periods must contain at least two periods');
  }
  if (schedule.periods.length > 26) throw new Error('schedule.periods supports at most 26 periods on one A3 page');
  const periodCount = schedule.periods.length;
  validateRange(schedule.statusPeriod, 1, periodCount, 'schedule.statusPeriod');
  if (!Array.isArray(schedule.workstreams) || schedule.workstreams.length === 0) {
    throw new Error('schedule.workstreams must contain at least one workstream');
  }
  const itemIds = new Set();
  const itemCount = schedule.workstreams.reduce((total, workstream) => {
    if (!workstream.name) throw new Error('every schedule workstream needs a name');
    if (!Array.isArray(workstream.items) || workstream.items.length === 0) {
      throw new Error(`schedule workstream "${workstream.name}" must contain items`);
    }
    for (const item of workstream.items) {
      if (!item.id || !item.name) throw new Error('every schedule item needs id and name');
      if (itemIds.has(item.id)) throw new Error(`duplicate schedule item id: ${item.id}`);
      itemIds.add(item.id);
      validateRange(item.start, 1, periodCount, `schedule item ${item.id} start`);
      validateRange(item.end, 1, periodCount, `schedule item ${item.id} end`);
      if (item.end < item.start) throw new Error(`schedule item ${item.id} end must not precede start`);
      if (!STATUS_COLORS[item.status]) {
        throw new Error(`schedule item ${item.id} status must be complete, active, upcoming, or hypercare`);
      }
    }
    return total + workstream.items.length;
  }, 0);
  if (itemCount > 32) throw new Error('schedule supports at most 32 task rows on one A3 page');
  for (const phase of list(schedule.phases)) {
    if (!phase.label) throw new Error('every schedule phase needs a label');
    validateRange(phase.start, 1, periodCount, `schedule phase ${phase.label} start`);
    validateRange(phase.end, 1, periodCount, `schedule phase ${phase.label} end`);
    if (phase.end < phase.start) throw new Error(`schedule phase ${phase.label} end must not precede start`);
  }
  const milestoneIds = new Set();
  for (const milestone of list(schedule.milestones)) {
    if (!milestone.id) throw new Error('every schedule milestone needs an id');
    if (milestoneIds.has(milestone.id)) throw new Error(`duplicate schedule milestone id: ${milestone.id}`);
    milestoneIds.add(milestone.id);
    validateRange(milestone.period, 1, periodCount, `schedule milestone ${milestone.id} period`);
  }
  return { periodCount, itemCount };
}

function text(x, y, value, options = {}) {
  const {
    size = 14,
    weight = 400,
    fill = COLORS.navy,
    anchor = 'start',
    family = 'Inter, Aptos, Arial, sans-serif',
    letterSpacing = 0
  } = options;
  return `<text x="${x}" y="${y}" font-family="${escapeXml(family)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${escapeXml(value)}</text>`;
}

function rect(x, y, width, height, fill, options = {}) {
  const { radius = 0, stroke = 'none', strokeWidth = 0, opacity = 1 } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

function line(x1, y1, x2, y2, options = {}) {
  const { stroke = COLORS.grid, width = 1, dash = '' } = options;
  const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${dashAttribute}/>`;
}

function statusLegend(x, y, width, height) {
  const entries = [
    ['complete', 'Completed work'],
    ['active', 'Active work'],
    ['upcoming', 'Upcoming work'],
    ['client', 'Client dependency'],
    ['current', 'Current date']
  ];
  const cellWidth = width / entries.length;
  const output = [];
  entries.forEach(([kind, label], index) => {
    const cellX = x + index * cellWidth;
    const fill = kind === 'client' || kind === 'current' ? COLORS.redLight : STATUS_COLORS[kind];
    const foreground = kind === 'client' || kind === 'current' ? COLORS.red : COLORS.white;
    output.push(rect(cellX, y, cellWidth - 2, height, fill));
    output.push(text(cellX + cellWidth / 2, y + height * 0.66, label, { size: 11, weight: 700, fill: foreground, anchor: 'middle' }));
  });
  return output.join('');
}

export function buildGanttSvg(schedule, context = {}) {
  const { periodCount, itemCount } = validateGantt(schedule);
  const width = 1600;
  const height = 1131;
  const margin = 34;
  const leftWidth = 520;
  const codeWidth = 52;
  const timelineX = margin + leftWidth;
  const timelineWidth = width - margin * 2 - leftWidth;
  const periodWidth = timelineWidth / periodCount;
  const phaseY = 142;
  const phaseHeight = 34;
  const markerY = 180;
  const markerHeight = 40;
  const headerY = 222;
  const headerHeight = 44;
  const chartBottom = 1055;
  const sourceY = 1096;
  const rowBudget = chartBottom - (headerY + headerHeight);
  const groupWeight = 0.82;
  const weightedRows = itemCount + schedule.workstreams.length * groupWeight;
  const itemHeight = Math.min(30, Math.max(19, rowBudget / weightedRows));
  const groupHeight = itemHeight * groupWeight;
  const chartHeight = itemCount * itemHeight + schedule.workstreams.length * groupHeight;
  const actualBottom = headerY + headerHeight + chartHeight;
  const parts = [];
  const accent = normalizeColor(context.accent, '#5B34E6');

  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="gantt-title gantt-desc">`);
  parts.push(`<title id="gantt-title">${escapeXml(schedule.title)}</title>`);
  parts.push(`<desc id="gantt-desc">Task-level delivery schedule with phase bands, milestone lines, and a current status line.</desc>`);
  parts.push(rect(0, 0, width, height, COLORS.white));
  parts.push(text(margin, 29, String(context.organization || '').toUpperCase(), { size: 11, weight: 700, fill: COLORS.muted }));
  parts.push(line(margin, 39, width - margin, 39, { stroke: accent, width: 2 }));
  parts.push(text(margin, 72, schedule.title, { size: 29, weight: 800 }));
  const subtitle = schedule.subtitle || `${periodCount} periods | Status as at ${schedule.statusDate}`;
  parts.push(text(margin, 96, subtitle, { size: 13, fill: COLORS.muted }));
  parts.push(statusLegend(margin, 108, width - margin * 2, 27));

  // Phase bands.
  parts.push(rect(margin, phaseY, leftWidth - 2, phaseHeight, COLORS.white));
  for (const phase of list(schedule.phases)) {
    const x = timelineX + (phase.start - 1) * periodWidth;
    const bandWidth = (phase.end - phase.start + 1) * periodWidth - 2;
    const fill = normalizeColor(phase.color, accent);
    parts.push(rect(x, phaseY, bandWidth, phaseHeight, fill, { radius: 2 }));
    parts.push(text(x + bandWidth / 2, phaseY + 22, fitText(phase.label.toUpperCase(), Math.max(8, Math.floor(bandWidth / 8))), { size: 11, weight: 700, fill: COLORS.white, anchor: 'middle' }));
  }

  // Milestone labels and current status marker.
  for (const milestone of list(schedule.milestones)) {
    const x = timelineX + milestone.period * periodWidth;
    parts.push(text(x - 4, markerY + 12, milestone.id, { size: 11, weight: 800, fill: '#B58B11', anchor: 'middle' }));
    parts.push(`<path d="M ${x - 9} ${markerY + 25} L ${x - 4} ${markerY + 20} L ${x + 1} ${markerY + 25} L ${x - 4} ${markerY + 30} Z" fill="#C59A1D"/>`);
    parts.push(line(x, markerY + 20, x, actualBottom, { stroke: COLORS.gold, width: 1.5, dash: '7 6' }));
  }
  const currentX = timelineX + schedule.statusPeriod * periodWidth;
  const sharesMilestone = list(schedule.milestones).some((milestone) => milestone.period === schedule.statusPeriod);
  parts.push(text(currentX - (sharesMilestone ? 26 : 7), markerY + 12, 'TODAY', { size: 10, weight: 800, fill: COLORS.red, anchor: sharesMilestone ? 'end' : 'middle' }));
  parts.push(`<path d="M ${currentX - 12} ${markerY + 22} L ${currentX - 2} ${markerY + 22} L ${currentX - 7} ${markerY + 30} Z" fill="${COLORS.red}"/>`);
  parts.push(line(currentX, markerY + 20, currentX, actualBottom, { stroke: COLORS.red, width: 3 }));

  // Header and time grid.
  parts.push(rect(margin, headerY, leftWidth, headerHeight, COLORS.navy));
  parts.push(text(margin + 19, headerY + 28, 'ID', { size: 10, weight: 700, fill: COLORS.white, anchor: 'middle' }));
  parts.push(text(margin + codeWidth + 10, headerY + 28, 'DELIVERABLE / WORK PACKAGE', { size: 11, weight: 700, fill: COLORS.white }));
  for (let index = 0; index < periodCount; index += 1) {
    const period = schedule.periods[index];
    const x = timelineX + index * periodWidth;
    parts.push(rect(x, headerY, periodWidth, headerHeight, COLORS.navy));
    parts.push(text(x + periodWidth / 2, headerY + 18, period.label || `P${index + 1}`, { size: 9, weight: 700, fill: COLORS.white, anchor: 'middle' }));
    if (period.date) parts.push(text(x + periodWidth / 2, headerY + 33, period.date, { size: 7.5, weight: 600, fill: COLORS.white, anchor: 'middle' }));
  }
  parts.push(line(margin + codeWidth, headerY, margin + codeWidth, actualBottom, { stroke: COLORS.grid, width: 1 }));
  parts.push(line(timelineX, headerY, timelineX, actualBottom, { stroke: COLORS.grid, width: 1 }));

  let y = headerY + headerHeight;
  let taskIndex = 0;
  for (const workstream of schedule.workstreams) {
    parts.push(rect(margin, y, width - margin * 2, groupHeight, COLORS.group));
    parts.push(text(margin + 5, y + groupHeight * 0.68, workstream.name.toUpperCase(), { size: 11, weight: 800 }));
    parts.push(line(margin, y + groupHeight, width - margin, y + groupHeight, { stroke: COLORS.grid, width: 0.8 }));
    y += groupHeight;
    for (const item of workstream.items) {
      const rowFill = taskIndex % 2 ? '#FBFCFE' : COLORS.white;
      parts.push(rect(margin, y, leftWidth, itemHeight, rowFill));
      for (let index = 0; index < periodCount; index += 1) {
        const x = timelineX + index * periodWidth;
        const sprintBand = Math.floor(index / 2) % 2;
        parts.push(rect(x, y, periodWidth, itemHeight, sprintBand ? COLORS.band : rowFill));
      }
      const codeColor = item.critical ? COLORS.red : COLORS.muted;
      const codePrefix = item.critical ? '● ' : '';
      parts.push(text(margin + 18, y + itemHeight * 0.67, `${codePrefix}${item.id}`, { size: 9.5, fill: codeColor }));
      parts.push(text(margin + codeWidth + 6, y + itemHeight * 0.67, fitText(item.name, 68), { size: 10.5 }));
      const barX = timelineX + (item.start - 1) * periodWidth + 1;
      const barWidth = (item.end - item.start + 1) * periodWidth - 2;
      const barY = y + itemHeight * 0.19;
      const barHeight = itemHeight * 0.62;
      const fill = normalizeColor(item.color, STATUS_COLORS[item.status]);
      parts.push(rect(barX, barY, barWidth, barHeight, fill, { radius: 2 }));
      if (item.duration) parts.push(text(barX + barWidth / 2, barY + barHeight * 0.72, item.duration, { size: 8.5, weight: 800, fill: COLORS.white, anchor: 'middle' }));
      parts.push(line(margin, y + itemHeight, width - margin, y + itemHeight, { stroke: COLORS.grid, width: 0.6 }));
      y += itemHeight;
      taskIndex += 1;
    }
  }

  for (let index = 0; index <= periodCount; index += 1) {
    const x = timelineX + index * periodWidth;
    parts.push(line(x, headerY, x, actualBottom, { stroke: COLORS.grid, width: 0.65 }));
  }
  // Redraw overlay rules so they remain visible over bars.
  for (const milestone of list(schedule.milestones)) {
    const x = timelineX + milestone.period * periodWidth;
    parts.push(line(x, markerY + 20, x, actualBottom, { stroke: COLORS.gold, width: 1.5, dash: '7 6' }));
  }
  parts.push(line(currentX, markerY + 20, currentX, actualBottom, { stroke: COLORS.red, width: 3 }));

  const source = schedule.source || context.source || '';
  const note = schedule.note || 'Bars show planned timing; milestone and current-date lines are drawn from the approved baseline and reporting cutoff.';
  parts.push(text(margin, actualBottom + 22, fitText(note, 205), { size: 9.5, weight: 600 }));
  if (source) parts.push(text(margin, sourceY, fitText(`Source: ${source}`, 225), { size: 8.5, fill: COLORS.muted }));
  parts.push(text(width - margin, sourceY, 'A3 landscape', { size: 8.5, fill: COLORS.muted, anchor: 'end' }));
  parts.push('</svg>');
  return parts.join('');
}

export function ganttMarkdown(schedule) {
  validateGantt(schedule);
  const output = [`## ${schedule.title}`, '', schedule.subtitle || `Status as at ${schedule.statusDate}`, ''];
  for (const workstream of schedule.workstreams) {
    output.push(`### ${workstream.name}`, '', '| ID | Deliverable | Period | Status |', '|---|---|---|---|');
    for (const item of workstream.items) {
      output.push(`| ${String(item.id).replaceAll('|', '\\|')} | ${String(item.name).replaceAll('|', '\\|')} | ${item.start}-${item.end} | ${item.status} |`);
    }
    output.push('');
  }
  return output.join('\n');
}
