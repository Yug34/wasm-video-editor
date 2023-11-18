import React, {SetStateAction, useEffect, useRef, useState} from "react";
import * as Styles from "./Modal.styles";
import {Codec, Format, Transformation, TransformationTypes} from "../../types";
import {FORMAT_NAMES, FORMATS, TRANSFORMATION_NAMES} from "../../contants";
import {StyledButton} from "../../App";
import {
    roundFloat,
    VideoDurationWrapper
} from "../../utils";

type ModalProps = {
    videoDuration: VideoDurationWrapper;
    isModalOpen: boolean;
    videoFormat: Format;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transformations: Transformation[];
    setTransformations: React.Dispatch<SetStateAction<Transformation[]>>;
    sourceVideoURL: string;
}

interface CommandProps {
    ffmpegCommand: string;
}

const Command = ({ffmpegCommand}: CommandProps) => {
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

const Modal = ({ videoDuration, isModalOpen, setIsModalOpen, transformations, setTransformations, videoFormat, sourceVideoURL }: ModalProps) => {
    const [currentTransformation, setCurrentTransformation] = useState<TransformationTypes>("Convert");
    const [videoConvertFormat, setVideoConvertFormat] = useState<Format>(FORMAT_NAMES.filter(format => format !== videoFormat)[0] as Format);
    const [videoConvertCodec, setVideoConvertCodec] = useState<Codec>(FORMATS[videoConvertFormat].codecs[0] as Codec);
    
    const [trimFromPercent, setTrimFromPercent] = useState<number>(30.00);
    const [trimToPercent, setTrimToPercent] = useState<number>(60.00);
    const [trimThumbnailPercent, setTrimThumbnailPercent] = useState<number>(45.00);

    const inputRefFrom = useRef<HTMLInputElement | null>(null);
    const inputRefTo = useRef<HTMLInputElement | null>(null);
    const inputRefThumbnail = useRef<HTMLInputElement | null>(null);

    const thumbnailVideoRef = useRef<HTMLVideoElement>(null);

    const checkTransformationsArrayFor = (trType: TransformationTypes): boolean => {
        for (const transformation of transformations) {
            if (transformation.type === trType) {
                return true;
            }
        }

        return false;
    };

    useEffect(() => {
        setVideoConvertCodec(FORMATS[videoConvertFormat].codecs[0] as Codec);
    }, [videoConvertFormat]);

    const addTransformation = (transformation: Transformation) => {
        setTransformations(prevTransformations => [...prevTransformations, transformation])
    }

    const removeTransformation = (e: React.MouseEvent<HTMLDivElement>, transformationType: TransformationTypes) => {
        e.stopPropagation();
        setTransformations(prevTransformations => prevTransformations.filter((transformation) => transformation.type !== transformationType));
    }    

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleTrimFromChange = (e: any) => {
        const inputValue = parseFloat(e.target.value);
        const value = Math.min(inputValue, trimToPercent - 1);

        if (trimThumbnailPercent < value) {
            setTrimThumbnailPercent(value + 0.01);
        }

        setTrimFromPercent(value);
    }

    const handleTrimToChange = (e: any) => {
        const inputValue = parseFloat(e.target.value);
        const value = Math.max(inputValue, trimFromPercent + 1);

        if(trimThumbnailPercent > value) {
            setTrimThumbnailPercent(value - 0.01);
        }

        setTrimToPercent(value);
    }

    const handleTrimThumbChange = (e: any) => {
        const inputValue = parseFloat(e.target.value);
        const value = Math.min(Math.max(inputValue, trimFromPercent + 0.01), trimToPercent - 0.01);

        const videoDurationInSeconds = videoDuration.toSeconds();
        thumbnailVideoRef.current!.currentTime = videoDurationInSeconds * (value / 100);

        setTrimThumbnailPercent(value);
    }

    const addTrimTransformation = () => {
        const toSeconds = (trimToPercent/100) * videoDuration.toSeconds();
        const toTimeStamp = VideoDurationWrapper.fromSeconds(toSeconds);

        const fromSeconds = (trimFromPercent/100) * videoDuration.toSeconds();
        const fromTimeStamp = VideoDurationWrapper.fromSeconds(fromSeconds);

        addTransformation({
            type: "Trim",
            trim: {
                from: fromTimeStamp,
                to: toTimeStamp
            }
        });
    };

    const getModalViews = (transformationType: TransformationTypes) => {
        switch (transformationType) {
            case "Convert":
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
            case "Grayscale":
                return (
                    <>
                        <StyledButton onClick={() => addTransformation({type: "Grayscale"})}>Add Grayscale</StyledButton>
                        <Command ffmpegCommand={`ffmpeg -i input.${videoFormat} -vf format=gray output.${videoFormat}`}/>
                    </>
                );
            case "Mute":
                return (
                    <>
                        <StyledButton onClick={() => addTransformation({type: "Mute"})}>Mute Video</StyledButton>
                        <Command ffmpegCommand={`ffmpeg -i input.${videoFormat} -vcodec copy -an output.${videoFormat}`}/>
                    </>
                );
            case "Trim":
                return (
                    <>
                        <Styles.TrimVideoContainer>
                            <Styles.TrimVideoPreview controls ref={thumbnailVideoRef} src={sourceVideoURL+"#t=,2"} />
                        </Styles.TrimVideoContainer>
                        <Styles.SliderContainer>
                            <Styles.Slider>
                                <Styles.EmptyBar style={{width: `${trimFromPercent + 1}%`, left: "0"}}/>
                                <Styles.EmptyBar style={{width: `${100 - trimToPercent}%`, right: "0", top: "-1px"}}/>
                                <Styles.RangeBar id="range" style={{left: `${trimFromPercent + (trimFromPercent / 100)}%`, right: `${100 - trimToPercent}%`}}/>
                                <Styles.Thumb style={{left: `calc(${trimFromPercent - 1}% + ${14 * (100 - trimFromPercent)/100}px)`}}/>
                                <Styles.Thumb style={{left: `calc(${trimToPercent}% + ${14 * (100 - trimToPercent)/100}px)`}}/>
                                <Styles.Thumb style={{left: `calc(${trimThumbnailPercent}% + ${14 * (100 - trimThumbnailPercent)/100}px)`}}/>
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
        }
    };

    return isModalOpen ? (
        <Styles.ModalContainer onClick={closeModal}>
            <Styles.ModalContentContainer onClick={(e) => {
                e.stopPropagation();
            }}>
                <Styles.ModalCloseCTA onClick={closeModal}>Close</Styles.ModalCloseCTA>
                <Styles.TransformationsContainer>
                    {TRANSFORMATION_NAMES.map((transformation, index) => (
                        <React.Fragment key={transformation}>
                            <Styles.TransformationOption
                                $isFirst={index === 0}
                                $selected={currentTransformation === transformation} 
                                onClick={() => setCurrentTransformation(transformation)}
                            >
                                {transformation}
                                {checkTransformationsArrayFor(transformation) && (
                                    <Styles.RemoveTransformationCTA
                                        $selected={currentTransformation === transformation}
                                        onClick={(e) => removeTransformation(e, transformation)}
                                    >
                                        Remove
                                    </Styles.RemoveTransformationCTA>
                                )}
                            </Styles.TransformationOption>
                            <Styles.Line/>
                        </React.Fragment>
                    ))}
                </Styles.TransformationsContainer>
                <Styles.ModalView>{getModalViews(currentTransformation)}</Styles.ModalView>
            </Styles.ModalContentContainer>
        </Styles.ModalContainer>
    ) : (
        <></>
    );
};

export default Modal;
