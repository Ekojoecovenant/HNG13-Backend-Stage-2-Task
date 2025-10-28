# HNG13Backend-Stage-2-Task

Country Currency and Exchange API: - A RESTful API that fetches country data, stores it in MySQL with exchange rate.

## Features

- Fetch and cache country data from an external REST API
- Integrate real-time exchanges rates
- Calculate estimated GDP
- Generate summary image
- Filter and sort countries by region, currency, and GDP

## Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/Ekojoecovenant/HNG13-Backend-Stage-2-Task.git
cd hng13-backend-stage-2-task
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure .env with your MySQL credentials

```.env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=country_currency_db
DB_PORT=3306

COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD

CACHE_DIR=./cache
```

### 4. Run db migrations

```bash
npm run db:migrate
```

### 5: Start the server

```bash
npm run dev
```

OR

```bash
npm start
```

## API Endpoints

### Base URL

[http://localhost:3003](http://localhost:3003)

N/A | Title                     | Req Type    | Endoint                                         |
--- | ------------------------- | ----------- | ----------------------------------------------- |
1   | Refresh Countries Data    | POST        | <http://localhost:3000/countries/refresh>       |
2   | Get All Countries         | GET         | <http://localhost:3000/countries>               |
3   | Filter by region          | GET         | <http://localhost:3000/countries?region=Africa> |
4   | Get specific country      | GET         | <http://localhost:3000/countries/Nigeria>       |
5   | Get status                | GET         | <http://localhost:3000/status>                  |
6   | Download summary image    | GET         | <http://localhost:3000/countries/image>         |
7   | Delete a country          | DELETE      | <http://localhost:3000/countries/Nigeria>       |

## Testing the API

Use the .http file to test or run the curl commands below

```bash
# 1. Refresh data
curl -X POST http://localhost:3000/countries/refresh

# 2. Get all countries
curl http://localhost:3000/countries

# 3. Filter by region
curl http://localhost:3000/countries?region=Africa

# 4. Get specific country
curl http://localhost:3000/countries/Nigeria

# 5. Get status
curl http://localhost:3000/status

# 6. Download summary image
curl http://localhost:3000/countries/image --output summary.png

# 7. Delete a country
curl -X DELETE http://localhost:3000/countries/Nigeria
```
