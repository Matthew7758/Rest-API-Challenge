const express = require('express')
const app = express();
app.use(express.static('public'))
//app.use(express.static(__dirname));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const fs = require('fs')
const {promisify} = require('util');
const filePath = './public/data.json'
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

app.use(function (req, res, next) {
    console.log('url:', req.url)
    next()
})
app.get('/', function (req, res) {
    (async () => {
        let data = await readFile(filePath, 'utf8')
        res.status(200).json(JSON.parse(data))
    })()
})
app.get('/recipes/details/*', function (req, res) {
    (async () => {
        let content = await readFile(filePath, 'utf8')
        let data = JSON.parse(content)
        let recipeName = req.url.slice(17)
        let retData = {}
        for (let i in data.recipes) {
            let item = data.recipes[i]
            if (item.name === recipeName) {
                retData = {
                    details:
                        {
                            "ingredients": [],
                            "numSteps": []
                        },
                }
                retData.details.ingredients = item.ingredients
                retData.details.numSteps = item.instructions.length
            }
        }
        res.status(200).json(retData)
    })()
})
app.get('/recipes', function (req, res) {
    (async () => {
        let content = await readFile(filePath, 'utf8')
        let data = JSON.parse(content)
        let retData = {
            recipeNames: []
        }
        for (let i in data.recipes) {
            let item = data.recipes[i]
            retData.recipeNames.push(item.name)
        }
        res.status(200).json(retData)
    })()
})

app.post('/recipes', function(req,res) {
    (async () => {
        let content = await readFile(filePath, 'utf8')
        let data = JSON.parse(content)
        let inputName = req.body.name
        for(let i in data.recipes) {
            let item = data.recipes[i]
            if(inputName === item.name) {
                const errRet = {
                    error:"Recipe already exists"
                }
                res.status(400).json(errRet)
                return
            }
        }
        data.recipes.push(req.body)
        await writeFile(filePath,JSON.stringify(data))
        res.sendStatus(201)
    })()
})

app.put('/recipes',function(req,res) {
    (async () => {
        let content = await readFile(filePath, 'utf8')
        let data = JSON.parse(content)
        let inputName = req.body.name
        for(let i in data.recipes) {
            let item = data.recipes[i]
            if(inputName === item.name) {
                //Update and return
                data.recipes[i] = req.body
                await writeFile(filePath,JSON.stringify(data))
                res.sendStatus(204)
                return
            }
        }
        const errRet = {
            error:"Recipe does not exist"
        }
        res.status(404).json(errRet)
    })()
})
module.exports = app