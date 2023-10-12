import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { StyledButton } from "../App";
import styled from "styled-components";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const StyledLabel = styled.label`
  color: white;
  cursor: pointer;
  border: 1px solid white;
  border-radius: 12px;
  padding: 1rem;

  &:hover {
    background: #333333;
  }
`;

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        const ffmpeg = ffmpegRef.current;

        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });

        setIsLoaded(true);
    }

    useEffect(() => {
        if (video && isLoaded) {
            ffmpegRef.current.on('log', ({ message }) => {
                messageRef.current!.innerHTML = message;
                console.log(message);
            });
        }
    }, [video, isLoaded]);

    const transcode = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data: FileData = await ffmpeg.readFile('output.mp4');
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "1rem"
            }}
        >
            {video && isLoaded ? (
                <>
                    {videoThumbnail && <img src={videoThumbnail} alt={"thumbnail"} />}
                    <video ref={videoRef} controls />
                    <StyledButton onClick={transcode}>Transcode webm to mp4</StyledButton>
                    <p style={{width: "400px"}} ref={messageRef}></p>
                </>
            ) : (
                <>
                    <StyledLabel htmlFor="file-upload" className="custom-file-upload">{video ? "Loading ffmpeg" : "Upload video"}</StyledLabel>
                    <input
                        style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                        onClick={video ? () => {} : load}
                        onChange={async (e: ChangeEvent) => {
                            console.log("Uploaded video");
                            const file = (e.target as HTMLInputElement)!.files![0];
                            const fileData = await fetchFile(file);

                            const ffmpeg = ffmpegRef.current;
                            await ffmpeg.writeFile('input.webm', fileData);
                            await ffmpeg.exec(['-i', 'input.webm', '-vf', 'select=eq(n\\,0)', "-q:v", "3", "output_image.png"]);
                            const data: FileData = await ffmpeg.readFile('output_image.png');
                            setVideoThumbnail(URL.createObjectURL(
                                new Blob([data as Uint8Array], { type: 'image/png' })
                            ));
                            await ffmpeg.deleteFile('output_image.png')

                            setVideo(fileData);
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default Editor;