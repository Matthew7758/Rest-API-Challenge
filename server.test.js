const request = require('supertest')
const app = require('./app')
const {promisify} = require("util");
const fs = require("fs");

const writeFile = promisify(fs.writeFile)
const filePath = './public/data.json'

async function resetFile() {
    const data = {
        "recipes": [
            {
                "name": "scrambledEggs",
                "ingredients": [
                    "1 tsp oil",
                    "2 eggs",
                    "salt"
                ],
                "instructions": [
                    "Beat eggs with salt",
                    "Heat oil in pan",
                    "Add eggs to pan when hot",
                    "Gather eggs into curds, remove when cooked",
                    "Salt to taste and enjoy"
                ]
            },
            {
                "name": "garlicPasta",
                "ingredients": [
                    "500mL water",
                    "100g spaghetti",
                    "25mL olive oil",
                    "4 cloves garlic",
                    "Salt"
                ],
                "instructions": [
                    "Heat garlic in olive oil",
                    "Boil water in pot",
                    "Add pasta to boiling water",
                    "Remove pasta from water and mix with garlic olive oil",
                    "Salt to taste and enjoy"
                ]
            },
            {
                "name": "chai",
                "ingredients": [
                    "400mL water",
                    "100mL milk",
                    "5g chai masala",
                    "2 tea bags or 20 g loose tea leaves"
                ],
                "instructions": [
                    "Heat water until 80 C",
                    "Add milk, heat until 80 C",
                    "Add tea leaves/tea bags, chai masala; mix and steep for 3-4 minutes",
                    "Remove mixture from heat; strain and enjoy"
                ]
            }
        ]
    }
    await writeFile(filePath, JSON.stringify(data))
}


describe("GET /recipes", () => {
    test("Should respond with list of recipe names", async () => {
        await resetFile()
        const response = await request(app).get('/recipes')
        expect(response.body).toEqual({"recipeNames": ["scrambledEggs", "garlicPasta", "chai"]})
        expect(response.statusCode).toBe(200)
    })
    test("Should respond with details and number of steps", async () => {
        await resetFile()
        const response = await request(app).get('/recipes/details/garlicPasta')
        expect(response.body).toEqual({
            "details": {
                "ingredients": [
                    "500mL water",
                    "100g spaghetti",
                    "25mL olive oil",
                    "4 cloves garlic",
                    "Salt"
                ],
                "numSteps": 5
            }
        })
        expect(response.statusCode).toBe(200)
    })
})

describe('POST /recipes', () => {
    test("Should respond with 201", async() => {
        await resetFile()
        const response = await request(app).post('/recipes').send({
            "name": "butteredBagel",
            "ingredients": [
                "1 bagel",
                "butter"
            ],
            "instructions": [
                "cut the bagel",
                "spread butter on bagel"
            ]
        })
        expect(response.body).toEqual({})
        expect(response.statusCode).toBe(201)
    })
    test("Should respond with 201", async() => {
        const response = await request(app).post('/recipes').send({
            "name": "butteredBagel",
            "ingredients": [
                "1 bagel",
                "butter"
            ],
            "instructions": [
                "cut the bagel",
                "spread butter on bagel"
            ]
        })
        expect(response.body).toEqual({
            "error": "Recipe already exists"
        })
        expect(response.statusCode).toBe(400)
    })
})

describe("PUT /recipes", () => {
    test("Should respond with 204", async() => {
        const response = await request(app).put('/recipes').send({
            "name": "butteredBagel",
            "ingredients": [
                "1 bagel",
                "2 tbsp butter"
            ],
            "instructions": [
                "cut the bagel",
                "spread butter on bagel"
            ]
        })
        expect(response.body).toEqual({})
        expect(response.statusCode).toBe(204)
    })
    test("Should be 404", async() => {
        await resetFile()
        const response = await request(app).put('/recipes').send({
            "name": "butteredBagel",
            "ingredients": [
                "1 bagel",
                "2 tbsp butter"
            ],
            "instructions": [
                "cut the bagel",
                "spread butter on bagel"
            ]
        })
        expect(response.body).toEqual({error: "Recipe does not exist"})
        expect(response.statusCode).toBe(404)
    })
})