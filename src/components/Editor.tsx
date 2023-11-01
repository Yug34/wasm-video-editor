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
import {HeadingContainer, InfoCard, InfoContainer, InfoHeading, InfoLine} from "../App.Styles";

// TODO: Maybe just process everything as MP4, then convert back to original/other formats

// NOTE: order should be trim -> compress -> greyscale/filters -> whatever (and then finally convert

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
            <Styles.VideoOverlay>
                <video style={{ width: "100%", display: "block" }} ref={videoRef} controls />
                {isUnplayable && <div>Unplayable</div>}
            </Styles.VideoOverlay>
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
                            <Styles.TransformationsContainer>
                                <StyledButton onClick={openModal}>Apply a transformation</StyledButton>
                                <StyledButton onClick={transform}>Apply all transformations!</StyledButton>
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