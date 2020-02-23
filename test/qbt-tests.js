const assert = require('assert')
const api = require('../src/qbt')

api.connect(process.env.HOST, process.env.USER, process.env.PASS)
	.then(qbt => {
		qbt.appVersion()
			.then(version => {
				assert.ok(version.startsWith('v'))
			})
			.catch(err => {
				assert.ifError(err)
			})
	})
