require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();

const client = axios.create({
    baseURL: 'https://api.hubspot.com',
    headers: {
        Authorization: `Bearer ${ process.env.PRIVATE_APP_TOKEN }`,
        'Content-Type': 'application/json',
    },
});

const createCustomObjectItem = async (objId, properties) => client.post(
    `/crm/v3/objects/${ objId }`,
    {
        properties,
    },
).then(resp => resp.data);

const retrieveCustomObjectItems = async (objId, properties) => client.get(
    `/crm/v3/objects/${ objId }?properties=${ properties.join(',') }`,
).then(resp => resp.data.results);

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });      
});

app.post('/update-cobj', async (req, res) => {
    try {
        const data = await createCustomObjectItem(
            process.env.OBJECT,
            {
                name: req.body.name,
                genre: req.body.genre,
                platforms: req.body.platforms.join(';'),
            },
        );
    
        if (data?.id) {
            res.redirect('/');
        } else {
            throw new Error(data?.errors?.[0].message || 'Error occured');
        }
    }
    catch (e) {
        console.error(e);
        res.redirect('/update-cobj');
    }   
});

app.get('/', async (_, res) => {
    try {
        const data = await retrieveCustomObjectItems(
            process.env.OBJECT,
            [
                'name',
                'genre',
                'platforms',
            ],
        );

        res.render('homepage', {
            title: 'Custom Object Table | Integrating With HubSpot I Practicum',
            data,
        });      
    } catch (error) {
        console.error(error);
        res.send('Error occurred during data receiving from HubSpot');
    }  
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));