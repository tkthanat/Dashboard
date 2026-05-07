import axios from 'axios';

export async function fetchDashboardData() {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard');
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return { summary: null, portfolios: [] };
  }
}