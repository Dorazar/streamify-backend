// import { loadFromStorage, saveToStorage } from './util.service.js'
import axios from 'axios'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'


export const youtubeService = {
	getVideos,
}

const YT_API_KEY = 'AIzaSyBI5sWC-degJz4OEhmVR39xp6wvP5eEA74'



const ytURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&videoEmbeddable=true&type=video&key=${YT_API_KEY}`

async function getVideos(keyword) {
	// if (gVideoMap[keyword]) return Promise.resolve(gVideoMap[keyword])

	const collection = await dbService.getCollection('videoDB')
	const criteria = await _buildCriteria(keyword)
	// console.log(criteria)
	const trackDocs = await collection.find({'keyword':{ $regex: criteria.keyword, $options: 'i' } }).toArray()
	
	const docs = await collection.find({}, { projection: { title: 1 } }).toArray()
	// console.log(docs)
	if (trackDocs.length > 0) {
		//  if track in mongoDB return it
		const trackFromVideoDB = trackDocs
		// console.log('trackFromVideoDB',trackFromVideoDB)
		return trackFromVideoDB
	}

	try {
		const { data } = await axios.get(`${ytURL}&q=${keyword}`)
		const youtubeItems = data.items.map(_getVideoInfo)
		// console.log('youtubeItems:', youtubeItems)
		if (youtubeItems.length > 0) {
			const firstVideo = youtubeItems[0]

			const videoToSave = {
				id: firstVideo.id,
				title: firstVideo.title,
				thumbnail: firstVideo.thumbnail,
				keyword
			}

			await add(videoToSave)
		}

		return youtubeItems
	} catch (err) {
		console.error('Failed to get videos:', err)
		throw err
	}
}

function _getVideoInfo(video) {

	const { id, snippet } = video
	const { title, thumbnails } = snippet

	const videoId = id.videoId
	const thumbnail = thumbnails.default.url

	return { id: videoId, title, thumbnail }
}


async function add(track) {
	
  try {
	
	const collection = await dbService.getCollection('videoDB')
	await collection.insertOne(track)

	return track
  } catch (err) {
	logger.error('cannot insert track', err)
	throw err
  }
}




export function _buildCriteria(keyword) {
	function escapeRegex(text) {
	
		return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	}

	
	const cleanKeyword = keyword.trim()

	
	const words = cleanKeyword.split(/\s+/).map(escapeRegex)
	const regex = words.map(w => `(?=.*${w})`).join('')

	return { keyword: regex }
}