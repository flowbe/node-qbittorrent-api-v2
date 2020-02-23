# Description

Wrapper around [qBittorrent's Web API v2](https://github.com/qbittorrent/qBittorrent/wiki/Web-API-Documentation) to manage your torrents from Node. Documented and everything.

The Web API v2 applies for version 4.1+ of qBittorrent, for qBittorrent v3.2.0-v4.0.4 check the [qbittorrent-api](https://www.npmjs.com/package/qbittorrent-api) package.

# Installation

```bash
npm install qbittorrent-api-v2
```

# Example

```js
const api = require('qbittorrent-api-v2')

api.connect('localhost:8080', 'admin', 'your_password')
	.then(qbt => {
		qbt.torrents()
			.then(torrents => {
				console.log(torrents)
			})
			.catch(err => {
				console.error(err)
			})
	})
	.catch(err => {
		console.error(err)
	})
```

# Documentation

The module is fully self-documented so you will find all info in the code.

See [qBittorrent's API documentation](https://github.com/qbittorrent/qBittorrent/wiki/Web-API-Documentation) for more info.

## Overview

- [Authentication](#authentication)
- [Application](#application)
- [Log](#log)
- [Sync](#sync)
- [Torrent management](#torrent-management)

## Authentication

`connect(host, user, password)`

This method returns an object allowing to call the other methods of the API.

## Application

### Get application version

`appVersion()`

### Get API version

`apiVersion()`

### Get build info

`buildInfo()`

### Shutdown application

`shutdown()`

### Get application preferences

`preferences()`

### Set application preferences

**TODO**

### Get default save path

`defaultSavePath()`

## Log

### Get log

**TODO**

### Get peer log

**TODO**

## Sync

### Get main data

**TODO**

### Get torrent peers data

**TODO**

### Transfer info

**TODO**

### Get global transfer info

**TODO**

### Get alternative speed limits state

**TODO**

### Toggle alternative speed limits

**TODO**

### Get global download limit

**TODO**

### Set global download limit

**TODO**

### Get global upload limit

**TODO**

### Set global upload limit

**TODO**

### Ban peers

**TODO**

# Torrent management

### Get torrent list

`torrents([filter], [category], [sort], [reverse], [limit], [offset], [hashes])`

### Get torrent generic properties

**TODO**

### Get torrent trackers

**TODO**

### Get torrent web seeds

**TODO**

### Get torrent contents

**TODO**

### Get torrent pieces' states

**TODO**

### Get torrent pieces' hashes

**TODO**

### Pause torrents

`pauseTorrents(hashes)`

### Resume torrents

`resumeTorrents(hashes)`

### Delete torrents

`deleteTorrents(hashes)`

### Recheck torrents

`recheckTorrents(hashes)`

### Reannounce torrents

`reannounceTorrents(hashes)`

### Edit trackers

**TODO**

### Remove trackers

**TODO**

### Add peers

**TODO**

### Add new torrent

**TODO**

### Add trackers to torrent

**TODO**

### Increase torrent priority

**TODO**

### Decrease torrent priority

**TODO**

### Maximal torrent priority

**TODO**

### Minimal torrent priority

**TODO**

### Set file priority

**TODO**

### Get torrent download limit

**TODO**

### Set torrent download limit

**TODO**

### Set torrent share limit

**TODO**

### Get torrent upload limit

**TODO**

### Set torrent upload limit

**TODO**

### Set torrent location

**TODO**

### Set torrent name

**TODO**

### Set torrent category

**TODO**

### Get all categories

**TODO**

### Add new category

**TODO**

### Edit category

**TODO**

### Remove categories

**TODO**

### Add torrent tags

**TODO**

### Remove torrent tags

**TODO**

### Get all tags

**TODO**

### Create tags

**TODO**

### Delete tags

**TODO**

### Set automatic torrent management

**TODO**

### Toggle sequential download

**TODO**

### Set first/last piece priority

**TODO**

### Set force start

**TODO**

### Set super seeding

**TODO**

### Rename file

**TODO**
