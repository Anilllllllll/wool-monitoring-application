const WoolBatch = require('../models/WoolBatch');

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (MILL_OPERATOR)
// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (MILL_OPERATOR)
const createBatch = async (req, res) => {
    const { woolType, weight, moisture, source } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const batch = new WoolBatch({
        creator: req.user._id,
        farmerId: req.user.role === 'FARMER' ? req.user._id : undefined,
        woolType,
        weight,
        moisture,
        source,
        images,
        processingLogs: [{
            stage: 'Received',
            note: 'Batch initialized',
            operator: req.user._id
        }]
    });

    const createdBatch = await batch.save();
    res.status(201).json(createdBatch);
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private (FARMER sees own, others see all)
const getBatches = async (req, res) => {
    let batches;

    if (req.user.role === 'FARMER') {
        // Ideally we'd link batches to farmers, but 'source' is string locally. 
        // Assuming creator might be farmer or mill operator. 
        // For this scaffold, if FARMER returned restricted list or all for simplicity?
        // Requirement says "view_own_batches". Let's assume Farmer created them or is source.
        // For simplicity here, we return all for demo unless 'creator' is used.
        // Let's filter by creator if role is FARMER
        batches = await WoolBatch.find({ creator: req.user._id });
    } else {
        batches = await WoolBatch.find({});
    }

    res.json(batches);
};

// @desc    Get batch by ID
// @route   GET /api/batches/:id
// @access  Private
const getBatchById = async (req, res) => {
    const batch = await WoolBatch.findById(req.params.id).populate('creator', 'name email').populate('processingLogs.operator', 'name');

    if (batch) {
        res.json(batch);
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

// @desc    Update batch status/stage
// @route   PATCH /api/batches/:id/status
// @access  Private (MILL_OPERATOR)
const updateBatchStatus = async (req, res) => {
    const { stage, note } = req.body;
    const batch = await WoolBatch.findById(req.params.id);

    if (batch) {
        batch.currentStage = stage;
        batch.processingLogs.push({
            stage,
            note,
            operator: req.user._id
        });

        const updatedBatch = await batch.save();
        res.json(updatedBatch);
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

// @desc    Add processing log to a batch
// @route   POST /api/batches/:id/logs
// @access  Private (MILL_OPERATOR)
const addLog = async (req, res) => {
    const { note } = req.body;
    const batch = await WoolBatch.findById(req.params.id);

    if (batch) {
        batch.processingLogs.push({
            stage: batch.currentStage,
            note,
            operator: req.user._id
        });

        await batch.save();
        res.json(batch);
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

module.exports = { createBatch, getBatches, getBatchById, updateBatchStatus, addLog };
