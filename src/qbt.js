const https = require('https')

const ENDPOINT = '/api/v2'

/**
 * Login to qBittorrent
 * @param {string} host - Host name of your qBittorrent instance without 'https://'
 * @param {string} username - Username used to access the WebUI
 * @param {string} password - Password used to access the WebUI
 */
exports.connect = async (host, username, password) => {
	try {
		const { res, cookie } = await performRequest(host, null, '/auth/login', { username: username, password: password })
		return {
			/**
			 * Get application version
			 * @return {Promise<string>} The response is a string with the application version, e.g. v4.1.3
			 */
			appVersion: async () => {
				return await appVersion(host, cookie)
			},
			/**
			 * Get API version
			 * @return {Promise<string>} The response is a string with the WebAPI version, e.g. 2.0
			 */
			apiVersion: async () => {
				return await apiVersion(host, cookie)
			},
			/**
			 * @typedef {Object} BuildInfo
			 * @param {string} qt - QT version
			 * @param {string} libtorrent - libtorrent version
			 * @param {string} boost - Boost version
			 * @param {string} openssl - OpenSSL version
			 * @param {string} bitness - Application bitness (e.g. 64-bit)
			 */
			/**
			 * Get build info
			 * @return {Promise<BuildInfo>} Object containing build info
			 */
			buildInfo: async () => {
				return await buildInfo(host, cookie)
			},
			/**
			 * Shutdown application
			 */
			shutdown: async () => {
				await shutdown(host, cookie)
			},
			/**
			 * @typedef {Object} Preferences
			 * {string} locale - Currently selected language (e.g. en_GB for English)
			 * {boolean} create_subfolder_enabled - True if a subfolder should be created when adding a torrent
			 * {boolean} start_paused_enabled - True if torrents should be added in a Paused state
			 * {number} auto_delete_mode
			 * {boolean} preallocate_all - True if disk space should be pre-allocated for all files
			 * {boolean} incomplete_files_ext - True if ".!qB" should be appended to incomplete files
			 * {boolean} auto_tmm_enabled - True if Automatic Torrent Management is enabled by default
			 * {boolean} torrent_changed_tmm_enabled - True if torrent should be relocated when its Category changes
			 * {boolean} save_path_changed_tmm_enabled - True if torrent should be relocated when the default save path changes
			 * {boolean} category_changed_tmm_enabled - True if torrent should be relocated when its Category's save path changes
			 * {string} save_path - Default save path for torrents, separated by slashes
			 * {boolean} temp_path_enabled - True if folder for incomplete torrents is enabled
			 * {string} temp_path - Path for incomplete torrents, separated by slashes
			 * {Object} scan_dirs - Property: directory to watch for torrent files, value: where torrents loaded from this directory should be downloaded to (see list of possible values below). Slashes are used as path separators; multiple key/value pairs can be specified
			 * {string} export_dir - Path to directory to copy .torrent files to. Slashes are used as path separators
			 * {string} export_dir_fin - Path to directory to copy .torrent files of completed downloads to. Slashes are used as path separators
			 * {boolean} mail_notification_enabled - True if e-mail notification should be enabled
			 * {string} mail_notification_sender - e-mail where notifications should originate from
			 * {string} mail_notification_email - e-mail to send notifications to
			 * {string} mail_notification_smtp - smtp server for e-mail notifications
			 * {boolean} mail_notification_ssl_enabled - True if smtp server requires SSL connection
			 * {boolean} mail_notification_auth_enabled - True if smtp server requires authentication
			 * {string} mail_notification_username - Username for smtp authentication
			 * {string} mail_notification_password - Password for smtp authentication
			 * {boolean} autorun_enabled - True if external program should be run after torrent has finished downloading
			 * {string} autorun_program - Program path/name/arguments to run if autorun_enabled is enabled; path is separated by slashes; you can use %f and %n arguments, which will be expanded by qBittorent as path_to_torrent_file and torrent_name (from the GUI; not the .torrent file name) respectively
			 * {boolean} queueing_enabled - True if torrent queuing is enabled
			 * {number} max_active_downloads - Maximum number of active simultaneous downloads
			 * {number} max_active_torrents - Maximum number of active simultaneous downloads and uploads
			 * {number} max_active_uploads - Maximum number of active simultaneous uploads
			 * {boolean} dont_count_slow_torrents - If true torrents w/o any activity (stalled ones) will not be counted towards max_active_* limits; see dont_count_slow_torrents for more information
			 * {number} slow_torrent_dl_rate_threshold - Download rate in KiB/s for a torrent to be considered "slow"
			 * {number} slow_torrent_ul_rate_threshold - Upload rate in KiB/s for a torrent to be considered "slow"
			 * {number} slow_torrent_inactive_timer - Seconds a torrent should be inactive before considered "slow"
			 * {boolean} max_ratio_enabled - True if share ratio limit is enabled
			 * {float} max_ratio - Get the global share ratio limit
			 * {boolean} max_ratio_act - Action performed when a torrent reaches the maximum share ratio. See list of possible values here below.
			 * {number} listen_port - Port for incoming connections
			 * {boolean} upnp - True if UPnP/NAT-PMP is enabled
			 * {boolean} random_port - True if the port is randomly selected
			 * {number} dl_limit - Global download speed limit in KiB/s; -1 means no limit is applied
			 * {number} up_limit - Global upload speed limit in KiB/s; -1 means no limit is applied
			 * {number} max_connec - Maximum global number of simultaneous connections
			 * {number} max_connec_per_torrent - Maximum number of simultaneous connections per torrent
			 * {number} max_uploads - Maximum number of upload slots
			 * {number} max_uploads_per_torrent - Maximum number of upload slots per torrent
			 * {boolean} enable_utp - True if uTP protocol should be enabled; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * {boolean} limit_utp_rate - True if [du]l_limit should be applied to uTP connections; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * {boolean} limit_tcp_overhead - True if [du]l_limit should be applied to estimated TCP overhead (service data: e.g. packet headers)
			 * {boolean} limit_lan_peers - True if [du]l_limit should be applied to peers on the LAN
			 * {number} alt_dl_limit - Alternative global download speed limit in KiB/s
			 * {number} alt_up_limit - Alternative global upload speed limit in KiB/s
			 * {boolean} scheduler_enabled - True if alternative limits should be applied according to schedule
			 * {number} schedule_from_hour - Scheduler starting hour
			 * {number} schedule_from_min - Scheduler starting minute
			 * {number} schedule_to_hour - Scheduler ending hour
			 * {number} schedule_to_min - Scheduler ending minute
			 * {number} scheduler_days - Scheduler days. See possible values here below
			 * {boolean} dht - True if DHT is enabled
			 * {boolean} dhtSameAsBT - True if DHT port should match TCP port
			 * {number} dht_port - DHT port if dhtSameAsBT is false
			 * {boolean} pex - True if PeX is enabled
			 * {boolean} lsd - True if LSD is enabled
			 * {number} encryption - See list of possible values here below
			 * {boolean} anonymous_mode - If true anonymous mode will be enabled; read more here; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * {number} proxy_type - See list of possible values here below
			 * {string} proxy_ip - Proxy IP address or domain name
			 * {number} proxy_port - Proxy port
			 * {boolean} proxy_peer_connections - True if peer and web seed connections should be proxified; this option will have any effect only in qBittorent built against libtorrent version 0.16.X and higher
			 * {boolean} force_proxy - True if the connections not supported by the proxy are disabled
			 * {boolean} proxy_auth_enabled - True proxy requires authentication; doesn't apply to SOCKS4 proxies
			 * {string} proxy_username - Username for proxy authentication
			 * {string} proxy_password - Password for proxy authentication
			 * {boolean} ip_filter_enabled - True if external IP filter should be enabled
			 * {string} ip_filter_path - Path to IP filter file (.dat, .p2p, .p2b files are supported); path is separated by slashes
			 * {boolean} ip_filter_trackers - True if IP filters are applied to trackers
			 * {string} web_ui_domain_list - Comma-separated list of domains to accept when performing Host header validation
			 * {string} web_ui_address - IP address to use for the WebUI
			 * {number} web_ui_port - WebUI port
			 * {boolean} web_ui_upnp - True if UPnP is used for the WebUI port
			 * {string} web_ui_username - WebUI username
			 * {string} web_ui_password - For API ≥ v2.3.0: Plaintext WebUI password, not readable, write-only. For API < v2.3.0: MD5 hash of WebUI password, hash is generated from the following string: username:Web UI Access:plain_text_web_ui_password
			 * {boolean} web_ui_csrf_protection_enabled - True if WebUI CSRF protection is enabled
			 * {boolean} web_ui_clickjacking_protection_enabled - True if WebUI clickjacking protection is enabled
			 * {boolean} bypass_local_auth - True if authentication challenge for loopback address (127.0.0.1) should be disabled
			 * {boolean} bypass_auth_subnet_whitelist_enabled - True if webui authentication should be bypassed for clients whose ip resides within (at least) one of the subnets on the whitelist
			 * {string} bypass_auth_subnet_whitelist - (White)list of ipv4/ipv6 subnets for which webui authentication should be bypassed; list entries are separated by commas
			 * {boolean} alternative_webui_enabled - True if an alternative WebUI should be used
			 * {string} alternative_webui_path - File path to the alternative WebUI
			 * {boolean} use_https - True if WebUI HTTPS access is enabled
			 * {string} ssl_key - SSL keyfile contents (this is a not a path)
			 * {string} ssl_cert - SSL certificate contents (this is a not a path)
			 * {boolean} dyndns_enabled - True if server DNS should be updated dynamically
			 * {number} dyndns_service - See list of possible values here below
			 * {string} dyndns_username - Username for DDNS service
			 * {string} dyndns_password - Password for DDNS service
			 * {string} dyndns_domain - Your DDNS domain name
			 * {number} rss_refresh_interval - RSS refresh interval
			 * {number} rss_max_articles_per_feed - Max stored articles per RSS feed
			 * {boolean} rss_processing_enabled - Enable processing of RSS feeds
			 * {boolean} rss_auto_downloading_enabled - Enable auto-downloading of torrents from the RSS feeds
			 */
			/**
			 * Get application preferences
			 * @return {Promise<Preferences>} Object containing the application's settings
			 */
			preferences: async () => {
				return await preferences(host, cookie)
			},
			/**
			 * Get default save path
			 * @return {Promise<string>} Default save path, e.g. C:/Users/Dayman/Downloads
			 */
			defaultSavePath: async () => {
				return await defaultSavePath(host, cookie)
			},
			/**
			 * @typedef {Object} Torrent
			 * @property {number} added_on - Time (Unix Epoch) when the torrent was added to the client
			 * @property {number} amount_left - Amount of data left to download (bytes)
			 * @property {boolean} auto_tmm - Whether this torrent is managed by Automatic Torrent Management
			 * @property {string} category - Category of the torrent
			 * @property {number} completed - Amount of transfer data completed (bytes)
			 * @property {number} completion_on - Time (Unix Epoch) when the torrent completed
			 * @property {number} dl_limit - Torrent download speed limit (bytes/s), `-1` if unlimited.
			 * @property {number} dlspeed - Torrent download speed (bytes/s)
			 * @property {number} downloaded - Amount of data downloaded
			 * @property {number} downloaded_session - Amount of data downloaded this session
			 * @property {number} eta - Torrent ETA (seconds)
			 * @property {boolean} f_l_piece_prio - True if first last piece are prioritized
			 * @property {boolean} force_start - True if force start is enabled for this torrent
			 * @property {string} hash - Torrent hash
			 * @property {number} last_activity - Last time (Unix Epoch) when a chunk was downloaded/uploaded
			 * @property {string} magnet_uri - Magnet URI corresponding to this torrent
			 * @property {number} max_ratio - Maximum share ratio until torrent is stopped from seeding/uploading
			 * @property {number} max_seeding_time - Maximum seeding time (seconds) until torrent is stopped from seeding
			 * @property {string} name - Torrent name
			 * @property {number} num_complete - Number of seeds in the swarm
			 * @property {number} num_incomplete - Number of leechers in the swarm
			 * @property {number} num_leechs - Number of leechers connected to
			 * @property {number} num_seeds - Number of seeds connected to
			 * @property {number} priority - Torrent priority. Returns `-1` if queuing is disabled or torrent is in seed mode
			 * @property {number} progress - Torrent progress (percentage/100)
			 * @property {number} ratio - Torrent share ratio. Max ratio value: 9999
			 * @property {number} ratio_limit
			 * @property {string} save_path - Path where this torrent's data is stored
			 * @property {number} seeding_time_limit
			 * @property {number} seen_complete - Time (Unix Epoch) when this torrent was last seen complete
			 * @property {boolean} seq_dl - True if sequential download is enabled
			 * @property {number} size - Total size (bytes) of files selected for download
			 * @property {string} state - Torrent state. See table here below for the possible values
			 * @property {boolean} super_seeding - True if super seeding is enabled
			 * @property {string} tags - Comma-concatenated tag list of the torrent
			 * @property {number} time_active - Total active time (seconds)
			 * @property {number} total_size - Total size (bytes) of all file in this torrent (including unselected ones)
			 * @property {string} tracker - The first tracker with working status
			 * @property {number} up_limit - Torrent upload speed limit (bytes/s), `-1` if unlimited
			 * @property {number} uploaded - Amount of data uploaded
			 * @property {number} uploaded_session - Amount of data uploaded this session
			 * @property {number} upspeed - Torrent upload speed (bytes/s)
			 */
			/**
			 * Get torrent list
			 * @param {('all'|'downloading'|'completed'|'paused'|'active'|'inactive'|'resumed')} filter - Filter torrent list
			 * @param {string} category - Get torrents with the given category (empty string means "without category"; null parameter means "any category")
			 * @param {string} sort - Sort torrents by given key
			 * @param {boolean} reverse - Enable reverse sorting
			 * @param {number} limit - Limit the number of torrents returned
			 * @param {number} offset - Set offset (if less than 0, offset from end)
			 * @param {string} hashes - Filter by hashes. Can contain multiple hashes separated by |
			 * @return {Promise<Torrent[]>} Array of torrents
			 */
			torrents: async (filter, category, sort, reverse, limit, offset, hashes) => {
				return await torrents(host, cookie, filter, category, sort, reverse, limit, offset, hashes)
			},
			/**
			 * Pause one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to pause. It can contain multiple hashes separated by |, to pause multiple torrents, or set to 'all', to pause all torrents
			 */
			pauseTorrents: async (hashes) => {
				return await pauseTorrents(host, cookie, hashes)
			},
			/**
			 * Resume one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to resume. It can contain multiple hashes separated by |, to resume multiple torrents, or set to 'all', to resume all torrents
			 */
			resumeTorrents: async (hashes) => {
				return await resumeTorrents(host, cookie, hashes)
			},
			/**
			 * Delete one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to delete. It can contain multiple hashes separated by |, to delete multiple torrents, or set to 'all', to delete all torrents
			 * @param {boolean} deleteFile - If set to `true`, the downloaded data will also be deleted, otherwise has no effect
			 */
			deleteTorrents: async (hashes, deleteFile) => {
				return await deleteTorrents(host, cookie, hashes, deleteFile)
			},
			/**
			 * Recheck one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to recheck. It can contain multiple hashes separated by |, to recheck multiple torrents, or set to 'all', to recheck all torrents
			 */
			recheckTorrents: async (hashes) => {
				return await recheckTorrents(host, cookie, hashes)
			},
			/**
			 * Reannounce one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to reannounce. It can contain multiple hashes separated by |, to reannounce multiple torrents, or set to 'all', to reannounce all torrents
			 */
			reannounceTorrents: async (hashes) => {
				return await reannounceTorrents(host, cookie, hashes)
			}
		}
	} catch (err) {
		console.error(err)
		throw new Error(`Login failed with username: ${username}`)
	}
}

// Application

async function appVersion(host, cookie) {
	try {
		const { res } = await performRequest(host, cookie, '/app/version', {})
		return res
	} catch (err) {
		throw err
	}
}

async function apiVersion(host, cookie) {
	try {
		const { res } = await performRequest(host, cookie, '/app/webapiVersion', {})
		return res
	} catch (err) {
		throw err
	}
}

async function buildInfo(host, cookie) {
	try {
		const { res } = await performRequest(host, cookie, '/app/buildInfo', {})
		return JSON.parse(res)
	} catch (err) {
		throw err
	}
}

async function shutdown(host, cookie) {
	try {
		await performRequest(host, cookie, '/app/shutdown', {})
	} catch (err) {
		throw err
	}
}

async function preferences(host, cookie) {
	try {
		const { res } = await performRequest(host, cookie, '/app/preferences', {})
		return JSON.parse(res)
	} catch (err) {
		throw err
	}
}

async function defaultSavePath(host, cookie) {
	try {
		const { res } = await performRequest(host, cookie, '/app/defaultSavePath', {})
		return res
	} catch (err) {
		throw err
	}
}

// Torrent management

async function torrents(host, cookie, filter, category, sort, reverse, limit, offset, hashes) {
	var parameters = {}
	if (filter) parameters.filter = filter
	if (category) parameters.category = category
	if (sort) parameters.sort = sort
	if (reverse) parameters.reverse = reverse
	if (limit) parameters.limit = limit
	if (offset) parameters.offset = offset
	if (hashes) parameters.hashes = hashes

	try {
		const { res } = await performRequest(host, cookie, '/torrents/info', parameters)
		return JSON.parse(res)
	} catch (err) {
		throw err
	}
}

async function pauseTorrents(host, cookie, hashes) {
	try {
		await performRequest(host, cookie, '/torrents/pause', { hashes: hashes })
		return
	} catch (err) {
		throw err
	}
}

async function resumeTorrents(host, cookie, hashes) {
	try {
		await performRequest(host, cookie, '/torrents/resume', { hashes: hashes })
		return
	} catch (err) {
		throw err
	}
}

async function deleteTorrents(host, cookie, hashes, deleteFile) {
	try {
		await performRequest(host, cookie, '/torrents/delete', { hashes: hashes, deleteFile: deleteFile })
		return
	} catch (err) {
		throw err
	}
}

async function recheckTorrents(host, cookie, hashes) {
	try {
		await performRequest(host, cookie, '/torrents/recheck', { hashes: hashes })
		return
	} catch (err) {
		throw err
	}
}

async function reannounceTorrents(host, cookie, hashes) {
	try {
		await performRequest(host, cookie, '/torrents/reannounce', { hashes: hashes })
		return
	} catch (err) {
		throw err
	}
}

// Utils functions

function performRequest(hostname, cookie, path, parameters) {
	const data = plainify(parameters)

	const options = {
		hostname: hostname,
		port: 443,
		path: ENDPOINT + path,
		method: 'POST',
		headers: {
			'Referer': 'https://' + hostname,
			'Origin': 'https://' + hostname,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length,
			'Cookie': cookie
		}
	}

	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			let data = []

			res.on('data', chunk => data.push(chunk))
				.on('end', () => {
					if (res.statusCode == 200) {
						var c = null
						if (res.headers['set-cookie'] != undefined) {
							c = res.headers['set-cookie'][0]
						}
						resolve({ res: Buffer.concat(data).toString(), cookie: c })
					} else {
						reject()
					}
				})
		})

		req.on('error', err => reject(err))

		req.write(data)
		req.end()
	})
}

/**
 * Convert a JSON object to plain text parameters for POST method
 * @param {Object} json - JSON object
 * @return {string} Plain text parameters
 */
function plainify(json) {
	let str = JSON.stringify(json)
	str = str.replace(/{([^}]*)}/g, '$1')
	str = str.replace(/"([^"]*)":"([^"]*)",?/g, '$1=$2&')
	return str
}