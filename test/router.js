const test = require('tape')
const server = require('diet')
const request = require('request-promise-native')
const Router = require('diet-router')
const path = require('path')
const rmrf = require('rimraf')

const db = require('../')
const ko = db.ko

/*********
 * Setup *
 *********/

const baseURL = 'http://localhost:7777'

const app = server()
app.listen(baseURL)
Router.extend(app)

test('Setup', function (t) {
	rmrf(path.resolve(__dirname, '../db'), function (err) {
		t.error(err, 'old database removed')
		t.end()
	})
})

test('Expect router to be created', function (t) {
	db.models({
		test1: {name: ko.String}
	})
	t.notEqual(db.routes.test1, undefined, 'route is not undefined')
	t.end()
})

test('Expect get requests to work', function (t) {
	db.models({
		test2: {
			name: ko.String
		}
	})
	app.route('/test2', db.routes.test2.getOne)

	db.models.test2.create({name: 'Test'}).save().then(function (user) {
		return request(baseURL + '/test2/' + user._id)
	})
	.then(function (response) {
		const res = JSON.parse(response)
		t.notEqual(res, null, 'returned something')
		t.equal(res.name, 'Test', 'returned expected object')
		t.end()
	})
	.catch(function (err) {
		//t.error(err)
		t.fail(`ran into an error: ${err.name}: ${err.message}`)
		t.end()
	})
})

test('Expect get many requests to work', function (t) {
	db.models({
		test3: {
			name: ko.String
		}
	})

	app.route('/test3', db.routes.test3.getMany)

	Promise.all([
		db.models.test3.create({name: 'value'}).save(),
		db.models.test3.create({name: 'value'}).save(),
		db.models.test3.create({name: 'value'}).save(),
	])
	.then(function () {
		return request({
			url: baseURL + '/test3/',
			method: 'POST',
			json: {}
		})
	})
	.then(function (response) {
		t.equal(response.length, 3, "got all the instances")
		t.equal(response[0].name, 'value', "returns the expected object")
		t.end()
	})
	.catch(function (err) {
		//t.error(err)
		t.fail(`ran into an error: ${err.name}: ${err.message}`)
		t.end()
	})
})

test('Expect postOne requests to work', function (t) {
	db.models({
		test4: {
			name: ko.String
		}
	})

	app.route('/test4', db.routes.test4.postOne)

	request({
		url: baseURL + '/test4/',
		method: 'POST',
		json: {name: 'Test'}
	})
	.then(function (response) {
		ko.models.test4.findOne({_id: response._id}).then(function (instance) {
			t.notEqual(instance, null, 'model was saved and retrieved')
			t.equal(instance.name, 'Test', 'got the expected model')
			t.end()
		})
		.catch(function (err) {
			t.error(err)
			t.end()
		})
	})
})

test.onFinish(function () {
	process.exit(0)
})
