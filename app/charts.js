/* 小家账本 · 图表：纯手写 SVG 环形图 + 柱状图，不依赖任何外部库。 */
'use strict';

/* 分类支出环形图：SVG 圆环 + 中心结余。返回 HTML 字符串。 */
function donutChart(spent, total) {
  var size = 200, r = 80, cx = 100, cy = 100;
  var circ = 2 * Math.PI * r;
  var offset = 0;
  var parts = [];
  parts.push('<svg class="donut" width="' + size + '" height="' + size + '" viewBox="0 0 200 200" role="img" aria-label="分类支出环形图">');
  parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#f0eadd" stroke-width="30"/>');
  CATEGORIES.forEach(function (c) {
    var v = spent[c.id] || 0;
    if (!v || !total) return;
    var frac = v / total;
    var len = Math.max(frac * circ - 2, 0.5);
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + c.color +
      '" stroke-width="30" stroke-dasharray="' + len.toFixed(1) + ' ' + (circ - len).toFixed(1) +
      '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 100 100)"/>');
    offset += frac * circ;
  });
  parts.push('</svg>');
  return parts.join('');
}

/* 月度趋势柱状图：6 个月收入/支出双柱。返回 HTML 字符串。 */
function barChart(months) {
  var W = 640, H = 260, padL = 46, padB = 30, padT = 14;
  var maxV = 0;
  months.forEach(function (m) { maxV = Math.max(maxV, m.income, m.expense); });
  maxV = Math.ceil(maxV / 2000) * 2000;
  var plotW = W - padL - 12, plotH = H - padT - padB;
  var groupW = plotW / months.length;
  var barW = Math.min(24, groupW / 3);
  var html = [];
  html.push('<svg class="bar-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="近 6 个月收支趋势柱状图">');
  [0, 0.5, 1].forEach(function (f) {
    var y = padT + plotH * (1 - f);
    var v = Math.round(maxV * f);
    html.push('<line x1="' + padL + '" y1="' + y + '" x2="' + (W - 12) + '" y2="' + y + '" stroke="#eee7d8" stroke-width="1"/>');
    html.push('<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#6b7a72">' + v.toLocaleString('zh-CN') + '</text>');
  });
  months.forEach(function (m, i) {
    var gx = padL + i * groupW + groupW / 2;
    var hIn = m.income / maxV * plotH;
    var hEx = m.expense / maxV * plotH;
    html.push('<rect x="' + (gx - barW - 3).toFixed(1) + '" y="' + (padT + plotH - hIn).toFixed(1) +
      '" width="' + barW + '" height="' + hIn.toFixed(1) + '" rx="3" fill="#1d5c43"><title>' + m.month + '收入 ¥' + m.income.toLocaleString('zh-CN') + '</title></rect>');
    html.push('<rect x="' + (gx + 3).toFixed(1) + '" y="' + (padT + plotH - hEx).toFixed(1) +
      '" width="' + barW + '" height="' + hEx.toFixed(1) + '" rx="3" fill="#e07856"><title>' + m.month + '支出 ¥' + m.expense.toLocaleString('zh-CN') + '</title></rect>');
    html.push('<text x="' + gx.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="12" fill="#22302a">' + m.month + '</text>');
  });
  html.push('</svg>');
  html.push('<p class="chart-note"><span style="color:#1d5c43">■</span> 收入　<span style="color:#e07856">■</span> 支出（元）</p>');
  return html.join('');
}
