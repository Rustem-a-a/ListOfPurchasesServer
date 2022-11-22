import jwt from "jsonwebtoken";
import config from "config";
import TokenService from "../service/token-service.js";

export default async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
           return  res.status(403).json({message: 'User is not authorized!!'})
        }
        const decodedToken =
            await TokenService.validateAccessToken(token)
            // jwt.verify(token, config.get('ACCESS_SECRET'))
        if (!decodedToken) {
           return  res.status(401).json({message: 'User is not authorized from miidelware'})
        }
        req.user = decodedToken
        next()
    } catch (e) {
        res.status(403).json({message: 'User is not authorized!'})
    }
}