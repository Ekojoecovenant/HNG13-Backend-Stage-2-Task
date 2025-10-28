import express from "express";
import * as countryController from "../controllers/countryController.js";

const router = express.Router();

// Refresh countries data
router.post("/refresh", countryController.refreshCountries);

// Get all countries with optional filters
router.get("/", countryController.getAllCountries);

// Get summary image
router.get("/image", countryController.getSummaryImage);

// Get single country by name
router.get("/:name", countryController.getCountryByName);

// Delete country
router.delete("/:name", countryController.deleteCountry);

export default router;
