import os
import uuid
import base64
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from datetime import datetime
from docx import Document
from docx.shared import Pt, Inches
import config
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= 百度 OCR 服务 =================
def get_baidu_ocr_token():
    """获取百度 OCR 的 access_token"""
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_token",
        "client_id": config.BAIDU_OCR_API_KEY,
        "client_secret": config.BAIDU_OCR_SECRET_KEY,
    }
    try:
        response = requests.post(url, params=params, timeout=10)
        print(f"[DEBUG] 百度Token响应状态: {response.status_code}")
        result = response.json()
        print(f"[DEBUG] 百度Token响应: {result}")
        if "access_token" in result:
            print("[DEBUG] ✅ 获取百度Token成功")
            return result.get("access_token")
        else:
            print(f"[ERROR] 获取百度Token失败: {result}")
            return None
    except Exception as e:
        print(f"[ERROR] 百度Token请求异常: {e}")
        return None

def call_baidu_ocr(image_base64):
    """调用百度通用文字识别"""
    token = get_baidu_ocr_token()
    if not token:
        print("[ERROR] ❌ 无法获取百度Token")
        return {"error": "无法获取百度Token，请检查API Key和Secret Key"}
    
    url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token={token}"
    payload = {"image": image_base64}
    headers = {"content-type": "application/x-www-form-urlencoded"}
    
    try:
        response = requests.post(url, data=payload, headers=headers, timeout=30)
        print(f"[DEBUG] 百度OCR响应状态: {response.status_code}")
        result = response.json()
        print(f"[DEBUG] 百度OCR响应内容: {str(result)[:500]}...")  # 只打印前500字符
        return result
    except Exception as e:
        print(f"[ERROR] 百度OCR调用异常: {e}")
        return {"error": str(e)}

# ================= DeepSeek API 服务 =================
def call_deepseek(prompt):
    """调用 DeepSeek API 生成内容"""
    url = f"{config.DEEPSEEK_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {config.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个专业的财务助手，帮助用户生成规范的报销单内容。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    try:
        response = requests.post(url, json=data, headers=headers, timeout=60)
        result = response.json()
        return result.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        print(f"[ERROR] DeepSeek API调用失败: {e}")
        return None

# ================= 前端 API 接口 =================
@app.get("/")
def read_root():
    return {"message": "数智办公 - 报销会计后端服务已启动"}

@app.post("/api/ocr")
async def ocr_invoice(file: UploadFile = File(...)):
    """接收图片/PDF，调用百度 OCR 识别"""
    print(f"[DEBUG] ===== 收到OCR请求 =====")
    print(f"[DEBUG] 文件名: {file.filename}")
    print(f"[DEBUG] 文件类型: {file.content_type}")
    
    try:
        # 读取文件
        image_data = await file.read()
        print(f"[DEBUG] 文件大小: {len(image_data)} 字节")
        
        if len(image_data) == 0:
            print("[ERROR] ❌ 文件为空")
            return JSONResponse(
                status_code=400,
                content={"code": 400, "detail": "上传的文件为空，请重新上传"}
            )
        
        # 转换为 base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        print("[DEBUG] ✅ Base64编码完成")
        
        # 调用百度 OCR
        print("[DEBUG] 正在调用百度OCR...")
        ocr_result = call_baidu_ocr(image_base64)
        
        if ocr_result is None:
            print("[ERROR] ❌ OCR返回空结果")
            return JSONResponse(
                status_code=500,
                content={"code": 500, "detail": "OCR服务无响应，请稍后重试"}
            )
        
        # 检查OCR错误
        if "error" in ocr_result:
            error_msg = ocr_result.get("error", {}).get("msg", "未知错误")
            print(f"[ERROR] ❌ OCR返回错误: {error_msg}")
            return JSONResponse(
                status_code=500,
                content={"code": 500, "detail": f"OCR识别失败: {error_msg}"}
            )
        
        # 提取文字结果
        if "words_result" not in ocr_result:
            print(f"[WARN] OCR结果中没有words_result: {ocr_result}")
            return JSONResponse(
                status_code=500,
                content={"code": 500, "detail": "OCR识别失败，请确认图片包含清晰文字"}
            )
        
        words = [item["words"] for item in ocr_result.get("words_result", [])]
        full_text = "\n".join(words)
        print(f"[DEBUG] OCR识别到 {len(words)} 行文字")
        print(f"[DEBUG] 识别内容预览: {full_text[:200]}...")
        
        if not full_text.strip():
            print("[WARN] OCR识别结果为空")
            return JSONResponse(
                status_code=500,
                content={"code": 500, "detail": "未识别到任何文字，请确认发票图片清晰"}
            )
        
        # 提取关键字段
        invoice_data = {
            "full_text": full_text,
            "number": "",
            "amount": "",
            "seller": "",
            "date": ""
        }
        
        for line in words:
            line_clean = line.replace(" ", "").replace("\t", "")
            if "号码" in line_clean or "No." in line or "发票号码" in line_clean:
                import re
                match = re.search(r'[\dA-Za-z]+', line_clean)
                if match:
                    invoice_data["number"] = match.group()
            if "金额" in line_clean and "税" not in line_clean:
                import re
                match = re.search(r'(\d+\.?\d*)', line_clean)
                if match:
                    invoice_data["amount"] = match.group()
            if "销售方" in line_clean or "销方" in line_clean or "收款人" in line_clean:
                import re
                match = re.search(r'[:：]\s*(.+?)(?:\s|$)', line_clean)
                if match:
                    invoice_data["seller"] = match.group(1).strip()
            if "开票日期" in line_clean or "日期" in line_clean:
                import re
                match = re.search(r'(\d{4}[-年]\d{1,2}[-月]\d{1,2})', line_clean)
                if match:
                    invoice_data["date"] = match.group(1).replace("年", "-").replace("月", "-")
        
        # 如果seller还是空，尝试取第一行含"公司"或"有限"的内容
        if not invoice_data["seller"]:
            for line in words:
                if "公司" in line or "有限" in line or "集团" in line:
                    invoice_data["seller"] = line.strip()
                    break
        
        # 如果amount还是空，尝试找包含"合计"的行
        if not invoice_data["amount"]:
            for line in words:
                if "合计" in line:
                    import re
                    match = re.search(r'(\d+\.?\d*)', line)
                    if match:
                        invoice_data["amount"] = match.group()
                        break
        
        print(f"[DEBUG] ✅ 提取结果: 号码={invoice_data['number']}, 金额={invoice_data['amount']}, 销方={invoice_data['seller'][:20]}")
        
        return {
            "code": 0,
            "data": invoice_data
        }
        
    except Exception as e:
        print(f"[ERROR] OCR接口异常: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"code": 500, "detail": f"服务器内部错误: {str(e)}"}
        )

@app.post("/api/generate_word")
async def generate_word(
    department: str = Form(...),
    operator: str = Form(...),
    category: str = Form(...),
    amount: str = Form(...),
    remark: str = Form(""),
    report_date: str = Form(...),
    invoice_number: str = Form(""),
    seller: str = Form("")
):
    """生成报销单 Word 文档"""
    try:
        doc = Document()
        title = doc.add_heading('报销单', 0)
        title.alignment = 1
        
        table = doc.add_table(rows=8, cols=2)
        table.style = 'Table Grid'
        
        fields = [
            ("部门", department),
            ("报销人", operator),
            ("类别", category),
            ("金额", f"¥{amount}"),
            ("备注", remark),
            ("报销时间", report_date),
            ("发票号码", invoice_number or "无"),
            ("销方", seller or "无")
        ]
        
        for i, (label, value) in enumerate(fields):
            row = table.rows[i]
            row.cells[0].text = label
            row.cells[0].paragraphs[0].runs[0].bold = True
            row.cells[1].text = value
        
        doc.add_paragraph()
        p = doc.add_paragraph()
        p.add_run("报销人签字：").bold = True
        p.add_run(" " * 20)
        p.add_run("日期：").bold = True
        p.add_run(datetime.now().strftime("%Y-%m-%d"))
        
        filename = f"报销单_{operator}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        filepath = os.path.join("generated", filename)
        os.makedirs("generated", exist_ok=True)
        doc.save(filepath)
        
        return {"code": 0, "data": {"filename": filename, "url": f"/download/{filename}"}}
    except Exception as e:
        print(f"[ERROR] 生成Word错误: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_file(filename: str):
    filepath = os.path.join("generated", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(filepath, filename=filename)

# ================= 启动服务 =================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print("=" * 50)
    print("🚀 启动数智办公后端服务...")
    print(f"📡 访问地址: http://0.0.0.0:{port}")
    print(f"📖 API文档: http://0.0.0.0:{port}/docs")
    print(f"📂 generated目录: {os.path.abspath('generated')}")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=port)