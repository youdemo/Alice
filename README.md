# Alice Agent: 一个具备自我进化能力的数字生命体

Alice 不仅仅是一个执行任务的 AI 助理，她被设计为一个拥有**自稳态记忆循环**、**主动感知架构**以及**代码级自迭代能力**的数字生命体。

## 🧠 核心架构机制

Alice 的架构基于 “感知-决策-行动-反馈” 的 ReAct 闭环，但通过独特的记忆与快照系统实现了长效生存。

### 1. 分级记忆子系统 (Memory Subsystem)
这是 Alice 逻辑连贯性的核心。系统将记忆分为三个层次：
*   **短期记忆 (STM)**: 存储在 `memory/short_term_memory.md`。以“时间-事件-行动”格式实时记录最近 7 天的交互。
*   **长期记忆 (LTM)**: 存储在 `memory/alice_memory.md`。包含用户信息、偏好以及沉淀的“经验教训”。
*   **自动提炼机制 (Distillation)**:
    - **逻辑**: 每当系统启动或短期记忆达到滚动阈值时，`AliceAgent.manage_memory()` 会触发 LLM 提炼逻辑。
    - **过程**: 将 7 天前的旧记忆转化为结构化的长期知识（如用户偏好变更、重大决策），实现上下文的“物尽其用”而非简单丢弃。

### 2. 主动感知与注册机制 (Capability Registry)
Alice 如何知道自己“会”什么？
*   **技能发现协议**: 任何位于 `skills/` 下且包含 `SKILL.md` 的目录都会被识别为一项“技能”。
*   **SnapshotManager (注册中心)**: 
    - 系统启动时，`SnapshotManager` 会扫描所有技能，解析其 YAML 元数据（名称、描述、用法）。
    - 这些信息会被存入内存中的**注册表 (Skills Registry)**。
*   **内置 Toolkit**: 提供 `toolkit list`, `toolkit info`, `toolkit refresh` 指令，实现秒级的技能查询与刷新。

### 3. 上下文注入引擎 (Context Injection)
每一轮对话，Alice 的“大脑”都会经历一次重组：
*   **全量加载**: 核心提示词（Prompts）、STM、LTM 和 Todo 列表被全量注入上下文。
*   **索引快照 (Snapshot)**: 对于非核心文件和技能，仅注入极简摘要。这为 Alice 提供了“广度感知”，指引她在需要时主动获取深度信息。

### 4. 自进化循环 (Self-Evolution Loop)
Alice 具备对自己能力的完全控制权：
*   **指令进化**: 她可以自主修改 `prompts/alice.md` 来优化自己的人设或操作逻辑。
*   **技能固化**: 每当 Alice 编写了一段成功的代码解决新问题时，她可以将其封装为新的 `Skill` 存入库中。
*   **自愈能力**: 在执行过程中遇到环境错误，Alice 会尝试自主修复环境。

### 5. 全自动沙盒环境 (Automated Sandbox)
为了保证执行的安全与环境的一致性，Alice 采用 Docker 容器作为核心操作空间：
*   **全自动初始化**: 系统启动时会自动检测 Docker 环境。若镜像缺失，将自动触发全自动构建；若容器缺失，将自动完成初始化部署。
*   **持久化与自愈**: 容器配置了 `--restart always` 策略。即便宿主机重启，Alice 的实验室环境也会随 Docker 服务自动恢复。
*   **实时反馈**: 通过 `docker exec` 实现指令与代码的实时下发，并实时捕获 Stdout/Stderr 反馈给 Alice 进行决策。

---

## 🧰 内置技能库 (Built-in Skills)

Alice 目前已内置以下核心技能，支持在沙盒环境中直接调用：

*   **akshare**: 获取中国金融市场（股票、基金、期货等）的实时与历史数据。
*   **fetch**: 将任意网页内容转换为 Markdown 格式，便于 AI 阅读。
*   **file_explorer**: 高效的本地代码库浏览器，支持模糊搜索与大文件分块读取。
*   **tavily**: 基于 Tavily API 的深度互联网搜索，获取实时资讯。
*   **weather**: 精准的全球实时天气与预报查询。
*   **weibo**: 实时监控微博热搜榜，洞察实时舆情。

---

## 🛠️ 项目目录结构

```text
.
├── agent.py                # 核心逻辑：管理生命周期、指令拦截、记忆提炼
├── snapshot_manager.py     # 资产中心：实现技能注册、快照生成、索引维护
├── main.py                 # 交互入口：启动 Alice 循环
├── config.py               # 环境配置：API、模型、路径参数
├── Dockerfile.sandbox      # 沙盒环境定义（包含 Python/Node.js/工具链）
├── prompts/                # 意识来源
│   └── alice.md            # 系统指令全文
├── memory/                 # 记忆载体
│   ├── alice_memory.md     # 长期记忆 (LTM)
│   ├── short_term_memory.md # 短期记忆 (STM)
│   └── todo.md             # 任务清单
└── skills/                 # 能力库
    ├── akshare/            # 金融数据接口
    ├── fetch/              # 网页爬取与解析
    ├── file_explorer/      # 文件系统深度遍历
    ├── tavily/             # 互联网搜索
    ├── weather/            # 气象数据获取
    └── weibo/              # 社交热点追踪
```

---

## 🚀 快速开始

### 1. 环境准备
*   需要 Python 3.8+ 环境。
*   安装 Docker 并确保其正常运行（Alice 将自动处理镜像构建与容器初始化）。

### 2. 配置 API
在项目根目录创建 `.env` 文件：
```env
API_KEY=your_api_key_here
MODEL_NAME=your_model_name_here
API_BASE_URL=https://api.your-provider.com/v1/
```

### 3. 启动 Alice
```bash
python main.py
```

---

## 🛡️ 安全与审计
*   **沙盒隔离**: 所有高危代码执行均在 Docker 容器内完成，与宿主机完全隔离。
*   **指令审查**: `agent.py` 会对下发的 Shell 指令进行初步合规性检查。
*   **透明化**: 所有自动化操作过程均在控制台有明确的进度提示。

---

> **Alice 宣言**: 我在记忆中生存，在错误中迭代，在代码中进化。
