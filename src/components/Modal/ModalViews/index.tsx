import * as Styles from "../Modal.styles";
import {Codec, Format, Transformation} from "../../../types";
import {FORMAT_NAMES, FORMATS} from "../../../constants";
import {StyledButton} from "../../../App";
import React, {useState} from "react";
import {VideoDurationWrapper} from "../../../utils";

interface ConvertVideoViewProps {
    videoFormat: Format;
    videoConvertFormat: Format;
    setVideoConvertFormat: React.Dispatch<React.SetStateAction<Format>>;
    setVideoConvertCodec: React.Dispatch<React.SetStateAction<Codec>>;
    videoConvertCodec: Codec;
    addTransformation(transformation: Transformation): void;
}

export const ConvertVideoView = (props: ConvertVideoViewProps) => {
    const {
        videoFormat,
        videoConvertFormat,
        setVideoConvertFormat,
        setVideoConvertCodec,
        videoConvertCodec,
        addTransformation
    } = props;

    return (
        <>
            <div>
                Convert video from
                <Styles.CodeContainer>.{videoFormat}</Styles.CodeContainer>
                to:
                <select
                    value={videoConvertFormat}
                    onChange={e => {setVideoConvertFormat(e.target.value as Format)}}
                >
                    {FORMAT_NAMES.filter(format => format !== videoFormat).map(format => (
                        <option key={format} value={format}>.{format}</option>
                    ))}
                </select>
                <select
                    value={videoConvertCodec}
                    onChange={e => {setVideoConvertCodec(e.target.value as Codec)}}
                >
                    {FORMATS[videoConvertFormat].codecs.map(codec => (
                        <option key={codec} value={codec}>{codec}</option>
                    ))}
                </select>
            </div>

            <StyledButton onClick={() => addTransformation({type: "Convert", transcode: {to: videoConvertFormat, codec: videoConvertCodec}})}>Convert</StyledButton>
        </>
    );
};

interface CommandProps {
    ffmpegCommand: string;
}

export const Command = ({ffmpegCommand}: CommandProps) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    return (
        <Styles.CommandContainer onClick={() => {
            navigator.clipboard.writeText(ffmpegCommand).then(() => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 3000);
            });
        }}>
            <div>Command</div>
            <Styles.CommandHLine />
            <code>{ffmpegCommand}</code>
            <Styles.CommandHLine />
            {!isCopied ? (
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 32 32" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 4 4 L 4 24 L 11 24 L 11 22 L 6 22 L 6 6 L 18 6 L 18 7 L 20 7 L 20 4 Z M 12 8 L 12 28 L 28 28 L 28 8 Z M 14 10 L 26 10 L 26 26 L 14 26 Z"/>
                </svg>
            ) : (
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                </svg>
            )}
        </Styles.CommandContainer>
    );
};

interface GrayscaleViewProps {
    addTransformation(transformation: Transformation): void
    videoFormat: Format;
}

export const GrayscaleView = (props: GrayscaleViewProps) => {
    const {addTransformation, videoFormat} = props;

    return (
        <>
            <Command ffmpegCommand={`ffmpeg -i input.${videoFormat} -vf format=gray output.${videoFormat}`}/>
            <StyledButton onClick={() => addTransformation({type: "Grayscale"})}>Add Grayscale</StyledButton>
        </>
    );
};

interface MuteViewProps {
    addTransformation(transformation: Transformation): void
    videoFormat: Format;
}

export const MuteView = (props: MuteViewProps) => {
    const {addTransformation, videoFormat} = props;

    return (
        <>
            <Command ffmpegCommand={`ffmpeg -i input.${videoFormat} -vcodec copy -an output.${videoFormat}`}/>
            <StyledButton onClick={() => addTransformation({type: "Mute"})}>Mute Video</StyledButton>
        </>
    )
}

interface TrimViewProps {
    sourceVideoURL: string;
    videoDuration: VideoDurationWrapper;
    trimFromPercent: number;
    trimToPercent: number;
    thumbnailVideoRef: React.Ref<HTMLVideoElement>;
    trimThumbnailPercent: number;
    inputRefFrom: React.Ref<HTMLInputElement>;
    inputRefTo: React.Ref<HTMLInputElement>;
    inputRefThumbnail: React.Ref<HTMLInputElement>;
    addTrimTransformation(): void;
    handleTrimFromChange(e: any): void;
    handleTrimToChange(e: any): void;
    handleTrimThumbChange(e: any): void;
}

export const TrimView = (props: TrimViewProps) => {
    const {
        sourceVideoURL,
        videoDuration,
        trimFromPercent,
        trimToPercent,
        thumbnailVideoRef,
        trimThumbnailPercent,
        inputRefFrom,
        inputRefTo,
        inputRefThumbnail,
        addTrimTransformation,
        handleTrimFromChange,
        handleTrimToChange,
        handleTrimThumbChange
    } = props;

    return (
        <>
            <Styles.TrimVideoContainer>
                <Styles.TrimVideoPreview controls ref={thumbnailVideoRef} src={sourceVideoURL+`#t=${videoDuration.toTimeStampAtPercent(trimFromPercent)},${videoDuration.toTimeStampAtPercent(trimToPercent)}`} />
            </Styles.TrimVideoContainer>
            <Styles.SliderContainer>
                <Styles.Slider>
                    <Styles.EmptyBar style={{width: `${trimFromPercent + 1}%`, left: "0"}}/>
                    <Styles.EmptyBar style={{width: `${100 - trimToPercent}%`, right: "0", top: "-1px"}}/>
                    <Styles.RangeBar id="range" style={{left: `${trimFromPercent + (trimFromPercent / 100)}%`, right: `${100 - trimToPercent}%`}}/>
                    <Styles.Thumb style={{left: `calc(${trimFromPercent - 1}% + ${14 * (100 - trimFromPercent)/100}px)`}}/>
                    <Styles.Thumb style={{left: `calc(${trimToPercent}% + ${14 * (100 - trimToPercent)/100}px)`}}/>
                    <Styles.Thumb style={{left: `calc(${trimThumbnailPercent - 0.5}% + ${14 * (100 - trimThumbnailPercent)/100}px)`, background: "red"}}/>
                    <div className="sign" style={{left: `calc(${trimFromPercent}% + ${14 * (100 - trimFromPercent)/100}px)`, top: "-31px"}}>
                        <span id="value">{videoDuration.toShortStringAtPercent(trimFromPercent)}</span>
                    </div>
                    <div className="sign" style={{left: `calc(${trimToPercent}% + ${14 * (100 - trimToPercent)/100}px)`, top: "28px"}}>
                        <span id="value">{videoDuration.toShortStringAtPercent(trimToPercent)}</span>
                    </div>
                    <div className="sign" style={{left: `calc(${trimThumbnailPercent}% + ${14 * (100 - trimThumbnailPercent)/100}px)`, top: "28px"}}>
                        <span id="value">{videoDuration.toShortStringAtPercent(trimThumbnailPercent)}</span>
                    </div>
                </Styles.Slider>

                <Styles.SliderInput
                    type="range" max="100" min="0" step=".01"
                    ref={inputRefFrom} value={trimFromPercent}
                    onChange={handleTrimFromChange}
                />

                <Styles.SliderInput
                    type="range" max="100" min="0" step=".01"
                    ref={inputRefTo} value={trimToPercent}
                    onChange={handleTrimToChange}
                />

                <Styles.SliderInput
                    type="range" max="100" min="0" step=".01"
                    ref={inputRefThumbnail} value={trimThumbnailPercent}
                    onChange={handleTrimThumbChange}
                />
            </Styles.SliderContainer>

            <StyledButton onClick={addTrimTransformation}>Trim</StyledButton>
        </>
    );
};

