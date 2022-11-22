import {Router} from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import ListDB from "../models/listDB-model.js";

const router = new Router()

router.post('/listAdd', authMiddleware,
    async (req, res) => {
        try {
            const userID = req.user.id
            const user = await ListDB.findOne({user: userID})
            if (!user) {
                await ListDB.create({
                    user: userID,
                    items: {
                        name: req.body.itemsName,
                        completed: req.body.completed,
                    }
                })
                return res.status(200).json({message: 'listDB created first!!!'})
            }

            await ListDB.updateOne({user: userID}, {
                $push: {
                    items: {
                        name: req.body.itemsName,
                        completed: req.body.completed
                    }
                }
            })
            return res.status(200).json({message: 'listDB updated!!!'})

        } catch (e) {
            return res.status(405).json({message: 'listDB is not created!'})
        }
    }
)

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

router.patch('/paragraphChange/:id', authMiddleware, async (req, res) => {
    try {
        const itemsObjectId = req.params.id
        const isItemsObjectId = await ListDB.findOne({'items._id': itemsObjectId})
        console.log(isItemsObjectId)
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
            return res.status(202).json({message: 'listDB updated!!!'})
        }
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})


router.delete('/listDelete/:id', authMiddleware, async (req, res) => {
    try {
        const user = await ListDB.findOne({user: req.user.id})
        await ListDB.findByIdAndUpdate(
            user._id,
            {$pull: {items: {_id: req.params.id}}})
        return res.status(202).json({message: 'listDB updated!!!'})

        return res.status(202).json({message: 'list is not founded!!!'})
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
            return res.status(202).json({message: 'listDB updated!!!'})
        }
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})

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
                {$set: {"items.$[inner].paragraph.$[itemsObjectParagraphId].name": "arsen"}},
                {
                    arrayFilters: [{"inner._id": itemsObjectId}, {"itemsObjectParagraphId._id": itemsObjectParagraphId}],
                    new: true
                })
            return res.status(202).json({message: 'listDB updated!!!'})
        }
        return res.status(202).json({message: 'list is not founded!!!'})
    } catch (e) {
        return res.status(405).json({message: 'listDB is not updated!!!!!'})
    }
})


export default router