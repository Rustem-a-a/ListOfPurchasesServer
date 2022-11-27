import {Schema, model, SchemaTypes} from "mongoose";

const ListDB = new Schema({
    user:{type:SchemaTypes.ObjectId,ref:'User'},
    items: [
        {
            name: {type:String,default:'def'},
            completed:{type:Boolean,required:true},
            paragraph: [
                {
                    name: {type:String},
                    completed: {type:Boolean}
                }
            ]
        }

    ],
    sharedItems:[{type:String}]
})
export default model("ListDB",ListDB)