const STATUS_COLORS = {
  complete: '#4E7FAF',
  active: '#173B61',
  upcoming: '#D2AA2E',
  hypercare: '#6C97BF'
};

const COLORS = {
  navy: '#173A5E',
  muted: '#607086',
  grid: '#B9BEC4',
  group: '#F7E9C7',
  band: '#F2F2F2',
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
  const margin = 30;
  const idWidth = 45;
  const phaseWidth = 64;
  const taskWidth = 365;
  const ownerWidth = 136;
  const startWidth = 45;
  const endWidth = 45;
  const leftWidth = idWidth + phaseWidth + taskWidth + ownerWidth + startWidth + endWidth;
  const timelineX = margin + leftWidth;
  const timelineWidth = width - margin * 2 - leftWidth;
  const periodWidth = timelineWidth / periodCount;
  const phaseY = 88;
  const phaseHeight = 30;
  const markerY = 120;
  const markerHeight = 34;
  const headerY = 156;
  const headerHeight = 36;
  const sprintY = headerY + headerHeight;
  const sprintHeight = 24;
  const chartStart = sprintY + sprintHeight;
  const chartBottom = 1037;
  const sourceY = 1106;
  const rowBudget = chartBottom - chartStart;
  const groupWeight = 0.9;
  const weightedRows = itemCount + schedule.workstreams.length * groupWeight;
  const itemHeight = Math.min(40, Math.max(18, rowBudget / weightedRows));
  const groupHeight = itemHeight * groupWeight;
  const chartHeight = itemCount * itemHeight + schedule.workstreams.length * groupHeight;
  const actualBottom = chartStart + chartHeight;
  const parts = [];
  const accent = normalizeColor(context.accent, '#5B34E6');

  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="gantt-title gantt-desc">`);
  parts.push(`<title id="gantt-title">${escapeXml(schedule.title)}</title>`);
  parts.push(`<desc id="gantt-desc">Task-level delivery schedule with phase bands, milestone lines, and a current status line.</desc>`);
  parts.push(rect(0, 0, width, height, COLORS.white));
  parts.push(text(width / 2, 34, schedule.title, { size: 27, weight: 800, anchor: 'middle' }));
  const subtitle = schedule.subtitle || `${periodCount} periods | Status as at ${schedule.statusDate}`;
  parts.push(text(width / 2, 58, subtitle, { size: 12.5, fill: COLORS.muted, anchor: 'middle' }));
  if (context.organization) parts.push(text(width - margin, 34, String(context.organization).toUpperCase(), { size: 10.5, weight: 700, fill: COLORS.muted, anchor: 'end' }));

  // Phase bands.
  parts.push(rect(margin, phaseY, leftWidth, phaseHeight, COLORS.white, { stroke: 'none' }));
  for (const phase of list(schedule.phases)) {
    const x = timelineX + (phase.start - 1) * periodWidth;
    const bandWidth = (phase.end - phase.start + 1) * periodWidth - 2;
    const fill = normalizeColor(phase.color, accent);
    parts.push(rect(x, phaseY, bandWidth, phaseHeight, fill, { radius: 2 }));
    parts.push(text(x + bandWidth / 2, phaseY + 20, fitText(phase.label, Math.max(7, Math.floor(bandWidth / 5.6))), { size: 9, weight: 700, fill: COLORS.white, anchor: 'middle' }));
  }

  // Milestone labels and current status marker.
  for (const milestone of list(schedule.milestones)) {
    const x = timelineX + milestone.period * periodWidth;
    parts.push(text(x, markerY + 11, milestone.id, { size: 10.5, weight: 800, fill: '#B58B11', anchor: 'middle' }));
    parts.push(`<path d="M ${x - 6} ${markerY + 22} L ${x} ${markerY + 16} L ${x + 6} ${markerY + 22} L ${x} ${markerY + 28} Z" fill="#C59A1D"/>`);
    parts.push(line(x, markerY + 16, x, actualBottom, { stroke: COLORS.gold, width: 1.4, dash: '6 5' }));
  }
  const currentX = timelineX + schedule.statusPeriod * periodWidth;
  const sharesMilestone = list(schedule.milestones).some((milestone) => milestone.period === schedule.statusPeriod);
  parts.push(text(currentX - (sharesMilestone ? 11 : 0), markerY + 11, 'TODAY', { size: 9.5, weight: 800, fill: COLORS.red, anchor: sharesMilestone ? 'end' : 'middle' }));
  parts.push(`<path d="M ${currentX - 6} ${markerY + 18} L ${currentX + 6} ${markerY + 18} L ${currentX} ${markerY + 28} Z" fill="${COLORS.red}"/>`);
  parts.push(line(currentX, markerY + 18, currentX, actualBottom, { stroke: COLORS.red, width: 3 }));

  // Header and time grid.
  const leftColumns = [
    ['ID', idWidth, 'middle'],
    ['Phase', phaseWidth, 'middle'],
    ['Activity / Work Package', taskWidth, 'middle'],
    ['Owner', ownerWidth, 'middle'],
    ['Start', startWidth, 'middle'],
    ['End', endWidth, 'middle']
  ];
  let leftX = margin;
  for (const [label, columnWidth] of leftColumns) {
    parts.push(rect(leftX, headerY, columnWidth, headerHeight, COLORS.navy, { stroke: COLORS.white, strokeWidth: 0.7 }));
    parts.push(text(leftX + columnWidth / 2, headerY + 23, label, { size: 10, weight: 700, fill: COLORS.white, anchor: 'middle' }));
    leftX += columnWidth;
  }
  for (let index = 0; index < periodCount; index += 1) {
    const period = schedule.periods[index];
    const x = timelineX + index * periodWidth;
    parts.push(rect(x, headerY, periodWidth, headerHeight, COLORS.navy, { stroke: COLORS.white, strokeWidth: 0.7 }));
    parts.push(text(x + periodWidth / 2, headerY + 15, period.label || `P${index + 1}`, { size: 8.5, weight: 700, fill: COLORS.white, anchor: 'middle' }));
    if (period.date) parts.push(text(x + periodWidth / 2, headerY + 29, period.date, { size: 6.8, weight: 600, fill: COLORS.white, anchor: 'middle' }));
  }

  // Two-week sprint bands, matching the planning workbook convention.
  parts.push(rect(margin, sprintY, leftWidth, sprintHeight, COLORS.white));
  const sprintBands = list(schedule.sprints).length
    ? schedule.sprints
    : Array.from({ length: Math.ceil(periodCount / 2) }, (_, index) => ({ label: `Sprint ${index + 1}`, start: index * 2 + 1, end: Math.min(periodCount, index * 2 + 2) }));
  for (const sprint of sprintBands) {
    const x = timelineX + (sprint.start - 1) * periodWidth;
    const bandWidth = (sprint.end - sprint.start + 1) * periodWidth;
    parts.push(rect(x, sprintY, bandWidth, sprintHeight, '#F7E9C7'));
    parts.push(text(x + bandWidth / 2, sprintY + 16, fitText(sprint.label, Math.max(7, Math.floor(bandWidth / 7))), { size: 8.5, weight: 700, anchor: 'middle' }));
  }

  let y = chartStart;
  let taskIndex = 0;
  for (const workstream of schedule.workstreams) {
    parts.push(rect(margin, y, width - margin * 2, groupHeight, COLORS.group));
    parts.push(text(margin + idWidth + 4, y + groupHeight * 0.68, fitText(workstream.name, 64), { size: 10.5, weight: 800 }));
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
      const startLabel = item.startLabel || schedule.periods[item.start - 1]?.label || item.start;
      const endLabel = item.endLabel || schedule.periods[item.end - 1]?.label || item.end;
      const cells = [
        [`${codePrefix}${item.id}`, margin + 5, idWidth - 8, codeColor, 'start'],
        [item.phase || '', margin + idWidth + phaseWidth / 2, phaseWidth - 8, COLORS.ink || COLORS.navy, 'middle'],
        [item.name, margin + idWidth + phaseWidth + 5, taskWidth - 8, COLORS.navy, 'start'],
        [item.owner || '', margin + idWidth + phaseWidth + taskWidth + 5, ownerWidth - 8, COLORS.navy, 'start'],
        [startLabel, margin + idWidth + phaseWidth + taskWidth + ownerWidth + startWidth / 2, startWidth - 6, COLORS.navy, 'middle'],
        [endLabel, margin + leftWidth - endWidth / 2, endWidth - 6, COLORS.navy, 'middle']
      ];
      for (const [value, cellX, cellWidth, fill, anchor] of cells) {
        const maxChars = Math.max(4, Math.floor(cellWidth / 6.4));
        parts.push(text(cellX, y + itemHeight * 0.67, fitText(value, maxChars), { size: 9.1, fill, anchor }));
      }
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

  let gridX = margin;
  for (const [, columnWidth] of leftColumns) {
    parts.push(line(gridX, headerY, gridX, actualBottom, { stroke: COLORS.grid, width: 0.65 }));
    gridX += columnWidth;
  }
  parts.push(line(timelineX, headerY, timelineX, actualBottom, { stroke: COLORS.grid, width: 0.9 }));
  for (let index = 0; index <= periodCount; index += 1) {
    const x = timelineX + index * periodWidth;
    parts.push(line(x, headerY, x, actualBottom, { stroke: COLORS.grid, width: 0.65 }));
  }
  // Redraw overlay rules so they remain visible over bars.
  for (const milestone of list(schedule.milestones)) {
    const x = timelineX + milestone.period * periodWidth;
    parts.push(line(x, markerY + 16, x, actualBottom, { stroke: COLORS.gold, width: 1.4, dash: '6 5' }));
  }
  parts.push(line(currentX, markerY + 18, currentX, actualBottom, { stroke: COLORS.red, width: 3 }));

  const source = schedule.source || context.source || '';
  const note = schedule.note || 'Bars show planned timing; milestone and current-date lines are drawn from the approved baseline and reporting cutoff.';
  parts.push(statusLegend(margin, actualBottom + 12, 650, 23));
  parts.push(text(margin, actualBottom + 54, fitText(note, 215), { size: 8.8, weight: 600 }));
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
