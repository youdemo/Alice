import sys
import os
from datetime import datetime

def add_memory(content, stm_path="memory/short_term_memory.md"):
    """
    向短期记忆文件追加内容，自动处理日期标题和时间戳。
    """
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    
    # 获取项目根目录（假设脚本在 skills/memory_manager/ 下运行，或者由项目根目录的 agent 运行）
    # agent.py 中设置了 cwd 为项目根目录，所以这里使用相对路径即可
    
    # 确保目录存在
    os.makedirs(os.path.dirname(stm_path), exist_ok=True)
    
    # 如果文件不存在，创建并添加标题
    if not os.path.exists(stm_path):
        with open(stm_path, "w", encoding="utf-8") as f:
            f.write("# Alice 的短期记忆 (最近 7 天)\n")
            f.write("这是 Alice 的短期 memory 空间，以“时间-事件-行动”格式记录最近 7 天的有价值交互。\n\n")

    # 读取内容检查日期标题
    with open(stm_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    has_date_header = False
    for line in lines:
        if line.strip() == f"## {date_str}":
            has_date_header = True
            break
    
    with open(stm_path, "a", encoding="utf-8") as f:
        if not has_date_header:
            f.write(f"\n## {date_str}\n")
        
        # 确保 content 不包含多余换行，并符合 Alice 的格式
        clean_content = content.strip()
        if not clean_content.startswith("- ["):
            f.write(f"- [{time_str}] {clean_content}\n")
        else:
            f.write(f"{clean_content}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python skills/memory_manager/memory_tool.py \"事件描述 | 行动记录\"")
        sys.exit(1)
    
    try:
        memory_text = sys.argv[1]
        add_memory(memory_text)
        print("成功更新短期记忆。")
    except Exception as e:
        print(f"更新记忆失败: {e}")
        sys.exit(1)
