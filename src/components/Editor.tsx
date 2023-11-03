import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { StyledButton } from "../App";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Flex } from "./common";
import Modal from "./Modal";
import { Codec, Format, Transformation, VideoDuration } from "../types";
import { CODECS } from "../contants";
import { getVideoDurationAsString, subtractVideoDuration } from '../utils';
import * as Styles from "../App.Styles";

// TODO: Maybe just process everything as MP4, then convert back to original/other formats
// TODO: There'a an ffmpeg.load error

// NOTE: order should be trim -> compress -> grayscale/filters -> whatever (and then finally convert

// p 2 p -> handled
// p 2 u -> todo
// u 2 p -> handled
// u 2 u -> todo

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
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

        ffmpeg.readFile(`input.${format}`).then((videoData) => {
            videoRef.current!.src = URL.createObjectURL(new Blob([videoData], {type: `video/${format}`}));
        });

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
        await ffmpeg.exec(`-i input.${videoFormat} -threads 4 -strict -2 -c:v ${CODECS[toCodec].ffmpegLib} input.${toFormat}`.split(" "));

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
        await ffmpeg.exec(`-i input.${format} -vf format=gray output.${format}`.split(" "));
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const mute = async (format: Format) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${format} -vcodec copy -an output.${format}`.split(" "));
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const trim = async (format: Format, from: VideoDuration, to: VideoDuration) => {
        const startTimestamp = getVideoDurationAsString(from);

        // WHAT? Why do I need to subtract twice for webms? This makes no sense.
        // TODO: Here's the official docs: https://trac.ffmpeg.org/wiki/Seeking
        const endTimeStamp = format === "webm" ? getVideoDurationAsString(subtractVideoDuration(subtractVideoDuration(to, from), from)) : getVideoDurationAsString(subtractVideoDuration(to, from));

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-ss ${startTimestamp} -i input.${format} -t ${endTimeStamp} -c copy output.${videoFormat}`.split(" "))
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
                case "Grayscale":
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
            <Styles.VideoOverlay>
                <video style={{ width: "100%", display: "block" }} ref={videoRef} controls />
                {isUnplayable && <div>Unplayable</div>}
            </Styles.VideoOverlay>
        );
    };

    return (
        <div style={{width: "100%", height: "100%"}}>
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
                            <VideoPlayer isUnplayable={isUnplayable} />
                            <Styles.TransformationsContainer>
                                {transformations.length === 0 ? (
                                    <Styles.EmptyTransformationsContainer onClick={openModal}>
                                        <div>No transformations added yet</div>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0S" viewBox="0 0 1024 1024" height="4em" width="4em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8Z"/>
                                        <path d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z"/>
                                        </svg>
                                        <div>Click here to Add</div>
                                    </Styles.EmptyTransformationsContainer>
                                ) : (
                                    <>
                                        <StyledButton onClick={openModal}>Add a transformation</StyledButton>
                                            {transformations.map((transformation) => (
                                                <div key={transformation.type}>{transformation.type}</div>
                                            ))}
                                        <StyledButton onClick={transform}>Apply all transformations!</StyledButton>
                                    </>
                                )}
                            </Styles.TransformationsContainer>
                        </Flex>
                        <Styles.MessageContainer>
                            <p>Ffmpeg Logs:</p>
                            <p ref={messageRef}></p>
                            <Styles.IconsContainer>
                                <a href={"https://github.com/Yug34/wasm-video-editor"} aria-label={"Link to Project"} target={"_blank"} rel={"noreferrer"}>
                                    <Styles.GHSvg/>
                                </a>
                            </Styles.IconsContainer>
                        </Styles.MessageContainer>
                    </Flex>
                </React.Fragment>
            ) : (
                <Styles.HeadingContainer>
                    <h1>Hey 👋,</h1>
                    <h3>
                        Welcome to the video-editor where <i>your files are not uploaded anywhere!</i> ✨
                    </h3>
                    <Styles.StyledLabel htmlFor="file-upload" className="custom-file-upload">{video ? "Loading ffmpeg" : "Add a video to start"}</Styles.StyledLabel>
                    <input
                        style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                        onClick={video ? () => {} : load}
                        onChange={initialize}
                    />
                    <Styles.InfoContainer>
                        <Styles.InfoCard>
                            <Styles.InfoHeading>How does it work?</Styles.InfoHeading>
                            <div>All of the files you add here are kept only with you, and are never sent to any server anywhere.</div>
                            <div>The video transformations occur on your computer locally through WebAssembly.</div>
                        </Styles.InfoCard>
                        <Styles.InfoLine />
                        <Styles.InfoCard>
                            <Styles.InfoHeading>Why did I make this?</Styles.InfoHeading>
                            <div>I was annoyed at the fact that I had to upload my videos to random servers.</div>
                            <div>It's anti-privacy. Once you upload your video to those servers, you never know what they'll do with it.</div>
                        </Styles.InfoCard>
                    </Styles.InfoContainer>
                </Styles.HeadingContainer>
            )}
        </div>
    );
}

export default Editor;