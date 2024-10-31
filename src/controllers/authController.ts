import { Request, Response } from "express"
import { comparePassword, hashPassword } from "../services/password.services"
import prisma from '../models/user'
import { generateToken } from "../services/auth.service"

export const register = async(req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body

    try {
        //Verificacion de existencia de email y password
        if (!email) {
            res.status(400).json({ message: 'El email es obligatorio'})
            return
        }
        if (!password) {
            res.status(400).json({ message: 'El password es obligatorio'})
            return
        }    
        
        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword)

        const user =  await prisma.create(
            {
                data: {
                    email,
                    password: hashedPassword
                }
            }
        )

        const token = generateToken(user)
        res.status(201).json({ token })
    } catch (error:any) {
        //TODO mejorar los errores
        console.log(error)
        if (!email) {
            res.status(400).json({ message: 'El email es obligatorio'})
        }
        if (!password) {
            res.status(400).json({ message: 'El password es obligatorio'})
        }

        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: 'El email ingresado ya existe'})
        }
        //console.log(error)
        res.status(500).json({error: 'Hubo un error en el registro'})
    }
}

export const login = async (req:Request, res:Response):Promise<void> => {
    const {email, password} = req.body
    try {
        //Verificacion de existencia de email y password
        if (!email) {
            res.status(400).json({ message: 'El email es obligatorio'})
            return
        }
        if (!password) {
            res.status(400).json({ message: 'El password es obligatorio'})
            return
        }

        const user = await prisma.findUnique({where: {email:email}})
        if (!user) {
            res.status(404).json({error: 'Usuario y/o contrasena no encontrado'})
            return
        }

        const passwordMatch = await comparePassword(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({error: 'Usuario y/o contrasena no coinciden'})
            //return
        }

        const token = generateToken(user)
        res.status(200).json({token})

    } catch (error: any) {
        console.log('Error: ',error)       
    }    
}