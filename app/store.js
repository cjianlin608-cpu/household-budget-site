/* 小家账本 · 数据层：localStorage 持久化 + 增删改 + 月度汇总计算。 */
'use strict';

var STORE_KEY = 'xiaojiabook-v1';

var store = {
  state: null,

  load: function () {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions) && parsed.budgets && Array.isArray(parsed.goals)) {
          this.state = parsed;
          return this.state;
        }
      }
    } catch (e) { /* 损坏的数据当作没有，落回示例 */ }
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
    return this.state;
  },

  save: function () {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* 隐私模式等写不进时只影响持久化 */ }
  },

  resetSample: function () {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  },

  clearAll: function () {
    this.state = { transactions: [], budgets: JSON.parse(JSON.stringify(SAMPLE_BUDGETS)), goals: [] };
    this.save();
  },

  addTransaction: function (tx) {
    tx.id = 't-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000);
    this.state.transactions.push(tx);
    this.save();
    return tx;
  },

  updateTransaction: function (id, patch) {
    var list = this.state.transactions;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var k in patch) list[i][k] = patch[k];
        this.save();
        return list[i];
      }
    }
    return null;
  },

  deleteTransaction: function (id) {
    this.state.transactions = this.state.transactions.filter(function (t) { return t.id !== id; });
    this.save();
  },

  setBudget: function (categoryId, amount) {
    this.state.budgets[categoryId] = amount;
    this.save();
  },

  addGoal: function (goal) {
    goal.id = 'g-' + Date.now().toString(36);
    this.state.goals.push(goal);
    this.save();
    return goal;
  },

  deleteGoal: function (id) {
    this.state.goals = this.state.goals.filter(function (g) { return g.id !== id; });
    this.save();
  },

  addToGoal: function (id, amount) {
    var goals = this.state.goals;
    for (var i = 0; i < goals.length; i++) {
      if (goals[i].id === id) {
        goals[i].saved = Math.round((goals[i].saved + amount) * 100) / 100;
        this.save();
        return goals[i];
      }
    }
    return null;
  }
};

/* ---- 汇总计算 ---- */

function monthOf(dateStr) { return dateStr.slice(0, 7); }

function monthTransactions() {
  return store.state.transactions.filter(function (t) { return monthOf(t.date) === BUDGET_MONTH; });
}

function sumByType(list, type) {
  var s = 0;
  for (var i = 0; i < list.length; i++) if (list[i].type === type) s += list[i].amount;
  return Math.round(s * 100) / 100;
}

function monthSummary() {
  var list = monthTransactions();
  var income = sumByType(list, 'income');
  var expense = sumByType(list, 'expense');
  var balance = Math.round((income - expense) * 100) / 100;
  var rate = income > 0 ? Math.round(balance / income * 1000) / 10 : 0;
  return { income: income, expense: expense, balance: balance, rate: rate, count: list.length };
}

function spentByCategory() {
  var out = {};
  CATEGORIES.forEach(function (c) { out[c.id] = 0; });
  monthTransactions().forEach(function (t) {
    if (t.type === 'expense') out[t.category] = Math.round((out[t.category] + t.amount) * 100) / 100;
  });
  return out;
}

function totalBudget() {
  var s = 0;
  for (var k in store.state.budgets) s += store.state.budgets[k];
  return s;
}

function fmt(n) {
  return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  var parts = dateStr.split('-');
  return Number(parts[1]) + '月' + Number(parts[2]) + '日';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

function toCSV(rows) {
  var head = ['日期', '类型', '分类', '备注', '金额（元）'];
  var lines = [head.join(',')];
  rows.forEach(function (t) {
    var note = '"' + String(t.note || '').replace(/"/g, '""') + '"';
    lines.push([t.date, t.type === 'income' ? '收入' : '支出', catById(t.category).name, note, t.amount].join(','));
  });
  return '\ufeff' + lines.join('\r\n');
}

function downloadCSV() {
  var rows = store.state.transactions.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '小家账本-2026年11月.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
