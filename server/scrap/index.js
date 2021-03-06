const request    = require('request-promise')
const mongoose   = require('mongoose')
const cherrio    = require('cheerio')
const {Album} = require('../model/Albums')
const {Song}  = require('../model/Songs')
const path       = require('path')
const dotenv     = require('dotenv')
// 크롤링 결과를 csv로 
dotenv.config({path:path.join(__dirname,'../../.env')})
 

async function sleep(miliseconds){
    return new Promise(resolve=>setTimeout(resolve,miliseconds))
}

async function connectToMongoDb(){
    await mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true })
    console.log("connected to mongodb")
}

async function scrapeAlbumDescription(pgIdx){
    try {
        const scrapResults = []
        const htmlRequest = await request.get(`https://www.melon.com/artist/album.htm?artistId=968265#params%5BlistType%5D=0&params%5BorderBy%5D=ISSUE_DATE&params%5BartistId%5D=968265&po=pageObj&startIndex=${pgIdx}`)
        const $ = await cherrio.load(htmlRequest)
        // 아티스트 명 
        $('.title_atist > .none').remove()
        const artistNm = $('.title_atist').text()
        $(".album11_ul > li").each((idx,elem)=>{
            const albumImg        = $(elem).find('img').attr('src')
            // console.log("albumImg",albumImdg)    
            const albumId         = $(elem).find('.wrap_album04 > a.thumb').attr('href').match(/\d+/g)[0]
            // console.log("albumId",albumId)
            const albumUrl        = `https://www.melon.com/album/detail.htm?albumId=${albumId}`
            // console.log("albumUrl",albumUrl)
            const albumType       = $(elem).find('.vdo_name').text()
            // console.log("albumType",albumType)
            const albumName       = $(elem).find('dt > .ellipsis').text().trim().replace(/\s/g,'')
            // console.log("albumName",albumName)
            const albumArtistName      = $(elem).find('.checkEllipsis > .play_artist').text().trim() 
            // console.log("artistName",artistName)
            const albumOpenDate   = $(elem).find('.wrap_btn > .cnt_view').text() 
            // console.log("albumOpDate",albumOpenDate)
            const albumYear   = albumOpenDate.split('.')[0]
            // console.log("albumYear",albumYear)
            const titleSong       = $(elem).find('.btn_play_song > .songname12').text() 
            // console.log("titleSong",titleSong)
            const songNums        = $(elem).find('.wrap_btn > .tot_song').text().slice(0,-1) 
            // console.log("songNums",songNums)
            const scrapResult = {
                artistNm,albumImg,albumId,albumUrl,albumYear
                albumType,albumName,albumArtistName,
                titleSong,albumOpenDate,songNums,songs:[]
            }
            scrapResults.push(scrapResult)
        })
        return [scrapResults,artistNm]
    } catch (error) {
        console.error(error)
    }
}

const scrapSongDesicription = async (albumResults,artistNm) => {
    return await Promise.all(
        albumResults.map(async album =>{
            const htmlResult = await request.get(album.albumUrl)
            const $ = await cherrio.load(htmlResult)
            
            const songLists = []
            $('tr').each((idx,elem)=>{
                if(idx > 0){
                    // 해당 아티스트가 부른 ost 곡만 넣기
                    const songArtist = $(elem).find('.checkEllipsis').text()
                    if(!songArtist.includes(artistNm)) return 
                    const songTitle  = $(elem).find('.ellipsis:nth-child(1) > span > a').text()
                    const songId     = album.albumName + '_' + songTitle
                    const songLikes  = $(elem).find('td:nth-child(5) > div > button > span.cnt').text().trim().match(/\d+/g)[0]
                    $('.button_etc.like > span.cnt > span').remove()
                    const song = {songId,songTitle, songArtist,songLikes,album:album.albumName}
                    songLists.push(song)
                }
            })
            album.songs = songLists
            return album
        })
    )
}

const insertSongInMongoDB = async (songArray) => {
    const songs = songArray.map(async song => {
        const songFromDb = await Song.findOne({songId:song.songId})
        if(!songFromDb){
            const newSong = new Song(song)
            return newSong.save()
        }
    })
    await Promise.all(songs)
}

const insertAlbumInMongoDB = async (albumArray) => {
    const albums = albumArray.map(async album => {
        const albumFromDb = await Album.findOne({albumId:album.albumId})
        console.log("album save ongoing")
        if(!albumFromDb){
            const newAlbum = new Album(album)
            await insertSongInMongoDB(album.songs)
            return newAlbum.save()
        }
    })
    await Promise.all(albums)
}

const scrapeAlbumLists = async () => {
    let url = '';
    await connectToMongoDb()
    for(let pgIdx = 1 ; pgIdx < 47; pgIdx = pgIdx + 15){
        const [albumResults,artistNm] = await scrapeAlbumDescription(pgIdx);
        const albumsFullData    = await scrapSongDesicription(albumResults,artistNm)
        // console.log("albumsFullData",albumsFullData)
        await createCsvFile(albumsFullData)
        // console.log("pgIdx",pgIdx)
        // await insertAlbumInMongoDB(albumsFullData)
        // await sleep(1000)
    }
    mongoose.disconnect();
    console.log("album save complete !!")
    
}

scrapeAlbumLists()