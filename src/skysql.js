const axios = require('axios');

class SkySQLAPI {
  constructor() {
    this.apiKey = process.env.SKYSQL_API_KEY;
    this.baseURL = 'https://api.skysql.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('API Configuration:', {
      baseURL: this.baseURL,
      headers: {
        'Content-Type': this.client.defaults.headers['Content-Type']
      }
    });
  }

  async createServerlessDatabase(name, region = 'us-east-1') {
    try {
      console.log('Creating database with params:', { name, region });
      
      // Get client IP address
      const clientIp = await axios.get('https://checkip.amazonaws.com/');
      const ipAddress = clientIp.data.trim();
      
      const response = await this.client.post('/provisioning/v1/services', {
        service_type: "transactional",
        topology: "serverless-standalone",
        provider: "aws",
        region: region,
        architecture: "amd64",
        version: "11.4.3-1",
        name: name,
        ssl_enabled: true,
        allow_list: [
          {
            comment: "Default access",
            ip: `${ipAddress}/32`
          }
        ]
      });
      console.log('Create database response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }

  async deleteServerlessDatabase(databaseId) {
    try {
      console.log('Deleting database:', databaseId);
      const response = await this.client.delete(`/provisioning/v1/services/${databaseId}`);
      console.log('Delete database response:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  }

  async getDatabaseStatus(databaseId) {
    try {
      console.log('Getting database status:', databaseId);
      const response = await this.client.get(`/provisioning/v1/services/${databaseId}`);
      console.log('Get database status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  }

  async listDatabases() {
    try {
      console.log('Listing databases...');
      const response = await this.client.get('/provisioning/v1/services');
      console.log('List databases response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  }
}

module.exports = new SkySQLAPI(); 