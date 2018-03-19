const Router = require('diet-router')

function ErrVomiter ($) {
	return function (err) { 
		if (err instanceof Error) {
			$.status('500')
			$.data = {
				name: err.name,
				message: err.message
			}
		} else {
			$.status('403')
			$.data = err
		}
		$.json()
		$.end()
	}
}

function JSONVomiter ($) {
	return function (result) {
		$.data = result
		$.json()
		$.end()
	}
}

function Routes (model) {
	const router = Router()

	router.getOne = Router().get('/:modelaccesskey', function ($) {
		const key = model.key || '_id'
		const query = {}
		query[key] = $.params.modelaccesskey
		model.findOne(query).then(JSONVomiter($)).catch(ErrVomiter($))
	})

	router.getMany = Router().post('/', function ($) {
		model.find($.body).then(JSONVomiter($)).catch(ErrVomiter($))
	})


	function postOne ($) {
		const instance = model.create($.body)
		instance.save().then(JSONVomiter($)).catch(ErrVomiter($))
	}

	router.postOne = Router().post('/', postOne)

	function postMany ($) {
		const instances = $.body.map(instance => model.create(instance).save())
		Promise.all(instances).then(JSONVomiter($)).catch(ErrVomiter($))
	}

	router.postMany = Router().post('/', postMany)

	router.create = Router().post('/', function ($) {
		if (Array.isArray($.body)) {
			return postMany($)
		}
		postOne($)
	})

	function update ($) {
		const key = model.$$key || '_id'
		const query = {}
		query[key] = $.params.$$key
		model.findOne(query).then(function (instance) {
			if (instance === null) {
				$.status('404')
				return $.end()
			}
			for (const field in $.body) {
				instance[field] = $.body[field]
			}
			return instance.save()
		})
	}

	router.update = Router().put('/:$$key', update).post('/:$$key', update)


	function _delete ($) {
		const query = Query(model.$$key, $.params.$$key)
		model.deleteOne(query).then(JSONVomiter($)).catch(ErrVomiter($))
	}

	function deleteMany($) {
		model.deleteMany($.body).then(JSONVomiter($)).catch(ErrVomiter($))
	}

	router.deleteOne = Router().delete('/:$$key', _delete)

	router.deleteMany = Router().post('/', deleteMany)

	router.destroy = Router().delete('/:$$key', _delete)
							 .post('/', deleteMany)
							 .get('/$$key', _delete)

	router.route('/get', router.getOne)
	router.route('/get', router.getMany)
	router.route('/create', router.create)
	router.route('/update', router.update)
	router.route('/destroy', router.destroy)

	router.singleEndpoint = Router()
	router.singleEndpoint.route('', router.getOne)
	router.singleEndpoint.route('', router.getMany)
	router.singleEndpoint.route('', router.create)
	router.singleEndpoint.route('', router.deleteOne)
	router.singleEndpoint.route('', router.update)

	return router
}

module.exports = Routes
