// hyg-converter.js
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Convert decimal hours to HHhMMmSS format
function raToHMS(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutesDecimal = (decimalHours - hours) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}m${seconds.toFixed(0).padStart(2, '0')}s`;
}

// Convert decimal degrees to ±DD°MM′SS″ format
function decToDMS(decimalDegrees) {
  const sign = decimalDegrees >= 0 ? '+' : '−';
  const absDegrees = Math.abs(decimalDegrees);
  const degrees = Math.floor(absDegrees);
  const minutesDecimal = (absDegrees - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  
  return `${sign}${String(degrees).padStart(2, '0')}°${String(minutes).padStart(2, '0')}′${String(seconds).padStart(2, '0')}″`;
}

// Determine best name for the star
function getBestName(row) {
  if (row.proper) return row.proper;
  if (row.bf) return row.bf;
  if (row.gl) return `GJ ${row.gl}`;
  // Fallback to HIP or HD catalog
  if (row.hip) return `HIP ${row.hip}`;
  if (row.hd) return `HD ${row.hd}`;
  return `Star ${row.id}`;
}

// Read and parse CSV
const csvContent = fs.readFileSync('hygdata_v3.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// Filter for stars within 60 LY (18.4 parsecs) and convert
const maxDistance = 60 / 3.26; // Convert LY to parsecs
const nearbyStars = records
  .filter(row => {
    const dist = parseFloat(row.dist);
    return dist > 0 && dist <= maxDistance;
  })
  .map(row => {
    const distLY = parseFloat(row.dist) * 3.26;
    
    return {
      name: getBestName(row),
      distance_ly: parseFloat(distLY.toFixed(2)),
      distance_pc: parseFloat(parseFloat(row.dist).toFixed(2)),
      ra: raToHMS(parseFloat(row.ra)),
      dec: decToDMS(parseFloat(row.dec)),
      components: [
        {
          name: getBestName(row),
          spectral_type: row.spect || "Unknown"
        }
      ]
    };
  })
  .sort((a, b) => a.distance_ly - b.distance_ly);

// Write to JSON file
fs.writeFileSync(
  'stars_60ly.json',
  JSON.stringify(nearbyStars, null, 2)
);

console.log(`Converted ${nearbyStars.length} stars within 60 light-years`);
console.log(`Distance range: ${nearbyStars[0].distance_ly} - ${nearbyStars[nearbyStars.length - 1].distance_ly} LY`);