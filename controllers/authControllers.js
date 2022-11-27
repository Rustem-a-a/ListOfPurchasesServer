import User from '../models/users-model.js'
import Role from "../models/roles-model.js";
import bcrypt from 'bcryptjs'
import {validationResult} from "express-validator";
import UserDto from '../dtos/user-dto.js'
import TokenService from "../service/token-service.js";
import { v4 as uuidv4 } from 'uuid'
import MailService from "../service/mail-service.js";
import config from "config";
class AuthControllers {
    async registration(req, res) {
        try {
            const validateErrors = validationResult(req)
            if (!validateErrors.isEmpty()) {
                console.log(validateErrors)
                return res.status(400).json({message: "error registration " + validateErrors.errors.map(i => `${i.param} ${i.msg}`)})
            }

            const {username, password} = req.body
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.json({message: 'user with this name has already created'})
            }
            const hashPassword = bcrypt.hashSync(password, 7) // or const hashPassword = await bcrypt.hash(password, 7)
            const userRole = await Role.findOne({value: "USER"})
            const activationLink = uuidv4()
            const user = new User({
                username,
                password: hashPassword,
                roles: [userRole.value],
                activationLink
            })
            await user.save()
            await MailService.sendActivationMail(username,`${config.get('URL')}/auth/activate/${activationLink}`)
            const userDto = new UserDto(user)
            const tokens = TokenService.generateToken({...userDto})
            await TokenService.saveToken(userDto.id,tokens.refreshToken)
            res.cookie('refreshToken',tokens.refreshToken,{maxAge:30*24*60*60*1000,httpOnly:true})
            return res.json(
                {   user:userDto,
                    ...tokens
                }
            )
        } catch (e) {
            res.status(400).json({message: 'registration !!! error'})
        }
    }
    async login(req, res) {
        try {
            const {username, password} = req.body
            const user = await User.findOne({username})
            if (!user) {
                return res.status(400).json({message: 'username or password incorrect'})
            }
            const isValidPassword = bcrypt.compareSync(password, user.password)
            if (!isValidPassword) {
                return res.status(400).json({message: 'username or password incorrect'})
            }
            const userDto = new UserDto(user)
            const tokens = TokenService.generateToken({...userDto})
            await TokenService.saveToken(userDto.id,tokens.refreshToken)
            res.cookie('refreshToken', tokens.refreshToken,{maxAge:30*24*60*60*1000,httpOnly:true})
            res.json({
                user: userDto,
                ...tokens
            })
        } catch (e) {
            res.status(400).json({message: 'login error'})
        }
    }

    async logout(req,res){
        try{
            const {refreshToken} = req.cookies
            const deletedToken = await TokenService.removeToken(refreshToken)
            res.clearCookie('refreshToken')
            return res.status(200).json(
                deletedToken)
        }
        catch (e){
            console.log(e)
        }
    }

    async refresh(req,res){
     try {
         const {refreshToken} = req.cookies
         if(!refreshToken){
             return res.status(401).json({message:'user is not authorized'})
         }
         const userDataFromToken = await TokenService.validateRefreshToken(refreshToken)
         const foundToken = await TokenService.findToken()
         if(!userDataFromToken || !foundToken){
             return res.status(401).json({message:'Error of authContollers of refresh'})
         }
         const user = await User.findOne({_id:userDataFromToken.id})
         const userDto = new UserDto(user)
         const tokens = TokenService.generateToken({...userDto})
         await TokenService.saveToken(userDto.id,tokens.refreshToken)
         res.cookie('refreshToken', tokens.refreshToken,{maxAge:30*24*60*60*1000,httpOnly:true})
         res.json({
             user:userDto,
             ...tokens
         })

     }
     catch (e) {
        res.status(401).json({message:'Error from catch of authContollers'})
     }
    }
    async activate(req,res){
        try {
            const activationLink = req.params.link
            const user = await User.findOne({activationLink})
            if(!user){
                return res.status(401).json({message: 'user is not founded'})
            }
            user.isActivated = true
            await user.save()
           return  res.redirect(config.get('URL_FRONT'))
        }catch (e){
            console.log(e)}

    }

    async getUsers(req,res){
        try{
            const decodedAccessToken = req.user
            const foundToken = await User({_id:decodedAccessToken.id})
            if (!foundToken) {
                res.status(403).json({message: 'User is not authorized'})
            }
            const users = await User.find()
            return res.status(200).json(users)
        }
        catch (e) {
            console.log(e)

        }
    }
}

export default new AuthControllers()