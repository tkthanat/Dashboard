import sqlite3
from contextlib import contextmanager
import os
from datetime import datetime

DB_PATH = 'database/dashboard.db'

# สร้างโฟลเดอร์ database ถ้ายังไม่มี
if not os.path.exists('database'):
    os.makedirs('database')

@contextmanager
def get_db_connection():
    """ตัวช่วยเปิด-ปิด Connection อัตโนมัติ ป้องกัน DB Locked"""
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # ตารางเดิม
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_summary (
                date TEXT PRIMARY KEY,
                total_equity REAL,
                total_ee REAL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS client_history (
                date TEXT,
                account_no TEXT,
                client_name TEXT,
                equity REAL,
                PRIMARY KEY (date, account_no)
            )
        ''')
        
        # อัปเดตคอลัมน์ใหม่สำหรับตารางเดิม (ถ้ายังไม่มี)
        new_columns = ['cash_flow', 'est_current_equity', 'open_vol', 'ee']
        for col in new_columns:
            try:
                cursor.execute(f'ALTER TABLE client_history ADD COLUMN {col} REAL')
            except sqlite3.OperationalError:
                pass

        # เตรียมรองรับข้อมูลพี่หนึ่งในอนาคต
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_alerts (
                id TEXT PRIMARY KEY, type TEXT, message TEXT, timestamp TEXT, is_active INTEGER DEFAULT 1
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stuck_orders (
                id TEXT PRIMARY KEY, account TEXT, side TEXT, price REAL, qty INTEGER, status TEXT, timestamp TEXT
            )
        ''')
        conn.commit()

def get_last_month_equity():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT total_equity FROM daily_summary ORDER BY date ASC LIMIT 1')
            row = cursor.fetchone()
            return row[0] if row else 0
    except Exception:
        return 0

def save_snapshot(total_equity, total_ee):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute('''
            INSERT OR REPLACE INTO daily_summary (date, total_equity, total_ee)
            VALUES (?, ?, ?)
        ''', (today, total_equity, total_ee))
        conn.commit()

def save_client_snapshots(portfolios):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        today = datetime.now().strftime('%Y-%m-%d')

        for p in portfolios:
            acc = p.get('account_no', p.get('name'))
            eq = float(p.get('equity', 0))
            cf = float(p.get('cash_flow', 0))
            est_eq = float(p.get('est_current_equity', 0))
            vol = float(p.get('open_vol', 0))
            ee = float(p.get('ee', 0))
            
            cursor.execute('''
                INSERT OR REPLACE INTO client_history (
                    date, account_no, client_name, equity, cash_flow, est_current_equity, open_vol, ee
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (today, acc, p['name'], eq, cf, est_eq, vol, ee))
        conn.commit()

def get_all_client_history():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT date, account_no, equity, cash_flow, est_current_equity, open_vol, ee 
            FROM client_history ORDER BY date ASC
        ''')
        rows = cursor.fetchall()

    history_map = {}
    for date, acc, eq, cf, est_eq, vol, ee in rows:
        if acc not in history_map:
            history_map[acc] = []
        history_map[acc].append({
            "time": date, 
            "equity": eq, 
            "cash_flow": cf,
            "est_current_equity": est_eq,
            "open_vol": vol,
            "ee": ee
        })
    return history_map