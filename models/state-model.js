import {Schema,model} from "mongoose";

const stateDB = new Schema({
    items: [
        {
            name: {type:String},
            paragraph: [
                {
                    name: {type:String,required:true},
                    id: {type:String, required:true,unique:true},
                    completed: {type:Boolean,required:true}
                }
            ],
            completed:{type:Boolean,required:true}
        }

    ]
})