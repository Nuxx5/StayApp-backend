const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('stay')
        const stays = await collection.find(criteria).toArray()
        // var stays = await collection.aggregate([
        //     {
        //         $match: filterBy
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'byUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser'
        //         }
        //     },
        //     {
        //         $unwind: '$byUser'
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'aboutUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'aboutUser'
        //         }
        //     },
        //     {
        //         $unwind: '$aboutUser'
        //     }
        // ]).toArray()
        // stays = stays.map(stay => {
        //     stay.byUser = { _id: stay.byUser._id, fullname: stay.byUser.fullname }
        //     stay.aboutUser = { _id: stay.aboutUser._id, fullname: stay.aboutUser.fullname }
        //     delete stay.byUserId
        //     delete stay.aboutUserId
        //     return stay
        // })

        return stays
    } catch (err) {
        // logger.error('cannot find stays', err)
        throw err
    }

}

async function getById(stayId) {
    // const stay = gStays.find(stay => stay._id === stayId)
    // return Promise.resolve(stay);
    try {
        const collection = await dbService.getCollection('stay')
        const stay = await collection.findOne({ '_id': ObjectId(stayId) })
        // delete stay.password

        // stay.givenReviews = await reviewService.query({ bystayId: ObjectId(stay._id) })
        // stay.givenReviews = stay.givenReviews.map(review => {
        //     delete review.bystay
        //     return review
        // })

        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function update(stay) {
    console.log('service update stay', stay);
    try {
        // peek only updatable fields!
        const stayToSave = {
            _id: ObjectId(stay._id),
            name: stay.name,
            price: stay.price,
            type: stay.type,
            inStock: stay.inStock,
            createdAt: stay.createdAt
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ '_id': stayToSave._id }, { $set: stayToSave })
        return stayToSave;
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const query = { _id: ObjectId(stayId) }
        // if (!isAdmin) query.byUserId = ObjectId(userId)
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(stayId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}


async function add(stay) {
    try {
        // peek only updatable fields!
        const stayToAdd = {
            _id: ObjectId(stay._id),
            name: stay.name,
            imgUrls: ["https://a0.muscache.com/im/pictures/pro_photo_tool/Hosting-38500362-unapproved/original/8a3b09d8-666c-4a8c-bbe3-ce987a0e2431.JPEG?im_w=720"],
            summary: stay.summary,
            price: stay.price,
            capacity: stay.capacity,
            amenities: [
                "TV",
                "Wifi",
                "Kitchen",
                "A/C"
              ],
            host: {
                fullname: stay.host.fullname
            },
            loc: {
                address: stay.loc.address
            },
            reviews:[],
        }
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stayToAdd)
        return stayToAdd;
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    console.log('filterBy in service', filterBy)
    const criteria = {}
    if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
        criteria.txt = txtCriteria;
        console.log('criteria', criteria);
    }
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    getById,
    update
}


