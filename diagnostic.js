
const axios = require('axios');

async function testOrders() {
    try {
        const response = await axios.get('http://localhost:5004/api/orders/my', {
            params: { page: 1, limit: 10 }
        });
        console.log('Success:', response.status);
    } catch (error) {
        console.log('Error Status:', error.response ? error.response.status : 'No Response');
        console.log('Error Data:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

testOrders();
