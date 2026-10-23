# 05 素材清单与使用状态

[事实] app/assets 下8张PNG均720×680、RGBA透明底，来自同一张八姿态图裁切。当前PNG是整幅姿态，并非分离的耳朵、眼球、尾巴绘画图层。

| 文件 | 用途 | 状态 |
|---|---|---|
| idle.png | 自在站立，指针跟随基础 | 当前使用 |
| blink.png | 站立闭眼，约160ms眨眼切帧 | 当前使用；需继续检查轻微形变 |
| happy.png | 开心 | 当前使用 |
| startled.png | 受惊 | 当前使用；不是识别主人惊恐 |
| tired.png | 疲惫 | 当前使用 |
| hungry.png | 抱点心/贪吃 | 当前使用 |
| enjoy.png | 被摸后的享受 | 当前使用 |
| rest.png | 蜷缩休息 | 当前使用 |

[事实] CSS通过同一PNG的clip-path做区域动画，分界与转轴需配合当前720×680画布。换素材后不能原封照抄裁切比例；边缘可能露缝，需用录屏复查。它不是Live2D或逐帧连续动画。

[复现] `python scripts/rebuild_sprites.py` 需要另装Pillow，重建到 assets/rebuilt-sprites/，不会覆盖app素材。裁切基准：原图1774×887；x边界0/463/890/1323/1774；y边界0/460/887；alpha bbox裁切后等比放大1.4；置入720×680、底线650。不同Pillow版本可能导致像素hash变化，重建不等于原字节校验通过。

## 概念图决策

| 路径 | 含义 |
|---|---|
| concepts-approved/jia-yi-bing-2d-style-master.png | 用户接受的2D方向母版；甲木/乙木开心和好奇细节小改版本 |
| concepts-needs-rework/ten-spirits-v1.png | 初次补齐十灵；庚辛过像、土需更威猛、甲木需粗壮 |
| concepts-needs-rework/ten-spirits-v2-jia-ji-rejected.png | 庚辛已拉开；甲木被否定、己土与戊土仍像，不可作为全体最终定稿 |
| concepts-rejected/figurine-style-not-current.png | 早期精致手办方向，被要求改成更活泼卡通 |
| source-sheets/bing-original-three-poses.png | 原始待机/开心/睡眠三姿态；是历史参照，不是app当前帧源 |
| source-sheets/bing-eight-poses.png | 当前8姿态源图 |
| references/user-bing-reference.png | 用户提供的丙火四阶段概念图；不是实际“疲惫检测”功能证据 |

[建议] 下一轮先复用现有丙火，不为每条对话实时生图。新增动作先命名并加入白名单，再补相应帧或图层。
[边界] 本包不含另外九只角色的独立透明图、完整表情集、3D模型、骨骼、PSD/Live2D工程或训练模型权重。总览中的角色需单独制作后才能投入运行。
