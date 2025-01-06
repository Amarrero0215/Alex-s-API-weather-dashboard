import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  description: string;

  constructor(
    city: string,
    date: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    description: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.description = description;
  }
}


// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string = 'https://api.openweathermap.org/data/2.5/forecast';
  private apiKey: string = process.env.API_KEY as string;

  // TODO: Create fetchLocationData method
  private async fetchLocationData(city: string): Promise<any> {
    const query = this.buildGeocodeQuery(city);
    console.log('Geocode Query:', query); // Log the query string
  
    try {
      const response = await fetch(query);
      const data = await response.json();
      console.log('Fetched Location Data:', data); // Log API response

    // Check if the city exists in the response
    if (!data || data.length === 0 || !data[0].lat || !data[0].lon) {
      console.error(`Invalid location data for city: ${city}`);
      throw new Error('Invalid location data');
    }

      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any[]): Coordinates {
    console.log('Location Data:', locationData); // Debug log
  
  // Ensure valid data exists
  if (!locationData || locationData.length === 0 || !locationData[0].lat || !locationData[0].lon) {
    throw new Error('Invalid location data - No coordinates found!');
  }
  
    const { lat, lon } = locationData[0]; // Use the first object
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery({ lat, lon }: Coordinates): string {
    return `${this.baseURL}?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }  

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const query = this.buildWeatherQuery(coordinates);
    console.log('Weather Query:', query); // Log the query string
  
    try {
      const response = await fetch(query);
      const data = await response.json();
      console.log('Fetched Weather Data:', data); // Log API response
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    // Validate response and 'list' array
    if (!response || !response.list || response.list.length === 0) {
      throw new Error('Invalid weather data: Missing list array');
    }
  
    // Safely access the first element
    const current = response.list[0];
    if (!current || !current.main || !current.weather || current.weather.length === 0) {
      throw new Error('Invalid weather data: Missing main or weather details');
    }
  
    const city = response.city?.name || 'Unknown City'; // Fallback for city name
    const date = current.dt_txt.split(' ')[0]; // Date format
    const tempF = current.main.temp || 0;
    const windSpeed = current.wind.speed || 0;
    const humidity = current.main.humidity || 0;
    const icon = current.weather[0].icon || '01d'; // Default icon
    const description = current.weather[0].description || 'No description';
  
    // Return parsed weather object
    return new Weather(city, date, tempF, windSpeed, humidity, icon, description);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecastArray: Weather[] = [];
    
    for (let i = 0; i < weatherData.length; i += 8) { // Use increments for daily forecasts
      const forecast = weatherData[i];
      forecastArray.push(
        new Weather(
          currentWeather.city,
          forecast.dt_txt.split(' ')[0],
          forecast.main.temp,
          forecast.wind.speed,
          forecast.main.humidity,
          forecast.weather[0].icon,
          forecast.weather[0].description
        )
      );
    }
  
    return forecastArray;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      // Fetch coordinates
      const coordinates = await this.fetchAndDestructureLocationData(city);
  
      // Fetch weather data
      const weatherData = await this.fetchWeatherData(coordinates);
  
      // Parse the current weather
      const currentWeather = this.parseCurrentWeather(weatherData);
  
      // Build the forecast array
      const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
  
      // Return both current weather and forecast
      return {
        currentWeather,
        forecast: forecastArray, // Include forecast
      };
    } catch (error: any) {
      console.error('Error fetching weather:', error.message);
  
      // Throw a controlled error to let the routes handle it gracefully
      throw new Error('Invalid city name. Please try again!');
    }
  }
}

export default new WeatherService();