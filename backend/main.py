from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import time

import database
from services import google_sheets, analysis
from services.ws_client import BotWebSocketClient

from store import dashboard_cache, system_metrics, st_service
from routers import api_router, ws_router

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
scheduler = AsyncIOScheduler()
bot_client = BotWebSocketClient()

# Routers
app.include_router(api_router.router, prefix="/api")
app.include_router(ws_router.router, prefix="/ws")

def update_background_data():
    """ดึงข้อมูลจาก Sheets และ Settrade แบบเบื้องหลัง"""
    print("🔄 [Scheduler] กำลังดึงข้อมูลจาก Sheets และอัปเดต Database...")
    system_metrics["total_runs"] += 1
    
    try:
        start_time = time.time()
        raw_rows = google_sheets.get_raw_data()
        system_metrics["google_sheets_ms"] = (time.time() - start_time) * 1000
        
        if not raw_rows or len(raw_rows) <= 1:
            print("⚠️ [Scheduler] ไม่พบข้อมูลใน Google Sheets")
            return

        portfolios = analysis.process_client_data(raw_rows)
        last_month_val = database.get_last_month_equity()
        summary = analysis.calculate_kpi(portfolios, last_month_val)
        
        database.save_snapshot(summary['totalEquity'], summary['totalEE'])
        database.save_client_snapshots(portfolios)

        history_map = database.get_all_client_history()
        for p in portfolios:
            acc = p.get('account_no', p.get('name'))
            client_hist = history_map.get(acc, [])
            p['history'] = client_hist
            p['stats'] = analysis.calculate_client_stats(client_hist)

        start_st_time = time.time()
        usd_current = st_service.get_usd_current_price("USDM26")
        usd_history = st_service.get_usd_historical_data("USDM26", count=30)
        system_metrics["settrade_api_ms"] = (time.time() - start_st_time) * 1000
        
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
        scheduler.add_job(update_background_data, trigger="interval", minutes=1)
        scheduler.start()
        print("✅ Started Google Sheets Polling Scheduler")
        
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, update_background_data)
    else:
        print("✅ Started WebSocket Client mode")
        asyncio.create_task(bot_client.connect_and_listen())

@app.on_event("shutdown")
async def shutdown_event():
    if USE_GOOGLE_SHEETS:
        scheduler.shutdown()