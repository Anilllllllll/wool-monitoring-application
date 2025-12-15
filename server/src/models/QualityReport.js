const mongoose = require('mongoose');

const qualityReportSchema = mongoose.Schema({
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WoolBatch',
        required: true,
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fiberDiameter: {
        type: Number, // in microns
    },
    tensileStrength: {
        type: Number,
    },
    colorGrade: {
        type: String,
    },
    cleanWoolYield: {
        type: Number, // percentage
    },
    notes: {
        type: String,
    },
    decision: {
        type: String,
        enum: ['Approved', 'Rejected'],
        required: true,
    },
    inspectionDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const QualityReport = mongoose.model('QualityReport', qualityReportSchema);

module.exports = QualityReport;
