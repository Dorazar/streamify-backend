import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

// const PAGE_SIZE = 3

export const stationService = {
  remove,
  query,
  getById,
  add,
  update,
  addStationMsg,
  removeStationMsg,
}

async function query(filterBy = { txt: '' }) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  if (!loggedinUser) return
  try {
    filterBy.loggedinUser = loggedinUser
    const criteria = await _buildCriteria(filterBy)

    // const sort = _buildSort(filterBy)
    const collection = await dbService.getCollection('station')

    const stationCursor = await collection.find({ 'createdBy._id': criteria.loggedinUser._id })

    const stations = stationCursor.toArray()

    return stations
  } catch (err) {
    logger.error('cannot find stations', err)
    throw err
  }
}

async function getById(stationId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stationId) }

    const collection = await dbService.getCollection('station')
    const station = await collection.findOne(criteria)

    station.createdAt = station._id.getTimestamp()
    return station
  } catch (err) {
    logger.error(`while finding station ${stationId}`, err)
    throw err
  }
}

async function remove(stationId) {
  //   const { loggedinUser } = asyncLocalStorage.getStore()
  // const { _id: ownerId, isAdmin } = loggedinUser

  try {
    const criteria = {
      _id: ObjectId.createFromHexString(stationId),
    }
    // if (!isAdmin) criteria['owner._id'] = ownerId

    const collection = await dbService.getCollection('station')
    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw 'Not your station'
    return stationId
  } catch (err) {
    logger.error(`cannot remove station ${stationId}`, err)
    throw err
  }
}

async function add(station) {
  try {
    const collection = await dbService.getCollection('station')
    await collection.insertOne(station)

    return station
  } catch (err) {
    logger.error('cannot insert station', err)
    throw err
  }
}

async function update(station) {
  //   console.log('station:', station)
  const stationToSave = {
    title: station.title,
    tags: station.tags,
    stationImgUrl: station.stationImgUrl,
    createdBy: station.createdBy,
    likedByUsers: station.likedByUsers,
    isPinned: station.isPinned,
    stationType: station.stationType,
    tracks: station.tracks,
    reviews: station.reviews,
    description: station.description,
    createdAt: station.createdAt,
  }

  try {
    const criteria = { _id: ObjectId.createFromHexString(station._id) }

    const collection = await dbService.getCollection('station')
    await collection.updateOne(criteria, { $set: stationToSave })

    return station
  } catch (err) {
    logger.error(`cannot update station ${station._id}`, err)
    throw err
  }
}

async function addStationMsg(stationId, msg) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stationId) }
    msg.id = makeId()

    const collection = await dbService.getCollection('station')
    await collection.updateOne(criteria, { $push: { msgs: msg } })

    return msg
  } catch (err) {
    logger.error(`cannot add station msg ${stationId}`, err)
    throw err
  }
}

async function removeStationMsg(stationId, msgId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stationId) }

    const collection = await dbService.getCollection('station')
    await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

    return msgId
  } catch (err) {
    logger.error(`cannot remove station msg ${stationId}`, err)
    throw err
  }
}

async function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.loggedinUser) {
    criteria.loggedinUser = filterBy.loggedinUser
  }

  return criteria
}

function _buildSort(filterBy) {
  if (!filterBy.sortField) return {}
  return { [filterBy.sortField]: filterBy.sortDir }
}
