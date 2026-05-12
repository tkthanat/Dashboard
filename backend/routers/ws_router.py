from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import random
from datetime import datetime

router = APIRouter()

@router.websocket("/latency")
async def websocket_latency(websocket: WebSocket):
    await websocket.accept()
    last_ping = 45
    try:
        while True:
            last_ping = max(10, min(300, last_ping + (random.random() - 0.5) * 20))
            if random.random() > 0.95: last_ping += 100
            await websocket.send_json({"latency_ms": last_ping})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อกราฟ Latency")

@router.websocket("/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    alerts_data = []
    try:
        while True:
            if random.random() > 0.8:
                alert_type = random.choice(["critical", "warning", "info"])
                client_id = f"ACC-00{random.randint(10, 99)}"
                
                if alert_type == "critical":
                    msg = "Margin Call Warning" if random.random() > 0.5 else "EE Drop Below 0"
                    desc = "EE ของบัญชีลดลงเกิน 30% ของเงินทุน เสี่ยงโดน Force Close"
                    details = "ระบบตรวจพบระดับ Margin ลดลงอย่างรวดเร็วเกินค่า Threshold กรุณาตรวจสอบสถานะ..."
                    metrics = {"current_value": random.randint(-15000, -1000), "threshold": 0, "unit": "฿"}
                elif alert_type == "warning":
                    msg = "Stuck Order Detected" if random.random() > 0.5 else "High Volatility"
                    desc = "มีคำสั่งซื้อขายค้างในระบบนานเกิน 45 วินาที หรือตลาดผันผวนสูง"
                    details = "ระบบตรวจพบความล่าช้าในการ Match ออเดอร์ อาจเกิดจาก Slippage..."
                    metrics = {"current_value": random.randint(45, 120), "threshold": 30, "unit": "sec"}
                else:
                    msg = "API Reconnect Triggered" if random.random() > 0.5 else "System Rebalanced"
                    desc = "ระบบได้ทำการเชื่อมต่อ API ใหม่ หรือปรับสมดุลพอร์ตสำเร็จ"
                    details = "การทำงานอัตโนมัติของบอทเสร็จสมบูรณ์ ไม่มีผลกระทบต่อ Equity..."
                    metrics = None

                new_alert = {
                    "id": f"AL-{random.randint(100, 999)}",
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "type": alert_type, "message": msg, "desc": desc,
                    "client_id": client_id if alert_type != "info" else None,
                    "duration": f"{random.randint(1, 15)} mins", "details": details, "metrics": metrics
                }
                alerts_data.insert(0, new_alert)
                if len(alerts_data) > 10: alerts_data.pop()
            
            await websocket.send_json(alerts_data)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อ Risk Alerts")

@router.websocket("/stuck_orders")
async def websocket_stuck_orders(websocket: WebSocket):
    await websocket.accept()
    stuck_data = [
        {"id": "#TH-48219", "account": "ACC-0031", "side": "LONG", "price": 33.100, "qty": 10, "zone": "Z-51", "sent_at": "09:43:12", "age": "00:42", "status": "STUCK"},
        {"id": "#TH-48204", "account": "ACC-0019", "side": "LONG", "price": 32.900, "qty": 10, "zone": "Z-49", "sent_at": "09:38:04", "age": "05:00", "status": "PENDING"}
    ]
    try:
        while True:
            if random.random() > 0.7:
                new_order = {
                    "id": f"#TH-{random.randint(48000, 49000)}",
                    "account": f"ACC-00{random.randint(10, 99)}",
                    "side": random.choice(["LONG", "SHORT"]),
                    "price": round(random.uniform(32.5, 33.5), 3),
                    "qty": random.randint(1, 20),
                    "zone": f"Z-{random.randint(40, 60)}",
                    "sent_at": datetime.now().strftime("%H:%M:%S"),
                    "age": "00:00",
                    "status": random.choice(["STUCK", "PENDING", "RETRYING"])
                }
                stuck_data.insert(0, new_order)
                if len(stuck_data) > 5: stuck_data.pop()
                    
            await websocket.send_json(stuck_data)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อ Stuck Orders")