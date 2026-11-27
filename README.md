# 小家账本 · 家庭月度预算管家

一家三口的月度预算工具：记账、分类预算、储蓄目标，全在浏览器本地跑，不联网、不上传，离线也能用。

[![make.fun bounty](https://make.fun/badge/bounty/best-household-budget-site-20261126-1457)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![make.fun entry](https://make.fun/badge/entry/best-household-budget-site-20261126-1457)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 四个页面

- **总览**（`#/`）：月收入 / 月支出 / 本月结余 / 储蓄率四张统计卡；分类支出环形图；近 6 个月收支趋势柱状图；最近 6 笔；本月预算进度。
- **记账**（`#/transactions`）：记一笔收入/支出（金额、分类、日期、备注），可编辑、可删除；按类型、分类筛选，按日期/金额排序，备注可搜索；导出 CSV；一键恢复示例数据 / 清空。
- **预算**（`#/budgets`）：8 个分类各自设月度预算，进度条实时显示已花占比，花到 90% 提醒、超支变红。
- **储蓄目标**（`#/goals`）：新建目标、往目标里存钱、删目标，进度条显示完成度。

## 示例数据

预置了一家三口 2026 年 11 月的账本，数字自洽：收入 ¥11,300（工资 ¥9,800 + 兼职 ¥1,500），支出 ¥7,000，结余 ¥4,300，储蓄率 38.1%。分类支出：餐饮 ¥2,180、住房 ¥1,800、交通 ¥420、购物 ¥960、娱乐 ¥380、医疗 ¥260、教育 ¥640、其他 ¥360。

## 本地运行

```sh
# 任选其一，打开 http://localhost:8080
npx --yes serve app -l 8080
# 或
python3 -m http.server 8080 --directory app
```

数据存在浏览器 localStorage（键 `xiaojiabook-v1`），只留本机。图表是手写 SVG，没有任何外部依赖——整个站零网络请求。

## 参赛提交

这是 [make.fun](https://make.fun)「Make the best household budget site」比赛的参赛作品。`main.ts`（Node 22，标准库 only）把 `app/` 与 `screenshots/` 复制到输出目录，并用 `vendor/makefun-frontend.ts`（kit 原样复制）生成 `dossier.json`：

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## 许可证

MIT，见 [LICENSE](LICENSE)。
