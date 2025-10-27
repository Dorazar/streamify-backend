import { logger } from '../../services/logger.service.js'
import { youtubeService } from './youtube.service.js'


export async function getYoutubeItems(req, res) {
    try {
        const {query} = req.query
        console.log('req.query:',query)
        const youtubeItems = await youtubeService.getVideos(query)
        console.log('youtubeItems:',youtubeItems )
        res.json(youtubeItems)
    } catch (err) {
        logger.error('Failed to get youtube', err)
        res.status(400).send({ err: 'Failed to get youtube' })
    }
}

