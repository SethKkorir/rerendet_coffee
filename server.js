require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({
  origin: 'http://127.0.0.1:5502', // your frontend origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import routes
app.use('/api/users', require('./controllers/userController'));

// Error handling middleware here...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
