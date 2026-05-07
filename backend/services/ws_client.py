import asyncio
import json
# import websockets # (เอาคอมเมนต์ออกเมื่อพร้อมเชื่อมต่อพี่หนึ่ง)

class BotWebSocketClient:
    def __init__(self, uri="ws://localhost:8080/data"):
        self.uri = uri
        self.is_connected = False

    async def connect_and_listen(self):
        """
        เตรียมพร้อมเชื่อมต่อ WebSocket จากบอทพี่หนึ่ง
        """
        print(f"🔌 [WS Client] เตรียมเชื่อมต่อกับเซิร์ฟเวอร์บอทพี่หนึ่ง: {self.uri}")
        self.is_connected = True
        
        # โค้ดสำหรับรับข้อมูลจริงจาก WebSocket (ยังไม่เปิดใช้งาน)
        # async with websockets.connect(self.uri) as websocket:
        #     while True:
        #         message = await websocket.recv()
        #         await self.process_bot_message(message)
        
        # จำลองการรันไปก่อนเพื่อไม่ให้กระทบระบบปัจจุบัน
        while self.is_connected:
            await asyncio.sleep(5) 

    async def process_bot_message(self, message):
        """
        นำข้อมูล JSON จากพี่หนึ่งมาอัปเดตระบบแทนที่ Google Sheets
        """
        pass
        # data = json.loads(message)
        # if data['type'] == 'portfolio_update':
        #     db.save_client_snapshots(data['payload'])