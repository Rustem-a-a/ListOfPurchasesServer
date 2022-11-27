import {Router} from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import ListDB from "../models/listDB-model.js";
import MailService from "../service/mail-service.js";

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


router.patch('/paragraphChange/:id', authMiddleware, async (req, res) => {
    try {
        const itemsObjectId = req.params.id
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
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

//
// router.patch('/sharedItems/:id', authMiddleware, async (req, res) => {
//     try {
//         const itemsObjectId = req.params.id
//         const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
//         if (isItemsObjectId) {
//             const user = await ListDB.findOne({user: req.user.id})
//             await ListDB.findByIdAndUpdate(
//                 user._id,
//                 {
//                     $push: {sharedItems: {
//                             "name": req.body.paragraphName,
//                             "completed": req.body.completed
//                         }
//                     }
//                 },
//                 {
//                     arrayFilters: [{"inner._id": itemsObjectId}],
//                     new: true
//                 })
//             const updatedUser = await ListDB.findById(user.id)
//             return res.status(202).json({updatedUser})
//         }
//         return res.status(202).json({message: 'list is not founded!!!'})
//     } catch (e) {
//         return res.status(405).json({message: 'listDB is not updated!!!!!'})
//     }
// })


router.patch('/updateParagraph/:id/:paragraphId', authMiddleware, async (req, res) => {
    try {
        const itemsObjectParagraphId = req.params.paragraphId
        const itemsObjectId = req.params.id
        console.log(itemsObjectParagraphId)
        console.log(itemsObjectId)
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        if (isItemsObjectId) {
            console.log(isItemsObjectId)
            const user = await ListDB.findOne({user: req.user.id})
            console.log(user)
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
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})




router.get('/getList', authMiddleware,
    async (req, res) => {
        try {
            const userList = await ListDB.findOne({user: req.user.id})
            console.log(userList)
            return res.json({userList})
        } catch (e) {
            return res.json({message: 'not data!!!!'})
        }
    })


router.post('/postShare',authMiddleware, async (req,res)=>{
        try{
            console.log('in share')
            const userList = await ListDB.findOne({user:req.user.id})
            console.log('in share!')
            await MailService.sendShareMail(req.body.to,req.body.link,req.body.from,req.body.listName)
            console.log('in share!!')
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
        return res.status(202).json({message: 'listDB updated!!!'})

    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})


router.delete('/deleteParagraph/:id/:paragraphId', authMiddleware, async (req, res) => {
    try {
        const itemsObjectParagraphId = req.params.paragraphId
        const itemsObjectId = req.params.id
        console.log(itemsObjectParagraphId)
        console.log(itemsObjectId)
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        if (isItemsObjectId) {
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
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

export default router