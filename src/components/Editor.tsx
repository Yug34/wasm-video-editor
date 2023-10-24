import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { StyledButton } from "../App";
import styled from "styled-components";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Flex } from "./common";
import Modal from "./Modal";
import { Codec, Format, Transformation } from "../types";
import { CODECS } from "../contants";

// TODO: Maybe just process everything as MP4, then convert back to original/other formats

// NOTE: order should be trim -> compress -> greyscale/filters -> whatever (and then finally convert

// p 2 p -> handled
// p 2 u -> todo
// u 2 p -> handled
// u 2 u -> todo

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

const VideoOverlay = styled.div`
  width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    const [videoFormat, setVideoFormat] = useState<Format | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [isUnplayable, setIsUnplayable] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true)

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

    const initialize = async (e: ChangeEvent) => {
        const file = (e.target as HTMLInputElement)!.files![0];

        const format = file.type.split("/")[1] as Format;
        setVideoFormat(format);

        const fileData = await fetchFile(file);

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile(`input.${format}`, fileData);
        await ffmpeg.exec(['-i', `input.${format}`, '-vf', 'select=eq(n\\,0)', "-q:v", "3", "output_image.png"]);
        const data: FileData = await ffmpeg.readFile('output_image.png');
        const dataUrl = URL.createObjectURL(
            new Blob([data], { type: 'image/png' })
        );
        setVideoThumbnail(dataUrl);
        await ffmpeg.deleteFile('output_image.png');

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

    const transcode = async (toFormat: Format, toCodec: Codec) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', `input.${videoFormat}`, '-threads', '4', '-strict', '-2', '-c:v', `${CODECS[toCodec].ffmpegLib}`, `output.${toFormat}`]);

        if (toFormat === "wmv" || toFormat === "avi") {
            setIsUnplayable(true);
        } else {
            setIsUnplayable(false);
        }

        const data: FileData = await ffmpeg.readFile(`output.${toFormat}`);
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: `video/${toFormat}`}));
    }

    const grayscale = async () => {
        const ffmpeg = ffmpegRef.current;
        console.log(await ffmpeg.listDir("."));
        await ffmpeg.exec(['-i', `input.${videoFormat}`, '-vf', 'format=gray', `output.${videoFormat}`]);
        const data: FileData = await ffmpeg.readFile(`output.${videoFormat}`);
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: `video/${videoFormat}`}));
        console.log(await ffmpeg.listDir("."));
    }

    const transform = () => {
        console.log(transformations);

        transformations.forEach(transformation => {
            switch (transformation.type) {
                case "Convert":
                    transcode(transformation.transcode?.to!, transformation.transcode?.codec!);
                    break;
                case "Greyscale":
                    grayscale();
                    break;
            }
        });
    }

    const VideoPlayer = ({isUnplayable}: {isUnplayable: boolean}) => {
        return (
            <VideoOverlay>
                <video style={{ width: "100%", display: "block" }} ref={videoRef} controls />
                {isUnplayable && <div>Unplayable</div>}
            </VideoOverlay>
        );
    };

    return (
        <div style={{width: "100%", height: "100%"}}>
            {/*<video src={require("../videos/bunnywmv.wmv")} autoPlay={true} controls={true}/>*/}
            {video && isLoaded ? (
                <React.Fragment>
                    <Modal
                        videoFormat={videoFormat!}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        transformations={transformations}
                        setTransformations={setTransformations}
                    />
                    <Flex>
                        <Flex style={{ width: "67%", flexDirection: "column" }}>
                            {videoThumbnail && (
                                <div style={{border: "1px solid white", borderRadius: "1rem", padding: "1rem", width: "fit-content"}}>
                                    <img src={videoThumbnail} alt={"thumbnail"} />
                                </div>
                            )}
                            <VideoPlayer isUnplayable={isUnplayable} />
                            <p ref={messageRef}></p>
                        </Flex>
                        <Flex style={{ width: "33%", flexDirection: "column" }}>
                            <StyledButton onClick={openModal}>Apply a transformation</StyledButton>
                            <StyledButton onClick={transform}>Apply all transformations!</StyledButton>
                        </Flex>
                    </Flex>
                </React.Fragment>
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