/* 小家账本 · 示例数据：一家三口（夫妻 + 5 岁孩子）2026 年 11 月的账本。
   数字自洽：收入 11,300（工资 9,800 + 兼职 1,500），支出 7,000，结余 4,300，储蓄率 38.1%。
   分类支出加总：餐饮 2,180 / 住房 1,800 / 交通 420 / 购物 960 / 娱乐 380 / 医疗 260 / 教育 640 / 其他 360。 */
'use strict';

var BUDGET_MONTH = '2026-11';

var CATEGORIES = [
  { id: 'food',      name: '餐饮', icon: '🍚', color: '#e07856' },
  { id: 'housing',   name: '住房', icon: '🏠', color: '#4a7fb5' },
  { id: 'transport', name: '交通', icon: '🚗', color: '#e8a13d' },
  { id: 'shopping',  name: '购物', icon: '🛍️', color: '#8a6fc0' },
  { id: 'fun',       name: '娱乐', icon: '🎬', color: '#4caf7d' },
  { id: 'health',    name: '医疗', icon: '💊', color: '#d95f7e' },
  { id: 'edu',       name: '教育', icon: '📚', color: '#3d9b8f' },
  { id: 'other',     name: '其他', icon: '🧾', color: '#9aa5ad' }
];

function catById(id) {
  for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
  return CATEGORIES[CATEGORIES.length - 1];
}

var SAMPLE_TRANSACTIONS = [
  // 收入
  { id: 't-in-1', type: 'income', amount: 9800, category: 'other', date: '2026-11-05', note: '11 月工资（税后到手）' },
  { id: 't-in-2', type: 'income', amount: 1500, category: 'other', date: '2026-11-15', note: '周末兼职设计费' },
  // 餐饮 2,180
  { id: 't01', type: 'expense', amount: 286, category: 'food', date: '2026-11-02', note: '超市周采购：米面粮油' },
  { id: 't02', type: 'expense', amount: 128, category: 'food', date: '2026-11-05', note: '早餐 + 外卖午餐' },
  { id: 't03', type: 'expense', amount: 154, category: 'food', date: '2026-11-08', note: '菜市场：蔬菜水果' },
  { id: 't04', type: 'expense', amount: 420, category: 'food', date: '2026-11-12', note: '周末家庭聚餐' },
  { id: 't05', type: 'expense', amount: 312, category: 'food', date: '2026-11-15', note: '超市补货：牛奶鸡蛋' },
  { id: 't06', type: 'expense', amount: 96,  category: 'food', date: '2026-11-18', note: '加班外卖' },
  { id: 't07', type: 'expense', amount: 188, category: 'food', date: '2026-11-21', note: '菜市场：排骨青菜' },
  { id: 't08', type: 'expense', amount: 342, category: 'food', date: '2026-11-25', note: '超市月末大采购' },
  { id: 't09', type: 'expense', amount: 254, category: 'food', date: '2026-11-28', note: '周末火锅' },
  // 住房 1,800
  { id: 't10', type: 'expense', amount: 1500, category: 'housing', date: '2026-11-01', note: '房租' },
  { id: 't11', type: 'expense', amount: 300,  category: 'housing', date: '2026-11-10', note: '物业 + 水电' },
  // 交通 420
  { id: 't12', type: 'expense', amount: 120, category: 'transport', date: '2026-11-03', note: '地铁公交卡充值' },
  { id: 't13', type: 'expense', amount: 180, category: 'transport', date: '2026-11-14', note: '加油' },
  { id: 't14', type: 'expense', amount: 68,  category: 'transport', date: '2026-11-22', note: '雨天打车' },
  { id: 't15', type: 'expense', amount: 52,  category: 'transport', date: '2026-11-27', note: '停车费' },
  // 购物 960
  { id: 't16', type: 'expense', amount: 420, category: 'shopping', date: '2026-11-06', note: '孩子冬衣两件' },
  { id: 't17', type: 'expense', amount: 265, category: 'shopping', date: '2026-11-11', note: '日用品：纸巾洗护' },
  { id: 't18', type: 'expense', amount: 275, category: 'shopping', date: '2026-11-20', note: '换季衣物' },
  // 娱乐 380
  { id: 't19', type: 'expense', amount: 128, category: 'fun', date: '2026-11-09', note: '周末电影票 3 张' },
  { id: 't20', type: 'expense', amount: 172, category: 'fun', date: '2026-11-17', note: '游乐场门票' },
  { id: 't21', type: 'expense', amount: 80,  category: 'fun', date: '2026-11-24', note: '家庭 KTV 两小时' },
  // 医疗 260
  { id: 't22', type: 'expense', amount: 86,  category: 'health', date: '2026-11-13', note: '孩子感冒药' },
  { id: 't23', type: 'expense', amount: 174, category: 'health', date: '2026-11-19', note: '牙科检查' },
  // 教育 640
  { id: 't24', type: 'expense', amount: 480, category: 'edu', date: '2026-11-07', note: '孩子兴趣班月费' },
  { id: 't25', type: 'expense', amount: 160, category: 'edu', date: '2026-11-16', note: '绘本 4 册' },
  // 其他 360
  { id: 't26', type: 'expense', amount: 128, category: 'other', date: '2026-11-11', note: '手机话费' },
  { id: 't27', type: 'expense', amount: 96,  category: 'other', date: '2026-11-23', note: '理发' },
  { id: 't28', type: 'expense', amount: 58,  category: 'other', date: '2026-11-26', note: '洗车' },
  { id: 't29', type: 'expense', amount: 78,  category: 'other', date: '2026-11-29', note: '快递费' }
];

var SAMPLE_BUDGETS = {
  food: 2400, housing: 1900, transport: 500, shopping: 1200,
  fun: 500, health: 400, edu: 800, other: 500
};

var SAMPLE_GOALS = [
  { id: 'g1', name: '孩子教育基金', target: 12000, saved: 7500, deadline: '2027-06-30' },
  { id: 'g2', name: '暑假家庭旅行', target: 6000,  saved: 2300, deadline: '2027-07-15' },
  { id: 'g3', name: '应急备用金',   target: 20000, saved: 9800, deadline: '2027-12-31' }
];

/* 近 6 个月收支趋势（6–10 月为已结月度汇总，11 月为本月实时汇总）。 */
var MONTHLY_TREND = [
  { month: '6月',  income: 10900, expense: 6850 },
  { month: '7月',  income: 11050, expense: 7420 },
  { month: '8月',  income: 10800, expense: 6980 },
  { month: '9月',  income: 11200, expense: 7150 },
  { month: '10月', income: 11150, expense: 7360 },
  { month: '11月', income: 11300, expense: 7000 }
];

var DEFAULT_STATE = {
  transactions: SAMPLE_TRANSACTIONS,
  budgets: SAMPLE_BUDGETS,
  goals: SAMPLE_GOALS
};
