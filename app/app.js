/* 小家账本 · 应用入口：哈希路由 + 全站事件接线。 */
'use strict';

var appEl = document.getElementById('app');
var editingId = null;
var currentType = 'expense';

function setActiveNav(route) {
  var links = document.querySelectorAll('[data-nav]');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.toggle('active', links[i].getAttribute('data-nav') === route);
  }
}

function route() {
  var hash = window.location.hash || '#/';
  var page = hash.replace(/^#\/?/, '').split('?')[0];
  if (page === 'transactions') {
    appEl.innerHTML = renderTransactions();
    setActiveNav('transactions');
    wireTransactions();
  } else if (page === 'budgets') {
    appEl.innerHTML = renderBudgets();
    setActiveNav('budgets');
    wireBudgets();
  } else if (page === 'goals') {
    appEl.innerHTML = renderGoals();
    setActiveNav('goals');
    wireGoals();
  } else {
    appEl.innerHTML = renderOverview();
    setActiveNav('overview');
  }
  window.scrollTo(0, 0);
}

/* ---- 记账页接线 ---- */
function wireTransactions() {
  var form = document.getElementById('tx-form');
  var toggle = document.getElementById('tx-type-toggle');
  var err = document.getElementById('tx-error');

  function setType(t) {
    currentType = t;
    var btns = toggle.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove('on-out', 'on-in');
      if (b.getAttribute('data-type') === t) b.classList.add(t === 'income' ? 'on-in' : 'on-out');
    }
    document.getElementById('tx-submit').textContent = editingId ? '保存修改' : '记下来';
  }
  toggle.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-type]');
    if (b) setType(b.getAttribute('data-type'));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var amount = parseFloat(document.getElementById('tx-amount').value);
    var note = document.getElementById('tx-note').value.trim();
    var date = document.getElementById('tx-date').value;
    var category = document.getElementById('tx-category').value;
    if (!amount || amount <= 0) { err.textContent = '金额要填一个大于 0 的数字。'; return; }
    if (!date) { err.textContent = '日期不能为空。'; return; }
    if (editingId) {
      store.updateTransaction(editingId, { type: currentType, amount: amount, category: category, date: date, note: note || catById(category).name });
      editingId = null;
    } else {
      store.addTransaction({ type: currentType, amount: amount, category: category, date: date, note: note || catById(category).name });
    }
    route();
  });

  document.getElementById('f-type').addEventListener('change', function (e) { txFilter.type = e.target.value; route(); });
  document.getElementById('f-cat').addEventListener('change', function (e) { txFilter.category = e.target.value; route(); });
  document.getElementById('f-sort').addEventListener('change', function (e) { txFilter.sort = e.target.value; route(); });
  document.getElementById('f-q').addEventListener('input', function (e) { txFilter.q = e.target.value; route(); });
  document.getElementById('btn-csv').addEventListener('click', downloadCSV);
  document.getElementById('btn-restore').addEventListener('click', function () { store.resetSample(); txFilter = { type: 'all', category: 'all', q: '', sort: 'date-desc' }; route(); });
  document.getElementById('btn-clear').addEventListener('click', function () {
    if (window.confirm('确定清空全部收支记录吗？预算和目标不受影响，之后可用「恢复示例数据」找回。')) { store.clearAll(); route(); }
  });

  appEl.querySelectorAll('[data-del]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.confirm('确定删除这笔记录吗？')) { store.deleteTransaction(btn.getAttribute('data-del')); route(); }
    });
  });
  appEl.querySelectorAll('[data-edit]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = store.state.transactions.filter(function (x) { return x.id === btn.getAttribute('data-edit'); })[0];
      if (!t) return;
      editingId = t.id;
      setType(t.type);
      document.getElementById('tx-amount').value = t.amount;
      document.getElementById('tx-category').value = t.category;
      document.getElementById('tx-date').value = t.date;
      document.getElementById('tx-note').value = t.note || '';
      document.getElementById('tx-submit').textContent = '保存修改';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('tx-amount').focus();
    });
  });
}

/* ---- 预算页接线 ---- */
function wireBudgets() {
  appEl.querySelectorAll('[data-save-budget]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-save-budget');
      var input = document.getElementById('budget-' + cat);
      var v = parseFloat(input.value);
      if (isNaN(v) || v < 0) { input.focus(); return; }
      store.setBudget(cat, Math.round(v));
      route();
    });
  });
}

/* ---- 目标页接线 ---- */
function wireGoals() {
  appEl.querySelectorAll('[data-add-money]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-add-money');
      var input = appEl.querySelector('[data-deposit="' + id + '"]');
      var v = parseFloat(input.value);
      if (!v || v <= 0) { input.focus(); return; }
      store.addToGoal(id, v);
      route();
    });
  });
  appEl.querySelectorAll('[data-del-goal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.confirm('确定删除这个储蓄目标吗？')) { store.deleteGoal(btn.getAttribute('data-del-goal')); route(); }
    });
  });
  var form = document.getElementById('goal-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('goal-name').value.trim();
    var target = parseFloat(document.getElementById('goal-target').value);
    var deadline = document.getElementById('goal-deadline').value;
    var err = document.getElementById('goal-error');
    if (!name) { err.textContent = '先给目标起个名字。'; return; }
    if (!target || target <= 0) { err.textContent = '目标金额要填一个大于 0 的数字。'; return; }
    if (!deadline) { err.textContent = '目标日期不能为空。'; return; }
    store.addGoal({ name: name, target: Math.round(target), saved: 0, deadline: deadline });
    route();
  });
}

store.load();
window.addEventListener('hashchange', route);
route();
