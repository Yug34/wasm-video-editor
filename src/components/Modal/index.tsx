import React, {SetStateAction, useEffect, useRef, useState} from "react";
import * as Styles from "./Modal.styles";
import {Codec, Format, Transformation, TransformationTypes, VideoDuration} from "../../types";
import {FORMAT_NAMES, FORMATS, TRANSFORMATION_NAMES} from "../../contants";
import {StyledButton} from "../../App";
import styled from "styled-components";
import { getVideoDurationFromSeconds, getVideoDurationInSeconds } from "../../utils";

type ModalProps = {
    videoDuration: VideoDuration;
    isModalOpen: boolean;
    videoFormat: Format;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transformations: Transformation[];
    setTransformations: React.Dispatch<SetStateAction<Transformation[]>>;
}

const Modal = (props: ModalProps) => {
    const { videoDuration, isModalOpen, setIsModalOpen, transformations, setTransformations, videoFormat } = props;
    const [currentTransformation, setCurrentTransformation] = useState<TransformationTypes>("Convert");
    const [videoConvertFormat, setVideoConvertFormat] = useState<Format>(FORMAT_NAMES.filter(format => format !== videoFormat)[0] as Format);
    const [videoConvertCodec, setVideoConvertCodec] = useState<Codec>(FORMATS[videoConvertFormat].codecs[0] as Codec);
    
    const [trimFromPercent, setTrimFromPercent] = useState(30);
    const [trimToPercent, setTrimToPercent] = useState(60);
    const inputRefFrom = useRef<HTMLInputElement | null>(null);
    const inputRefTo = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setVideoConvertCodec(FORMATS[videoConvertFormat].codecs[0] as Codec);
    }, [videoConvertFormat]);

    const addTransformation = (transformation: Transformation) => {
        console.log(transformation)
        setTransformations(prevTransformations => [...prevTransformations, transformation])
    }

    const closeModal = () => {
        setIsModalOpen(false);
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
            case "Greyscale":
                return (
                    <>
                        <StyledButton onClick={() => addTransformation({type: "Greyscale"})}>Add Greyscale</StyledButton>
                    </>
                );
            case "Mute":
                return (
                    <>
                        <StyledButton onClick={() => addTransformation({type: "Mute"})}>Mute Video</StyledButton>
                    </>
                )
            case "Trim":
                return (
                    <div style={{width: "100%"}}>
                        <Styles.SliderContainer>
                            <Styles.Slider>
                                <Styles.EmptyBar style={{width: `${trimFromPercent}%`, left: "0"}}/>
                                <Styles.EmptyBar style={{width: `${100 - trimToPercent + 1}%`, right: "0", top: "-1px"}}/>
                                <Styles.RangeBar id="range" style={{left: `${trimFromPercent - 1}%`, right: `${100 - trimToPercent + 1}%`}}/>
                                <Styles.Thumb style={{left: `${trimFromPercent}%`}}/>
                                <Styles.Thumb style={{left: `${trimToPercent}%`}}/>
                                <div className="sign" style={{left: `${trimFromPercent}%`}}>
                                    <span id="value">{trimFromPercent}</span>
                                </div>
                                <div className="sign" style={{left: `${trimToPercent}%`}}>
                                    <span id="value">{trimToPercent}</span>
                                </div>
                            </Styles.Slider>
                            <Styles.SliderInput ref={inputRefFrom} type="range" value={trimFromPercent} max="100" min="0" step="1"
                                onChange={(e) => {
                                    const inputValue = parseInt(e.target.value);
                                    const value = Math.min(inputValue, trimToPercent - 1);

                                    setTrimFromPercent(value);
                                }}
                            />
                            
                            <Styles.SliderInput ref={inputRefTo} type="range" value={trimToPercent} max="100" min="0" step="1" 
                                onChange={(e) => {
                                    const inputValue = parseInt(e.target.value)
                                    const value = Math.max(inputValue, trimFromPercent + 1);

                                    setTrimToPercent(value);
                                }}
                            />
                        </Styles.SliderContainer>

                        <StyledButton onClick={() => {
                            const videoLengthInSeconds = getVideoDurationInSeconds(videoDuration);

                            const toSeconds = (trimToPercent/100) * videoLengthInSeconds;
                            const toTimeStamp = getVideoDurationFromSeconds(toSeconds);

                            const fromSeconds = (trimFromPercent/100) * videoLengthInSeconds;
                            const fromTimeStamp = getVideoDurationFromSeconds(fromSeconds);

                            addTransformation({
                                type: "Trim",
                                trim: {
                                    from: fromTimeStamp,
                                    to: toTimeStamp
                                }
                            })
                        }}>Trim</StyledButton>
                    </div>
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
                            <Styles.TransformationOption onClick={() => setCurrentTransformation(transformation)}>
                                {transformation}
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
