import { logger } from '../../services/logger.service.js'
import { spotifyService } from './spotify.service.js'
// import { spotifyService } from './spotify.service.js'

export async function getSpotifyItems(req, res) {
    try {
        const {item,query} = req.query
        console.log('req.query:', req.query)
        const spotifyItems = await spotifyService.getSpotifyItems(item,query)
        console.log('spotifyItems:',spotifyItems )
        res.json(spotifyItems)
    } catch (err) {
        logger.error('Failed to get spotifys', err)
        res.status(400).send({ err: 'Failed to get spotifys' })
    }
}

