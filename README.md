# SkySQL MCP Integration

This project provides a REST API interface for managing SkySQL databases, with integration capabilities for GitHub and Smithery.ai.

## Features

- Create and manage serverless databases in SkySQL
- RESTful API endpoints for database operations
- GitHub integration for version control
- Smithery.ai deployment support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SkySQL API key
- GitHub account
- Smithery.ai account

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd skysql-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your credentials:
```
SKYSQL_API_KEY=your_api_key
SKYSQL_HOST=your_host
SKYSQL_USER=your_user
SKYSQL_PASSWORD=your_password
SKYSQL_DATABASE=your_database
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/databases` - Create a new database
- `GET /api/databases` - List all databases
- `GET /api/databases/:id` - Get database status
- `DELETE /api/databases/:id` - Delete a database
- `POST /api/query` - Execute SQL queries
- `GET /health` - Health check endpoint

## Deployment

This project is configured for deployment on Smithery.ai. Follow these steps:

1. Push your code to GitHub
2. Connect your GitHub repository to Smithery.ai
3. Configure your environment variables in Smithery.ai
4. Deploy your application

## License

MIT 