const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dataRoutes = require('./routes/dataRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI must be set in .env using the Atlas-generated connection string');
}

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/data', dataRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});