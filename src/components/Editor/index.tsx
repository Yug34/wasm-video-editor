import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { StyledButton } from "../../App";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {CheckSVG, Flex, GitHubSVG} from "../common";
import Modal from "../Modal";
import { Codec, Format, Transformation, VideoDuration } from "../../types";
import { CODECS } from "../../constants";
import {VideoDurationWrapper} from '../../utils';
import * as Styles from "./Editor.Styles";

// TODO: Maybe just process everything as MP4, then convert back to original/other formats
// TODO: There's an ffmpeg.load error

// NOTE: order should be trim -> compress -> grayscale/filters -> whatever (and then finally convert

interface StepProps {
    completed: boolean;
    enabled?: boolean;
    clickHandler?(): void;
    text?: string;
    completedText: string;
    svg: ReactElement;
    completedSVG?: ReactElement;
}
const Step = ({completed, clickHandler = () => {}, completedText, text = "", svg, completedSVG = <CheckSVG/>, enabled}: StepProps) => {
    return (
        <Styles.Step $completed={completed} onClick={completed ? () => {} : clickHandler}>
            <>
                {completed ? completedSVG : svg}
                {completed ? completedText : text}
            </>
        </Styles.Step>
    );
};

const Editor = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [video, setVideo] = useState<Uint8Array | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    const [videoFormat, setVideoFormat] = useState<Format | null>(null);
    const [videoDuration, setVideoDuration] = useState<VideoDurationWrapper | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [isUnplayable, setIsUnplayable] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true)

    const [transformations, setTransformations] = useState<Transformation[]>([]);
    const [isTransformComplete, setIsTransformComplete] = useState<boolean>(false);

    const [sourceVideoURL, setSourceVideoURL] = useState<string | null>(null);
    const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

    const downloadVideo = () => {
        var link = document.createElement("a");
        link.download = `output.${videoFormat}`;
        link.target = "_blank";

        link.href = sourceVideoURL!;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        setIsDownloaded(true);
    }

    useEffect(() => {
        load();
    }, []);

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
                const videoDuration: VideoDuration = {
                    hours: parseInt(timeStamps[0]),
                    minutes: parseInt(timeStamps[1]),
                    seconds: parseInt(timeStamps[2])
                }
                setVideoDuration(VideoDurationWrapper.fromVideoDuration(videoDuration));
            }
        });

        // Does nothing, just getting the metadata of the video.
        await ffmpeg.exec([`-i`, `input.${format}`]);

        ffmpeg.readFile(`input.${format}`).then((videoData) => {
            const videoURL = URL.createObjectURL(new Blob([videoData], {type: `video/${format}`}));
            setSourceVideoURL(videoURL);
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

    const transcode = async (toFormat: Format, toCodec: Codec, fromFormat?: Format) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${fromFormat ?? videoFormat} -threads 4 -strict -2 -c:v ${CODECS[toCodec].ffmpegLib} input.${toFormat}`.split(" "));

        if (toFormat === "wmv" || toFormat === "avi") {
            setIsUnplayable(true);
        } else {
            setIsUnplayable(false);
        }

        await ffmpeg.deleteFile(`input.${fromFormat ?? videoFormat}`);
        setVideoFormat(toFormat);
    }

    const grayscale = async (format: Format) => {
        console.log("grayscale")
        const ffmpeg = ffmpegRef.current;

        if (format === "webm") {
            await transcode("mp4", "h264");
            await ffmpeg.exec(`-i input.mp4 -vf format=gray output.mp4`.split(" "));
            await ffmpeg.deleteFile("input.mp4");
            console.log(await ffmpeg.listDir("."));
            await ffmpeg.rename("output.mp4", "input.mp4");
            console.log(await ffmpeg.listDir("."));
            await transcode(format, "vp8", "mp4");
        } else {
            await ffmpeg.exec(`-i input.${format} -vf format=gray output.${format}`.split(" "));
            await ffmpeg.rename(`output.${format}`, `input.${format}`);
        }
    }

    const mute = async (format: Format) => {
        console.log("mute")
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${format} -vcodec copy -an output.${format}`.split(" "));
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const trim = async (format: Format, from: VideoDuration, to: VideoDuration) => {
        console.log("trim")
        const startTimestamp = VideoDurationWrapper.fromVideoDuration(from).toString();

        // WHAT? Why do I need to subtract twice for webms? This makes no sense.
        // TODO: Here's the official docs: https://trac.ffmpeg.org/wiki/Seeking
        const endTimeStamp = format === "webm" ? VideoDurationWrapper.subtract(VideoDurationWrapper.subtract(to, from), from).toString() : VideoDurationWrapper.subtract(to, from).toString();

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-ss ${startTimestamp} -i input.${format} -t ${endTimeStamp} -c copy output.${videoFormat}`.split(" "))
        await ffmpeg.rename(`output.${format}`, `input.${format}`);
    }

    const transform = async () => {
        const transcodeSteps = transformations.filter((transformation) => transformation.type === "Convert");
        const hasTranscode = transcodeSteps.length > 0;

        const format = hasTranscode ? transcodeSteps[0].transcode!.to : videoFormat;

        for (const transformation of transformations) {
            switch (transformation.type) {
                case "Convert":
                    await transcode(transformation.transcode!.to, transformation.transcode!.codec);
                    break;
                case "Grayscale":
                    await grayscale(format!);
                    break;
                case "Mute":
                    await mute(format!);
                    break;
                case "Trim":
                    await trim(format!, transformation.trim!.from, transformation.trim!.to);
                    break;
            }
        }
    
        const ffmpeg = ffmpegRef.current;
        const data = await ffmpeg.readFile(`input.${format}`);
        const videoURL = URL.createObjectURL(new Blob([data], { type: `video/${format}` }));
        setSourceVideoURL(videoURL);
        setIsTransformComplete(true);
    }

    const VideoPlayer = ({isUnplayable}: {isUnplayable: boolean}) => {
        return (
            <Styles.VideoOverlay $isUnplayable={isUnplayable}>
                <video ref={videoRef} controls src={sourceVideoURL!} />
                {isUnplayable && <div style={{position: "absolute"}}>Unplayable</div>}
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
                        sourceVideoURL={sourceVideoURL!}
                    />
                    <Flex style={{ flexDirection: "column" }}>
                        <Flex style={{padding: "1rem"}}>
                            <Flex style={{ flexDirection: "column" }}>
                                <VideoPlayer isUnplayable={isUnplayable} />
                                <Styles.StepsContainer>
                                    <Step 
                                        completed={transformations.length > 0} clickHandler={openModal}
                                        completedText='Added a Transformation' text='Add a Transformation'
                                        svg={
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0S" viewBox="0 0 1024 1024" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8Z"/>
                                                <path d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z"/>
                                            </svg>
                                        }
                                    />
                                    <Step
                                        completed={isTransformComplete} clickHandler={transform}
                                        svg={
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0v1.829Zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707L14 2.707ZM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707L7.293 4Zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1h1.829Zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1h1.829ZM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707L13.293 10ZM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0v1.829Zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0L8.354 9.06Z"/>
                                            </svg>
                                        }
                                        text='Transform video' completedText='Processed!'
                                    />
                                    <Step
                                        completed={isDownloaded} clickHandler={downloadVideo}
                                        text='Download' completedText='Downloaded'
                                        svg={
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4.75 17.25a.75.75 0 0 1 .75.75v2.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V18a.75.75 0 0 1 1.5 0v2.25A1.75 1.75 0 0 1 18.25 22H5.75A1.75 1.75 0 0 1 4 20.25V18a.75.75 0 0 1 .75-.75Z"/>
                                                <path d="M5.22 9.97a.749.749 0 0 1 1.06 0l4.97 4.969V2.75a.75.75 0 0 1 1.5 0v12.189l4.97-4.969a.749.749 0 1 1 1.06 1.06l-6.25 6.25a.749.749 0 0 1-1.06 0l-6.25-6.25a.749.749 0 0 1 0-1.06Z"/>
                                            </svg>
                                        }
                                    />
                                    <Styles.StepsLine />
                                </Styles.StepsContainer>
                            </Flex>
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
                                    <GitHubSVG />
                                </a>
                            </Styles.IconsContainer>
                        </Styles.MessageContainer>
                    </Flex>
                </React.Fragment>
            ) : (
                <Styles.HeadingContainer>
                    <h1>Hey 👋,</h1>
                    <h3>g
                        Welcome to the video-editor where <i>your files are not uploaded anywhere!</i> ✨
                    </h3>
                    <Styles.LandingPageInputContainer>
                        <Styles.StyledLink href={"https://github.com/Yug34/wasm-video-editor/raw/master/public/bunnymp4.mp4"} rel={"noreferrer"}>
                            Download a sample video
                        </Styles.StyledLink>
                        <Styles.Separator>|</Styles.Separator>
                        <Styles.StyledLabel htmlFor="file-upload" className="custom-file-upload">{video ? "Loading ffmpeg" : "Add a video to start"}</Styles.StyledLabel>
                        <input
                            style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                            onChange={initialize}
                        />
                    </Styles.LandingPageInputContainer>
                    <Styles.InfoContainer>
                        <Styles.InfoCard>
                            <Styles.InfoHeading>How does it work?</Styles.InfoHeading>
                            <div>The video you add here is kept only with you, and never sent to a server anywhere.</div>
                            <div>The edits occur on your computer locally through WebAssembly.</div>
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