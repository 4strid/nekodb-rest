const ko = require('kodbm')

const Fieldtypes = require('./fieldtypes')

function Models () {
	const models = function register (schemas) {
		ko.models(schemas)
		for (const name in schemas) {
			models[name] = ko.models[name]
		}
	}
	return models
}

module.exports = Models
