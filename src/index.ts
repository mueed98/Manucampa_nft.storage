import { NFTStorage, File, Blob } from 'nft.storage'
require('dotenv').config();
import * as fs from 'fs';
import * as path from 'path';
import { error } from 'console';
const ethers = require('ethers');
const axios = require("axios");

const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Environment Variables
const NFT_STORAGE_TOKEN:string = process.env.API_KEY ? process.env.API_KEY : '';
const FILE_COUNT:number = parseInt(process.env.FILE_COUNT || '0');

const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })


async function uploadImages(){

    let imageArray:any [] = [];

    for (let i = 0; i < FILE_COUNT; i++) {
        let readFiledata = await fs.readFileSync(`${__dirname}/images/${i}.png`);
        let temp1 = readFiledata.toString('hex'); 
        let base64String = Buffer.from(temp1, 'hex').toString('base64')

        imageArray.push(new File([readFiledata],`${i}.png`, {type:"image/png"}));
    }

    const cid = await client.storeDirectory(imageArray);

    console.log(cid);

    return cid;
}

async function uploadVideos(){

    let videoArray:any [] = [];

    for (let i = 0; i < FILE_COUNT; i++) {
        let readFiledata = await fs.readFileSync(`${__dirname}/videos/${i}.mp4`);
        //let temp1 = readFiledata.toString('hex'); 
        //let base64String = Buffer.from(temp1, 'hex').toString('base64')

        videoArray.push(new File([readFiledata],`${i}.mp4`, {type:"video/mp4"}));
    }

    const cid = await client.storeDirectory(videoArray);

    console.log(cid);

    return cid;
}

async function updateMetaDataFiles(imageCid : string, videoCid:string){

    let MetaDataArray:any [] = [];

    for (let i = 0; i < FILE_COUNT; i++) {

        let readFiledata = await fs.readFileSync(`${__dirname}/metadata/${i}.json`);
        let jsonFile =  JSON.parse(readFiledata.toString());

        jsonFile['image'] = 'ipfs://'+imageCid+`/${i}.png`;
        jsonFile['external_url'] = 'ipfs://'+videoCid+`/${i}.mp4`;
        jsonFile['animation_url'] = 'ipfs://'+videoCid+`/${i}.mp4`;

        const buf = Buffer.from(JSON.stringify(jsonFile));

        MetaDataArray.push(new File([buf],`${i}.json`, { type: 'application/json' }));   
    }

    const metaDataCid = await client.storeDirectory(MetaDataArray);

    console.log(metaDataCid);

    return metaDataCid;
}


async function bootstrap() {

    const videoCid = 'bafybeighl4prtso6io6negnn3szgejbieyuvk2e6tb3u42rqpdouawwqze';
    const imageCid = 'bafybeicw4k46vpqxqlalb3gpazlmrfpgz2huuow5prlkek5pjaqbltp25m';

    // const imageCid = await uploadImages();
    // const videoCid = await uploadVideos();
    
    await updateMetaDataFiles(imageCid, videoCid);
    console.log('--- Complete ---');
}


bootstrap();