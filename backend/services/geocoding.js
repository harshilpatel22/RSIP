const { Client } = require('@googlemaps/google-maps-services-js');

class GeocodingService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  // Convert coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat, lng },
          key: this.apiKey,
          language: 'en', // We'll also get Gujarati names
          result_type: ['street_address', 'route', 'neighborhood', 'sublocality']
        }
      });

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        
        // Extract ward information from address components
        const ward = this.extractWard(result.address_components);
        
        return {
          formatted_address: result.formatted_address,
          address_components: result.address_components,
          ward: ward,
          place_id: result.place_id,
          location_type: result.types[0]
        };
      }

      return {
        formatted_address: `${lat}, ${lng}`,
        ward: null
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        formatted_address: `${lat}, ${lng}`,
        error: error.message
      };
    }
  }

  // Extract ward number from address components
  extractWard(addressComponents) {
    // Ward mapping for Rajkot
    const wardMappings = {
      'Bhaktinagar': 15,
      'Raiya Road': 12,
      'Kalawad Road': 8,
      'University Road': 23,
      'Nana Mava': 18,
      'Kothariya': 11,
      'Mavdi': 20,
      'Kuvadva': 7,
      // Add all ward mappings
    };

    for (const component of addressComponents) {
      for (const area in wardMappings) {
        if (component.long_name.includes(area)) {
          return wardMappings[area];
        }
      }
    }

    // Default ward assignment based on coordinates
    return this.getWardByCoordinates(lat, lng);
  }

  // Fallback ward detection by coordinates
  getWardByCoordinates(lat, lng) {
    // Simple grid-based ward assignment for Rajkot
    // This is a simplified example - you'd need actual ward boundaries
    const latGrid = Math.floor((lat - 22.2) * 50);
    const lngGrid = Math.floor((lng - 70.7) * 50);
    return Math.min(Math.max((latGrid * 5 + lngGrid) % 23 + 1, 1), 23);
  }

  // Get nearby landmarks for better location context
  async getNearbyPlaces(lat, lng) {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius: 500,
          type: 'point_of_interest',
          key: this.apiKey
        }
      });

      return response.data.results.slice(0, 3).map(place => ({
        name: place.name,
        distance: this.calculateDistance(lat, lng, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        )
      }));
    } catch (error) {
      return [];
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c); // Distance in meters
  }
}

module.exports = new GeocodingService();