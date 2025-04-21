const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const summarizeRoutes = require('./routes/summarize');
const historyRoutes = require('./routes/history');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/api', summarizeRoutes);
app.use('/api', historyRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
