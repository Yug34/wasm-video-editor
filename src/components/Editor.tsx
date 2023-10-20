import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { StyledButton } from "../App";
import styled from "styled-components";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Flex } from "./common";
import Modal from "./Modal";

// NOTE: order should be trim -> compress -> greyscale/filters

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

type VideoFormats = "webm" | "mp4";

type Transformation = {
    type: "Transcode";
    to: VideoFormats;
}

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [transformations, setTransformations] = useState<Transformation[]>([]);

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

    const getFirstFrameUrl = async (fileData: Uint8Array) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile('input.webm', fileData);
        await ffmpeg.exec(['-i', 'input.webm', '-vf', 'select=eq(n\\,0)', "-q:v", "3", "output_image.png"]);
        const data: FileData = await ffmpeg.readFile('output_image.png');
        const dataUrl = URL.createObjectURL(
            new Blob([data], { type: 'image/png' })
        );
        await ffmpeg.deleteFile('output_image.png')

        return dataUrl;
    }

    const initialize = async (e: ChangeEvent) => {
        const file = (e.target as HTMLInputElement)!.files![0];
        const fileData = await fetchFile(file);

        setVideoThumbnail(await getFirstFrameUrl(fileData));

        setVideo(fileData);
    }

    useEffect(() => {
        if (video && isLoaded) {
            ffmpegRef.current.on('log', ({ message }) => {
                messageRef.current!.innerHTML = message;
                console.log(message);
            });
        }
    }, [video, isLoaded]);

    const transcodeTo = async (outputFormat: string = "mp4") => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', 'input.webm', `output.${outputFormat}`]);
        const data: FileData = await ffmpeg.readFile(`output.${outputFormat}`);
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: `video/${outputFormat}`}));
    }

    const transcode = async () => {
        setIsModalOpen(true);
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data: FileData = await ffmpeg.readFile('output.mp4');
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
    }

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            {video && isLoaded ? (
                <Flex>
                    <Flex style={{ width: "67%", flexDirection: "column" }}>
                        {videoThumbnail && (
                            <div style={{border: "1px solid white", borderRadius: "1rem", padding: "1rem", width: "fit-content"}}>
                                <img src={videoThumbnail} alt={"thumbnail"} />
                            </div>
                        )}
                        <video ref={videoRef} controls />
                        <p ref={messageRef}></p>
                    </Flex>
                    <Flex style={{ width: "33%", flexDirection: "column" }}>
                        <StyledButton onClick={transcode}>Transcode webm to mp4</StyledButton>
                    </Flex>
                </Flex>
            ) : (
                <Flex style={{ justifyContent: "center", alignItems: "center" }}>
                    <StyledLabel htmlFor="file-upload" className="custom-file-upload">{video ? "Loading ffmpeg" : "Upload video"}</StyledLabel>
                    <input
                        style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                        onClick={video ? () => {} : load}
                        onChange={initialize}
                    />
                </Flex>
            )}
        </div>
    );
}

export default Editor;