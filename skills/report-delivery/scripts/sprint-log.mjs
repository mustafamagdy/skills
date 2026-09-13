const COLORS = {
  navy: '#173A5E',
  ink: '#202A35',
  muted: '#68717B',
  grid: '#B9BEC4',
  row: '#FFFFFF',
  alternate: '#F2F2F2',
  critical: '#D93A2F',
  high: '#F08A18',
  medium: '#666666',
  low: '#47779F',
  complete: '#246B45',
  active: '#1E5A8A',
  resolved: '#6B4F9B',
  new: '#5F6871',
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

function fitText(value, maxChars) {
  const text = String(value ?? '').replaceAll('·', '-').replaceAll('–', '-').replaceAll('—', '-');
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function text(x, y, value, options = {}) {
  const {
    size = 13,
    weight = 400,
    fill = COLORS.ink,
    anchor = 'start',
    family = 'Arial, Aptos, sans-serif'
  } = options;
  return `<text x="${x}" y="${y}" font-family="${escapeXml(family)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function rect(x, y, width, height, fill, options = {}) {
  const { stroke = COLORS.grid, strokeWidth = 0.8 } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateSprintLog(sprintLog) {
  if (!sprintLog || typeof sprintLog !== 'object') throw new Error('sprintLog must be an object');
  if (!sprintLog.title) throw new Error('sprintLog.title is required');
  if (!sprintLog.statusDate || !isIsoDate(sprintLog.statusDate)) {
    throw new Error('sprintLog.statusDate must be an ISO date in YYYY-MM-DD format');
  }
  if (!Array.isArray(sprintLog.sprints) || sprintLog.sprints.length === 0) {
    throw new Error('sprintLog.sprints must contain at least one sprint');
  }
  let itemCount = 0;
  const ids = new Set();
  for (const sprint of sprintLog.sprints) {
    if (!sprint.name) throw new Error('every sprintLog sprint needs a name');
    if (!Array.isArray(sprint.items)) throw new Error(`sprintLog sprint "${sprint.name}" needs items`);
    for (const item of sprint.items) {
      if (!item.id || !item.name) throw new Error('every sprintLog item needs id and name');
      if (ids.has(String(item.id))) throw new Error(`duplicate sprintLog item id: ${item.id}`);
      ids.add(String(item.id));
      itemCount += 1;
    }
  }
  if (itemCount > 70) throw new Error('sprintLog supports at most 70 story rows on one A3 page');
  return { itemCount };
}

function priorityColor(value) {
  const key = String(value || '').toLowerCase();
  if (key === 'critical') return COLORS.critical;
  if (key === 'high') return COLORS.high;
  if (key === 'low') return COLORS.low;
  return COLORS.medium;
}

function statusColor(value) {
  const key = String(value || '').toLowerCase();
  if (key === 'closed' || key === 'done' || key === 'complete') return COLORS.complete;
  if (key === 'active' || key === 'in progress') return COLORS.active;
  if (key === 'resolved') return COLORS.resolved;
  return COLORS.new;
}

export function buildSprintLogSvg(sprintLog, context = {}) {
  const { itemCount } = validateSprintLog(sprintLog);
  const width = 1600;
  const height = 1131;
  const margin = 38;
  const tableWidth = width - margin * 2;
  const titleY = 39;
  const subtitleY = 65;
  const headerY = 88;
  const headerHeight = 42;
  const footerY = 1104;
  const sprintCount = sprintLog.sprints.length;
  const availableHeight = footerY - headerY - headerHeight - 16;
  const groupHeight = Math.min(27, Math.max(19, availableHeight * 0.055 / sprintCount));
  const rowHeight = Math.min(24, Math.max(13.5, (availableHeight - groupHeight * sprintCount) / Math.max(1, itemCount)));
  const columns = [
    { key: 'sprint', label: 'Sprint', width: 78, align: 'middle', max: 12 },
    { key: 'module', label: 'Module', width: 145, max: 20 },
    { key: 'name', label: 'User Story / Task', width: 620, max: 82 },
    { key: 'priority', label: 'Priority', width: 105, align: 'middle', max: 12 },
    { key: 'points', label: 'Story Points', width: 86, align: 'middle', max: 8 },
    { key: 'assignee', label: 'Assignee', width: 180, max: 24 },
    { key: 'status', label: 'Status', width: 105, align: 'middle', max: 14 },
    { key: 'notes', label: 'Notes', width: tableWidth - 1319, max: 22 }
  ];
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="sprint-log-title sprint-log-desc">`);
  parts.push(`<title id="sprint-log-title">${escapeXml(sprintLog.title)}</title>`);
  parts.push(`<desc id="sprint-log-desc">Sprint backlog grouped by sprint with story, priority, points, assignee and status.</desc>`);
  parts.push(rect(0, 0, width, height, COLORS.white, { stroke: 'none', strokeWidth: 0 }));
  parts.push(text(margin, titleY, sprintLog.title, { size: 29, weight: 800, fill: COLORS.navy }));
  const subtitle = sprintLog.subtitle || `Status as at ${sprintLog.statusDate}`;
  parts.push(text(margin, subtitleY, subtitle, { size: 13, fill: COLORS.muted }));
  if (context.organization) parts.push(text(width - margin, titleY, String(context.organization).toUpperCase(), { size: 11, weight: 700, fill: COLORS.muted, anchor: 'end' }));

  let x = margin;
  for (const column of columns) {
    parts.push(rect(x, headerY, column.width, headerHeight, COLORS.navy, { stroke: '#FFFFFF', strokeWidth: 0.8 }));
    const labelX = column.align === 'middle' ? x + column.width / 2 : x + 8;
    parts.push(text(labelX, headerY + 27, column.label, { size: 12, weight: 700, fill: COLORS.white, anchor: column.align === 'middle' ? 'middle' : 'start' }));
    x += column.width;
  }

  let y = headerY + headerHeight;
  let rowIndex = 0;
  for (const sprint of sprintLog.sprints) {
    parts.push(rect(margin, y, tableWidth, groupHeight, COLORS.navy, { stroke: '#FFFFFF', strokeWidth: 0.8 }));
    const dates = sprint.startDate && sprint.endDate ? ` (${sprint.startDate} to ${sprint.endDate})` : '';
    parts.push(text(margin + 3, y + groupHeight * 0.69, `${sprint.name}${sprint.label ? ` - ${sprint.label}` : ''}${dates}`, { size: Math.min(13, rowHeight * 0.78), weight: 700, fill: COLORS.white }));
    y += groupHeight;
    for (const item of sprint.items) {
      const values = {
        sprint: item.sprint || sprint.shortName || sprint.name,
        module: item.module || '',
        name: item.name,
        priority: item.priority || '',
        points: item.points ?? '',
        assignee: item.assignee || '',
        status: item.status || '',
        notes: item.notes || ''
      };
      x = margin;
      const fill = rowIndex % 2 ? COLORS.alternate : COLORS.row;
      for (const column of columns) {
        parts.push(rect(x, y, column.width, rowHeight, fill));
        const value = fitText(values[column.key], column.max);
        const alignMiddle = column.align === 'middle';
        const valueX = alignMiddle ? x + column.width / 2 : x + 5;
        let color = COLORS.ink;
        let weight = 400;
        if (column.key === 'priority') {
          color = priorityColor(value);
          weight = 700;
        }
        if (column.key === 'status') {
          color = statusColor(value);
          weight = 700;
        }
        parts.push(text(valueX, y + rowHeight * 0.69, value, { size: Math.min(11.2, rowHeight * 0.68), weight, fill: color, anchor: alignMiddle ? 'middle' : 'start' }));
        x += column.width;
      }
      y += rowHeight;
      rowIndex += 1;
    }
  }

  const source = sprintLog.source || '';
  if (source) parts.push(text(margin, footerY, fitText(`Source: ${source}`, 210), { size: 8.5, fill: COLORS.muted }));
  parts.push(text(width - margin, footerY, 'A3 landscape', { size: 8.5, fill: COLORS.muted, anchor: 'end' }));
  parts.push('</svg>');
  return parts.join('');
}

export function sprintLogMarkdown(sprintLog) {
  validateSprintLog(sprintLog);
  const output = [`## ${sprintLog.title}`, '', sprintLog.subtitle || `Status as at ${sprintLog.statusDate}`, ''];
  for (const sprint of sprintLog.sprints) {
    output.push(`### ${sprint.name}${sprint.label ? ` - ${sprint.label}` : ''}`, '', '| Sprint | Module | User Story / Task | Priority | Story Points | Assignee | Status | Notes |', '|---|---|---|---|---:|---|---|---|');
    for (const item of sprint.items) {
      const cells = [item.sprint || sprint.shortName || sprint.name, item.module || '', item.name, item.priority || '', item.points ?? '', item.assignee || '', item.status || '', item.notes || ''];
      output.push(`| ${cells.map((value) => String(value).replaceAll('|', '\\|')).join(' | ')} |`);
    }
    output.push('');
  }
  return output.join('\n');
}
