import express from 'express'

import { log } from '../../middlewares/logger.middleware.js'

import { getYoutubeItems } from './youtube.controller.js' 

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getYoutubeItems)

export const youtubeRoutes = router
