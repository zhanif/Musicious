const mongoose = require('mongoose')

const CooldownSchema = new mongoose.Schema({
    id_user: {
        type: String,
        unique: true
    },
    time: Number,
    alert: Boolean
}, {versionKey: false})

module.exports = mongoose.models.Cooldown || mongoose.model('Cooldown', CooldownSchema)