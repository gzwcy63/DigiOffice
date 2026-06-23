import os

# 直接从系统环境变量读取（Railway 自动注入）
# 如果没找到，尝试从当前目录 .env 文件加载
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

BAIDU_OCR_APP_ID = os.environ.get("BAIDU_OCR_APP_ID") or os.getenv("BAIDU_OCR_APP_ID", "")
BAIDU_OCR_API_KEY = os.environ.get("BAIDU_OCR_API_KEY") or os.getenv("BAIDU_OCR_API_KEY", "")
BAIDU_OCR_SECRET_KEY = os.environ.get("BAIDU_OCR_SECRET_KEY") or os.getenv("BAIDU_OCR_SECRET_KEY", "")

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY") or os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.environ.get("DEEPSEEK_BASE_URL") or os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

# 启动时打印调试
print(f"[CONFIG] BAIDU_OCR_APP_ID={'已设置' if BAIDU_OCR_APP_ID else '未设置'}")
print(f"[CONFIG] BAIDU_OCR_API_KEY={'已设置' if BAIDU_OCR_API_KEY else '未设置'}")
print(f"[CONFIG] BAIDU_OCR_SECRET_KEY={'已设置' if BAIDU_OCR_SECRET_KEY else '未设置'}")
print(f"[CONFIG] DEEPSEEK_API_KEY={'已设置' if DEEPSEEK_API_KEY else '未设置'}")
