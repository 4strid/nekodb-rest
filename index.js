const ko = require('kodbm')

const Models = require('./lib/models')
const Routes = require('./lib/routes')

const prototype = {}

db = Object.create(prototype)

db.routes = {}

db.models = new Proxy(Models(), {
	apply (target, thisArg, args) {
		target.apply(thisArg, args)
		for (const name in args[0]) {
			db.routes[name] = Routes(target[name])
		}
		return true
	}
})

db.ko = ko

module.exports = db
