const express = require('express')
const passport = require('passport')
const Channel = require('../models/channel')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// INDEX
// GET /channels
router.get('/channelCreator', requireToken, (req, res, next) => {
  Channel.find()
    .then(channels => {
      return channels.map(channel => channel.toObject())
    })
    .then(channels => res.status(200).json({ channels: channels }))
    .catch(next)
})

// SHOW
// GET /channels/5a7db6c74d55bc51bdf39793
router.get('/channelCreator/:id', requireToken, (req, res, next) => {
  Channel.findById(req.params.id)
    .then(handle404)
    .then(channel => res.status(200).json({ channel: channel.toObject() }))
    .catch(next)
})

// CREATE
// POST /channels
router.post('/channelCreator', requireToken, (req, res, next) => {
  req.body.channel.owner = req.user._id
  Channel.create(req.body.channel)
    .then(channel => {
      res.status(201).json({ channel: channel.toObject() })
    })
    .catch(next)
})

// UPDATE
// PATCH /channels/5a7db6c74d55bc51bdf39793
router.patch('/channelCreator/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.channel.owner
  Channel.findById(req.params.id)
    .then(handle404)
    .then(channel => {
      requireOwnership(req, channel)
      return channel.updateOne(req.body.channel)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
// DELETE /channels/5a7db6c74d55bc51bdf39793
router.delete('/channelCreator/:id', requireToken, (req, res, next) => {
  Channel.findById(req.params.id)
    .then(handle404)
    .then(channel => {
      requireOwnership(req, channel)
      channel.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
