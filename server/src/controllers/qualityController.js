const QualityReport = require('../models/QualityReport');
const WoolBatch = require('../models/WoolBatch');

// @desc    Create quality inspection report
// @route   POST /api/quality/inspect
// @access  Private (QUALITY_INSPECTOR)
const createInspection = async (req, res) => {
    const { batchId, fiberDiameter, tensileStrength, colorGrade, cleanWoolYield, notes, decision } = req.body;

    const batch = await WoolBatch.findById(batchId);
    if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
    }

    const report = await QualityReport.create({
        batch: batchId,
        inspector: req.user._id,
        fiberDiameter,
        tensileStrength,
        colorGrade,
        cleanWoolYield,
        notes,
        decision,
    });

    batch.qualityReport = report._id;
    batch.qualityStatus = decision; // Assuming auto-update status based on decision
    await batch.save();

    res.status(201).json(report);
};

// @desc    Get logged-in farmer's quality reports
// @route   GET /api/quality/my
// @access  Private (FARMER)
const getMyQualityReports = async (req, res) => {
    // 1. Get Farmer ID
    const farmerId = req.user._id;
    console.log("Farmer ID:", farmerId);

    // 2. Find batches owned by this farmer that HAVE a quality report
    // We populate the qualityReport field.
    const batches = await WoolBatch.find({
        $or: [{ farmerId: farmerId }, { creator: farmerId }], // Support both fields to be safe with seed data vs new data
        qualityReport: { $exists: true, $ne: null }
    }).populate('qualityReport');

    console.log("Fetched batches count:", batches.length);
    if (batches.length > 0) {
        console.log("Sample batch report:", batches[0].qualityReport);
    }

    // 3. Transform to desired format
    const results = batches.map(batch => {
        const report = batch.qualityReport;
        return {
            batchId: batch.batchId || batch._id.toString().slice(-6),
            woolType: batch.woolType,
            date: report.inspectionDate || report.createdAt,
            grade: report.decision, // Or specific grade if exists like report.grade
            notes: report.notes,
            // Extra fields if needed for UI debugging
            _id: report._id
        };
    });

    res.json(results);
};

// @desc    Approve batch quality
// @route   PATCH /api/quality/approve/:id
// @access  Private (QUALITY_INSPECTOR with 'approve_batch')
const approveBatch = async (req, res) => {
    const batch = await WoolBatch.findById(req.params.id);

    if (batch) {
        batch.qualityStatus = 'Approved';
        await batch.save();
        res.json({ message: 'Batch approved', batch });
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

// @desc    Reject batch quality
// @route   PATCH /api/quality/reject/:id
// @access  Private (QUALITY_INSPECTOR with 'reject_batch')
const rejectBatch = async (req, res) => {
    const batch = await WoolBatch.findById(req.params.id);

    if (batch) {
        batch.qualityStatus = 'Rejected';
        await batch.save();
        res.json({ message: 'Batch rejected', batch });
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

// @desc    Get quality analytics
// @route   GET /api/quality/analytics
// @access  Private (QUALITY_INSPECTOR)
const getAnalytics = async (req, res) => {
    // Aggregation pipeline to get stats
    const totalInspections = await QualityReport.countDocuments();
    const approvedCount = await QualityReport.countDocuments({ decision: 'Approved' });
    const rejectedCount = await QualityReport.countDocuments({ decision: 'Rejected' });

    // Average fiber diameter
    const avgDiameter = await QualityReport.aggregate([
        { $group: { _id: null, avg: { $avg: "$fiberDiameter" } } }
    ]);

    // Recent trends (mocked for simple MVP if not enough data)
    // Real implementation would group by date.

    res.json({
        totalInspections,
        approvedCount,
        rejectedCount,
        passRate: totalInspections > 0 ? ((approvedCount / totalInspections) * 100).toFixed(1) : 0,
        avgDiameter: avgDiameter.length > 0 ? avgDiameter[0].avg.toFixed(2) : 0
    });
};

// @desc    Get quality logs (history)
// @route   GET /api/quality/logs
// @access  Private (QUALITY_INSPECTOR)
const getQualityLogs = async (req, res) => {
    const logs = await QualityReport.find()
        .populate('batch', 'batchId woolType')
        .populate('inspector', 'name')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(logs);
};

module.exports = {
    createInspection,
    approveBatch,
    rejectBatch,
    getMyQualityReports,
    getAnalytics,
    getQualityLogs
};
