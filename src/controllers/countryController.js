import * as countryService from "../services/countryService.js";
import { sanitizeQueryParams } from "../utils/validators.js";
import { getSummaryImagePath } from "../services/imageService.js";
import fs from "fs/promises";

export const refreshCountries = async (req, res, next) => {
  try {
    const result = await countryService.refreshCountries();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllCountries = async (req, res, next) => {
  try {
    const filters = sanitizeQueryParams(req.query);
    const countries = await countryService.getAllCountries(filters);
    res.json(countries);
  } catch (error) {
    next(error);
  }
};

export const getCountryByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const country = await countryService.getCountryByName(name);
    res.json(country);
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const { name } = req.params;
    const result = await countryService.deleteCountry(name);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const status = await countryService.getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

export const getSummaryImage = async (req, res, next) => {
  try {
    const imagePath = getSummaryImagePath();

    //check if file exists
    try {
      await fs.access(imagePath);
    } catch {
      return res.status(404).json({ error: "Summary image not found" });
    }

    res.sendFile(imagePath, { root: "." });
  } catch (error) {
    next(error);
  }
};
