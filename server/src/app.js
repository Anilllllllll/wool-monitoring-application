const express = require('express');
const cors = require('cors');
const { protect } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const batchRoutes = require('./routes/batchRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const path = require('path');

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, '../uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Monitoring / Sensor Stub (Protected just for demo, or public if sensors push data)
// Monitoring Stub removed in favor of monitoringRoutes

app.get('/', (req, res) => {
    res.send('Wool Monitoring API is running...');
});

module.exports = app;
