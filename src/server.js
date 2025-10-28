import express from "express";
import dotenv from "dotenv";
import countryRoutes from "./routes/countryRoute.js";
import { errorHandler } from "./middleware/errorHandling.js";
import { getStatus } from "./services/countryService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// routes
app.get("/", (req, res) => {
  res.json({
    message: "Country Currency & Exchange API",
    version: "1.0.0",
  });
});

app.get("/status", async (req, res, next) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

app.use("/countries", countryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server runnig on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
