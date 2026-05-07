import gspread

SHEET_ID = '1xd8vjuv4lM0k05IjgaVVRdQwdaldc3_ptpdKZG_9HbQ'

def get_raw_data():
    try:
        gc = gspread.service_account(filename='credentials.json')
        sh = gc.open_by_key(SHEET_ID)
        worksheet = sh.sheet1
        return worksheet.get_all_values()
    except Exception as e:
        print(f"Error fetching Google Sheets: {e}")
        return []