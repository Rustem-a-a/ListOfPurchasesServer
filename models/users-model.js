import {Schema,model} from "mongoose";

const User = new Schema({
    username:{type:String,unique:true,required:true},
    password:{type:String, required: true},
    avatar:{type:String,default:null},
    roles:[{type:String,ref:"Role"}],
    isActivated:{type:String, required:true,default: false},
    activationLink:{type:String, required:true}
})

export default model('Users',User)