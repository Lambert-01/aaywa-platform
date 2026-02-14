const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api/farmer-issues';

async function testCreateIssue() {
    try {
        const form = new FormData();
        form.append('farmer_id', 'test-farmer-123');
        form.append('category', 'Pest/Disease Outbreak');
        form.append('description', 'Test issue from script');
        form.append('urgency', 'High');
        form.append('gps_lat', '-1.95');
        form.append('gps_lng', '30.05');

        // Create a dummy file if needed
        const filePath = path.join(__dirname, 'test_image.jpg');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'dummy image content');
        }
        form.append('photo', fs.createReadStream(filePath));

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Issue created:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error creating issue:', error.response ? error.response.data : error.message);
    }
}

async function run() {
    console.log('Testing Farmer Issue API...');
    await testCreateIssue();
}

run();
