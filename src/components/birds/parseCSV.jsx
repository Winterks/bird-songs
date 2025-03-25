
// Function to parse CSV data
async function parseCSV(csvFile,jsonData) {
try {
    const response = await fetch(csvFile); // Fetch the CSV file
    if (!response.ok) {
      throw new Error(csvFile + ` problem - status: ${response.status}`);
    }
    const fileData = await response.text();
    // This is a regular expression to identify carriage 
    // Returns and line breaks to split data into rows
    const rows = fileData.split(/\r\n|\n/);
    const headers = rows[0].split(","); // find the field names in first row
    // const jsonData = [];
    for (let i = 1; i < (rows.length-1); i++) {
        const values = rows[i].split(","); // find the values of each field
        const obj = {};
        if (rows[i] != "") {
            for (let j = 0; j < headers.length; j++) {
                const key = headers[j].trim();
                const value = values[j].trim();
                obj[key] = value;
            }
        }
        jsonData.push(obj);
    }
} catch (error) {
    console.error(error.message);
}};

export default parseCSV;
