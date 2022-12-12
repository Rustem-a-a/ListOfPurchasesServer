import e, {Router} from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import ListDB from "../models/listDB-model.js";
import MailService from "../service/mail-service.js";
import User from "../models/users-model.js";
import {ObjectId} from "mongodb";

const router = new Router()

router.post('/listAdd', authMiddleware,
    async (req, res) => {
        try {
            const userID = req.user.id
            const user = await ListDB.findOne({user: userID})
            if (!user) {
                const updatedList = await ListDB.create({
                    user: userID,
                    items: {
                        name: req.body.itemsName,
                        completed: req.body.completed,
                    }
                })
                return res.status(200).json({updatedList})
            }
             await ListDB.updateOne({user: userID}, {
                $push: {
                    items: {
                        name: req.body.itemsName,
                        completed: req.body.completed
                    }
                }
            })
            const updatedList = await ListDB.findOne({user: userID})
            return res.status(200).json({updatedList})

        } catch (e) {
            return res.status(405).json({message: 'listDB is not created!!!!!!!!!'})
        }
    }
)


router.patch('/paragraphChange/:id/:isOwnItem', authMiddleware, async (req, res) => {
    try {
        const itemsObjectId = req.params.id
        const isOwnItem = req.params.isOwnItem
        if(isOwnItem==='true'){
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        if (isItemsObjectId) {
            const user = await ListDB.findOne({user: req.user.id})
            await ListDB.findByIdAndUpdate(
                user._id,
                {
                    $push: {
                        "items.$[inner].paragraph": {
                            "name": req.body.paragraphName,
                            "completed": req.body.completed
                        }
                    }
                },
                {
                    arrayFilters: [{"inner._id": itemsObjectId}],
                    new: true
                })
            const updatedUser = await ListDB.findById(user.id)
            return res.status(202).json({updatedUser})
        }
        return res.status(202).json({message: 'list is not founded!!!'})}
        else{
            const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
            if (isItemsObjectId) {
                const user = await ListDB.findOne({items:{$elemMatch:{_id:req.params.id}}})
                await ListDB.findByIdAndUpdate(
                    user._id,
                    {
                        $push: {
                            "items.$[inner].paragraph": {
                                "name": req.body.paragraphName,
                                "completed": req.body.completed
                            }
                        }
                    },
                    {
                        arrayFilters: [{"inner._id": itemsObjectId}],
                        new: true
                    })
                return res.status(202).json({message: 'Paragraph add'})
            }
            return res.status(202).json({message: 'list is not founded!!!'})
        }
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

router.patch('/updateParagraph/:id/:paragraphId/:isOwnItem', authMiddleware, async (req, res) => {
    try {
        const itemsObjectParagraphId = req.params.paragraphId
        const itemsObjectId = req.params.id
        const isOwnItem = req.params.isOwnItem
        if(isOwnItem==='true'){
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        if (isItemsObjectId) {
            const user = await ListDB.findOne({user: req.user.id})
            await ListDB.findByIdAndUpdate(
                user._id,
                {$set: {
                    "items.$[inner].paragraph.$[itemsObjectParagraphId].completed": req.body.completed,
                        "items.$[inner].paragraph.$[itemsObjectParagraphId].name": req.body.name

                }},
                {
                    arrayFilters: [{"inner._id": itemsObjectId}, {"itemsObjectParagraphId._id": itemsObjectParagraphId}],
                    new: true
                })
            const updatedUser = await ListDB.findById(user.id)
            return res.status(202).json({updatedUser})
        }
        return res.status(202).json({message: 'list is not founded!!!'})}
        else{
            const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
            if (isItemsObjectId) {
                const user = await ListDB.findOne({items:{$elemMatch:{_id:req.params.id}}})
                await ListDB.findByIdAndUpdate(
                    user._id,
                    {$set: {
                            "items.$[inner].paragraph.$[itemsObjectParagraphId].completed": req.body.completed,
                            "items.$[inner].paragraph.$[itemsObjectParagraphId].name": req.body.name

                        }},
                    {
                        arrayFilters: [{"inner._id": itemsObjectId}, {"itemsObjectParagraphId._id": itemsObjectParagraphId}],
                        new: true
                    })

                return res.status(202).json({message: 'Paragraph changed'})
            }
            return res.status(202).json({message: 'list is not founded!!!'})
        }
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})




router.get('/getList', authMiddleware,
    async (req, res) => {
        try {
            const userList = await ListDB.findOne({user: req.user.id})
            return res.json({userList})
        } catch (e) {
            return res.json({message: 'not data!!!!'})
        }
    })

let arrShared=[]

router.post('/filter', authMiddleware,
    async (req, res) => {
        let arrShared=[]
    try {
        // const founded = await ListDB.findOne({})
        // console.log(founded)
        //         console.log(11111111111111)

            const arr = req.body.sharedUserItemsId
        console.log(arr)
                      const new1=   await ListDB.aggregate([
                        {
                            $project: {
                                items: {
                                    $filter: {
                                        input: "$items",
                                        as: "item",
                                        cond:{$or:
                                                arr.map((i)=>({ $eq:[ "$$item._id", ObjectId(i) ] }))

                                                 }
                                    }
                                }
                            }
                        }
                    ])
        return res.json(new1)
        } catch (e) {
            return res.json({message: 'not data!!!!'})
        }
    })


router.post('/postShare',authMiddleware, async (req,res)=>{
        try{
            const sendingUser = await User.findOne({username:req.body.from})
            const receivingUser = await User.findOne({username:req.body.to})
                await ListDB.findOneAndUpdate(
                {user: receivingUser._id},
                {$push: {sharedItems: req.body.itemId
            }}
            )
            const userList = await ListDB.findOne({user:req.user.id})
            await MailService.sendShareMail(req.body.to,req.body.link,req.body.from,req.body.listName)
            res.status(201).json({userList})
        }
        catch (e) {

        }
})

router.delete('/documentDelete', authMiddleware,
    async (req, res) => {
        try {
            const user = await ListDB.findOne({user: req.user.id})
            await ListDB.findByIdAndDelete(user._id)
            return res.json({message: 'deleted'})
        } catch (e) {
            return res.json({message: 'not deleted'})
        }
    })


router.delete('/listDelete/:id', authMiddleware, async (req, res) => {
    try {
        const user = await ListDB.findOne({user: req.user.id})
        await ListDB.findByIdAndUpdate(
            user._id,
            {$pull: {items: {_id: req.params.id}}})
        const updatedUser = await ListDB.findById(user.id)
        return res.status(202).json({updatedUser})

    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})


router.delete('/deleteParagraph/:id/:paragraphId/:isOwnItem', authMiddleware, async (req, res) => {
    try {
        const itemsObjectId = req.params.id
        const itemsObjectParagraphId = req.params.paragraphId
        const isOwnItem = req.params.isOwnItem
        if(isOwnItem==='true'){
            const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
            if (isItemsObjectId) {
                console.log(111111111)
                const user = await ListDB.findOne({user: req.user.id})
                await ListDB.findByIdAndUpdate(
                    user._id,
                    {$pull: {"items.$[inner].paragraph": {_id: itemsObjectParagraphId}}},
                    {
                        arrayFilters: [{"inner._id": itemsObjectId}],
                        new: true
                    })
                const updatedUser = await ListDB.findById(user.id)
                return res.status(202).json({updatedUser})
            }
            return res.status(202).json({message: 'list is not founded!!!'})}
        else {
            const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
            if (isItemsObjectId) {
                console.log(2222222222)
                const user = await ListDB.findOne({items:{$elemMatch:{_id:req.params.id}}})
                await ListDB.findByIdAndUpdate(
                    user._id,
                    {$pull: {"items.$[inner].paragraph": {_id: itemsObjectParagraphId}}},
                    {
                        arrayFilters: [{"inner._id": itemsObjectId}],
                        new: true
                    })
                return res.status(202).json({message:'SharedParagraphDeleted'})
            }
            return res.status(202).json({message: 'list is not founded!!!'})
        }
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

router.patch('/shareParagraphChange/:id', authMiddleware, async (req, res) => {
    try {
        const itemsObjectId = req.params.id

    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

router.patch('/shareUpdateParagraph/:id/:paragraphId', authMiddleware, async (req, res) => {
    try {
        const itemsObjectParagraphId = req.params.paragraphId
        const itemsObjectId = req.params.id
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        if (isItemsObjectId) {
            const user = await ListDB.findOne({items:{$elemMatch:{_id:req.params.id}}})
            await ListDB.findByIdAndUpdate(
                user._id,
                {$set: {
                        "items.$[inner].paragraph.$[itemsObjectParagraphId].completed": req.body.completed,
                        "items.$[inner].paragraph.$[itemsObjectParagraphId].name": req.body.name

                    }},
                {
                    arrayFilters: [{"inner._id": itemsObjectId}, {"itemsObjectParagraphId._id": itemsObjectParagraphId}],
                    new: true
                })

            return res.status(202).json({message: 'Paragraph changed'})
        }
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})


export default router