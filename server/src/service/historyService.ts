import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Resolve the directory name for ES module compatibility
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// TODO: Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  private filePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../routes/db/searchHistory.json'
  );

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      // Check if file exists, create if missing
      const exists = await fs
        .access(this.filePath)
        .then(() => true)
        .catch(() => false);
  
      if (!exists) {
        console.log('File does not exist. Creating searchHistory.json...');
        await fs.writeFile(this.filePath, JSON.stringify([])); // Create empty file
      }
  
      // Read the file
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      // Ensure the folder structure exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
    }
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return await this.read(); // Reads from file and returns the array.
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string): Promise<City[]> {
    const cities = await this.read();

    // Check if city already exists
    const exists = cities.some(
      (c) => c.name.toLowerCase().trim() === city.toLowerCase().trim()
    );

    if (exists) {
      console.log(`City "${city}" already exists in history.`);
      return cities; // Exit early if duplicate
    }
    
    console.log('Existing Cities:', cities);
    console.log('Adding New City:', city);

    // Add new city
    const newCity = new City(uuidv4(), city);
    cities.push(newCity);

    await this.write(cities); // Save updated history
    return cities;
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<City[]> {
    let cities = await this.read();

    // Filter out the city by ID
    cities = cities.filter((city) => city.id !== id);

    await this.write(cities); // Save updated history
    return cities;
  }

  // * BONUS: Clear all search history
  async clearAllCities(): Promise<void> {
    try {
      // Write an empty array to the file to clear it
      await this.write([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }
}

export default new HistoryService();
