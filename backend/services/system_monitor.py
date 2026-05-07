import psutil
import sqlite3
import os

def get_system_health(real_metrics):

    # SYSTEM RESOURCES
    cpu_usage = psutil.cpu_percent(interval=0.5)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    db_status = "OK"
    db_path = 'database/dashboard.db'
    try:
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            conn.close()
        else:
            db_status = "Not Found"
    except Exception:
        db_status = "Locked/Error"

    # DATA FETCH PERFORMANCE
    sheets_ms = real_metrics.get('google_sheets_ms', 0)
    settrade_ms = real_metrics.get('settrade_api_ms', 0)
    total_runs = real_metrics.get('total_runs', 1)
    success_runs = real_metrics.get('successful_runs', 0)

    # คำนวณค่าเฉลี่ย
    avg_latency = (sheets_ms + settrade_ms) / 2 if (sheets_ms and settrade_ms) else 0
    success_rate = (success_runs / total_runs) * 100 if total_runs > 0 else 0

    return {
        "server": {
            "cpu": cpu_usage,
            "ram": ram.percent,
            "disk": disk.percent,
            "database": db_status
        },
        "performance": {
            "avg_latency_ms": int(avg_latency),
            "google_sheets_ms": int(sheets_ms),
            "settrade_api_ms": int(settrade_ms),
            "success_rate": round(success_rate, 2)
        }
    }