from services.settrade_api import SettradeService

# Instance SettradeService
st_service = SettradeService()

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