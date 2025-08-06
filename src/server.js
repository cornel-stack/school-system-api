const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');



const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Welcome to the School System API!' });
});

app.use('/api/users', userRoutes);

// Connect to MongoDB

console.log('Starting server...');
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

