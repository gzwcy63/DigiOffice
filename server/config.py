import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

# Try railway_vars as fallback (for when Railway doesn't inject env vars)
try:
    from railway_vars import *
    BAIDU_OCR_APP_ID = RAILWAY_BAIDU_OCR_APP_ID
    BAIDU_OCR_API_KEY = RAILWAY_BAIDU_OCR_API_KEY
    BAIDU_OCR_SECRET_KEY = RAILWAY_BAIDU_OCR_SECRET_KEY
    DEEPSEEK_API_KEY = RAILWAY_DEEPSEEK_API_KEY
    DEEPSEEK_BASE_URL = "https://api.deepseek.com"
    print("[CONFIG] Using railway_vars.py")
except:
    # Use system env vars
    BAIDU_OCR_APP_ID = os.getenv("BAIDU_OCR_APP_ID", "")
    BAIDU_OCR_API_KEY = os.getenv("BAIDU_OCR_API_KEY", "")
    BAIDU_OCR_SECRET_KEY = os.getenv("BAIDU_OCR_SECRET_KEY", "")
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    print("[CONFIG] Using system env vars")

print(f"[CONFIG] BAIDU_OCR_APP_ID={'SET' if BAIDU_OCR_APP_ID else 'MISSING'}", flush=True)
print(f"[CONFIG] BAIDU_OCR_API_KEY={'SET' if BAIDU_OCR_API_KEY else 'MISSING'}", flush=True)
