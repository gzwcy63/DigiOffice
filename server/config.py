import os
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()

# 从环境变量中读取，如果没有则使用下方的默认值（仅用于开发测试）
BAIDU_OCR_APP_ID = os.getenv("BAIDU_OCR_APP_ID", "你的AppID")
BAIDU_OCR_API_KEY = os.getenv("BAIDU_OCR_API_KEY", "你的API Key")
BAIDU_OCR_SECRET_KEY = os.getenv("BAIDU_OCR_SECRET_KEY", "你的Secret Key")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "你的DeepSeek API Key")
# DeepSeek 的基础 URL，通常不需要修改
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")