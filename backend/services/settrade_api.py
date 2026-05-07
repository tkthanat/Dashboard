import os
import time
from dotenv import load_dotenv
from settrade_v2 import Investor

load_dotenv()

class SettradeService:
    def __init__(self):
        self.app_id = os.getenv("SETTRADE_APP_ID")
        self.app_secret = os.getenv("SETTRADE_APP_SECRET")
        self.account_no = os.getenv("SETTRADE_ACCOUNT_NO")
        self.broker_id = os.getenv("SETTRADE_BROKER_ID")
        self.app_code = os.getenv("SETTRADE_APP_CODE")
        
        # ย้าย Logic การต่อ API มาไว้ในฟังก์ชันแยก เพื่อให้เรียกซ้ำได้
        self.connect()

    def connect(self):
        try:
            self.investor = Investor(
                app_id=self.app_id,
                app_secret=self.app_secret,
                broker_id=self.broker_id,
                app_code=self.app_code,
                is_auto_queue=False
            )
            self.market = self.investor.MarketData()
            print(f"✅ Settrade Production Connected! (Broker: {self.broker_id})")
        except Exception as e:
            print(f"❌ Failed to connect Settrade: {e}")

    def get_usd_current_price(self, symbol="USDM26", retry=True):
        """ดึงราคาล่าสุด พร้อมระบบ Auto-Reconnect"""
        try:
            quote = self.market.get_quote_symbol(symbol)
            return {
                "symbol": symbol,
                "last_price": quote.get("last", 0),
                "bid": quote.get("bid_price1", 0),
                "offer": quote.get("ask_price1", 0)
            }
        except Exception as e:
            error_msg = str(e).lower()
            print(f"Error fetching quote: {e}")
            # เช็คว่า Error เกิดจาก Token หมดอายุ หรือโดนเตะ (Kicked) หรือไม่
            if retry and ("expired" in error_msg or "invalid" in error_msg or "kicked" in error_msg):
                print("🔄 Token expired or Kicked. Auto-Reconnecting...")
                self.connect() # ล็อกอินใหม่
                time.sleep(1) # รอเซิร์ฟเวอร์ Settrade อนุมัติแป๊บนึง
                return self.get_usd_current_price(symbol, retry=False) # ลองดึงข้อมูลใหม่อีกครั้ง
            return None

    def get_usd_historical_data(self, symbol="USDM26", count=30, retry=True):
        """ดึงข้อมูลกราฟแท่งเทียนย้อนหลัง พร้อมระบบ Auto-Reconnect"""
        try:
            history = self.market.get_candlestick(symbol, interval="1d", limit=count)
            formatted_data = []
            
            for i in range(len(history['time'])):
                formatted_data.append({
                    "time": history['time'][i],
                    "value": history['close'][i]
                })
            return formatted_data
        except Exception as e:
            error_msg = str(e).lower()
            print(f"Error fetching historical data: {e}")
            if retry and ("expired" in error_msg or "invalid" in error_msg or "kicked" in error_msg):
                print("🔄 Token expired or Kicked. Auto-Reconnecting...")
                self.connect()
                time.sleep(1)
                return self.get_usd_historical_data(symbol, count, retry=False)
            return []