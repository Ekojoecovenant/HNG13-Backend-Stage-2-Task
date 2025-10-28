import axios from "axios";
import dotenv from "dotenv";
import db from "../config/database.js";
import { fetchExchangeRates } from "./exchangeRateService.js";
import { generateSummaryImage } from "./imageService.js";
import { AppError } from "../middleware/errorHandling.js";

dotenv.config();

export const refreshCountries = async () => {
  let countriesData, exchangeRates;

  try {
    // to fetch countries data
    const countriesResponse = await axios.get(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies",
      {
        // const countriesResponse = await axios.get(process.env.COUNTRIES_API, {
        timeout: 15000,
      }
    );
    countriesData = countriesResponse.data;
  } catch (error) {
    throw new AppError(
      "External data source unavailable",
      503,
      "Could not fetch data from Countries API"
    );
  }

  try {
    // to fetch exhange rates
    exchangeRates = await fetchExchangeRates();
  } catch (error) {
    throw new AppError("External data source unavailable", 503, error.message);
  }

  //to process and store countries
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    for (const country of countriesData) {
      const countryRecord = processCountryData(country, exchangeRates);
      await upsertCountry(connection, countryRecord);
    }

    // Update global last_refreshed_at timestamp
    const now = new Date().toISOString(); //.slice(0, 19).replace("T", " ");
    await connection.query(
      "UPDATE metadata SET value = ?, updated_at = NOW() WHERE key_name = ?",
      [now, "last_refreshed_at"]
    );

    await connection.commit();

    // summary image
    const totalCountries = countriesData.length;
    const topCountries = await getTopCountriesByGDP(5);
    await generateSummaryImage(totalCountries, topCountries, now);

    return {
      message: "Countries refreshed successfully",
      total_countries: totalCountries,
      last_refreshed_at: now,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const processCountryData = (country, exchangeRates) => {
  const name = country.name;
  const capital = country.capital || null;
  const region = country.region || null;
  const population = country.population;
  const flagUrl = country.flag || null;

  //currencies
  let currencyCode = null;
  let exchangeRate = null;
  let estimatedGdp = null;

  if (country.currencies && country.currencies.length > 0) {
    currencyCode = country.currencies[0].code;

    //check if exchange rate exists
    if (exchangeRates[currencyCode]) {
      exchangeRate = exchangeRates[currencyCode];

      const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
      estimatedGdp = (population * randomMultiplier) / exchangeRate;
    }
  } else {
    estimatedGdp = 0;
  }

  return {
    name,
    capital,
    region,
    population,
    currencyCode,
    exchangeRate,
    estimatedGdp,
    flagUrl,
  };
};

const upsertCountry = async (connection, countryData) => {
  const {
    name,
    capital,
    region,
    population,
    currencyCode,
    exchangeRate,
    estimatedGdp,
    flagUrl,
  } = countryData;

  // if country exists
  const [existing] = await connection.query(
    "SELECT id FROM countries WHERE LOWER(name) = LOWER(?)",
    [name]
  );

  if (existing.length > 0) {
    // update existing country
    await connection.query(
      `UPDATE countries
        SET capital = ?, region = ?, population = ?, currency_code = ?, exchange_rate = ?, estimated_gdp = ?, flag_url = ?, last_refreshed_at = NOW()
        WHERE id = ?`,
      [
        capital,
        region,
        population,
        currencyCode,
        exchangeRate,
        estimatedGdp,
        flagUrl,
        existing[0].id,
      ]
    );
  } else {
    // add a new country
    await connection.query(
      `INSERT INTO countries
        (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        capital,
        region,
        population,
        currencyCode,
        exchangeRate,
        estimatedGdp,
        flagUrl,
      ]
    );
  }
};

export const getAllCountries = async (filters = {}) => {
  let query = "SELECT * FROM countries WHERE 1=1";
  const params = [];

  // region filter
  if (filters.region) {
    query += " AND region = ?";
    params.push(filters.region);
  }

  //currency filter
  if (filters.currency) {
    query += " AND currency_code = ?";
    params.push(filters.region);
  }

  // sorting filter
  if (filters.sort) {
    switch (filters.sort) {
      case "gdp_desc":
        query += " ORDER BY estimated_gdp DESC";
        break;
      case "gdp_asc":
        query += " ORDER BY estimated_gdp ASC";
        break;
      case "population_desc":
        query += " ORDER BY population DESC";
        break;
      case "population_asc":
        query += " ORDER BY population ASC";
        break;
      case "name_asc":
        query += " ORDER BY name ASC";
        break;
      case "name_desc":
        query += " ORDER BY name DESC";
        break;
    }
  } else {
    query += " ORDER BY name ASC";
  }

  const [rows] = await db.query(query, params);
  return rows;
};

export const getCountryByName = async (name) => {
  const [rows] = await db.query(
    "SELECT * FROM countries WHERE LOWER(name) = LOWER(?)",
    [name]
  );

  if (rows.length === 0) {
    throw new AppError("Country not found", 404);
  }

  return rows[0];
};

export const deleteCountry = async (name) => {
  const [result] = await db.query(
    "DELETE FROM countries WHERE LOWER(name) = LOWER(?)",
    [name]
  );

  if (result.affectedRows === 0) {
    throw new AppError("Country not found", 404);
  }

  return { message: "Country deleted successfully" };
};

export const getStatus = async () => {
  const [countRows] = await db.query("SELECT COUNT(*) as total FROM countries");
  const [metaRows] = await db.query(
    "SELECT value FROM metadata WHERE key_name = ?",
    ["last_refreshed_at"]
  );

  return {
    total_countries: countRows[0].total,
    last_refreshed_at: metaRows[0].value || null,
  };
};

export const getTopCountriesByGDP = async (limit = 5) => {
  const [rows] = await db.query(
    "SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?",
    [limit]
  );
  return rows;
};
