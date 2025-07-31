const Cycle = require('../models/Cycle');

// POST /api/cycles - Create a new cycle entry
exports.createCycle = async (req, res) => {
  const { startDate, endDate, notes } = req.body;

  try {
    const predictedNextStartDate = new Date(startDate);
    predictedNextStartDate.setDate(predictedNextStartDate.getDate() + 28); // basic prediction logic

    const newCycle = new Cycle({
      userId: req.user.id,
      startDate,
      endDate,
      predictedNextStartDate,
      notes
    });

    const savedCycle = await newCycle.save();
    res.status(201).json(savedCycle);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/cycles - Get all cycles for logged-in user
exports.getCycles = async (req, res) => {
  try {
    const cycles = await Cycle.find({ userId: req.user.id }).sort({ startDate: -1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/cycles/:id - Update a cycle
exports.updateCycle = async (req, res) => {
  const { startDate, endDate, notes } = req.body;

  try {
    const cycle = await Cycle.findOne({ _id: req.params.id, userId: req.user.id });
    if (!cycle) return res.status(404).json({ msg: 'Cycle not found' });

    if (startDate) cycle.startDate = startDate;
    if (endDate) cycle.endDate = endDate;
    if (notes) cycle.notes = notes;

    if (startDate) {
      const predictedNextStartDate = new Date(startDate);
      predictedNextStartDate.setDate(predictedNextStartDate.getDate() + 28);
      cycle.predictedNextStartDate = predictedNextStartDate;
    }

    const updated = await cycle.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// DELETE /api/cycles/:id - Delete a cycle
exports.deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!cycle) return res.status(404).json({ msg: 'Cycle not found' });

    res.json({ msg: 'Cycle deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
