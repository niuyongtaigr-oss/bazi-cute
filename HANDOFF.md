# HANDOFF · 灵魂方程 · 守护灵（bazi_cute）

> 交接日期：2026-10-23（Asia/Shanghai）
> 状态：**可演示的 Demo，不是产品**。核心链路已跑通并在线验证，无后端、无账号体系、无记忆。
> 接收方请先读第 3 节（边界）和第 9 节（已知坑），再动代码。

---

## 1. 一句话

**输入生辰 → 算出四柱八字 → 程序化生成一只专属守护灵 → 出可下载卡片 → 进入它的栖所。**

产品的赌注是一句话：*同一个八字，永远生成同一只。这不是抽卡，是你的出厂设置。*

---

## 2. 目标

### 2.1 产品愿景（来自 docs/02-构想版.md）
「东方灵魂方程」= 八字（出厂设置）+ 桌面宠物（陪伴）+ 宝可梦（收集/养成）+ 数字孪生。核心不是算命，是**情感投射**：让用户觉得"它像我"。

### 2.2 本阶段目标（已达成部分）
可离线、可断网、单人 150 分钟内做出来、能在投影仪上 30 秒讲清楚的演示件。

### 2.3 明确不在本阶段
登录、账号、SQLite/云端持久化、真实 LLM 对话、模型配置界面、长期记忆、支付。

---

## 3. 边界（接手前必须同意）

### 3.1 硬约束（违反即破坏产品）
1. **零网络请求**：页面不得 fetch 任何外部资源，不得引 CDN、字体、图标库。断网必须可跑。
2. **确定性形象**：同一八字必须生成完全相同的形象。禁止引入随机数参与形象生成。
3. **只做加法**：`docs/`、`.kiro/specs/spirit-agent-integration/`、`spirit/` 下三处原始交接材料**只读**，不得改写、删除。它们是证据链。
4. **免责声明必须存在**：页脚「娱乐向 · 非命理咨询」不得移除。
5. **不做命理断言**：不输出疾病、生死、婚姻吉凶、投资建议。

### 3.2 当前状态的诚实描述
- `spirit/`（2D 小曜）是**原封不动搬进来的独立页面**，与本项目没有代码级整合，只有一个链接跳转。不要声称它已合并。
- `.kiro/specs/spirit-agent-integration/` 里的 requirements/design/tasks 是外部交接包带来的，其中 **D01–D07 七个决策仍未定**，对应的开发任务处于阻塞状态。不要把这些讨论当成已确认结论。

---

## 4. 现状：能跑什么

| 能力 | 状态 | 说明 |
|---|---|---|
| 生辰输入（日期 + 十二时辰） | ✅ | 原生 `<input type=date>` + `<select>` |
| 四柱（年月日时干支） | ✅ | 基于 lunar-javascript，真节气 |
| 农历日期 / 节令 | ✅ | 显示"农历乙亥年五月十八 · 芒种后" |
| 五行统计 | ✅ | 天干 1 分 + 地支藏干加权（0.6/0.3/0.1） |
| 身强身弱 | ✅ | 月令 + 帮扶 − 克泄耗，0–100 分 |
| 守护灵形象 | ✅ | SVG 参数化，五行决定物种/配色，时柱决定耳型，八字哈希微调 |
| 性格文案 | ✅ | 日主天干 10 套模板 |
| 「今天」文案 | ✅ | 按缺失/最旺五行选模板 |
| 卡片导出 1080×1920 PNG | ⚠️ | 代码完成，**未在真机验证下载行为** |
| 2D 小曜栖所 | ✅ | 独立页面，含 7 状态、blink、点击/喂食/休息、预设对话 |
| **真实 LLM 对话** | ✅ | `/live/` 页面，OpenAI 兼容接口，SSE 流式；画像自动注入 system prompt |
| **本地代理 `server.js`** | ✅ | 零依赖 Node，Key 留服务端，浏览器只连 127.0.0.1:8787 |
| 手机适配 | ⚠️ | 有 viewport 与响应式，未系统测试 |

---

## 5. 文件地图

```
bazi_cute/
├── index.html          # 主页面：表单 + 四柱 + 五行 + 形象 + 卡片导出（599 行）
├── live/index.html     # 真实 LLM 对话页（画像从 localStorage 读取）
├── server.js           # 零依赖 Node 代理：Key 留服务端，SSE 透传
├── lunar.js            # lunar-javascript 1.7.7，426KB，本地加载（勿删）
├── spirit/             # 2D 小曜栖所（来自外部交接包，原样保留）
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── classic.html
│   └── assets/         # 8 张 PNG：idle/blink/happy/enjoy/hungry/tired/rest/startled
├── docs/
│   ├── 01-MVP验证版.md      # 商业化验证路线图（四阶段）
│   ├── 02-构想版.md         # 产品构想（2.9MB，含内嵌图）
│   └── handoff/             # 外部交接包说明与素材清单
│       ├── START-HERE.md
│       └── 05-assets.md
├── .kiro/specs/spirit-agent-integration/   # 外部规格（requirements/design/tasks）
├── .gitignore
└── HANDOFF.md          # 本文件
```

**`index.html` 与 `lunar.js` 必须同目录。** 分开部署会直接白屏。

---

## 6. 关键决策（及被否定的方案）

| # | 决策 | 理由 | 被否定的 |
|---|---|---|---|
| D1 | 四柱改用 `lunar-javascript` | 手写节气表只能近似到"每月 4–8 日"，遇到像 1984-02-02 这种立春前后会算错年柱 | 纯手写儒略日 + 近似节气（代码已删除） |
| D2 | 形象用 **SVG 参数化生成** | 离线、确定性、零成本、同八字必然同形 —— 正好对应"IP 一致性"这个护城河 | 调用图像模型（要网络/额度/不可复现） |
| D3 | 保留 `spirit/` 原样，不改造 | 它是唯一一张已定稿的视觉资产（丙火小曜），改坏等于毁掉视觉基线 | 重画一套统一的十灵形象（时间不够） |
| D4 | 允许 `lunar.js` 作为独立文件 | 426KB 内联进 HTML 会让文件不可读 | 坚持严格单文件 |
| D5 | 不接后端 | 交接包 D01–D07 未决，且演示不需要 | 先搭 Node 代理 + SQLite（原 bazi_cute 的做法） |
| D6 | LLM 走**代理优先**，前端直连仅作本地调试 | Pages 是公开静态站，Key 进前端等于公开泄露 | 纯前端直连（会暴露 Key，且受 CORS 限制） |
| D7 | 画像（四柱/日主/强弱/缺五行）写进 system prompt | 让回答"像它"，而不是通用助手口吻 | 让模型自己去算八字（不可控、易错） |

---

## 7. 证据（可复核）

### 7.1 四柱正确性

**A. 与原工程 `bazi-calculator.js` 的逐条对比（92 个样本）**

| 对比项 | 不一致数 |
|---|---|
| 四柱（年/月/日/时 干支） | **0 / 92** |
| 五行计数（藏干加权） | **0 / 92** |
| 身强身弱等级 | **0 / 92** |
| 身强身弱分数 | **0 / 92** |

样本覆盖：立春前后（2/3、2/4、2/5 × 8 个年份）、十二个节气交界日各两天、闰年 2/29、1900 与 2100 边界、子时与零点、40 个 1900–2100 随机日期。

> 注：对比时对原脚本做了 4 处 API 适配（见第 8 节第 1 条），因为它写的 `getYearGan().getName()` 在 lunar-javascript 1.7.7 上会直接抛错。等级枚举做了映射（`strong→身强 / balanced→中和 / weak→身弱`）。

**B. 四个手工样本（含边界）**

```
1995-06-15 12:00 → 乙亥 壬午 丁丑 丙午 | 农历乙亥年五月十八 | 芒种 | 日主 丁火
1984-02-02 00:00 → 癸亥 乙丑 丙寅 戊子 | 农历甲子年正月初一 | 大寒 | 日主 丙火   ← 立春前，年柱仍属癸亥
2000-12-31 22:00 → 庚辰 戊子 癸亥 癸亥 | 农历庚辰年腊月初六 | 冬至 | 日主 癸水
2026-10-23 14:00 → 丙午 戊戌 庚午 癸未 | 农历丙午年九月十四 | 寒露 | 日主 庚金
```

复核命令：

```bash
node -e "const {Solar}=require('./lunar.js');const l=Solar.fromYmdHms(1995,6,15,12,0,0).getLunar();console.log(l.getEightChar().toString(), l.getYearInGanZhi(), l.getMonthInChinese()+'月'+l.getDayInChinese())"
```

### 7.2 确定性
同一生辰连续生成两次，SVG 输出字节完全一致；不同生辰输出不同。已验证于浏览器内。

### 7.3 部署
```
https://niuyongtaigr-oss.github.io/bazi-cute/          200
https://niuyongtaigr-oss.github.io/bazi-cute/lunar.js  200
https://niuyongtaigr-oss.github.io/bazi-cute/spirit/   200
```
仓库 `niuyongtaigr-oss/bazi-cute`，分支 `master`，Pages 从 root 部署。

### 7.4 LLM 链路（已验证到 mock 层）
用本地 mock SSE 上游验证过完整链路：

```
浏览器 /live/  →  POST 127.0.0.1:8787/v1/chat/completions
               →  server.js 转发（加 Authorization）
               →  mock 上游逐字吐 SSE
               →  页面逐字渲染，最终文本：「你今天看着有点累。先坐一会儿。」
```

**未验证**：真实供应商（DeepSeek/Moonshot/OpenAI）的连通性与 CORS 表现 —— 因为没有真实 Key。接真实 Key 后必须重跑一次。

### 7.5 未验证的部分（不要当成已完成）
- PNG 实际下载（iOS Safari / Chrome / 桌面）—— **P0**
- 手机真机布局
- 卡片在 1080×1920 下中文是否裁切

---

## 8. 已知坑

1. **`lunar.js` 的 API 与旧工程不一致**。外部工程 `bazi-calculator.js` 里写的是 `bazi.getDayGan().getName()`，而 1.7.7 中 `getDayGan()` **直接返回字符串**。照抄旧代码会报 `getName is not a function`。
2. **子时跨日未处理**。当前 23:00–24:00 按当日 0 点计算（早子时），传统上有"晚子时进次日"的流派。若要做对，需在 `HOUR_MAP` 与日期上做偏移。
3. **时辰只到 2 小时粒度**，无法输入具体分钟，节气交界日出生的人可能差一个柱。
4. **身强身弱是简化模型**（50 基准 ± 权重），不是专业排盘结论。对外必须标注"演示用"。
5. **形象只有 5 种**（按五行），不是构想中的"十灵"（按日主天干）。小曜只有丙火一只。
6. **顶部那个悬浮小圆点**（五行符号）视觉突兀，需要调位置或去掉。
7. **仓库含 2.9MB 的 Markdown**（02-构想版.md 内嵌图），clone 较慢，可考虑 Git LFS 或移到 releases。

---

## 9. 建议的下一步（按优先级）

| P | 任务 | 预估 | 备注 |
|---|---|---|---|
| P0 | 真机验证卡片下载；修中文裁切 | 1h | 演示的核心动作之一，必须先确认 |
| P1 | 十神上 UI | 1.5h | `shiShen()` 已写好，只差展示与文案模板 |
| P2 | 用 `MAPPING_RULES.md` 替换简化映射 | 3h | 外部工程已有完整映射表，能让形象与性格更"像人" |
| P3 | 把输入框搬进 `spirit/`，两个页面合成一个体验 | 2h | 现在要在两个 URL 之间跳，演示时割裂 |
| P4 | 大运流年 | 3h | `getDaYun`/`getLiuNian` 算法在外层工程有参考实现 |
| P5 | 后端 + 记忆 | 需先定 D01–D07 | 不要在没有决策的情况下开工 |

---

## 10. 环境

- 开发机：Windows 11 + **WSL2 Ubuntu 24.04**，项目在 WSL 文件系统（`~/project/bazi_cute`），不在 `/mnt/c`
- Node v22（仅用于本地验证脚本，页面本身不需要 Node）
- Python 3（本地预览：`python3 -m http.server 8000`）
- Git remote：`git@github.com:niuyongtaigr-oss/bazi-cute.git`
- 无构建步骤、无依赖安装、无 CI

本地跑：

```bash
cd ~/project/bazi_cute
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

**不要用 `file://` 双击打开来验证卡片下载**，某些浏览器对 `file://` 的 download 属性有限制，会得出错误结论。

### 10.1 打开真实对话（三步）

```bash
# 1. 起代理（Key 只在这里）
LLM_KEY=sk-你的key node server.js
#    换供应商：加 LLM_UPSTREAM=https://api.moonshot.cn/v1/chat/completions LLM_MODEL=moonshot-v1-8k
#    本地 Ollama：LLM_UPSTREAM=http://127.0.0.1:11434/v1/chat/completions LLM_MODEL=qwen2.5

# 2. 起静态服务
python3 -m http.server 8000

# 3. 浏览器打开 → 生成守护灵 → 点「和它说说话」
#    → 右下角「模型设置」→ 接口地址填 http://127.0.0.1:8787/v1/chat/completions
#    → API Key 留空 → 保存
```

页面底部状态栏会从「未配置模型」变成「● 模型名 · 代理」。没有配置时自动退回预设回复，不会报错。

**部署到公网时**：`server.js` 不能跟着 Pages 走，需要单独部署（任意 Node 托管），再把地址填进「模型设置」。或者接受"页面走预设、对话演示在本地跑"。

---

## 11. 参考资料（都在仓库内）

| 文件 | 内容 |
|---|---|
| `docs/01-MVP验证版.md` | 商业化四阶段验证：烟雾弹 → 礼宾 → 绿野仙踪 → 技术 POC |
| `docs/02-构想版.md` | 产品愿景、十神拟人、未来沙盘、商业价值 |
| `.kiro/specs/spirit-agent-integration/design.md` | 外部交接的三份上下文、模块边界、**待决 D01–D07** |
| `.kiro/specs/spirit-agent-integration/tasks.md` | 需求追踪、依赖、阻塞项 |
| `.kiro/specs/spirit-agent-integration/requirements.md` | EARS 验收标准 |
| `docs/handoff/START-HERE.md` | 外部交接包原始说明（阅读顺序、三份现状不可混用） |
| `docs/handoff/05-assets.md` | 视觉素材说明 |

**外部工程**（含完整 `bazi-calculator.js` v0.2、`spirit-mapper.js`、`MAPPING_RULES.md`、`mvp-prototype.html`）不在本仓库内，需向项目所有者索取。那是十神映射与大运流年的参考实现。

---

## 12. 接手第一步（Checklist）

- [ ] `git log --oneline` 看四个提交，理解演进顺序
- [ ] `python3 -m http.server` 起服务，走一遍完整链路（填生日 → 召唤 → 存卡 → 进栖所）
- [ ] 用第 7.1 节的四个样本核对你改过的算法，**改动四柱相关代码后必须重跑**
- [ ] 读第 3 节边界，确认你接受"确定性"和"只读证据"这两条
- [ ] 读 `.kiro/specs/.../design.md` 的 D01–D07，**不要自行替所有者决定**
- [ ] 先做 P0（真机验证导出），再谈新功能

---

> 本文件描述的是 2026-10-23 的真实状态，不是计划。任何在此之后的改动，请更新第 4 节的表格与第 7 节的证据。
