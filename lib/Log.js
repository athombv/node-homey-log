'use strict';

const Raven = require('raven');

class Log {

	constructor() {

		this._capturedExceptions = [];
		this._capturedMessages = [];

		if( typeof global.Homey === 'undefined' ) {
			try {
				this._homey = require('homey');
			} catch( err ) {
				console.error(err)
				return console.error('Error: Homey not found');
			}
		} else {
			this._homey = global.Homey;
		}
		
		if( typeof this._homey === 'undefined' )
			return console.error('Error: Homey not found');

		if( typeof this._homey.env.HOMEY_LOG_URL === 'string' ) {
			this.init( this._homey.env.HOMEY_LOG_URL );
		}

	}

	_log() {
		console.log.bind( null, Log.logTime(), '[homey-log]' ).apply( null, arguments );
	}

	init( url, opts ) {

		if( process.env.DEBUG === '1' && this._homey.env.HOMEY_LOG_FORCE !== '1' )
			return this._log('App is running in debug mode, disabling log');

		Raven.config(url, opts).install();

		this.setTags({
			appId			: this._homey.manifest.id,
			appVersion		: this._homey.manifest.version,
			homeyVersion	: this._homey.version
		});

		if (this._homey.hasOwnProperty('ManagerCloud')) { // SDKv2
			this._homey.ManagerCloud.getHomeyId(this.setHomeyIdTag.bind(this))
		} else if (this._homey.hasOwnProperty('manager')) { // SDKv1
			this._homey.manager('cloud').getHomeyId(this.setHomeyIdTag.bind(this))
		}

		this._log(`App ${this._homey.manifest.id} v${this._homey.manifest.version} logging...`);

		return this;

	}

	setHomeyIdTag(err, result) {
		if (!err && typeof result === 'string') {
			this.setTags({ homeyId: result })
		}
	}

	setTags( tags ) {
		this._mergeContext('tags', tags)

		return this;
	}

	setExtra( extra ) {
		this._mergeContext('extra', extra);

		return this;
	}

	setUser( user ) {
		this._mergeContext('user', user);

		return this;
	}

	_mergeContext(key, value) {
		// Raven.mergeContext covers only 1-level of the context (tags, extra, user)
		// We need to merge a 2-level of the context
		// see https://github.com/getsentry/raven-node/issues/228
		const context = Raven.getContext();
		if (!context[key]) {
			context[key] = {}
		}

		Object.assign(context[key], value)
		Raven.setContext(context);
	}

	captureMessage( message, options, callback) {
		this._log('captureMessage:', message);

		if( this._capturedMessages.indexOf( message ) > -1 ) {
			this._log('Prevented sending a duplicate message');
			return this;
		}

		this._capturedMessages.push( message )

		Raven.captureMessage(
			message,
			options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
			callback
		);

		return this;
	}

	captureException( err, options, callback) {
		this._log('captureException:', err);

		if( this._capturedExceptions.indexOf( err ) > -1 ) {
			this._log('Prevented sending a duplicate log');
			return this;
		}

		this._capturedExceptions.push( err )

		Raven.captureException(
			err,
			options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
			callback
		);

		return this;
	}

	static logTime() {

		let date = new Date();

		let mm = date.getMonth()+1;
			mm = (mm<10?"0"+mm:mm);
		let dd = date.getDate();
			dd = (dd<10?"0"+dd:dd);
		let hh = date.getHours();
			hh = (hh<10?"0"+hh:hh);
		let min = date.getMinutes();
			min = (min<10?"0"+min:min);
		let sec = date.getSeconds();
			sec = (sec<10?"0"+sec:sec);

		return `${date.getFullYear()}-${mm}-${dd} ${hh}:${min}:${sec}`;
	}

}

module.exports = new Log();
