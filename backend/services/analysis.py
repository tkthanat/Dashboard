from datetime import datetime

def calculate_kpi(portfolios, last_month_equity):
    total_equity = sum(p['equity'] for p in portfolios)
    total_ee = sum(p['ee'] for p in portfolios)
    total_im = sum(p.get('totalIM', 0) for p in portfolios)
    
    diff_text = "Awaiting history data"
    is_positive = True
    if last_month_equity:
        diff = total_equity - last_month_equity
        is_positive = diff >= 0
        diff_text = f"{'↑' if is_positive else '↓'} ฿{abs(diff):,.0f} vs last month"

    return {
        "totalClients": len(portfolios),
        "totalEquity": total_equity,
        "totalEE": total_ee,
        "totalIM": total_im,
        "equityDiffText": diff_text,
        "isPositive": is_positive,
        "criticalCount": len([p for p in portfolios if p['status'] == 'Critical']),
        "cautionCount": len([p for p in portfolios if p['status'] == 'Caution'])
    }

def process_client_data(rows):
    data = []
    for row in rows[1:]:
        row = row + [''] * (7 - len(row))
        
        def parse_num(val):
            try: return float(str(val).replace(',', '').strip())
            except: return 0.0

        equity = parse_num(row[1])
        cash_flow = parse_num(row[2])
        est_eq = parse_num(row[3])
        open_vol = parse_num(row[4])
        im = parse_num(row[5])
        ee = parse_num(row[6])
        
        status = "OK"
        if ee < 0: status = "Critical"
        elif ee < equity * 0.3: status = "Caution"

        data.append({
            "account_no": row[0],
            "name": row[0],
            "equity": equity,
            "cash_flow": cash_flow,
            "est_current_equity": est_eq,
            "open_vol": open_vol,
            "totalIM": im,
            "ee": ee,
            "status": status
        })
    return data

# ฟังก์ชันคำนวณสถิติเชิงลึก (Quant Metrics)
def calculate_client_stats(history):
    if not history:
        return {
            "peak": 0, "peakDate": None,
            "trough": 0, "troughDate": None,
            "maxMDD": 0, "currentMDD": 0,
            "mtdPnl": 0
        }

    peak = float('-inf')
    max_mdd = 0
    current_trough = float('inf')
    peak_date = None
    trough_date = None
    current_mdd = 0
    mtd_pnl = 0
    
    current_month = datetime.now().strftime('%Y-%m')

    # ลูปคำนวณ
    for h in history:
        eq = float(h.get('equity', 0))
        cf = float(h.get('cash_flow', 0))
        date_str = h.get('date', '')

        # คำนวณ MTD PNL (กำไรสะสมเฉพาะเดือนนี้)
        if date_str.startswith(current_month):
            mtd_pnl += cf

        # คำนวณ Peak & Trough
        if eq > peak:
            peak = eq
            peak_date = date_str
            current_trough = eq

        if eq < current_trough:
            current_trough = eq
            trough_date = date_str

        # คำนวณ Drawdown
        dd = 0
        if peak > 0:
            dd = ((eq - peak) / peak) * 100

        if dd < max_mdd:
            max_mdd = dd
            
        current_mdd = dd

    return {
        "peak": peak if peak != float('-inf') else 0,
        "peakDate": peak_date,
        "trough": current_trough if current_trough != float('inf') else 0,
        "troughDate": trough_date,
        "maxMDD": round(max_mdd, 2),
        "currentMDD": round(current_mdd, 2),
        "mtdPnl": round(mtd_pnl, 2)
    }