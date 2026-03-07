import Analysis from '../models/Analysis.js'

export const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(analyses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}