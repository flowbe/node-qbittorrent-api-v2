const protocol = { 'https:': require('https'), 'http:': require('http') }

const ENDPOINT = '/api/v2'

/**
 * Login to qBittorrent
 * @param {string} host - Host name of your qBittorrent instance
 * @param {string} username - Username used to access the WebUI
 * @param {string} password - Password used to access the WebUI
 */
exports.connect = async (host, username, password) => {
	const hostname = new URL(host)
	const options = {
		hostname: hostname.hostname,
		protocol: hostname.protocol,
		port: parseInt(hostname.port) || (hostname.protocol == 'https:' ? 443 : 80)
	}

	try {
		const { cookie } = await performRequest(options, null, '/auth/login', { username: username, password: password })
		return {
			/**
			 * Get application version
			 * @return {Promise<string>} The response is a string with the application version, e.g. v4.1.3
			 */
			appVersion: async () => {
				return await appVersion(options, cookie)
			},
			/**
			 * Get API version
			 * @return {Promise<string>} The response is a string with the WebAPI version, e.g. 2.0
			 */
			apiVersion: async () => {
				return await apiVersion(options, cookie)
			},
			/**
			 * @typedef {Object} BuildInfo
			 * @property {string} qt - QT version
			 * @property {string} libtorrent - libtorrent version
			 * @property {string} boost - Boost version
			 * @property {string} openssl - OpenSSL version
			 * @property {string} bitness - Application bitness (e.g. 64-bit)
			 */
			/**
			 * Get build info
			 * @return {Promise<BuildInfo>} Object containing build info
			 */
			buildInfo: async () => {
				return await buildInfo(options, cookie)
			},
			/**
			 * Shutdown application
			 */
			shutdown: async () => {
				await shutdown(options, cookie)
			},
			/**
			 * @typedef {Object} Preferences
			 * @property {string} locale - Currently selected language (e.g. en_GB for English)
			 * @property {boolean} create_subfolder_enabled - True if a subfolder should be created when adding a torrent
			 * @property {boolean} start_paused_enabled - True if torrents should be added in a Paused state
			 * @property {number} auto_delete_mode
			 * @property {boolean} preallocate_all - True if disk space should be pre-allocated for all files
			 * @property {boolean} incomplete_files_ext - True if ".!qB" should be appended to incomplete files
			 * @property {boolean} auto_tmm_enabled - True if Automatic Torrent Management is enabled by default
			 * @property {boolean} torrent_changed_tmm_enabled - True if torrent should be relocated when its Category changes
			 * @property {boolean} save_path_changed_tmm_enabled - True if torrent should be relocated when the default save path changes
			 * @property {boolean} category_changed_tmm_enabled - True if torrent should be relocated when its Category's save path changes
			 * @property {string} save_path - Default save path for torrents, separated by slashes
			 * @property {boolean} temp_path_enabled - True if folder for incomplete torrents is enabled
			 * @property {string} temp_path - Path for incomplete torrents, separated by slashes
			 * @property {Object} scan_dirs - Property: directory to watch for torrent files, value: where torrents loaded from this directory should be downloaded to (see list of possible values below). Slashes are used as path separators; multiple key/value pairs can be specified
			 * @property {string} export_dir - Path to directory to copy .torrent files to. Slashes are used as path separators
			 * @property {string} export_dir_fin - Path to directory to copy .torrent files of completed downloads to. Slashes are used as path separators
			 * @property {boolean} mail_notification_enabled - True if e-mail notification should be enabled
			 * @property {string} mail_notification_sender - e-mail where notifications should originate from
			 * @property {string} mail_notification_email - e-mail to send notifications to
			 * @property {string} mail_notification_smtp - smtp server for e-mail notifications
			 * @property {boolean} mail_notification_ssl_enabled - True if smtp server requires SSL connection
			 * @property {boolean} mail_notification_auth_enabled - True if smtp server requires authentication
			 * @property {string} mail_notification_username - Username for smtp authentication
			 * @property {string} mail_notification_password - Password for smtp authentication
			 * @property {boolean} autorun_enabled - True if external program should be run after torrent has finished downloading
			 * @property {string} autorun_program - Program path/name/arguments to run if autorun_enabled is enabled; path is separated by slashes; you can use %f and %n arguments, which will be expanded by qBittorent as path_to_torrent_file and torrent_name (from the GUI; not the .torrent file name) respectively
			 * @property {boolean} queueing_enabled - True if torrent queuing is enabled
			 * @property {number} max_active_downloads - Maximum number of active simultaneous downloads
			 * @property {number} max_active_torrents - Maximum number of active simultaneous downloads and uploads
			 * @property {number} max_active_uploads - Maximum number of active simultaneous uploads
			 * @property {boolean} dont_count_slow_torrents - If true torrents w/o any activity (stalled ones) will not be counted towards max_active_* limits; see dont_count_slow_torrents for more information
			 * @property {number} slow_torrent_dl_rate_threshold - Download rate in KiB/s for a torrent to be considered "slow"
			 * @property {number} slow_torrent_ul_rate_threshold - Upload rate in KiB/s for a torrent to be considered "slow"
			 * @property {number} slow_torrent_inactive_timer - Seconds a torrent should be inactive before considered "slow"
			 * @property {boolean} max_ratio_enabled - True if share ratio limit is enabled
			 * @property {float} max_ratio - Get the global share ratio limit
			 * @property {boolean} max_ratio_act - Action performed when a torrent reaches the maximum share ratio. See list of possible values here below.
			 * @property {number} listen_port - Port for incoming connections
			 * @property {boolean} upnp - True if UPnP/NAT-PMP is enabled
			 * @property {boolean} random_port - True if the port is randomly selected
			 * @property {number} dl_limit - Global download speed limit in KiB/s; -1 means no limit is applied
			 * @property {number} up_limit - Global upload speed limit in KiB/s; -1 means no limit is applied
			 * @property {number} max_connec - Maximum global number of simultaneous connections
			 * @property {number} max_connec_per_torrent - Maximum number of simultaneous connections per torrent
			 * @property {number} max_uploads - Maximum number of upload slots
			 * @property {number} max_uploads_per_torrent - Maximum number of upload slots per torrent
			 * @property {boolean} enable_utp - True if uTP protocol should be enabled; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * @property {boolean} limit_utp_rate - True if [du]l_limit should be applied to uTP connections; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * @property {boolean} limit_tcp_overhead - True if [du]l_limit should be applied to estimated TCP overhead (service data: e.g. packet headers)
			 * @property {boolean} limit_lan_peers - True if [du]l_limit should be applied to peers on the LAN
			 * @property {number} alt_dl_limit - Alternative global download speed limit in KiB/s
			 * @property {number} alt_up_limit - Alternative global upload speed limit in KiB/s
			 * @property {boolean} scheduler_enabled - True if alternative limits should be applied according to schedule
			 * @property {number} schedule_from_hour - Scheduler starting hour
			 * @property {number} schedule_from_min - Scheduler starting minute
			 * @property {number} schedule_to_hour - Scheduler ending hour
			 * @property {number} schedule_to_min - Scheduler ending minute
			 * @property {number} scheduler_days - Scheduler days. See possible values here below
			 * @property {boolean} dht - True if DHT is enabled
			 * @property {boolean} dhtSameAsBT - True if DHT port should match TCP port
			 * @property {number} dht_port - DHT port if dhtSameAsBT is false
			 * @property {boolean} pex - True if PeX is enabled
			 * @property {boolean} lsd - True if LSD is enabled
			 * @property {number} encryption - See list of possible values here below
			 * @property {boolean} anonymous_mode - If true anonymous mode will be enabled; read more here; this option is only available in qBittorent built against libtorrent version 0.16.X and higher
			 * @property {number} proxy_type - See list of possible values here below
			 * @property {string} proxy_ip - Proxy IP address or domain name
			 * @property {number} proxy_port - Proxy port
			 * @property {boolean} proxy_peer_connections - True if peer and web seed connections should be proxified; this option will have any effect only in qBittorent built against libtorrent version 0.16.X and higher
			 * @property {boolean} force_proxy - True if the connections not supported by the proxy are disabled
			 * @property {boolean} proxy_auth_enabled - True proxy requires authentication; doesn't apply to SOCKS4 proxies
			 * @property {string} proxy_username - Username for proxy authentication
			 * @property {string} proxy_password - Password for proxy authentication
			 * @property {boolean} ip_filter_enabled - True if external IP filter should be enabled
			 * @property {string} ip_filter_path - Path to IP filter file (.dat, .p2p, .p2b files are supported); path is separated by slashes
			 * @property {boolean} ip_filter_trackers - True if IP filters are applied to trackers
			 * @property {string} web_ui_domain_list - Comma-separated list of domains to accept when performing Host header validation
			 * @property {string} web_ui_address - IP address to use for the WebUI
			 * @property {number} web_ui_port - WebUI port
			 * @property {boolean} web_ui_upnp - True if UPnP is used for the WebUI port
			 * @property {string} web_ui_username - WebUI username
			 * @property {string} web_ui_password - For API ≥ v2.3.0: Plaintext WebUI password, not readable, write-only. For API < v2.3.0: MD5 hash of WebUI password, hash is generated from the following string: username:Web UI Access:plain_text_web_ui_password
			 * @property {boolean} web_ui_csrf_protection_enabled - True if WebUI CSRF protection is enabled
			 * @property {boolean} web_ui_clickjacking_protection_enabled - True if WebUI clickjacking protection is enabled
			 * @property {boolean} bypass_local_auth - True if authentication challenge for loopback address (127.0.0.1) should be disabled
			 * @property {boolean} bypass_auth_subnet_whitelist_enabled - True if webui authentication should be bypassed for clients whose ip resides within (at least) one of the subnets on the whitelist
			 * @property {string} bypass_auth_subnet_whitelist - (White)list of ipv4/ipv6 subnets for which webui authentication should be bypassed; list entries are separated by commas
			 * @property {boolean} alternative_webui_enabled - True if an alternative WebUI should be used
			 * @property {string} alternative_webui_path - File path to the alternative WebUI
			 * @property {boolean} use_https - True if WebUI HTTPS access is enabled
			 * @property {string} ssl_key - SSL keyfile contents (this is a not a path)
			 * @property {string} ssl_cert - SSL certificate contents (this is a not a path)
			 * @property {boolean} dyndns_enabled - True if server DNS should be updated dynamically
			 * @property {number} dyndns_service - See list of possible values here below
			 * @property {string} dyndns_username - Username for DDNS service
			 * @property {string} dyndns_password - Password for DDNS service
			 * @property {string} dyndns_domain - Your DDNS domain name
			 * @property {number} rss_refresh_interval - RSS refresh interval
			 * @property {number} rss_max_articles_per_feed - Max stored articles per RSS feed
			 * @property {boolean} rss_processing_enabled - Enable processing of RSS feeds
			 * @property {boolean} rss_auto_downloading_enabled - Enable auto-downloading of torrents from the RSS feeds
			 */
			/**
			 * Get application preferences
			 * @return {Promise<Preferences>} Object containing the application's settings
			 */
			preferences: async () => {
				return await preferences(options, cookie)
			},
			/**
			 * Get default save path
			 * @return {Promise<string>} Default save path, e.g. C:/Users/Dayman/Downloads
			 */
			defaultSavePath: async () => {
				return await defaultSavePath(options, cookie)
			},
			/**
			 * @typedef {Object} Log
			 * @property {number} id - ID of the message
			 * @property {string} message - Text of the message
			 * @property {number} timestamp - Milliseconds since epoch
			 * @property {(1|2|4|8)} type - Type of the message (normal: `1`, info: `2`, warning: `4`, critical: `8`)
			 */
			/**
			 * Get log
			 * @param {boolean} normal - Include normal messages (default: `true`)
			 * @param {boolean} info - Include info messages (default: `true`)
			 * @param {boolean} warning - Include warning messages (default: `true`)
			 * @param {boolean} critical - Include critical messages (default: `true`)
			 * @param {number} lastKnownId - Exclude messages with "message id" <= `lastKnownId` (default: `-1`)
			 * @return {Promise<Log[]>} Logs
			 */
			log: async (normal, info, warning, critical, lastKnownId) => {
				return await log(options, cookie, normal, info, warning, critical, lastKnownId)
			},
			/**
			 * @typedef {Object} PeerLog
			 * @property {number} id - ID of the message
			 * @property {string} ip - IP of the peer
			 * @property {number} timestamp - Milliseconds since epoch
			 * @property {boolean} blocked - Whether or not the peer was blocked
			 * @property {string} reason - Reason of the block
			 */
			/**
			 * Get peer log
			 * @param {number} lastKnownId - Exclude messages with "message id" <= `lastKnownId` (default: `-1`)
			 * @return {Promise<PeerLog[]>} Peer logs
			 */
			peerLog: async (lastKnownId) => {
				return await peerLog(options, cookie, lastKnownId)
			},
			/**
			 * @typedef {Object} MainData
			 * @property {number} rid - Response ID
			 * @property {boolean} full_update - Whether the response contains all the data or partial data
			 * @property {Object} torrents - Property: torrent hash, value: same as torrent list
			 * @property {string[]} torrents_removed - List of hashes of torrents removed since last request
			 * @property {Object} categories - Info for categories added since last request
			 * @property {string[]} categories_removed - List of categories removed since last request
			 * @property {string[]} tags - List of tags added since last request
			 * @property {string[]} tags_removed - List of tags removed since last request
			 * @property {Object} server_state - Global transfer info
			 */
			/**
			 * Get main data
			 * @param {number} rid - Response ID. If not provided, rid=0 will be assumed. If the given rid is different from the one of last server reply, `full_update` will be `true`
			 * @return {Promise<MainData>} Main data
			 */
			syncMainData: async (rid) => {
				return await syncMainData(options, cookie, rid)
			},
			/**
			 * Get torrent peers data
			 * @param {string} hash - Torrent hash
			 * @param {number} rid - Response ID. If not provided, rid=0 will be assumed. If the given rid is different from the one of last server reply, `full_update` will be `true`
			 * @return {Promise<PeerData>} Peer data
			 */
			syncPeersData: async (hash, rid) => {
				return await syncPeersData(options, cookie, hash, rid)
			},
			/**
			 * @typedef {Object} TransferInfo
			 * @property {number} dl_info_speed - Global download rate (bytes/s)
			 * @property {number} dl_info_data - Data downloaded this session (bytes)
			 * @property {number} up_info_speed - Global upload rate (bytes/s)
			 * @property {number} up_info_data - Data uploaded this session (bytes)
			 * @property {number} dl_rate_limit - Download rate limit (bytes/s)
			 * @property {number} up_rate_limit - Upload rate limit (bytes/s)
			 * @property {number} dht_nodes - DHT nodes connected to
			 * @property {string} connection_status - Connection status
			 */
			/**
			 * Get global transfer info
			 * @return {Promise<TransferInfo>} Transfer info
			 */
			transferInfo: async () => {
				return await transferInfo(options, cookie)
			},
			/**
			 * Get alternative speed limits state
			 * @return {Promise<number>} The response is 1 if alternative speed limits are enabled, 0 otherwise
			 */
			speedLimitsMode: async () => {
				return await speedLimitsMode(options, cookie)
			},
			/**
			 * Toggle alternative speed limits
			 */
			toggleSpeedLimitsMode: async () => {
				return await toggleSpeedLimitsMode(options, cookie)
			},
			/**
			 * Get global download limit
			 * @return {Promise<number>} Current global download speed limit in bytes/second; this value will be zero if no limit is applied
			 */
			globalDownloadLimit: async () => {
				return await globalDownloadLimit(options, cookie)
			},
			/**
			 * Set global download limit
			 * @param {number} limit - The global download speed limit to set in bytes/second
			 */
			setGlobalDownloadLimit: async (limit) => {
				return await setGlobalDownloadLimit(options, cookie, limit)
			},
			/**
			 * Get global upload limit
			 * @return {Promise<number>} Current global upload speed limit in bytes/second; this value will be zero if no limit is applied
			 */
			globalUploadLimit: async () => {
				return await globalUploadLimit(options, cookie)
			},
			/**
			 * Set global upload limit
			 * @param {number} limit - The global upload speed limit to set in bytes/second
			 */
			setGlobalUploadLimit: async (limit) => {
				return await setGlobalUploadLimit(options, cookie, limit)
			},
			/**
			 * Ban peers
			 * @param {string} peers - The peer to ban, or multiple peers separated by a pipe `|`. Each peer is a colon-separated `host:port`
			 */
			banPeers: async (peers) => {
				return await banPeers(options, cookie, peers)
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
			 * @return {Promise<Torrent[]>} Torrents
			 */
			torrents: async (filter, category, sort, reverse, limit, offset, hashes) => {
				return await torrents(options, cookie, filter, category, sort, reverse, limit, offset, hashes)
			},
			/**
			 * @typedef {Object} TorrentInfo
			 * @property {string} save_path - Torrent save path
			 * @property {number} creation_date - Torrent creation date (Unix timestamp)
			 * @property {number} piece_size - Torrent piece size (bytes)
			 * @property {string} comment - Torrent comment
			 * @property {number} total_wasted - Total data wasted for torrent (bytes)
			 * @property {number} total_uploaded - Total data uploaded for torrent (bytes)
			 * @property {number} total_uploaded_session - Total data uploaded this session (bytes)
			 * @property {number} total_downloaded - Total data downloaded for torrent (bytes)
			 * @property {number} total_downloaded_session - Total data downloaded this session (bytes)
			 * @property {number} up_limit - Torrent upload limit (bytes/s)
			 * @property {number} dl_limit - Torrent download limit (bytes/s)
			 * @property {number} time_elapsed - Torrent elapsed time (seconds)
			 * @property {number} seeding_time - Torrent elapsed time while complete (seconds)
			 * @property {number} nb_connections - Torrent connection count
			 * @property {number} nb_connections_limit - Torrent connection count limit
			 * @property {number} share_ratio - Torrent share ratio
			 * @property {number} addition_date - When this torrent was added (unix timestamp)
			 * @property {number} completion_date - Torrent completion date (unix timestamp)
			 * @property {string} created_by - Torrent creator
			 * @property {number} dl_speed_avg - Torrent average download speed (bytes/second)
			 * @property {number} dl_speed - Torrent download speed (bytes/second)
			 * @property {number} eta - Torrent ETA (seconds)
			 * @property {number} last_seen - Last seen complete date (unix timestamp)
			 * @property {number} peers - Number of peers connected to
			 * @property {number} peers_total - Number of peers in the swarm
			 * @property {number} pieces_have - Number of pieces owned
			 * @property {number} pieces_num - Number of pieces of the torrent
			 * @property {number} reannounce - Number of seconds until the next announce
			 * @property {number} seeds - Number of seeds connected to
			 * @property {number} seeds_total - Number of seeds in the swarm
			 * @property {number} total_size - Torrent total size (bytes)
			 * @property {number} up_speed_avg - Torrent average upload speed (bytes/second)
			 * @property {number} up_speed - Torrent upload speed (bytes/second)
			 */
			/**
			 * Get torrent generic properties
			 * @param {string} hash - The hash of the torrent you want to get the generic properties of
			 * @return {Promise<TorrentInfo>} Torrent properties
			 */
			properties: async (hash) => {
				return await properties(options, cookie, hash)
			},
			/**
			 * @typedef {Object} Tracker
			 * @property {string} url - Tracker url
			 * @property {number} status - Tracker status. See the table below for possible values
			 * @property {number} tier - Tracker priority tier. Lower tier trackers are tried before higher tiers
			 * @property {number} num_peers - Number of peers for current torrent, as reported by the tracker
			 * @property {number} num_seeds - Number of seeds for current torrent, asreported by the tracker
			 * @property {number} num_leeches - Number of leeches for current torrent, as reported by the tracker
			 * @property {number} num_downloaded - Number of completed downlods for current torrent, as reported by the tracker
			 * @property {string} msg - Tracker message (there is no way of knowing what this message is - it's up to tracker admins)
			 */
			/**
			 * Get torrent trackers
			 * @param {string} hash - The hash of the torrent you want to get the trackers of
			 * @return {Promise<Tracker[]>} Torrent trackers
			 */
			trackers: async (hash) => {
				return await trackers(options, cookie, hash)
			},
			/**
			 * @typedef {Object} Webseed
			 * @property {string} url - URL of the web seed
			 */
			/**
			 * Get torrent webseeds
			 * @param {string} hash - The hash of the torrent you want to get the webseeds of
			 * @return {Promise<Webseed[]>} Torrent webseeds
			 */
			webseeds: async (hash) => {
				return await webseeds(options, cookie, hash)
			},
			/**
			 * @typedef {Object} Content
			 * @property {string} name - File name (including relative path)
			 * @property {number} size - File size (bytes)
			 * @property {number} progress - File progress (percentage/100)
			 * @property {(0|1|6|7)} priority - File priority.
			 * @property {boolean} is_seed - True if file is seeding/complete
			 * @property {number} piece_range array - The first number is the starting piece index and the second number is the ending piece index (inclusive)
			 * @property {number} availability - Percentage of file pieces currently available
			 */
			/**
			 * Get torrent contents
			 * @param {string} hash - The hash of the torrent you want to get the contents of
			 * @return {Promise<Content[]>} Torrent contents
			 */
			files: async (hash) => {
				return await files(options, cookie, hash)
			},
			/**
			 * Get torrent pieces' states
			 * @param {string} hash - The hash of the torrent you want to get the pieces' states of
			 * @return {Promise<(0|1|2)[]>} States (integers) of all pieces (in order) of the torrent
			 */
			pieceStates: async (hash) => {
				return await pieceStates(options, cookie, hash)
			},
			/**
			 * Get torrent pieces' hashes
			 * @param {string} hash - The hash of the torrent you want to get the pieces' hashes of
			 * @return {Promise<string[]>} Hashes (strings) of all pieces (in order) of the torrent
			 */
			pieceHashes: async (hash) => {
				return await pieceHashes(options, cookie, hash)
			},
			/**
			 * Pause one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to pause. It can contain multiple hashes separated by |, to pause multiple torrents, or set to 'all', to pause all torrents
			 */
			pauseTorrents: async (hashes) => {
				return await pauseTorrents(options, cookie, hashes)
			},
			/**
			 * Resume one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to resume. It can contain multiple hashes separated by |, to resume multiple torrents, or set to 'all', to resume all torrents
			 */
			resumeTorrents: async (hashes) => {
				return await resumeTorrents(options, cookie, hashes)
			},
			/**
			 * Delete one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to delete. It can contain multiple hashes separated by |, to delete multiple torrents, or set to 'all', to delete all torrents
			 * @param {boolean} deleteFile - If set to `true`, the downloaded data will also be deleted, otherwise has no effect
			 */
			deleteTorrents: async (hashes, deleteFile) => {
				return await deleteTorrents(options, cookie, hashes, deleteFile)
			},
			/**
			 * Recheck one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to recheck. It can contain multiple hashes separated by |, to recheck multiple torrents, or set to 'all', to recheck all torrents
			 */
			recheckTorrents: async (hashes) => {
				return await recheckTorrents(options, cookie, hashes)
			},
			/**
			 * Reannounce one or several torrents
			 * @param {string} hashes - The hashes of the torrents you want to reannounce. It can contain multiple hashes separated by |, to reannounce multiple torrents, or set to 'all', to reannounce all torrents
			 */
			reannounceTorrents: async (hashes) => {
				return await reannounceTorrents(options, cookie, hashes)
			},
			/**
			 * Edit trackers
			 * @param {string} hash - The hash of the torrent
			 * @param {string} origUrl - The tracker URL you want to edit
			 * @param {string} newUrl - The new URL to replace the `origUrl`
			 */
			editTrackers: async (hash, origUrl, newUrl) => {
				return await editTrackers(options, cookie, hash, origUrl, newUrl)
			},
			/**
			 * Remove trackers
			 * @param {string} hash - The hash of the torrent
			 * @param {string} url - URLs to remove, separated by `|`
			 */
			removeTrackers: async (hash, urls) => {
				return await removeTrackers(options, cookie, hash, urls)
			},
			/**
			 * Add peers
			 * @param {string} hashes - The hash of the torrent, or multiple hashes separated by a pipe `|`
			 * @param {string} peers - The peer to add, or multiple peers separated by a pipe `|`. Each peer is a colon-separated `host:port`
			 */
			addPeers: async (hashes, peers) => {
				return await addPeers(options, cookie, hashes, peers)
			},
			/**
			 * Add torrent
			 * @param {string} urls - URLs of the trackers, separated by a newline `\n`
			 */
			addTorrent: async (urls) => {
				return await addTorrent(options, cookie, urls)
			},
			/**
			 * Add trackers to torrent
			 * @param {string} hash - The hash of the torrent
			 * @param {string} urls - URLs of the trackers, separated by a newline `\n`
			 */
			addTrackers: async (hash, urls) => {
				return await addTrackers(options, cookie, hash, urls)
			},
			/**
			 * Increase torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to increase the priority of. It can contain multiple hashes separated by `|`, to increase the priority of multiple torrents, or set to 'all', to increase the priority of all torrents
			 */
			increasePriority: async (hashes) => {
				return await increasePriority(options, cookie, hashes)
			},
			/**
			 * Decrease torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to decrease the priority of. It can contain multiple hashes separated by `|`, to decrease the priority of multiple torrents, or set to 'all', to decrease the priority of all torrents
			 */
			decreasePriority: async (hashes) => {
				return await decreasePriority(options, cookie, hashes)
			},
			/**
			 * Maximal torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to set to the maximum priority. It can contain multiple hashes separated by `|`, to set multiple torrents to the maximum priority, or set to 'all', to set all torrents to the maximum priority
			 */
			maxPriority: async (hashes) => {
				return await maxPriority(options, cookie, hashes)
			},
			/**
			 * Minimal torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to set to the minimum priority. It can contain multiple hashes separated by `|`, to set multiple torrents to the minimum priority, or set to 'all', to set all torrents to the minimum priority
			 */
			minPriority: async (hashes) => {
				return await minPriority(options, cookie, hashes)
			},
			/**
			 * Set file priority
			 * @param {string} hash - The hash of the torrent
			 * @param {string} id - File ids, separated by `|`
			 * @param {(0|1|6|7)} priority - File priority to set
			 */
			setFilePriority: async (hash, id, priority) => {
				return await setFilePriority(options, cookie, hash, id, priority)
			},
			/**
			 * Get torrent download limit
			 * @param {string} hashes - The hashes of the torrents. It can contain multiple hashes separated by `|` or set to 'all'
			 */
			downloadLimit: async (hashes) => {
				return await downloadLimit(options, cookie, hashes)
			},
			/**
			 * Set torrent download limit
			 * @param {string} hashes - The hashes of the torrents you want to set the download limit. It can contain multiple hashes separated by `|`, to set the download limit of multiple torrents, or set to 'all', to set all torrents the download limit
			 * @param {string} limit - Download speed limit in bytes per second you want to set
			 */
			setDownloadLimit: async (hashes, limit) => {
				return await setDownloadLimit(options, cookie, hashes, limit)
			},
			/**
			 * Set torrent share limit
			 * @param {string} hashes - The hashes of the torrents you want to set the share limit. It can contain multiple hashes separated by `|`, to set the share limit of multiple torrents, or set to 'all', to set all torrents the share limit
			 * @param {string} ratioLimit - Max ratio the torrent should be seeded until. `-2` means the global limit should be used, `-1` means no limit
			 * @param {string} seedingTimeLimit - Max amount of time the torrent should be seeded. `-2` means the global limit should be used, `-1` means no limit
			 */
			setShareLimit: async (hashes, ratioLimit, seedingTimeLimit) => {
				return await setShareLimit(options, cookie, ratioLimit, seedingTimeLimit)
			},
			/**
			 * Get torrent upload limit
			 * @param {string} hashes - The hashes of the torrents. It can contain multiple hashes separated by `|` or set to 'all'
			 */
			uploadLimit: async (hashes) => {
				return await uploadLimit(options, cookie, hashes)
			},
			/**
			 * Set torrent upload limit
			 * @param {string} hashes - The hashes of the torrents you want to set the upload limit. It can contain multiple hashes separated by `|`, to set the upload limit of multiple torrents, or set to 'all', to set all torrents the upload limit
			 * @param {string} limit - Upload speed limit in bytes per second you want to set
			 */
			setUploadLimit: async (hashes, limit) => {
				return await setUploadLimit(options, cookie, hashes, limit)
			},
			/**
			 * Set torrent location
			 * @param {string} hashes - The hashes of the torrents you want to set the location. It can contain multiple hashes separated by `|`, to set the location of multiple torrents, or set to 'all', to set all torrents the location
			 * @param {string} location - Location to download the torrent to. If the location doesn't exist, the torrent's location is unchanged
			 */
			setLocation: async (hashes, location) => {
				return await setLocation(options, cookie, hashes, location)
			},
			/**
			 * Set torrent name
			 * @param {string} hash - The hash of the torrent
			 * @param {string} name - New torrent name
			 */
			rename: async (hash, name) => {
				return await rename(hash, name)
			},
			/**
			 * Set torrent category
			 * @param {string} hashes - The hashes of the torrents you want to set the category. It can contain multiple hashes separated by `|`, to set the category of multiple torrents, or set to 'all', to set the category of all torrents
			 * @param {string} category - The torrent category you want to set
			 */
			setCategory: async (hashes, category) => {
				return await setCategory(options, cookie, hashes, category)
			},
			/**
			 * Get all categories
			 * @return {Promise<Categories>} Categories in JSON format
			 */
			categories: async () => {
				return await categories(options, cookie)
			},
			/**
			 * Add new category
			 * @param {string} category - The category you want to create
			 * @param {string} savePath - Save path of the category
			 */
			createCategory: async (category, savePath) => {
				return await createCategory(options, cookie, category, savePath)
			},
			/**
			 * Edit category
			 * @param {string} category - The category you want to edit
			 * @param {string} savePath - Save path of the category
			 */
			editCategory: async (category, savePath) => {
				return await editCategory(options, cookie, category, savePath)
			},
			/**
			 * Remove categories
			 * @param {string} categories - Category you want to remove. It can contain multiple cateogies separated by a newline `\n`
			 */
			removeCategories: async (categories) => {
				return await removeCategories(options, cookie, categories)
			},
			/**
			 * Add torrent tags
			 * @param {string} hashes - The hashes of the torrents you want to add tags to. It can contain multiple hashes separated by `|`, to add tags to multiple torrents, or set to 'all', to add the tags of all torrents
			 * @param {string} tags - The list of tags you want to add to passed torrents
			 */
			addTags: async (hashes, tags) => {
				return await addTags(options, cookie, hashes, tags)
			},
			/**
			 * Remove torrent tags
			 * @param {string} hashes - The hashes of the torrents you want to remove tags to. It can contain multiple hashes separated by `|`, to remove tags to multiple torrents, or set to 'all', to remove the tags of all torrents
			 * @param {string} tags - Category you want to remove. It can contain multiple cateogies separated by a newline `\n`
			 */
			removeTags: async (hashes, tags) => {
				return await removeTags(options, cookie, hashes, tags)
			},
			/**
			 * Get all tags
			 * @return {Promise<string[]>} Tags
			 */
			tags: async () => {
				return await tags(options, cookie)
			},
			/**
			 * Create tags
			 * @param {string} tags - List of tags you want to create. Can contain multiple tags separated by `,`
			 */
			createTags: async (tags) => {
				return await createTags(options, cookie, tags)
			},
			/**
			 * Delete tags
			 * @param {string} tags - List of tags you want to delete. Can contain multiple tags separated by `,`
			 */
			deleteTags: async (tags) => {
				return await deleteTags(options, cookie, tags)
			},
			/**
			 * Set automatic torrent management
			 * @param {string} hashes - The hashes of the torrents you want to set automatic torrent management. It can contain multiple hashes separated by `|`, to set automatic torrent management of multiple torrents, or set to 'all', to set automatic torrent management of all torrents
			 * @param {boolean} enable - Enable automatic torrent management or not for the torrents listed in `hashes`
			 */
			setAutoManagement: async (hashes, enable) => {
				return await setAutoManagement(options, cookie, hashes, enable)
			},
			/**
			 * Toggle sequential download
			 * @param {string} hashes - The hashes of the torrents you want to toggle sequential download for. It can contain multiple hashes separated by `|`, to toggle sequential download for multiple torrents, or set to 'all', to toggle sequential download for all torrents
			 */
			toggleSequentialDownload: async (hashes) => {
				return await toggleSequentialDownload(options, cookie, hashes)
			},
			/**
			 * Set first/last piece priority
			 * @param {string} hashes - The hashes of the torrents you want to toggle the first/last piece priority for. It can contain multiple hashes separated by `|`, to toggle the first/last piece priority for multiple torrents, or set to 'all', to toggle the first/last piece priority for all torrents
			 */
			toggleFirstLastPiecePrio: async (hashes) => {
				return await toggleFirstLastPiecePrio(options, cookie, hashes)
			},
			/**
			 * Set force start
			 * @param {string} hashes - The hashes of the torrents you want to set force start. It can contain multiple hashes separated by `|`, to set force start of multiple torrents, or set to 'all', to set force start of all torrents
			 * @param {boolean} value - Enable force start or not for the torrents listed in `hashes`
			 */
			setForceStart: async (hashes, value) => {
				return await setForceStart(options, cookie, hashes, value)
			},
			/**
			 * Set super seeding
			 * @param {string} hashes - The hashes of the torrents you want to set super seeding. It can contain multiple hashes separated by `|`, to set super seeding of multiple torrents, or set to 'all', to set super seeding of all torrents
			 * @param {boolean} value - Enable super seeding or not for the torrents listed in `hashes`
			 */
			setSuperSeeding: async (hashes, value) => {
				return await setSuperSeeding(options, cookie, hashes, value)
			},
			/**
			 * Rename file
			 * @param {string} hash - The hash of the torrent
			 * @param {number} id - The id of the file to rename
			 * @param {string} name - The new name to use for the file
			 */
			renameFile: async (hash, id, name) => {
				return await renameFile(options, cookie, hash, id, name)
			},
			/**
			 * @typedef {Object} SearchJob
			 * @property {number} id - ID of the search job
			 */
			/**
			 * Start search
			 * @param {string} pattern - Pattern to search for (e.g. "Ubuntu 18.04")
			 * @param {string} plugins - Plugins to use for searching (e.g. "legittorrents"). Supports multiple plugins separated by `|`. Also supports 'all' and 'enabled'
			 * @param {string} category - Categories to limit your search to (e.g. "legittorrents"). Available categories depend on the specified plugins. Also supports 'all'
			 * @return {Promise<SearchJob>} Search ID as JSON
			 */
			startSearch: async (pattern, plugins, category) => {
				return await startSearch(options, cookie, pattern, plugins, category)
			},
			/**
			 * Stop search
			 * @param {number} id - ID of the search job
			 */
			stopSearch: async (id) => {
				return await stopSearch(options, cookie, id)
			},
			/**
			 * @typedef {Object} SearchStatus
			 * @property {number} id - ID of the search job
			 * @property {string} status - Current status of the search job (either `Running` or `Stopped`)
			 * @property {number} total - Total number of results. If the status is `Running` this number may continue to increase
			 */
			/**
			 * Get search status
			 * @param {number} [id] - ID of the search job. If not specified, all search jobs are returned
			 * @return {Promise<SearchStatus[]>} Status of the search jobs
			 */
			searchStatus: async (id) => {
				return await searchStatus(options, cookie, id)
			},
			/**
			 * @typedef {Object} SearchResult
			 * @property {string} descrLink - URL of the torrent's description page
			 * @property {string} fileName - Name of the file
			 * @property {number} fileSize - Size of the file in Bytes
			 * @property {string} fileUrl - Torrent download link (usually either .torrent file or magnet link)
			 * @property {number} nbLeechers - Number of leechers
			 * @property {number} nbSeeders - Number of seeders
			 * @property {string} siteUrl - URL of the torrent site
			 */
			/**
			 * @typedef {Object} SearchResults
			 * @property {SearchResult[]} results - Array of result objects
			 * @property {string} status - Current status of the search job (either `Running` or `Stopped`)
			 * @property {number} total - Total number of results. If the status is `Running` this number may continue to increase
			 */
			/**
			 * Get search results
			 * @param {number} id - ID of the search job
			 * @param {number} [limit] - Max number of results to return. 0 or negative means no limit
			 * @param {number} [offset] - Result to start at. A negative number means count backwards (e.g. -2 returns the 2 most recent results)
			 * @return {Promise<SearchResults>} Search results
			 */
			searchResults: async (id, limit, offset) => {
				return await searchResults(options, cookie, id, limit, offset)
			},
			/**
			 * Delete search
			 * @param {number} id - ID of the search job
			 */
			deleteSearch: async (id) => {
				return await deleteSearch(options, cookie, id)
			},
			/**
			 * Get search categories
			 * @param {string} [pluginName] - Name of the plugin (e.g. "legittorrents"). Also supports 'all' and 'enabled'
			 * @return {Promise<string[]>} List of categories
			 */
			searchCategories: async (pluginName) => {
				return await searchCategories(options, cookie, pluginName)
			},
			/**
			 * @typedef {Object} SearchPlugin
			 * @property {boolean} enabled - Whether the plugin is enabled
			 * @property {string} fullName - Full name of the plugin
			 * @property {string} name - Short name of the plugin
			 * @property {string[]} supportedCategories - List of supported categories
			 * @property {string} url - URL of the torrent site
			 * @property {string} version - Installed version of the plugin
			 */
			/**
			 * Get search plugins
			 * @return {Promise<SearchPlugin[]>} List of plugins
			 */
			searchPlugins: async () => {
				return await searchPlugins(options, cookie)
			},
			/**
			 * Install search plugin
			 * @param {string} sources - Url or file path of the plugin to install. Supports multiple sources separated by `|`
			 */
			installPlugin: async (sources) => {
				return await installPlugin(options, cookie, sources)
			},
			/**
			 * Uninstall search plugin
			 * @param {string} names - Name of the plugin to uninstall (e.g. "legittorrents"). Supports multiple names separated by `|`
			 */
			uninstallPlugin: async (names) => {
				return await uninstallPlugin(options, cookie, names)
			},
			/**
			 * Enable search plugin
			 * @param {string} names - Name of the plugin to enable/disable (e.g. "legittorrents"). Supports multiple names separated by `|`
			 * @param {boolean} enable - Whether the plugins should be enabled
			 */
			enablePlugin: async (names, enable) => {
				return await enablePlugin(options, cookie, names, enable)
			},
			/**
			 * Update search plugins
			 */
			updatePlugins: async () => {
				return await updatePlugins(options, cookie)
			},
		}
	} catch (err) {
		console.error(err)
		throw new Error(`Login failed with username: ${username}`)
	}
}

// Application

async function appVersion(options, cookie) {
	const { res } = await performRequest(options, cookie, '/app/version', {})
	return res
}

async function apiVersion(options, cookie) {
	const { res } = await performRequest(options, cookie, '/app/webapiVersion', {})
	return res
}

async function buildInfo(options, cookie) {
	const { res } = await performRequest(options, cookie, '/app/buildInfo', {})
	return JSON.parse(res)
}

async function shutdown(options, cookie) {
	await performRequest(options, cookie, '/app/shutdown', {})
}

async function preferences(options, cookie) {
	const { res } = await performRequest(options, cookie, '/app/preferences', {})
	return JSON.parse(res)
}

// TODO: setPreferences()

async function defaultSavePath(options, cookie) {
	const { res } = await performRequest(options, cookie, '/app/defaultSavePath', {})
	return res
}

// Log

async function log(options, cookie, normal = true, info = true, warning = true, critical = true, lastKnownId = -1) {
	const { res } = await performRequest(options, cookie, '/log/main', { normal: normal, info: info, warning: warning, critical: critical, last_known_id: lastKnownId })
	return JSON.parse(res)
}

async function peerLog(options, cookie, lastKnownId) {
	const { res } = await performRequest(options, cookie, '/log/peers', { last_known_id: lastKnownId })
	return JSON.parse(res)
}

// Sync

async function syncMainData(options, cookie, rid) {
	const { res } = await performRequest(options, cookie, '/sync/maindata', { rid: rid })
	return JSON.parse(res)
}

async function syncPeersData(options, cookie, hash, rid) {
	const { res } = await performRequest(options, cookie, '/sync/torrentPeers', { hash: hash, rid: rid })
	return JSON.parse(res)
}

// Transfer info

async function transferInfo(options, cookie) {
	const { res } = await performRequest(options, cookie, '/transfer/info', {})
	return JSON.parse(res)
}

async function speedLimitsMode(options, cookie) {
	const { res } = await performRequest(options, cookie, '/transfer/speedLimitsMode', {})
	return res
}

async function toggleSpeedLimitsMode(options, cookie) {
	await performRequest(options, cookie, '/transfer/toggleSpeedLimitsMode', {})
	return
}

async function globalDownloadLimit(options, cookie) {
	const { res } = await performRequest(options, cookie, '/transfer/downloadLimit', {})
	return res
}

async function setGlobalDownloadLimit(options, cookie, limit) {
	await performRequest(options, cookie, '/transfer/setDownloadLimit', { limit: limit })
	return
}

async function globalUploadLimit(options, cookie) {
	const { res } = await performRequest(options, cookie, '/transfer/uploadLimit', {})
	return res
}

async function setGlobalUploadLimit(options, cookie, limit) {
	await performRequest(options, cookie, '/transfer/setUploadLimit', { limit: limit })
	return
}

async function banPeers(options, cookie, peers) {
	await performRequest(options, cookie, '/transfer/banPeers', { peers: peers })
	return
}

// Torrent management

async function torrents(options, cookie, filter, category, sort, reverse, limit, offset, hashes) {
	var parameters = {}
	if (filter) parameters.filter = filter
	if (category) parameters.category = category
	if (sort) parameters.sort = sort
	if (reverse) parameters.reverse = reverse
	if (limit) parameters.limit = limit
	if (offset) parameters.offset = offset
	if (hashes) parameters.hashes = hashes

	const { res } = await performRequest(options, cookie, '/torrents/info', parameters)
	return JSON.parse(res)
}

async function properties(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/properties', { hash: hash })
	return JSON.parse(res)
}

async function trackers(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/trackers', { hash: hash })
	return JSON.parse(res)
}

async function webseeds(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/webseeds', { hash: hash })
	return JSON.parse(res)
}

async function files(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/files', { hash: hash })
	return JSON.parse(res)
}

async function pieceStates(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/pieceStates', { hash: hash })
	return JSON.parse(res)
}

async function pieceHashes(options, cookie, hash) {
	const { res } = await performRequest(options, cookie, '/torrents/pieceHashes', { hash: hash })
	return JSON.parse(res)
}

async function pauseTorrents(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/pause', { hashes: hashes })
	return
}

async function resumeTorrents(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/resume', { hashes: hashes })
	return
}

async function deleteTorrents(options, cookie, hashes, deleteFile) {
	await performRequest(options, cookie, '/torrents/delete', { hashes: hashes, deleteFile: deleteFile })
	return
}

async function recheckTorrents(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/recheck', { hashes: hashes })
	return
}

async function reannounceTorrents(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/reannounce', { hashes: hashes })
	return
}

async function editTrackers(options, cookie, hash, origUrl, newUrl) {
	await performRequest(options, cookie, '/torrents/editTracker', { hash: hash, origUrl: origUrl, newUrl: newUrl })
	return
}

async function removeTrackers(options, cookie, hash, urls) {
	await performRequest(options, cookie, '/torrents/removeTrackers', { hash: hash, urls: urls })
	return
}

async function addPeers(options, cookie, hashes, peers) {
	await performRequest(options, cookie, '/torrents/addPeers', { hashes: hashes, peers: peers })
	return
}

async function addTorrent(options, cookie, urls) {
	await performRequest(options, cookie, '/torrents/add', { urls: encodeURI(urls) })
	return
}

async function addTrackers(options, cookie, hash, urls) {
	await performRequest(options, cookie, '/torrents/addTrackers', { hash: hash, urls: encodeURI(urls) })
	return
}

async function increasePriority(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/increasePrio', { hashes: hashes })
	return
}

async function decreasePriority(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/decreasePrio', { hashes: hashes })
	return
}

async function maxPriority(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/topPrio', { hashes: hashes })
	return
}

async function minPriority(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/bottomPrio', { hashes: hashes })
	return
}

async function setFilePriority(options, cookie, hash, id, priority) {
	await performRequest(options, cookie, '/torrents/filePrio', { hash: hash, id: id, priority: priority })
	return
}

async function downloadLimit(options, cookie, hashes) {
	const { res } = await performRequest(options, cookie, '/torrents/downloadLimit', { hashes: hashes })
	return JSON.parse(res)
}

async function setDownloadLimit(options, cookie, hashes, limit) {
	await performRequest(options, cookie, '/torrents/setDownloadLimit', { hashes: hashes, limit: limit })
	return
}

async function setShareLimit(options, cookie, hashes, ratioLimit, seedingTimeLimit) {
	await performRequest(options, cookie, '/torrents/setShareLimits', { hashes: hashes, ratioLimit: ratioLimit, seedingTimeLimit: seedingTimeLimit })
	return
}

async function uploadLimit(options, cookie, hashes) {
	const { res } = await performRequest(options, cookie, '/torrents/uploadLimit', { hashes: hashes })
	return JSON.parse(res)
}

async function setUploadLimit(options, cookie, hashes, limit) {
	await performRequest(options, cookie, '/torrents/setUploadLimit', { hashes: hashes, limit: limit })
	return
}

async function setLocation(options, cookie, hashes, location) {
	await performRequest(options, cookie, '/torrents/setLocation', { hashes: hashes, location: location })
	return
}

async function rename(options, cookie, hash, name) {
	await performRequest(options, cookie, '/torrents/rename', { hash: hash, name: encodeURI(name) })
	return
}

async function setCategory(options, cookie, hash, category) {
	await performRequest(options, cookie, '/torrents/setCategory', { hash: hash, category: encodeURI(category) })
	return
}

async function categories(options, cookie) {
	const { res } = await performRequest(options, cookie, '/torrents/categories', {})
	return JSON.parse(res)
}

async function createCategory(options, cookie, category, savePath) {
	await performRequest(options, cookie, '/torrents/createCategory', { category: encodeURI(category), savePath: savePath })
	return
}

async function editCategory(options, cookie, category, savePath) {
	await performRequest(options, cookie, '/torrents/editCategory', { category: encodeURI(category), savePath: savePath })
	return
}

async function removeCategories(options, cookie, categories) {
	await performRequest(options, cookie, '/torrents/removeCategories', { categories: encodeURI(categories) })
	return
}

async function addTags(options, cookie, hashes, tags) {
	await performRequest(options, cookie, '/torrents/addTags', { hashes: hashed, tags: encodeURI(tags) })
	return
}

async function removeTags(options, cookie, hashes, tags) {
	await performRequest(options, cookie, '/torrents/removeTags', { hashes: hashed, tags: encodeURI(tags) })
	return
}

async function tags(options, cookie) {
	const { res } = await performRequest(options, cookie, '/torrents/tags', {})
	return JSON.parse(res)
}

async function createTags(options, cookie, tags) {
	await performRequest(options, cookie, '/torrents/createTags', { tags: encodeURI(tags) })
	return
}

async function deleteTags(options, cookie, tags) {
	await performRequest(options, cookie, '/torrents/deleteTags', { tags: encodeURI(tags) })
	return
}

async function setAutoManagement(options, cookie, hashes, enable) {
	await performRequest(options, cookie, '/torrents/setAutoManagement', { hashes: hashes, enable: enable })
	return
}

async function toggleSequentialDownload(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/toggleSequentialDownload', { hashes: hashes })
	return
}

async function toggleFirstLastPiecePrio(options, cookie, hashes) {
	await performRequest(options, cookie, '/torrents/toggleFirstLastPiecePrio', { hashes: hashes })
	return
}

async function setForceStart(options, cookie, hashes, value) {
	await performRequest(options, cookie, '/torrents/setForceStart', { hashes: hashes, value: value })
	return
}

async function setSuperSeeding(options, cookie, hashes, value) {
	await performRequest(options, cookie, '/torrents/setSuperSeeding', { hashes: hashes, value: value })
	return
}

async function renameFile(options, cookie, hash, id, name) {
	await performRequest(options, cookie, '/torrents/renameFile', { hash: hash, id: id, name: encodeURI(name) })
	return
}

// Search

async function startSearch(options, cookie, pattern, plugins, category) {
	const { res } = await performRequest(options, cookie, '/search/start', { pattern: pattern, plugins: plugins, category: category })
	return JSON.parse(res)
}

async function stopSearch(options, cookie, id) {
	await performRequest(options, cookie, '/search/stop', { id: id })
	return
}

async function searchStatus(options, cookie, id) {
	var parameters = {}
	if (id) parameters.id = id

	const { res } = await performRequest(options, cookie, '/search/status', parameters)
	return JSON.parse(res)
}

async function searchResults(options, cookie, id, limit, offset) {
	var parameters = { id: id }
	if (limit) parameters.limit = limit
	if (offset) parameters.offset = offset

	const { res } = await performRequest(options, cookie, '/search/results', parameters)
	return JSON.parse(res)
}

async function deleteSearch(options, cookie, id) {
	await performRequest(options, cookie, '/search/delete', { id: id })
	return
}

async function searchCategories(options, cookie, pluginName) {
	var parameters = {}
	if (pluginName) parameters.pluginName = pluginName

	const { res } = await performRequest(options, cookie, '/search/categories', parameters)
	return JSON.parse(res)
}

async function searchPlugins(options, cookie) {
	const { res } = await performRequest(options, cookie, '/search/plugins', {})
	return JSON.parse(res)
}

async function installPlugin(options, cookie, sources) {
	await performRequest(options, cookie, '/search/installPlugin', { sources: sources })
	return
}

async function uninstallPlugin(options, cookie, names) {
	await performRequest(options, cookie, '/search/uninstallPlugin', { names: names })
	return
}

async function enablePlugin(options, cookie, names, enable) {
	await performRequest(options, cookie, '/search/enablePlugin', { names: names, enable: enable })
	return
}

async function updatePlugins(options, cookie) {
	await performRequest(options, cookie, '/search/updatePlugins', {})
	return
}

// Utils functions

function performRequest(opt, cookie, path, parameters) {
	const data = plainify(parameters)

	const options = {
		hostname: opt.hostname,
		protocol: opt.protocol,
		port: opt.port,
		path: ENDPOINT + path,
		method: 'POST',
		headers: {
			'Referer': opt.protocol + '//' + opt.hostname + ((opt.port != 80 || opt.port != 443) ? ':' + opt.port : ''),
			'Origin': opt.protocol + '//' + opt.hostname + ((opt.port != 80 || opt.port != 443) ? ':' + opt.port : ''),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length,
			'Cookie': cookie
		}
	}

	return new Promise((resolve, reject) => {
		const req = protocol[options.protocol].request(options, res => {
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
						reject(new Error(`HTTP request error: ${res.statusCode}`))
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
