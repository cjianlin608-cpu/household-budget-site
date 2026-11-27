/* 小家账本 · 视图：总览 / 记账 / 预算 / 储蓄目标 四页的渲染。 */
'use strict';

function txRow(t, withActions) {
  var c = catById(t.category);
  var sign = t.type === 'income' ? '+' : '−';
  var cls = t.type === 'income' ? 'in' : 'out';
  var actions = withActions
    ? '<span class="mini-actions"><button class="icon-btn" data-edit="' + t.id + '">编辑</button>' +
      '<button class="icon-btn danger" data-del="' + t.id + '">删除</button></span>'
    : '';
  return '<li><span class="tx-cat" style="background:' + c.color + '">' + c.icon + '</span>' +
    '<span class="tx-main"><span class="tx-note">' + esc(t.note || c.name) + '</span><br>' +
    '<span class="tx-meta">' + c.name + ' · ' + fmtDate(t.date) + '</span></span>' +
    '<span class="tx-amt ' + cls + '">' + sign + fmt(t.amount) + '</span>' + actions + '</li>';
}

/* ---------- 总览 ---------- */
function renderOverview() {
  var s = monthSummary();
  var spent = spentByCategory();
  var totalBudgeted = totalBudget();
  var recent = monthTransactions().slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-6).reverse();
  var trend = MONTHLY_TREND.slice();
  trend[trend.length - 1] = { month: '11月', income: s.income, expense: s.expense };

  var legend = CATEGORIES.map(function (c) {
    var v = spent[c.id] || 0;
    var pct = s.expense ? Math.round(v / s.expense * 100) : 0;
    return '<li><span class="dot" style="background:' + c.color + '"></span>' + c.name +
      '<span class="amt"><b>' + fmt(v) + '</b> · ' + pct + '%</span></li>';
  }).join('');

  var budgetMini = CATEGORIES.map(function (c) {
    var b = store.state.budgets[c.id] || 0;
    var v = spent[c.id] || 0;
    var pct = b ? Math.min(Math.round(v / b * 100), 100) : 0;
    var cls = v > b ? 'over' : (v / b >= 0.9 ? 'warn' : '');
    return '<div class="budget-row"><div class="budget-head"><span class="cat">' + c.name + '</span>' +
      '<span class="nums">已花 <b>' + fmt(v) + '</b> / 预算 ' + fmt(b) + '</span></div>' +
      '<div class="bar"><i class="' + cls + '" style="width:' + pct + '%"></i></div></div>';
  }).join('');

  return '' +
    '<h1>11 月总览</h1>' +
    '<p class="lead">一家三口这个月的钱进多少、出多少，一眼看清。数据来自下方记账页的 ' + s.count + ' 笔收支。</p>' +
    '<section class="stats" aria-label="月度汇总">' +
      '<div class="stat"><div class="label">月收入</div><div class="value income">' + fmt(s.income) + '</div><div class="sub">工资 <b>¥9,800</b> + 兼职 <b>¥1,500</b></div></div>' +
      '<div class="stat"><div class="label">月支出</div><div class="value expense">' + fmt(s.expense) + '</div><div class="sub">预算 ' + fmt(totalBudgeted) + '，剩 <b>' + fmt(Math.max(totalBudgeted - s.expense, 0)) + '</b></div></div>' +
      '<div class="stat"><div class="label">本月结余</div><div class="value">' + fmt(s.balance) + '</div><div class="sub">结余已划入储蓄目标</div></div>' +
      '<div class="stat"><div class="label">储蓄率</div><div class="value">' + s.rate + '%</div><div class="sub">每赚 100 元存下 <b>' + s.rate + ' 元</b></div></div>' +
    '</section>' +
    '<div class="grid-2 section-gap">' +
      '<section class="card"><h2>钱花在哪了</h2><div class="chart-wrap">' + donutChart(spent, s.expense) +
      '<ul class="legend">' + legend + '</ul></div>' +
      '<p class="chart-note">餐饮是大头（' + fmt(spent.food) + '），其次是住房 ' + fmt(spent.housing) + '。点「记账」可看每一笔明细。</p></section>' +
      '<section class="card"><h2>近 6 个月收支趋势</h2>' + barChart(trend) +
      '<p class="chart-note">11 月支出比 10 月少 ' + fmt(7360 - s.expense) + '，主要是聚餐和购物收住了。</p></section>' +
    '</div>' +
    '<div class="grid-2">' +
      '<section class="card"><h2>最近 6 笔</h2><ul class="tx-list">' + recent.map(function (t) { return txRow(t, false); }).join('') + '</ul>' +
      '<p style="margin:14px 0 0"><a href="#/transactions">去记账页看全部 →</a></p></section>' +
      '<section class="card"><h2>本月预算进度</h2>' + budgetMini +
      '<p style="margin:14px 0 0"><a href="#/budgets">去预算页调整额度 →</a></p></section>' +
    '</div>';
}

/* ---------- 记账 ---------- */
var txFilter = { type: 'all', category: 'all', q: '', sort: 'date-desc' };

function filteredTransactions() {
  var list = store.state.transactions.slice();
  if (txFilter.type !== 'all') list = list.filter(function (t) { return t.type === txFilter.type; });
  if (txFilter.category !== 'all') list = list.filter(function (t) { return t.category === txFilter.category; });
  if (txFilter.q) {
    var q = txFilter.q.toLowerCase();
    list = list.filter(function (t) { return (t.note || '').toLowerCase().indexOf(q) >= 0 || catById(t.category).name.indexOf(q) >= 0; });
  }
  var sorts = {
    'date-desc': function (a, b) { return a.date < b.date ? 1 : -1; },
    'date-asc': function (a, b) { return a.date < b.date ? -1 : 1; },
    'amount-desc': function (a, b) { return b.amount - a.amount; },
    'amount-asc': function (a, b) { return a.amount - b.amount; }
  };
  list.sort(sorts[txFilter.sort] || sorts['date-desc']);
  return list;
}

function renderTransactions() {
  var list = filteredTransactions();
  var income = sumByType(list, 'income'), expense = sumByType(list, 'expense');
  var catOptions = CATEGORIES.map(function (c) {
    return '<option value="' + c.id + '"' + (txFilter.category === c.id ? ' selected' : '') + '>' + c.name + '</option>';
  }).join('');
  var rows = list.length
    ? list.map(function (t) { return txRow(t, true); }).join('')
    : '<p class="empty">没有符合条件的记录，换个筛选试试，或点下方「恢复示例数据」。</p>';
  return '' +
    '<h1>记账</h1>' +
    '<p class="lead">每一笔收入支出都在这里。支持按类型、分类筛选，按日期或金额排序，备注可搜索。</p>' +
    '<section class="card"><h2>记一笔</h2>' +
      '<form id="tx-form">' +
      '<div class="form-grid">' +
        '<div class="field"><label>类型</label><span class="toggle" id="tx-type-toggle">' +
          '<button type="button" data-type="expense" class="on-out">支出</button>' +
          '<button type="button" data-type="income">收入</button></span></div>' +
        '<div class="field"><label for="tx-amount">金额（元）</label><input id="tx-amount" type="number" min="0.01" step="0.01" placeholder="例如 128" required></div>' +
        '<div class="field"><label for="tx-category">分类</label><select id="tx-category">' +
          CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label for="tx-date">日期</label><input id="tx-date" type="date" value="2026-11-27" required></div>' +
        '<div class="field wide"><label for="tx-note">备注</label><input id="tx-note" type="text" maxlength="60" placeholder="写清楚这笔钱花在哪，例如：超市周采购"></div>' +
        '<div class="field"><label>&nbsp;</label><button class="btn" type="submit" id="tx-submit">记下来</button></div>' +
      '</div>' +
      '<p class="error" id="tx-error"></p>' +
      '<p class="hint">点列表里的「编辑」可把一笔记录重新填回这张表修改；「删除」会立刻删掉并保存。</p>' +
      '</form></section>' +
    '<section class="card"><h2>全部记录 <span style="color:var(--muted);font-size:14px;font-weight:400">共 ' + list.length + ' 笔 · 收入 ' + fmt(income) + ' · 支出 ' + fmt(expense) + '</span></h2>' +
      '<div class="toolbar">' +
        '<div class="field"><label for="f-type">类型</label><select id="f-type">' +
          '<option value="all"' + (txFilter.type === 'all' ? ' selected' : '') + '>全部</option>' +
          '<option value="expense"' + (txFilter.type === 'expense' ? ' selected' : '') + '>支出</option>' +
          '<option value="income"' + (txFilter.type === 'income' ? ' selected' : '') + '>收入</option></select></div>' +
        '<div class="field"><label for="f-cat">分类</label><select id="f-cat"><option value="all">全部分类</option>' + catOptions + '</select></div>' +
        '<div class="field"><label for="f-sort">排序</label><select id="f-sort">' +
          '<option value="date-desc"' + (txFilter.sort === 'date-desc' ? ' selected' : '') + '>日期：新 → 旧</option>' +
          '<option value="date-asc"' + (txFilter.sort === 'date-asc' ? ' selected' : '') + '>日期：旧 → 新</option>' +
          '<option value="amount-desc"' + (txFilter.sort === 'amount-desc' ? ' selected' : '') + '>金额：高 → 低</option>' +
          '<option value="amount-asc"' + (txFilter.sort === 'amount-asc' ? ' selected' : '') + '>金额：低 → 高</option></select></div>' +
        '<div class="field"><label for="f-q">搜索备注</label><input id="f-q" type="search" placeholder="例如：超市" value="' + esc(txFilter.q) + '"></div>' +
        '<span class="spacer"></span>' +
        '<button class="btn secondary small" id="btn-csv" type="button">导出 CSV</button>' +
        '<button class="btn ghost small" id="btn-restore" type="button">恢复示例数据</button>' +
        '<button class="btn ghost small" id="btn-clear" type="button">清空全部记录</button>' +
      '</div>' +
      '<ul class="tx-list">' + rows + '</ul></section>';
}

/* ---------- 预算 ---------- */
function renderBudgets() {
  var spent = spentByCategory();
  var s = monthSummary();
  var totalB = totalBudget();
  var rows = CATEGORIES.map(function (c) {
    var b = store.state.budgets[c.id] || 0;
    var v = spent[c.id] || 0;
    var pct = b ? Math.round(v / b * 100) : 0;
    var pctBar = Math.min(pct, 100);
    var cls = v > b ? 'over' : (v / b >= 0.9 ? 'warn' : '');
    var badge = v > b
      ? '<span class="badge over">已超支 ' + fmt(v - b) + '</span>'
      : (v / b >= 0.9 ? '<span class="badge warn">快花完了</span>' : '<span class="badge">还剩 ' + fmt(b - v) + '</span>');
    return '<div class="budget-row"><div class="budget-head"><span class="cat">' + c.icon + ' ' + c.name + '</span>' +
      '<span class="nums">已花 <b>' + fmt(v) + '</b> / 预算 ' + fmt(b) + ' · ' + pct + '%</span></div>' +
      '<div class="bar"><i class="' + cls + '" style="width:' + pctBar + '%"></i></div>' +
      '<div class="budget-foot"><span class="left">' + badge + '</span>' +
      '<span class="budget-edit"><label for="budget-' + c.id + '">月度预算</label>' +
      '<input id="budget-' + c.id + '" type="number" min="0" step="10" value="' + b + '" data-cat="' + c.id + '">' +
      '<button class="btn small secondary" data-save-budget="' + c.id + '">保存</button></span></div></div>';
  }).join('');
  return '' +
    '<h1>分类预算</h1>' +
    '<p class="lead">每月初给每个分类定个上限，花到 90% 会提醒，超了变红。改完点「保存」立即生效。</p>' +
    '<section class="card"><div class="summary-line"><span>预算总额 <b>' + fmt(totalB) + '</b></span>' +
    '<span>本月已花 <b>' + fmt(s.expense) + '</b></span>' +
    '<span>还剩 <b>' + fmt(Math.max(totalB - s.expense, 0)) + '</b></span>' +
    '<span>预算使用率 <b>' + (totalB ? Math.round(s.expense / totalB * 100) : 0) + '%</b></span></div></section>' +
    '<section class="card">' + rows +
    '<p class="hint">小建议：餐饮常超的话，先看记账页里外卖有几笔——11 月外卖加起来 ' + fmt(128 + 96) + '，自己做饭一周能省下一顿火锅钱。</p></section>';
}

/* ---------- 储蓄目标 ---------- */
function renderGoals() {
  var cards = store.state.goals.map(function (g) {
    var pct = g.target ? Math.min(Math.round(g.saved / g.target * 100), 100) : 0;
    var cls = pct >= 100 ? '' : (pct >= 70 ? 'warn' : '');
    var left = Math.max(g.target - g.saved, 0);
    return '<div class="goal-card"><div class="goal-head"><span class="name">' + esc(g.name) + '</span>' +
      '<span class="nums">已存 <b>' + fmt(g.saved) + '</b> / 目标 ' + fmt(g.target) + ' · ' + pct + '%</span></div>' +
      '<div class="bar"><i class="' + cls + '" style="width:' + pct + '%"></i></div>' +
      '<div class="goal-actions"><span class="goal-date">目标日期：' + esc(g.deadline) + (left > 0 ? ' · 还差 ' + fmt(left) : ' · 已达成 🎉') + '</span>' +
      '<input type="number" min="1" step="1" placeholder="存入金额" aria-label="存入' + esc(g.name) + '的金额" data-deposit="' + g.id + '">' +
      '<button class="btn small" data-add-money="' + g.id + '">存入</button>' +
      '<button class="btn small ghost" data-del-goal="' + g.id + '">删除目标</button></div></div>';
  }).join('');
  if (!cards) cards = '<p class="empty">还没有储蓄目标，在下面新建一个吧。</p>';
  var totalSaved = store.state.goals.reduce(function (a, g) { return a + g.saved; }, 0);
  var totalTarget = store.state.goals.reduce(function (a, g) { return a + g.target; }, 0);
  return '' +
    '<h1>储蓄目标</h1>' +
    '<p class="lead">每月结余先分到目标里，攒够了再花。三个目标一共已存 ' + fmt(totalSaved) + '，占目标总额 ' + fmt(totalTarget) + ' 的 ' + (totalTarget ? Math.round(totalSaved / totalTarget * 100) : 0) + '%。</p>' +
    '<section class="card">' + cards + '</section>' +
    '<section class="card"><h2>新建目标</h2>' +
    '<form id="goal-form"><div class="form-grid">' +
      '<div class="field"><label for="goal-name">目标名字</label><input id="goal-name" type="text" maxlength="20" placeholder="例如：换一台冰箱" required></div>' +
      '<div class="field"><label for="goal-target">目标金额（元）</label><input id="goal-target" type="number" min="1" step="1" placeholder="例如 5000" required></div>' +
      '<div class="field"><label for="goal-deadline">目标日期</label><input id="goal-deadline" type="date" value="2027-06-30" required></div>' +
      '<div class="field"><label>&nbsp;</label><button class="btn" type="submit">新建目标</button></div>' +
    '</div><p class="error" id="goal-error"></p></form></section>';
}
