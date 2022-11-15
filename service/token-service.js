import jwt from "jsonwebtoken";
import config from "config";
import Token from "../models/token-models.js";

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, config.get('ACCESS_SECRET'), {expiresIn: '30s'})
        const refreshToken = jwt.sign(payload, config.get('REFRESH_SECRET'), {expiresIn: '30m'})
        return {
            accessToken,
            refreshToken
        }
    }

    async validateAccessToken(accessToken) {
        try {
            const userDataFromToken = jwt.verify(accessToken, config.get('ACCESS_SECRET'))
            return userDataFromToken
        } catch (e) {
            return null
        }

    }

    async validateRefreshToken(refreshToken) {
        try {
            const userDataFromToken = jwt.verify(refreshToken, config.get('REFRESH_SECRET'))
            return userDataFromToken
        } catch (e) {
            return null
        }
    }

    async saveToken(id, refreshToken) {
        const tokenData = await Token.findOne({user: id})
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return await tokenData.save()
        }

        return await Token.create({user: id, refreshToken: refreshToken})
    }

    async removeToken(refreshToken) {
        const removedToken = await Token.deleteOne({refreshToken})
        return removedToken
    }
    async findToken(userId){
        try{
            const foundToken = await Token.findOne({userId})
            return foundToken
        }
        catch (e) {
            console.log(e)
        }
    }
}

export default new TokenService()