import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeName: { type: String, required: true },
  jobTitle: { type: String },
  matchScore: { type: Number, required: true },
  missingSkills: [String],
  suggestions: [String],
}, { timestamps: true })

export default mongoose.model('Analysis', analysisSchema)