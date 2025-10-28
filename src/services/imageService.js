import { createCanvas } from "canvas";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const CACHE_DIR = process.env.CACHE_DIR || "./cache";

export const generateSummaryImage = async (
  totalCountries,
  topCountries,
  lastRefreshed
) => {
  try {
    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });

    // Create canvas (800x600)
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, "#1e3a8a");
    gradient.addColorStop(1, "#3b82f6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Country Data Summary", 400, 60);

    // Border/Card effect
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 100, 700, 420);

    // Total countries
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "left";
    ctx.fillText(`Total Countries: ${totalCountries}`, 80, 150);

    // Top 5 countries header
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Top 5 Countries by GDP:", 80, 200);

    // Top countries list
    ctx.font = "20px Arial";
    let yPosition = 240;
    topCountries.forEach((country, index) => {
      const gdpFormatted = formatGDP(country.estimated_gdp);
      ctx.fillStyle = index === 0 ? "#fbbf24" : "#e5e7eb";
      ctx.fillText(
        `${index + 1}. ${country.name} - $${gdpFormatted}`,
        100,
        yPosition
      );
      yPosition += 35;
    });

    // Last updated
    ctx.font = "italic 18px Arial";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "center";
    const dateStr = lastRefreshed
      ? new Date(lastRefreshed).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Never";
    ctx.fillText(`Last Updated: ${dateStr}`, 400, 560);

    // Save to file
    const imagePath = path.join(CACHE_DIR, "summary.png");
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    console.log("✓ Summary image generated successfully");
    return imagePath;
  } catch (error) {
    console.error("✗ Failed to generate summary image:", error.message);
    throw error;
  }
};

const formatGDP = (gdp) => {
  if (!gdp) return "0";

  const billion = 1000000000;
  const trillion = 1000000000000;

  if (gdp >= trillion) {
    return (gdp / trillion).toFixed(2) + "T";
  } else if (gdp >= billion) {
    return (gdp / billion).toFixed(2) + "B";
  } else {
    return (gdp / 1000000).toFixed(2) + "M";
  }
};

export const getSummaryImagePath = () => {
  return path.join(CACHE_DIR, "summary.png");
};
