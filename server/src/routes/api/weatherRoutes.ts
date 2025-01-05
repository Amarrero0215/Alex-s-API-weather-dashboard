import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;

    if (!city) {
      console.error("City name is required but missing in the request.");
      return res.status(400).json({ error: "City name is required" });
    }

    console.log(`Fetching weather for city: ${city}`);
    
    const weatherData = await WeatherService.getWeatherForCity(city);

    // Validate city before adding to history
    if (!weatherData || !weatherData.currentWeather || weatherData.currentWeather.city.toLowerCase() !== city.toLowerCase()) {
      console.error('Invalid city name:', city);
      return res.status(404).json({ error: 'Invalid city name. Please try again!' });
    }

    console.log("Weather data fetched:", weatherData);
    

    // Save city to search history
    await HistoryService.addCity(city);
    console.log(`City "${city}" added to search history.`);

    return res.json(weatherData);
  } catch (error: any) {
    console.error("Error fetching weather:", error.message);

    if (error.message.includes('Invalid city name')) {
      return res.status(404).json({ error: 'Invalid city name. Please try again!' });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
});
  
  
// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities(); // Retrieve history
    return res.status(200).json(cities); // Return the history
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get city ID from request params

    // Remove city from history using HistoryService
    await HistoryService.removeCity(id);

    res.json({ success: true, message: 'City deleted successfully!' });
  } catch (error) {
    console.error('Error deleting city from history:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// * BONUS TODO: Clear All Search History
router.delete('/history/clear', async (_req: Request, res: Response) => {
  try {
    // Clear all cities from history
    await HistoryService.clearAllCities();

    res.json({ success: true, message: 'Search history cleared successfully!' });
  } catch (error) {
    console.error('Error clearing search history:', error);
    res.status(500).json({ error: 'Failed to clear search history' });
  }
});

export default router;
