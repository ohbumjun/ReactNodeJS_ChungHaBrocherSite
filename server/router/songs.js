const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../db/db.js');
const {Song} = require('../model/Songs')

// 메인 페이지 
router.post('/songs', (req,res) => {
    // 여기에 cache 기능 넣기 : cache object 따로 생성하기  
    let limit = req.body.limit ? parseInt(req.body.limit) : 100 ;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0 ;
    let term = req.body.searchTerm // 우리가 검색한 단어
    // filter를 거쳐서 들어올 때 그에 해당하는 db find하기
    let findArgs = {};
    for(let key in req.body.filters){
        // key는 check list 상에서 체크된 continents 혹은 price가 될 것이다
        if( req.body.filters[key].length  > 0){
            findArgs[key] = req.body.filters[key];
        }    
    }
    if(term){
        // 만약 검색 단어가 존재한다면 
        // frontend에서 term을 보내줬다면
        Song.find(findArgs)// findArgs에 맞는 정보만 db 에서 가져오기 >> findArgs가 적용되기 위해서는 당연히 product schema에 cotinents 정보가 있어야 한다
        .find({ $text : { $search : term}}) // 우리가 검색란에 입력한 단어로 한번 더 검색한다
        .skip(skip) // 처음 ~번째 부터 8개( limit의 수 만큼 ) 가져와
        .limit(limit) // mongodb에게 알려주는 것이다. 8개만 가져와
        .exec(( err , songInfos) => { // exec : query 돌리기
            // songInfos는 배열로서, 그 안에 한 상품은 한 객체 형태로 저장된다
            if(err){
                console.log("err",err)
                return res.status(400).json({ success : false, err})
            } 
            return res.status(200).json({ 
                success : true , 
                // songInfos : 받아온 모든 products
                songInfos,
                // postSize : 내가 가져온 정보들의 수 ( length )
                // postSize가 limit보다 크거나 같으면, 아직 여전히 가져올 데이터가 존재한다는 것 
                postSize : songInfos.length})
        })  

    }else{
        // 검색 단어가 없을 때
        // Product collection에 들어있는 모든 상품 정보 가져오기
        Song.find(findArgs)// findArgs에 맞는 정보만 db 에서 가져오기 >> findArgs가 적용되기 위해서는 당연히 product schema에 cotinents 정보가 있어야 한다
        .skip(skip) // 처음 ~번째 부터 8개( limit의 수 만큼 ) 가져와
        .limit(limit) // mongodb에게 알려주는 것이다. 8개만 가져와
        .exec(( err , songInfos) => {
            // songInfos는 배열로서, 그 안에 한 상품은 한 객체 형태로 저장된다
            if(err) return res.status(400).json({ success : false, err})
            return res.status(200).json({ 
                success : true , 
                songInfos,
                // postSize : 내가 가져온 정보들의 수 ( length )
                // postSize가 limit보다 크거나 같으면, 아직 여전히 가져올 데이터가 존재한다는 것 
                postSize : songInfos.length})
        })  
    }
})

module.exports = router;