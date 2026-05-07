from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import time
import random

import database
from services import google_sheets, analysis, system_monitor
from services.settrade_api import SettradeService
from services.ws_client import BotWebSocketClient
from datetime import datetime

app = FastAPI(title="TFEX Grid Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CONFIGURATION
USE_GOOGLE_SHEETS = True

# Init Services
database.init_db()
st_service = SettradeService()
scheduler = AsyncIOScheduler()
bot_client = BotWebSocketClient()

# Global States
dashboard_cache = {
    "summary": None,
    "portfolios": [],
    "usd_market": None
}

system_metrics = {
    "google_sheets_ms": 0,
    "settrade_api_ms": 0,
    "total_runs": 0,
    "successful_runs": 0
}

def update_background_data():
    """ดึงข้อมูลจาก Sheets และ Settrade แบบเบื้องหลัง"""
    print("🔄 [Scheduler] กำลังดึงข้อมูลจาก Sheets และอัปเดต Database...")
    system_metrics["total_runs"] += 1
    
    try:
        # Fetch Google Sheets
        start_time = time.time()
        raw_rows = google_sheets.get_raw_data()
        system_metrics["google_sheets_ms"] = (time.time() - start_time) * 1000
        
        if not raw_rows or len(raw_rows) <= 1:
            print("⚠️ [Scheduler] ไม่พบข้อมูลใน Google Sheets")
            return

        # Process Data & Calculate KPI
        portfolios = analysis.process_client_data(raw_rows)
        last_month_val = database.get_last_month_equity()
        summary = analysis.calculate_kpi(portfolios, last_month_val)
        
        # Save to Local DB
        database.save_snapshot(summary['totalEquity'], summary['totalEE'])
        database.save_client_snapshots(portfolios)

        # Attach History & Quant Stats
        history_map = database.get_all_client_history()
        for p in portfolios:
            acc = p.get('account_no', p.get('name'))
            client_hist = history_map.get(acc, [])
            p['history'] = client_hist
            p['stats'] = analysis.calculate_client_stats(client_hist)

        # Fetch Settrade Data
        start_st_time = time.time()
        usd_current = st_service.get_usd_current_price("USDM26")
        usd_history = st_service.get_usd_historical_data("USDM26", count=30)
        system_metrics["settrade_api_ms"] = (time.time() - start_st_time) * 1000
        
        # Update Memory Cache
        dashboard_cache['summary'] = summary
        dashboard_cache['portfolios'] = portfolios
        dashboard_cache['usd_market'] = {
            "current": usd_current,
            "history": usd_history
        }
        
        system_metrics["successful_runs"] += 1
        print(f"✅ [Scheduler] อัปเดตสำเร็จ! โหลดข้อมูลและคำนวณสถิติเรียบร้อย")

    except Exception as e:
        print(f"❌ [Scheduler] เกิดข้อผิดพลาด: {e}")

@app.on_event("startup")
async def startup_event():
    print("✅ Database and Services Initialized")
    
    if USE_GOOGLE_SHEETS:
        # โหมดปัจจุบัน: ดึงข้อมูลจาก Sheets แบบเก่า
        scheduler.add_job(update_background_data, trigger="interval", minutes=1)
        scheduler.start()
        print("✅ Started Google Sheets Polling Scheduler")
        
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, update_background_data)
    else:
        # เชื่อมต่อบอทพี่หนึ่ง
        print("✅ Started WebSocket Client mode")
        asyncio.create_task(bot_client.connect_and_listen())

@app.on_event("shutdown")
async def shutdown_event():
    if USE_GOOGLE_SHEETS:
        scheduler.shutdown()

# REST API ROUTES

@app.get("/api/dashboard")
async def get_dashboard():
    if not dashboard_cache['portfolios']:
        raise HTTPException(status_code=503, detail="Data is still loading...")
    return dashboard_cache

@app.get("/api/system-health")
async def get_system_health():
    try:
        health_data = system_monitor.get_system_health(system_metrics)
        is_connected = hasattr(st_service, 'investor') and st_service.investor is not None
        
        health_data['settrade'] = {
            "status": "Connected" if is_connected else "Disconnected",
            "rate_limit": "Safe", 
            "reconnects_today": 0
        }
        return {"status": "success", "data": health_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WEBSOCKET ROUTES (Real-time Streaming)

@app.websocket("/ws/latency")
async def websocket_latency(websocket: WebSocket):
    """
    ท่อส่งข้อมูล API Latency แบบ Real-time 
    (ตอนนี้ใช้ข้อมูลจำลองรอก่อน เมื่อพี่หนึ่งส่งของจริงมา เราจะดึงจาก ws_client.py มายิงแทน)
    """
    await websocket.accept()
    last_ping = 45
    
    try:
        while True:
            # จำลองข้อมูล Latency 
            last_ping = max(10, min(300, last_ping + (random.random() - 0.5) * 20))
            if random.random() > 0.95: 
                last_ping += 100
                
            print(f"📡 [WS Server] กำลังส่งข้อมูล Latency: {last_ping:.2f} ms")

            # ส่งข้อมูลกลับไปที่ React ทุกๆ 2 วิ
            await websocket.send_json({"latency_ms": last_ping})
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อกราฟ Latency")

# WEBSOCKET ROUTES (Event-Driven Alerts)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """ท่อส่งข้อมูลแจ้งเตือนความเสี่ยง (Risk Alerts)"""
    await websocket.accept()
    # Mock ข้อมูลเริ่มต้น
    alerts_data = [
        {"id": "AL-001", "time": datetime.now().strftime("%H:%M:%S"), "type": "critical", "message": "EE Drop below 0: ACC-0012"},
        {"id": "AL-002", "time": datetime.now().strftime("%H:%M:%S"), "type": "warning", "message": "High Volatility on USDM26"}
    ]
    try:
        while True:
            # สุ่มสร้าง Alert ใหม่
            if random.random() > 0.8:
                new_alert = {
                    "id": f"AL-{random.randint(100, 999)}",
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "type": random.choice(["critical", "warning", "info"]),
                    "message": random.choice(["Margin Call Warning", "API Reconnect Triggered", "Unusual Volume Detected", "Stuck Order Detected"])
                }
                alerts_data.insert(0, new_alert)
                if len(alerts_data) > 10: # เก็บโชว์แค่ 10 รายการล่าสุด
                    alerts_data.pop()
            
            await websocket.send_json(alerts_data)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อ Risk Alerts")

@app.websocket("/ws/stuck_orders")
async def websocket_stuck_orders(websocket: WebSocket):
    """ท่อส่งข้อมูลออเดอร์ค้าง (Stuck Orders)"""
    await websocket.accept()
    # Mock ข้อมูลเริ่มต้นให้ตรงกับฟอร์แมตตารางบนหน้าเว็บ
    stuck_data = [
        {"id": "#TH-48219", "account": "ACC-0031", "side": "LONG", "price": 33.100, "qty": 10, "zone": "Z-51", "sent_at": "09:43:12", "age": "00:42", "status": "STUCK"},
        {"id": "#TH-48204", "account": "ACC-0019", "side": "LONG", "price": 32.900, "qty": 10, "zone": "Z-49", "sent_at": "09:38:04", "age": "05:00", "status": "PENDING"}
    ]
    try:
        while True:
            # สุ่มอัปเดตข้อมูลออเดอร์ค้าง
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
                if len(stuck_data) > 5: # โชว์ 5 รายการล่าสุดพอ
                    stuck_data.pop()
                    
            await websocket.send_json(stuck_data)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("⚠️ [WS Server] Frontend ยกเลิกการเชื่อมต่อ Stuck Orders")