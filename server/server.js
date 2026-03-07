import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'
import historyRoutes from './routes/historyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/jobs', jobRoutes)

app.get('/', (req, res) => res.send('SmartHire API running'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))