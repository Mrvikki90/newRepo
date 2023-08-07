const dbConfig = require("../config/config");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("../models/user.modal")(mongoose);
db.conversation = require("../models/converstation.modal")(mongoose);
db.message = require("../models/messages.modal")(mongoose);
db.ChatTracking = require("../models/chatTracking.modal")(mongoose);
db.groups = require("../models/groups.modal")(mongoose);

module.exports = db;
