from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

from store import dashboard_cache, system_metrics, st_service
from services import system_monitor

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard():
    if not dashboard_cache['portfolios']:
        raise HTTPException(status_code=503, detail="Data is still loading...")
    return dashboard_cache

@router.get("/system-health")
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


# ORDER ACTIONS API
class OrderAction(BaseModel):
    action_type: str

@router.post("/orders/{order_id}/action")
async def handle_order_action(order_id: str, payload: OrderAction):
    """API สำหรับรับคำสั่งจัดการออเดอร์ค้าง (Mock)"""
    print(f"📥 [Order Execution] ได้รับคำสั่ง {payload.action_type} สำหรับออเดอร์ {order_id}")
    await asyncio.sleep(1.5)
    
    if payload.action_type == "CANCEL":
        msg = f"ยกเลิกคำสั่งซื้อ {order_id} สำเร็จ ออเดอร์ถูกลบออกจากระบบแล้ว"
    elif payload.action_type == "FORCE_MARKET":
        msg = f"บังคับซื้อ {order_id} แบบ Market Order สำเร็จ (Slippage: 0.002)"
    else:
        msg = f"ส่งคำสั่ง {order_id} เข้าตลาดใหม่อีกครั้งสำเร็จ สถานะปัจจุบัน: PENDING"
        
    return {"status": "success", "order_id": order_id, "action": payload.action_type, "message": msg}

@router.post("/orders/panic")
async def handle_panic_action():
    """API สำหรับปุ่ม PANIC ยกเลิกออเดอร์ค้างทั้งหมด"""
    print(f"🚨 [PANIC] กำลังยกเลิกออเดอร์ STUCK ทั้งหมดในระบบ!")
    await asyncio.sleep(2)
    return {"status": "success", "message": "เคลียร์ออเดอร์ STUCK ทั้งหมดออกจากระบบ Settrade สำเร็จ"}