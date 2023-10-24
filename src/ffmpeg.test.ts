import {toBlobURL} from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";

import * as fs from "fs";
import path from "path";

const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    const ffmpeg = new FFmpeg();

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    });
}

describe('FFmpeg testing', () => {
    // beforeAll(async () => {
    //     await load()
    // });

    const bunnyWebmPath = path.join(__dirname + "/assets/bunnywebm.webm");
    const data = fs.readFileSync(bunnyWebmPath);
    console.log(data)
    it('should', () => {
        expect(1+1).toBe(2);
    });
});