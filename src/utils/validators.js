export const validateCountryData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "is required";
  }

  if (data.population === undefined || data.population === null) {
    errors.population = "is required";
  } else if (typeof data.population !== "number" || data.population < 0) {
    errors.population = "must be a positive number";
  }

  if (!data.currency_code || data.currency_code.trim() === "") {
    errors.currency_code = "is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeQueryParams = (query) => {
  const sanitized = {};

  if (query.region) {
    sanitized.region = query.region.trim();
  }

  if (query.currency) {
    sanitized.currency = query.currency.trim().toUpperCase();
  }

  if (query.sort) {
    const validSorts = [
      "gdb_desc",
      "gdp_asc",
      "population_desc",
      "population_asc",
      "name_asc",
      "name_desc",
    ];
    if (validSorts.includes(query.sort)) {
      sanitized.sort = query.sort;
    }
  }

  return sanitized;
};
