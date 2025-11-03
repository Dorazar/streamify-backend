async function makeSpotifyRequest(endpoint) {
  const token = await getAccessToken()
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Spotify API request failed: ${response.status}`)
  }
  return response.json()
}

async function getNewAlbumsReleases(limit = 21, offset = 0) {
  try {
    const endpoint = `/browse/new-releases?limit=${limit}&offset=${offset}&country=US`
    const response = await makeSpotifyRequest(endpoint)
    // Map albums to clean object format

    const albums = await Promise.all(response.albums.items.map(async (album) => await _organizeAlbumData(album)))
    return albums
  } catch (error) {
    throw error
  }
}

async function _organizeAlbumData(album) {
  const albumToShow = {
    id: album.id,
    name: album.name,
    artists: album.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    images: album.images.map((img) => ({
      url: img.url,
      height: img.height,
      width: img.width,
    })),
    externalUrls: album.external_urls,
    uri: album.uri,
    albumType: album.album_type,
  }
  return albumToShow
}
