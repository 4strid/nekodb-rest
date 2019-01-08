//const Models = require('./lib/models')
//const Routes = require('./lib/routes')

//const prototype = {}

//db = Object.create(prototype)

//db.routes = {}

//db.models = new Proxy(Models(), {
	//apply (target, thisArg, args) {
		//target.apply(thisArg, args)
		//for (const name in args[0]) {
			//db.routes[name] = Routes(target[name])
		//}
		//return true
	//}
//})

//db.ko = ko

//module.exports = db

const nekodb = require('nekodb')

function APIRouter (Router) {
	const o = Object.create(Router.prototype)
	o.routes = {}
	o.Router = Router
	return o
}

APIRouter.prototype = Object.create(nekodb)

APIRouter.prototype.models = function (schemas) {
	for (const name in schemas) {
		this.Model(name, schemas[name])
	}
}

APIRouter.prototype.Model = function (name, schema) {
	const Model = this.ko_models.Model(name, schema)
	console.log(Model)
	this.routes[name] = new Routes(Model, this.Router)
	return Model
}

module.exports = APIRouter
