import express from 'express'
import config from 'config'
import mongoose from "mongoose";
import cors from 'cors'
import authRouter from "./routes/authRouter.js";
import cookieParser from 'cookie-parser'

const app =express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use('/auth',authRouter)
const PORT =process.env.PORT || config.get('serverPort')


const start = async()=>{

    try{
        await mongoose.connect(config.get('database'),{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
        app.listen(PORT,()=> {
            console.log('Server is running in port ' + config.get('serverPort'))
        })
    }
    catch (e){
        console.log(e)
    }
}
start()