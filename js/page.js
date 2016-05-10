'use strict'

import co from 'co'
import m3u8 from 'm3u8-stream-list'
import UrlPattern from 'url-pattern'

const url_stream_pattern = new UrlPattern('https\\://www.twitch.tv/(:username)')
const url_vod_pattern = new UrlPattern('https\\://www.twitch.tv/(:username)/v/(:video)')

function playlist_url_stream(channel, token, sig) {
  return `http://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?token=${token}&sig=${sig}&allow_source=true&allow_spectre=true`
}

function playlist_url_vod(video, token, sig) {
  return `http://usher.ttvnw.net/vod/${video}.m3u8?nauth=${token}&nauthsig=${sig}&allow_source=true&allow_spectre=true`
}

function json(url, opts) {
  return fetch(url, opts).then(c => c.json())
}

function token_api(opts) {
  return json('https://api.twitch.tv/api/viewer/token.json', opts).then(c => c.token)
}

function oauth_channel_token_api(channel, token, opts) {
  return json(`https://api.twitch.tv/api/channels/${channel}/access_token?oauth_token=${token}`, opts)
}

function oauth_vod_token_api(video, token, opts) {
  return json(`https://api.twitch.tv/api/vods/${video}/access_token?oauth_token=${token}`, opts)
}

function ext_fetch(url) {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage(url, function responseCallback(response) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
  
      resolve(response)
    })
  })
}

function stream_max_quality(streams) {
  const quality = [
    "chunked",
    "high",
    "medium",
    "low",
    "mobile"
  ]
  
  if (!streams.length) { return null }

  if (streams.length == 1) {
    return streams[0]
  }

  streams.sort(function (left, right) {
    return quality.indexOf( left.VIDEO ) > quality.indexOf( right.VIDEO )
  })
  
  return streams[0]
}

/*
function* channel_main(channel) {
  const requrest_opts = { credentials: 'include' }
  
  const token = yield token_api(requrest_opts)
  const auth = yield oauth_channel_token_api(channel, token, requrest_opts)
  const m3u8data = yield ext_fetch(playlist_url_stream(channel, auth.token, auth.sig))
  
  const streams = m3u8(m3u8data)
  const playlist = stream_max_quality(streams)

  if (!playlist) { return }
  
  console.log(playlist.VIDEO, playlist.url)

  injectButton(playlist.url)
}
*/

function* vod_main(vod) {
  const requrest_opts = { credentials: 'include' }

  const token = yield token_api(requrest_opts)
  const auth = yield oauth_vod_token_api(vod, token, requrest_opts)
  const m3u8data = yield ext_fetch(playlist_url_vod(vod, encodeURIComponent(auth.token), auth.sig))
  const streams = m3u8(m3u8data)
  
  const playlist = stream_max_quality(streams)

  if (!playlist) { console.error('playlist not found'); return }

  console.log(playlist.VIDEO, playlist.url)
  injectButton(playlist.url)
}

chrome.runtime.onMessage.addListener(function(request) {
  const channel = url_stream_pattern.match(request.data.url)
  const vod = url_vod_pattern.match(request.data.url)

  // if (channel && ['jobs', 'directory'].indexOf(channel.username) == -1) {
  //   co(channel_main, channel.username).catch(e => console.error(e))
  // }

  if (vod) {
    co(vod_main, vod.video).catch(e => console.error(e))
  }
})

function injectButton(url) {
  const wrapper = document.createElement('span')

  const link = document.createElement('a')
  link.className = 'action button primary subscribe-button'
  link.href = "#"

  const text = document.createElement('span')
  // span.style = 'padding-right: 10px'
  text.textContent = 'Copy stream'
  text.className = 'subscribe-text'

  const price = document.createElement('span')
  price.className = 'subscribe-price'
  price.textContent = '.m3u8'

  link.appendChild(text)
  link.appendChild(price)

  wrapper.addEventListener('click', () => prompt('Insert this link into your loved player', url))
  wrapper.appendChild(link)

  console.log(document.querySelector('.channel-actions').appendChild(wrapper))
}
