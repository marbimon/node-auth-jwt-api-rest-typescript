import { Request, Response } from "express"
import { hashPassword } from "../services/password.services"
import prisma from '../models/user'

export const createUser = async (req:Request, res:Response): Promise<void> => {
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
        const user = await prisma.create(
            {
                data: {
                    email,
                    password: hashedPassword
                }    
            }
        )
        res.status(201).json(user)
    } catch (error:any) {
        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: 'El email ingresado ya existe'})
        }
        console.log(error)
        res.status(500).json({error: 'Hubo un error en el registro, pruebe mas tarde'})
    }
}

export const getAllUsers = async (req:Request, res:Response): Promise<void> => {
    try {
        const users = await prisma.findMany()
        res.status(200).json(users);
    } catch (error:any) {
        console.log(error)
        res.status(500).json({error: 'Hubo un error en el registro, pruebe mas tarde'})
    }
}

export const getUserById = async (req:Request, res:Response): Promise<void> => {
    
    const userId = parseInt(req.params.id)
    try {
        const user = await prisma.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            res.status(404).json({error: 'El usuario no fue encontrado'})
            return //Porque estamos devolviendo una promesa void
        }
        res.status(200).json(user)
    } catch (error:any) {
        console.log(error)
        res.status(500).json({error: 'Hubo un error en el registro, pruebe mas tarde'})
    }
}

export const updateUser = async (req:Request, res:Response): Promise<void> => {
    
    const userId = parseInt(req.params.id)
    const {email, password } = req.body

    try {

        let dataToUpdate: any = {...req.body} //como parametros del request body
        
        if (password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }
        if (email) {
            dataToUpdate.email = email
        }
        const user = await prisma.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })

        res.status(200).json(user)
    } catch (error:any) {
        console.log(error)
        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: 'El email ingresado ya existe'})
        }else if(error?.code==='P2025') {
            res.status(404).json({message: 'Usuario no encontrado'})
        } else {        
            res.status(500).json({error: 'Hubo un error en el registro, pruebe mas tarde'})
        }
    }
}

export const deleteUser = async (req:Request, res:Response): Promise<void> => {
    
    const userId = parseInt(req.params.id)
    
    try {
        await prisma.delete({
            where: {
                id: userId
            }
        })

        res.status(200).json({
            message: `El usuario ${userId} ha sido eliminado`
        }).end() //No olvidar poner .end() para el DELETE
    } catch (error:any) {
        console.log(error)
        if(error?.code==='P2025') {
            res.status(404).json({message: 'Usuario no encontrado'})
        } else {        
            res.status(500).json({error: 'Hubo un error en el borrado, pruebe mas tarde'})
        }
    }
}