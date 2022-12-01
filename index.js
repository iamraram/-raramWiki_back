const express = require('express')
const res = require('express/lib/response')
const { contentDisposition } = require('express/lib/utils')
const MongoClient = require('mongodb').MongoClient

const app = express()
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('hello node')
})

MongoClient.connect(process.env.admin_code, function(err, client) {

  if (err) {
    return console.log(err)
  }

  db = client.db('raramWiki')

  app.listen(4000, () =>
    console.log('connected')
  )

})

app.get('/value', (req, res) => {
    db.collection('Documents').find({}).toArray((err, result) => {
        res.json(result.length)
    })
})

app.get('/file', (req, res) => {
    console.log(req.query.title)
    db.collection('Documents').findOne({
        title: req.query.title
    }), (err, result) => {
        res.json({
            title: result.title,
            desc: result.desc
        })
    }

    // 여기가 안됨
})

app.get('/search', (req, res) => {
    try {
        db.collection('Documents').aggregate([
            {
              $search: {
                index: 'default2',
                text: {
                  query: req.query.title,
                  path: {
                    'wildcard': '*'
                  }
                }
              }
            }
          ]).toArray((err, result) => {
            res.send(result)
        })
    }
    catch(err) {
        console.log(err)
    }
})

app.post('/new', (req, res) => {
    console.log(req.query)
    if (req.query.title.length >= 2 && req.query.desc.length >= 10) {
        db.collection('Documents').insertOne({
            title: req.query.title,
            desc: req.query.desc,
        }, (err, result) => {
            if (err) {
                console.log(err)
            }
            res.json(result)
        } )
    }
    else {
        res.json('no')
    }
})