# 伴生十灵 Personal Agent · 最终资料交接
日期：2026-10-23（Asia/Shanghai）
状态：Draft / 上下文待补全。此轮只整理规格和素材，没有开发业务代码。

## 交付边界
这是完整资料包，不是已整合的个人Agent产品。
包内唯一完整原型源码是 [source-handoff/app](source-handoff/app/index.html)，即原2D小曜快照。
当前bazi_cute的后端和像素页面没有复制进来；其现状和接口在design.md中记录。
继续在现有工程开发仍需取得实际宿主代码，不能把本包当作两套工程合并的结果。
本次未调用真实模型、迁移数据库、开发模型配置界面或自动长期记忆。

## 阅读顺序
1. [requirements.md](.kiro/specs/spirit-agent-integration/requirements.md)：需求、EARS验收、范围和状态。
2. [design.md](.kiro/specs/spirit-agent-integration/design.md)：三份上下文、模块边界、待定决策D01—D07。
3. [learning-agent参考报告](references/learning-agent-memory-design.md)：已有记忆机制、源码定位及不能照搬的部分。
4. [tasks.md](.kiro/specs/spirit-agent-integration/tasks.md)：需求追踪、依赖、阻塞和未来验收。
5. [原交接入口](source-handoff/START-HERE.md)及[素材说明](source-handoff/docs/05-assets.md)。
6. [打包检查报告](evidence/package-validation.json)：只证明本次文件检查，不证明业务功能通过。

## 已确认方向
- 当前只整理资料，不开发功能。
- 后续采用独立SQLite持久化，密钥留服务端，模型按需记忆；具体确认策略仍待统一。
- 展示组件可替换，生日、偏好和会话不因换组件丢失。
- 完整闭环优先，不再以两小时为硬截止。
- 原包传递的视觉基线是2D丙火“小曜”和暖林栖所，保留现有表情与互动。
- 不回到已否定的3D/手办方向；甲木加强版与己土仍需修改，十灵总览不是全部定稿。
- learning-agent只借鉴设计，不复制整个仓库、数据库或凭据，也不迁入其Python技术栈。

## 三份现状不可混用
| 来源 | 可核对的已有内容 | 缺口 |
|---|---|---|
| 当前bazi_cute | Node模型代理、生日计算、可替换像素展示、浏览器偏好和近期对话 | 无可视化模型配置、数据库和自动记忆 |
| 原2D交接包 | 小曜资产、栖息地、七状态与blink、点击/喂食/休息、预设聊天 | 无真实LLM、记忆服务或排盘 |
| learning-agent | SQLite记忆服务、工具写入/召回、最近6条注入、管理列表 | 本轮仅只读核对源码，没有重跑其测试或完成整合 |

## 继续协作前
先处理design.md的D01—D07：记忆确认、分类、纠错、宿主身份、八字口径、迁移归属和表现协议。
相关开发任务明确阻塞，不可把讨论过的建议当成已经确认。
接收方先核对资料与实际宿主；只有用户明确授权开发后再执行tasks.md。

## 原型查看
按[原README](source-handoff/README.md)，在解压目录运行：
    python -m http.server 8000 --directory source-handoff/app
打开 http://localhost:8000/ 。这是2D演示，不代表真实模型和记忆已接通。
原包校验脚本应以source-handoff为工作目录；运行会更新其历史报告，建议在副本执行。
本次没有运行原包脚本、重建素材或重验动态效果。

## 完整性与保密
原包所有文件按字节保存；顶层MANIFEST.sha256覆盖所有打包文件（自身除外），原清单也原样保留。
未读取或复制.env、SQLite库、密钥目录、浏览器数据或私人会话导出；原包历史创想文档原样保留。
未加入learning-agent业务源码、依赖或整个仓库，仅提供设计分析和来源文件相对路径/哈希。
旧截图与原包历史报告保持原意，不作为新功能验收。
