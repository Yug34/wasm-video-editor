// let users apply filters and so on in a layered (?) way
// so basically steps through different transformations and applies all the effects sequentially

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";

const App = () => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [video, setVideo] = useState<Uint8Array | null>(null);

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            messageRef.current!.innerHTML = message;
            console.log(message);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });

        setLoaded(true);
    }

    const transcode = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile('input.webm', video!);
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data: FileData = await ffmpeg.readFile('output.mp4');
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
    }

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}>
        {loaded ? (
            <>
              <input type="file" ref={fileInputRef} onChange={async (e: ChangeEvent) => {
                setVideo(await fetchFile((e.target as HTMLInputElement)!.files![0]));
              }}/>
              <video ref={videoRef} controls></video>
              <button onClick={transcode}>Transcode webm to mp4</button>
              <p ref={messageRef}></p>
            </>
        ) : (
            <button onClick={load}>Load ffmpeg</button>
        )}
      </div>
  );
}

export default App;