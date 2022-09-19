import { NFTStorage, File, Blob } from 'nft.storage'
require('dotenv').config();
import * as fs from 'fs';
const ethers = require('ethers')
//const wallet = ethers.Wallet.createRandom()

// Environment Variables
const NFT_STORAGE_TOKEN:string = process.env.API_KEY ? process.env.API_KEY : '';
const FILE_COUNT:number = parseInt(process.env.FILE_COUNT || '0');
const fee_recipient=process.env.fee_recipient;
const seller_fee_basis_points=process.env.seller_fee_basis_points;

const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })


async function uploadImages(){

    let imageArray:any [] = [];

    for (let i = 0; i < FILE_COUNT; i++) {
        let readFiledata = await fs.readFileSync(`${__dirname}/images/${i}.png`);
        imageArray.push(new File([readFiledata],`${i}.png`, {type:"image/png"}));
    }

    const cid = await client.storeDirectory(imageArray);

    console.log('--> imageCid : ',cid);

    return cid;
}

async function uploadVideos(){

    let videoArray:any [] = [];

    for (let i = 0; i < FILE_COUNT; i++) {
        let readFiledata = await fs.readFileSync(`${__dirname}/videos/${i}.mp4`);
        videoArray.push(new File([readFiledata],`${i}.mp4`, {type:"video/mp4"}));
    }

    const cid = await client.storeDirectory(videoArray);

    console.log('--> videoCid : ',cid);

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
        jsonFile['fee_recipient'] = fee_recipient;
        jsonFile['seller_fee_basis_points'] = seller_fee_basis_points;

        const buf = Buffer.from(JSON.stringify(jsonFile));

        MetaDataArray.push(new File([buf],`${i}.json`, { type: 'application/json' }));   
    }

    const metaDataCid = await client.storeDirectory(MetaDataArray);

    console.log('--> metaDataCid : ',metaDataCid);

    return metaDataCid;
}

async function bootstrap() {

    // const videoCid = 'bafybeighl4prtso6io6negnn3szgejbieyuvk2e6tb3u42rqpdouawwqze';
    // const imageCid = 'bafybeicw4k46vpqxqlalb3gpazlmrfpgz2huuow5prlkek5pjaqbltp25m';

    const imageCid = await uploadImages();
    const videoCid = await uploadVideos();
    
    await updateMetaDataFiles(imageCid, videoCid);


    // console.log('address:', wallet.address)
    // console.log('mnemonic:', wallet.mnemonic.phrase)
    // console.log('privateKey:', wallet.privateKey)

    console.log('--- Complete ---');
}


bootstrap();