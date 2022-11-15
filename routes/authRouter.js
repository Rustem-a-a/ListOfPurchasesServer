import {Router} from "express";
import controller from '../controllers/authControllers.js'
import {check} from "express-validator";
import authControllers from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = new Router()
router.post('/registration',
    [
        check('username', 'field must be filled').notEmpty(),
        check('password', 'must have min 7, max 20 symbols').isLength({min: 7, max: 20})
    ], controller.registration)

router.post('/login', authControllers.login)

router.post('/logout', authControllers.logout)

router.get('/refresh',authControllers.refresh)

router.get('/activate/:link', authControllers.activate)

router.get('/users',authMiddleware, authControllers.getUsers)

export default router