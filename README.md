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
- [Transfer info](#transfer-info)
- [Torrent management](#torrent-management)
- [Search](#search)

## Authentication

`connect(host, user, password)`

This method returns a Promise resolving an object allowing to call the other methods of the API.

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

`log(normal, info, warning, critical, lastKnownId)`

### Get peer log

`peerLog(lastKnownId)`

## Sync

### Get main data

`syncMainData(rid)`

### Get torrent peers data

`syncPeersData(hash, rid)`

## Transfer info

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

`properties(hash)`

### Get torrent trackers

`trackers(hash)`

### Get torrent web seeds

`webseeds(hash)`

### Get torrent contents

`files(hash)`

### Get torrent pieces' states

`pieceStates(hash)`

### Get torrent pieces' hashes

`pieceHashes(hash)`

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

`editTrackers(hash, origUrl, newUrl)`

### Remove trackers

`removeTrackers(hash, urls)`

### Add peers

`addPeers(hashes, peers)`

### Add new torrent

**TODO**

### Add trackers to torrent

`addTrackers(hash, urls)`

### Increase torrent priority

`increasePriority(hashes)`

### Decrease torrent priority

`decreasePriority(hashes)`

### Maximal torrent priority

`maxPriority(hashes)`

### Minimal torrent priority

`minPriority(hashes)`

### Set file priority

`setFilePriority(hash, id, priority)`

### Get torrent download limit

`downloadLimit(hashes)`

### Set torrent download limit

`setDownloadLimit(hashes, limit)`

### Set torrent share limit

`setShareLimit(hashes, ratioLimit, seedingTimeLimit)`

### Get torrent upload limit

`uploadLimit(hashes)`

### Set torrent upload limit

`setUploadLimit(hashes, limit)`

### Set torrent location

`setLocation(hashes, location)`

### Set torrent name

`rename(hash, name)`

### Set torrent category

`setCategory(hash, category)`

### Get all categories

`categories()`

### Add new category

`createCategory(category, savePath)`

### Edit category

`editCategory(category, savePath)`

### Remove categories

`removeCategories(categories)`

### Add torrent tags

`addTags(hashes, tags)`

### Remove torrent tags

`removeTags(hashes, tags)`

### Get all tags

`tags()`

### Create tags

`createTags(tags)`

### Delete tags

`deleteTags(tags)`

### Set automatic torrent management

`setAutoManagement(hashes, enable)`

### Toggle sequential download

`toggleSequentialDownload(hashes)`

### Set first/last piece priority

`toggleFirstLastPiecePrio(hashes)`

### Set force start

`setForceStart(hashes, value)`

### Set super seeding

`setSuperSeeding(hashes, value)`

### Rename file

`renameFile(hash, id, name)`

## Search

### Start search

**TODO**

### Stop search

**TODO**

### Get search status

**TODO**

### Get search results

**TODO**

### Delete search

**TODO**

### Get search categories

**TODO**

### Get search plugins

**TODO**

### Install search plugin

**TODO**

### Uninstall search plugin

**TODO**

### Enable search plugin

**TODO**

### Update search plugins

**TODO**
