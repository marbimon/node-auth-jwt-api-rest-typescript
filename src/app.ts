import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import authRoutes from './routes/authRoutes'
import usersRoutes from './routes/userRoutes'

const app = express()

app.use(express.json())

//Routes
//autenticacion
app.use('/auth', authRoutes)
//hacer una api rest de usuarios
app.use('/users', usersRoutes)
//console.log("Esto esta siendo ejecutado")

export default app