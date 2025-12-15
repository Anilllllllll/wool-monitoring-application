const mongoose = require('mongoose');

const woolBatchSchema = mongoose.Schema({
    batchId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'BATCH-' + Math.floor(Math.random() * 10000), // Simple random ID generation
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    qualityReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QualityReport',
    },
    woolType: {
        type: String,
        required: true,
    },
    images: [{
        type: String, // Store URLs/Paths
    }],
    weight: {
        type: Number,
        required: true, // in kg
    },
    moisture: {
        type: Number, // percentage
    },
    source: {
        type: String,
    },
    dateReceived: {
        type: Date,
        default: Date.now,
    },
    currentStage: {
        type: String,
        enum: ['Received', 'Cleaning', 'Carding', 'Spinning', 'Finished'],
        default: 'Received',
    },
    qualityStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    processingLogs: [{
        stage: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true,
});

const WoolBatch = mongoose.model('WoolBatch', woolBatchSchema);

module.exports = WoolBatch;
