import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { StyledButton } from "../App";
import styled from "styled-components";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Flex } from "./common";
import Modal from "./Modal";
import { Codec, Format, Transformation, VideoDuration } from "../types";
import { CODECS } from "../contants";
import { getVideoDurationAsString, subtractVideoDuration } from '../utils';

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

const MessageContainer = styled.div`
  position: relative;
  margin-top: 1rem;
  border-top: 1px solid white;
  column-gap: 12px;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 2rem 3rem;
`;

const IconsContainer = styled.div`
  display: flex;
  column-gap: 8px;
  position: absolute;
  color: white;
  right: 2rem;
  padding: 1rem;
`;

const TransformationsContainer = styled(Flex)`
  flex-direction: column;
  width: 300px;
  height: 100%;
  border-left: 1px solid white;
  padding-left: 1rem;
`;

const GHSvg = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
    </svg>
);

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    const [videoFormat, setVideoFormat] = useState<Format | null>(null);
    const [videoDuration, setVideoDuration] = useState<VideoDuration | null>(null);
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
        console.log("Initializing")
        const file = (e.target as HTMLInputElement)!.files![0];

        const format = file.type.split("/")[1] as Format;
        setVideoFormat(format);

        const fileData = await fetchFile(file);

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile(`input.${format}`, fileData);
        ffmpeg.on('log', ({message}) => {
            let DurationPattern = /DURATION *: \d+:\d+:\d+.?\d*(?=,*)/ig;
            const msgToMatch = message.split(",")[0];
            if (msgToMatch.match(DurationPattern)) {
                const splitMessage = msgToMatch.split(":");
                let timeStamps = splitMessage.splice(1, splitMessage.length);
                timeStamps = timeStamps.map((timeStamp) => timeStamp.trim());
                setVideoDuration({
                    hours: parseInt(timeStamps[0]),
                    minutes: parseInt(timeStamps[1]),
                    seconds: parseInt(timeStamps[2])
                });
            }
        });
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
        await ffmpeg.exec(['-i', `input.${videoFormat}`, '-threads', '4', '-strict', '-2', '-c:v', `${CODECS[toCodec].ffmpegLib}`, `input.${toFormat}`]);

        if (toFormat === "wmv" || toFormat === "avi") {
            setIsUnplayable(true);
        } else {
            setIsUnplayable(false);
        }

        await ffmpeg.deleteFile(`input.${videoFormat}`);
        setVideoFormat(toFormat);
    }

    const grayscale = async (format: Format) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', `input.${format}`, '-vf', 'format=gray', `output.${format}`]);
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const mute = async (format: Format) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(['-i', `input.${format}`, '-vcodec', 'copy', '-an', `output.${format}`]);
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const trim = async (format: Format, from: VideoDuration, to: VideoDuration) => {
        const startTimestamp = getVideoDurationAsString(from);

        // WHAT? Why do I need to subtract twice for webms? This makes no sense.
        // TODO: Here's the official docs: https://trac.ffmpeg.org/wiki/Seeking
        const endTimeStamp = format === "webm" ? getVideoDurationAsString(subtractVideoDuration(subtractVideoDuration(to, from), from)) : getVideoDurationAsString(subtractVideoDuration(to, from));

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(["-ss", startTimestamp, "-i", `input.${format}`, "-t", endTimeStamp, "-c", "copy", `output.${videoFormat}`] )
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const transform = async () => {
        const transcodeSteps = transformations.filter((transformation) => transformation.type === "Convert");
        const hasTranscode = transcodeSteps.length > 0;

        const format = hasTranscode ? transcodeSteps[0].transcode!.to : videoFormat;

        await Promise.all(transformations.map(async transformation => {
            switch (transformation.type) {
                case "Convert":
                    return await transcode(transformation.transcode!.to, transformation.transcode!.codec);
                case "Greyscale":
                    return await grayscale(format!);
                case "Mute":
                    return await mute(format!);
                case "Trim":
                    return await trim(format!, transformation.trim!.from, transformation.trim!.to);
            }
        })).then(async () => {
            const ffmpeg = ffmpegRef.current;
            const data: FileData = await ffmpeg.readFile(`input.${format}`);
            videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: `video/${format}`}));
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
                        videoDuration={videoDuration!}
                        videoFormat={videoFormat!}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        transformations={transformations}
                        setTransformations={setTransformations}
                    />
                    <Flex style={{ flexDirection: "column" }}>
                        <Flex style={{padding: "1rem"}}>
                            {videoThumbnail && (
                                <div style={{border: "1px solid white", borderRadius: "1rem", padding: "1rem", width: "fit-content"}}>
                                    <img src={videoThumbnail} alt={"thumbnail"} />
                                </div>
                            )}
                            <VideoPlayer isUnplayable={isUnplayable} />
                            <TransformationsContainer>
                                <StyledButton onClick={openModal}>Apply a transformation</StyledButton>
                                <StyledButton onClick={transform}>Apply all transformations!</StyledButton>
                            </TransformationsContainer>
                        </Flex>
                        <MessageContainer>
                            <p>Ffmpeg Logs:</p>
                            <p ref={messageRef}></p>
                            <IconsContainer>
                                <a href={"https://github.com/Yug34/wasm-video-editor"} aria-label={"Link to Project"} target={"_blank"}>
                                    <GHSvg/>
                                </a>
                            </IconsContainer>
                        </MessageContainer>
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