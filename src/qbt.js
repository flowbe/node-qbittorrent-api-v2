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
		const { cookie } = await performRequest(host, null, '/auth/login', { username: username, password: password })
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
			 * @return {Promise<Torrent[]>} Torrents
			 */
			torrents: async (filter, category, sort, reverse, limit, offset, hashes) => {
				return await torrents(host, cookie, filter, category, sort, reverse, limit, offset, hashes)
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
				return await properties(host, cookie, hash)
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
				return await trackers(host, cookie, hash)
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
				return await webseeds(host, cookie, hash)
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
				return await files(host, cookie, hash)
			},
			/**
			 * Get torrent pieces' states
			 * @param {string} hash - The hash of the torrent you want to get the pieces' states of
			 * @return {Promise<(0|1|2)[]>} States (integers) of all pieces (in order) of the torrent
			 */
			pieceStates: async (hash) => {
				return await pieceStates(host, cookie, hash)
			},
			/**
			 * Get torrent pieces' hashes
			 * @param {string} hash - The hash of the torrent you want to get the pieces' hashes of
			 * @return {Promise<string[]>} Hashes (strings) of all pieces (in order) of the torrent
			 */
			pieceHashes: async (hash) => {
				return await pieceHashes(host, cookie, hash)
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
			},
			/**
			 * Edit trackers
			 * @param {string} hash - The hash of the torrent
			 * @param {string} origUrl - The tracker URL you want to edit
			 * @param {string} newUrl - The new URL to replace the `origUrl`
			 */
			editTrackers: async (hash, origUrl, newUrl) => {
				return await editTrackers(host, cookie, hash, origUrl, newUrl)
			},
			/**
			 * Remove trackers
			 * @param {string} hash - The hash of the torrent
			 * @param {string} url - URLs to remove, separated by `|`
			 */
			removeTrackers: async (hash, urls) => {
				return await removeTrackers(host, cookie, hash, urls)
			},
			/**
			 * Add peers
			 * @param {string} hashes - The hash of the torrent, or multiple hashes separated by a pipe `|`
			 * @param {string} peers - The peer to add, or multiple peers separated by a pipe `|`. Each peer is a colon-separated `host:port`
			 */
			addPeers: async (hashes, peers) => {
				return await addPeers(host, cookie, hashes, peers)
			},
			/**
			 * Add trackers to torrent
			 * @param {string} hash - The hash of the torrent
			 * @param {string} urls - URLs of the trackers, separated by a newline `\n`
			 */
			addTrackers: async (hash, urls) => {
				return await addTrackers(host, cookie, hash, urls)
			},
			/**
			 * Increase torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to increase the priority of. It can contain multiple hashes separated by `|`, to increase the priority of multiple torrents, or set to 'all', to increase the priority of all torrents
			 */
			increasePriority: async (hashes) => {
				return await increasePriority(host, cookie, hashes)
			},
			/**
			 * Decrease torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to decrease the priority of. It can contain multiple hashes separated by `|`, to decrease the priority of multiple torrents, or set to 'all', to decrease the priority of all torrents
			 */
			decreasePriority: async (hashes) => {
				return await decreasePriority(host, cookie, hashes)
			},
			/**
			 * Maximal torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to set to the maximum priority. It can contain multiple hashes separated by `|`, to set multiple torrents to the maximum priority, or set to 'all', to set all torrents to the maximum priority
			 */
			maxPriority: async (hashes) => {
				return await maxPriority(host, cookie, hashes)
			},
			/**
			 * Minimal torrent priority
			 * @param {string} hashes - The hashes of the torrents you want to set to the minimum priority. It can contain multiple hashes separated by `|`, to set multiple torrents to the minimum priority, or set to 'all', to set all torrents to the minimum priority
			 */
			minPriority: async (hashes) => {
				return await minPriority(host, cookie, hashes)
			},
			/**
			 * Set file priority
			 * @param {string} hash - The hash of the torrent
			 * @param {string} id - File ids, separated by `|`
			 * @param {(0|1|6|7)} priority - File priority to set
			 */
			setFilePriority: async (hash, id, priority) => {
				return await setFilePriority(host, cookie, hash, id, priority)
			},
			/**
			 * Get torrent download limit
			 * @param {string} hashes - The hashes of the torrents. It can contain multiple hashes separated by `|` or set to 'all'
			 */
			downloadLimit: async (hashes) => {
				return await downloadLimit(host, cookie, hashes)
			},
			/**
			 * Set torrent download limit
			 * @param {string} hashes - The hashes of the torrents you want to set the download limit. It can contain multiple hashes separated by `|`, to set the download limit of multiple torrents, or set to 'all', to set all torrents the download limit
			 * @param {string} limit - Download speed limit in bytes per second you want to set
			 */
			setDownloadLimit: async (hashes, limit) => {
				return await setDownloadLimit(host, cookie, hashes, limit)
			},
			/**
			 * Set torrent share limit
			 * @param {string} hashes - The hashes of the torrents you want to set the share limit. It can contain multiple hashes separated by `|`, to set the share limit of multiple torrents, or set to 'all', to set all torrents the share limit
			 * @param {string} ratioLimit - Max ratio the torrent should be seeded until. `-2` means the global limit should be used, `-1` means no limit
			 * @param {string} seedingTimeLimit - Max amount of time the torrent should be seeded. `-2` means the global limit should be used, `-1` means no limit
			 */
			setShareLimit: async (hashes, ratioLimit, seedingTimeLimit) => {
				return await setShareLimit(host, cookie, ratioLimit, seedingTimeLimit)
			},
			/**
			 * Get torrent upload limit
			 * @param {string} hashes - The hashes of the torrents. It can contain multiple hashes separated by `|` or set to 'all'
			 */
			uploadLimit: async (hashes) => {
				return await uploadLimit(host, cookie, hashes)
			},
			/**
			 * Set torrent upload limit
			 * @param {string} hashes - The hashes of the torrents you want to set the upload limit. It can contain multiple hashes separated by `|`, to set the upload limit of multiple torrents, or set to 'all', to set all torrents the upload limit
			 * @param {string} limit - Upload speed limit in bytes per second you want to set
			 */
			setUploadLimit: async (hashes, limit) => {
				return await setUploadLimit(host, cookie, hashes, limit)
			},
			/**
			 * Set torrent location
			 * @param {string} hashes - The hashes of the torrents you want to set the location. It can contain multiple hashes separated by `|`, to set the location of multiple torrents, or set to 'all', to set all torrents the location
			 * @param {string} location - Location to download the torrent to. If the location doesn't exist, the torrent's location is unchanged
			 */
			setLocation: async (hashes, location) => {
				return await setLocation(host, cookie, hashes, location)
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
				return await setCategory(host, cookie, hashes, category)
			},
			/**
			 * Get all categories
			 * @return {Promise<Categories>} Categories in JSON format
			 */
			categories: async () => {
				return await categories(host, cookie)
			},
			/**
			 * Add new category
			 * @param {string} category - The category you want to create
			 * @param {string} savePath - Save path of the category
			 */
			createCategory: async (category, savePath) => {
				return await createCategory(host, cookie, category, savePath)
			},
			/**
			 * Edit category
			 * @param {string} category - The category you want to edit
			 * @param {string} savePath - Save path of the category
			 */
			editCategory: async (category, savePath) => {
				return await editCategory(host, cookie, category, savePath)
			},
			/**
			 * Remove categories
			 * @param {string} categories - Category you want to remove. It can contain multiple cateogies separated by a newline `\n`
			 */
			removeCategories: async (categories) => {
				return await removeCategories(host, cookie, categories)
			},
			/**
			 * Add torrent tags
			 * @param {string} hashes - The hashes of the torrents you want to add tags to. It can contain multiple hashes separated by `|`, to add tags to multiple torrents, or set to 'all', to add the tags of all torrents
			 * @param {string} tags - The list of tags you want to add to passed torrents
			 */
			addTags: async (hashes, tags) => {
				return await addTags(host, cookie, hashes, tags)
			},
			/**
			 * Remove torrent tags
			 * @param {string} hashes - The hashes of the torrents you want to remove tags to. It can contain multiple hashes separated by `|`, to remove tags to multiple torrents, or set to 'all', to remove the tags of all torrents
			 * @param {string} tags - Category you want to remove. It can contain multiple cateogies separated by a newline `\n`
			 */
			removeTags: async (hashes, tags) => {
				return await removeTags(host, cookie, hashes, tags)
			},
			/**
			 * Get all tags
			 * @return {Promise<string[]>} Tags
			 */
			tags: async () => {
				return await tags(host, cookie)
			},
			/**
			 * Create tags
			 * @param {string} tags - List of tags you want to create. Can contain multiple tags separated by `,`
			 */
			createTags: async (tags) => {
				return await createTags(host, cookie, tags)
			},
			/**
			 * Delete tags
			 * @param {string} tags - List of tags you want to delete. Can contain multiple tags separated by `,`
			 */
			deleteTags: async (tags) => {
				return await deleteTags(host, cookie, tags)
			},
			/**
			 * Set automatic torrent management
			 * @param {string} hashes - The hashes of the torrents you want to set automatic torrent management. It can contain multiple hashes separated by `|`, to set automatic torrent management of multiple torrents, or set to 'all', to set automatic torrent management of all torrents
			 * @param {boolean} enable - Enable automatic torrent management or not for the torrents listed in `hashes`
			 */
			setAutoManagement: async (hashes, enable) => {
				return await setAutoManagement(host, cookie, hashes, enable)
			},
			/**
			 * Toggle sequential download
			 * @param {string} hashes - The hashes of the torrents you want to toggle sequential download for. It can contain multiple hashes separated by `|`, to toggle sequential download for multiple torrents, or set to 'all', to toggle sequential download for all torrents
			 */
			toggleSequentialDownload: async (hashes) => {
				return await toggleSequentialDownload(host, cookie, hashes)
			},
			/**
			 * Set first/last piece priority
			 * @param {string} hashes - The hashes of the torrents you want to toggle the first/last piece priority for. It can contain multiple hashes separated by `|`, to toggle the first/last piece priority for multiple torrents, or set to 'all', to toggle the first/last piece priority for all torrents
			 */
			toggleFirstLastPiecePrio: async (hashes) => {
				return await toggleFirstLastPiecePrio(host, cookie, hashes)
			},
			/**
			 * Set force start
			 * @param {string} hashes - The hashes of the torrents you want to set force start. It can contain multiple hashes separated by `|`, to set force start of multiple torrents, or set to 'all', to set force start of all torrents
			 * @param {boolean} value - Enable force start or not for the torrents listed in `hashes`
			 */
			setForceStart: async (hashes, value) => {
				return await setForceStart(host, cookie, hashes, value)
			},
			/**
			 * Set super seeding
			 * @param {string} hashes - The hashes of the torrents you want to set super seeding. It can contain multiple hashes separated by `|`, to set super seeding of multiple torrents, or set to 'all', to set super seeding of all torrents
			 * @param {boolean} value - Enable super seeding or not for the torrents listed in `hashes`
			 */
			setSuperSeeding: async (hashes, value) => {
				return await setSuperSeeding(host, cookie, hashes, value)
			},
			/**
			 * Rename file
			 * @param {string} hash - The hash of the torrent
			 * @param {number} id - The id of the file to rename
			 * @param {string} name - The new name to use for the file
			 */
			renameFile: async (hash, id, name) => {
				return await renameFile(host, cookie, hash, id, name)
			}
		}
	} catch (err) {
		console.error(err)
		throw new Error(`Login failed with username: ${username}`)
	}
}

// Application

async function appVersion(host, cookie) {
	const { res } = await performRequest(host, cookie, '/app/version', {})
	return res
}

async function apiVersion(host, cookie) {
	const { res } = await performRequest(host, cookie, '/app/webapiVersion', {})
	return res
}

async function buildInfo(host, cookie) {
	const { res } = await performRequest(host, cookie, '/app/buildInfo', {})
	return JSON.parse(res)
}

async function shutdown(host, cookie) {
	await performRequest(host, cookie, '/app/shutdown', {})
}

async function preferences(host, cookie) {
	const { res } = await performRequest(host, cookie, '/app/preferences', {})
	return JSON.parse(res)
}

async function defaultSavePath(host, cookie) {
	const { res } = await performRequest(host, cookie, '/app/defaultSavePath', {})
	return res
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

	const { res } = await performRequest(host, cookie, '/torrents/info', parameters)
	return JSON.parse(res)
}

async function properties(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/properties', { hash: hash })
	return JSON.parse(res)
}

async function trackers(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/trackers', { hash: hash })
	return JSON.parse(res)
}

async function webseeds(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/webseeds', { hash: hash })
	return JSON.parse(res)
}

async function files(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/files', { hash: hash })
	return JSON.parse(res)
}

async function pieceStates(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/pieceStates', { hash: hash })
	return JSON.parse(res)
}

async function pieceHashes(host, cookie, hash) {
	const { res } = await performRequest(host, cookie, '/torrents/pieceHashes', { hash: hash })
	return JSON.parse(res)
}

async function pauseTorrents(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/pause', { hashes: hashes })
	return
}

async function resumeTorrents(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/resume', { hashes: hashes })
	return
}

async function deleteTorrents(host, cookie, hashes, deleteFile) {
	await performRequest(host, cookie, '/torrents/delete', { hashes: hashes, deleteFile: deleteFile })
	return
}

async function recheckTorrents(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/recheck', { hashes: hashes })
	return
}

async function reannounceTorrents(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/reannounce', { hashes: hashes })
	return
}

async function editTrackers(host, cookie, hash, origUrl, newUrl) {
	await performRequest(host, cookie, '/torrents/editTracker', { hash: hash, origUrl: origUrl, newUrl: newUrl })
	return
}

async function removeTrackers(host, cookie, hash, urls) {
	await performRequest(host, cookie, '/torrents/removeTrackers', { hash: hash, urls: urls })
	return
}

async function addPeers(host, cookie, hashes, peers) {
	await performRequest(host, cookie, '/torrents/addPeers', { hashes: hashes, peers: peers })
	return
}

async function addTrackers(host, cookie, hash, urls) {
	await performRequest(host, cookie, '/torrents/addTrackers', { hash: hash, urls: encodeURI(urls) })
	return
}

async function increasePriority(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/increasePrio', { hashes: hashes })
	return
}

async function decreasePriority(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/decreasePrio', { hashes: hashes })
	return
}

async function maxPriority(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/topPrio', { hashes: hashes })
	return
}

async function minPriority(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/bottomPrio', { hashes: hashes })
	return
}

async function setFilePriority(host, cookie, hash, id, priority) {
	await performRequest(host, cookie, '/torrents/filePrio', { hash: hash, id: id, priority: priority })
	return
}

async function downloadLimit(host, cookie, hashes) {
	const { res } = await performRequest(host, cookie, '/torrents/downloadLimit', { hashes: hashes })
	return JSON.parse(res)
}

async function setDownloadLimit(host, cookie, hashes, limit) {
	await performRequest(host, cookie, '/torrents/setDownloadLimit', { hashes: hashes, limit: limit })
	return
}

async function setShareLimit(host, cookie, hashes, ratioLimit, seedingTimeLimit) {
	await performRequest(host, cookie, '/torrents/setShareLimits', { hashes: hashes, ratioLimit: ratioLimit, seedingTimeLimit: seedingTimeLimit })
	return
}

async function uploadLimit(host, cookie, hashes) {
	const { res } = await performRequest(host, cookie, '/torrents/uploadLimit', { hashes: hashes })
	return JSON.parse(res)
}

async function setUploadLimit(host, cookie, hashes, limit) {
	await performRequest(host, cookie, '/torrents/setUploadLimit', { hashes: hashes, limit: limit })
	return
}

async function setLocation(host, cookie, hashes, location) {
	await performRequest(host, cookie, '/torrents/setLocation', { hashes: hashes, location: location })
	return
}

async function rename(host, cookie, hash, name) {
	await performRequest(host, cookie, '/torrents/rename', { hash: hash, name: encodeURI(name) })
	return
}

async function setCategory(host, cookie, hash, category) {
	await performRequest(host, cookie, '/torrents/setCategory', { hash: hash, category: encodeURI(category) })
	return
}

async function categories(host, cookie) {
	const { res } = await performRequest(host, cookie, '/torrents/categories', {})
	return JSON.parse(res)
}

async function createCategory(host, cookie, category, savePath) {
	await performRequest(host, cookie, '/torrents/createCategory', { category: encodeURI(category), savePath: savePath })
	return
}

async function editCategory(host, cookie, category, savePath) {
	await performRequest(host, cookie, '/torrents/editCategory', { category: encodeURI(category), savePath: savePath })
	return
}

async function removeCategories(host, cookie, categories) {
	await performRequest(host, cookie, '/torrents/removeCategories', { categories: encodeURI(categories) })
	return
}

async function addTags(host, cookie, hashes, tags) {
	await performRequest(host, cookie, '/torrents/addTags', { hashes: hashed, tags: encodeURI(tags) })
	return
}

async function removeTags(host, cookie, hashes, tags) {
	await performRequest(host, cookie, '/torrents/removeTags', { hashes: hashed, tags: encodeURI(tags) })
	return
}

async function tags(host, cookie) {
	const { res } = await performRequest(host, cookie, '/torrents/tags', {})
	return JSON.parse(res)
}

async function createTags(host, cookie, tags) {
	await performRequest(host, cookie, '/torrents/createTags', { tags: encodeURI(tags) })
	return
}

async function deleteTags(host, cookie, tags) {
	await performRequest(host, cookie, '/torrents/deleteTags', { tags: encodeURI(tags) })
	return
}

async function setAutoManagement(host, cookie, hashes, enable) {
	await performRequest(host, cookie, '/torrents/setAutoManagement', { hashes: hashes, enable: enable })
	return
}

async function toggleSequentialDownload(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/toggleSequentialDownload', { hashes: hashes })
	return
}

async function toggleFirstLastPiecePrio(host, cookie, hashes) {
	await performRequest(host, cookie, '/torrents/toggleFirstLastPiecePrio', { hashes: hashes })
	return
}

async function setForceStart(host, cookie, hashes, value) {
	await performRequest(host, cookie, '/torrents/setForceStart', { hashes: hashes, value: value })
	return
}

async function setSuperSeeding(host, cookie, hashes, value) {
	await performRequest(host, cookie, '/torrents/setSuperSeeding', { hashes: hashes, value: value })
	return
}

async function renameFile(host, cookie, hash, id, name) {
	await performRequest(host, cookie, '/torrents/renameFile', { hash: hash, id: id, name: encodeURI(name) })
	return
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