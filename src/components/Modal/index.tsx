import React, {SetStateAction, useEffect, useRef, useState} from "react";
import * as Styles from "./Modal.styles";
import {Codec, Format, Transformation, TransformationTypes} from "../../types";
import {FORMAT_NAMES, FORMATS, TRANSFORMATION_NAMES} from "../../contants";
import {StyledButton} from "../../App";
import styled from "styled-components";

const Slider = styled.div`
    width: 400px;
    position: relative;
    height: 14px;
    border-radius: 10px;
    text-align: left;
    margin-bottom: 100px;

    & > div {
        position: absolute;
        left: 13px;
        right: 15px;
        height: 14px;
    }

    & > div > #inverse-left {
        position: absolute;
        left: 0;
        height: 14px;
        background-color: #CCC;
    }

    & > div > #inverse-right {
        position: absolute;
        right: 0;
        height: 14px;
        background-color: #CCC;
    }

    & > div > #range {
        position: absolute;
        left: 0;
        height: 14px;
        background-color: #1ABC9C;
    }

    & > div > .thumb {
        position: absolute;
        top: -7px;
        z-index: 2;
        height: 28px;
        width: 28px;
        text-align: left;
        margin-left: -11px;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
        background-color: #FFF;
        border-radius: 50%;
        outline: none;
    }

    & > input {
        position: absolute;
        pointer-events: none;
        -webkit-appearance: none;
        z-index: 3;
        height: 14px;
        top: -2px;
        width: 100%;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        filter: alpha(opacity=0);
        -moz-opacity: 0;
        -khtml-opacity: 0;
        opacity: 0;
    }

    & > input::-ms-track {
        -webkit-appearance: none;
        background: transparent;
        color: transparent;
    }
      
    & > input::-moz-range-track {
        -moz-appearance: none;
        background: transparent;
        color: transparent;
    }
      
    & > input:focus::-webkit-slider-runnable-track {
        background: transparent;
        border: transparent;
    }
      
    & > input:focus {
        outline: none;
    }
      
    & > input::-ms-thumb {
        pointer-events: all;
        width: 28px;
        height: 28px;
        border-radius: 0px;
        border: 0 none;
        background: red;
    }
      
    & > input::-moz-range-thumb {
        pointer-events: all;
        width: 28px;
        height: 28px;
        border-radius: 0px;
        border: 0 none;
        background: red;
    }
      
    & > input::-webkit-slider-thumb {
        pointer-events: all;
        width: 28px;
        height: 28px;
        border-radius: 0px;
        border: 0 none;
        background: red;
        -webkit-appearance: none;
    }
      
    & > input::-ms-fill-lower {
        background: transparent;
        border: 0 none;
    }
      
    & > input::-ms-fill-upper {
        background: transparent;
        border: 0 none;
    }
      
    & > input::-ms-tooltip {
        display: none;
    }

    & > div > .sign {
        opacity: 0;
        position: absolute;
        margin-left: -11px;
        top: -39px;
        z-index:3;
        background-color: #1ABC9C;
        color: #fff;
        width: 28px;
        height: 28px;
        border-radius: 28px;
        -webkit-border-radius: 28px;
        align-items: center;
        -webkit-justify-content: center;
        justify-content: center;
        text-align: center;
    }
      
    & > div > .sign:after {
        position: absolute;
        content: '';
        left: 0;
        border-radius: 16px;
        top: 19px;
        border-left: 14px solid transparent;
        border-right: 14px solid transparent;
        border-top-width: 16px;
        border-top-style: solid;
        border-top-color: #1ABC9C;
    }
      
    & > div > .sign > span {
        font-size: 12px;
        font-weight: 700;
        line-height: 28px;
    }
      
    & > div > .sign {
        opacity: 1;
    }
`;

const InputBar = styled.div`

`;

type ModalProps = {
    isModalOpen: boolean;
    videoFormat: Format;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transformations: Transformation[];
    setTransformations: React.Dispatch<SetStateAction<Transformation[]>>;
}

const Modal = (props: ModalProps) => {
    const { isModalOpen, setIsModalOpen, transformations, setTransformations, videoFormat } = props;
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
            case "Trim":
                return (
                    <div style={{width: "100%"}}>
                        <Slider>
                            <InputBar>
                                <div id="inverse-left" style={{width: `${trimFromPercent}%`}}/>
                                <div id="inverse-right" style={{width: `${100 - trimToPercent}%`}}/>
                                <div id="range" style={{left: `${trimFromPercent}%`, right: `${100 - trimToPercent}%`}}/>
                                <span className="thumb" style={{left: `${trimFromPercent}%`}}/>
                                <span className="thumb" style={{left: `${trimToPercent}%`}}/>
                                <div className="sign" style={{left: `${trimFromPercent}%`}}>
                                    <span id="value">{trimFromPercent}</span>
                                </div>
                                <div className="sign" style={{left: `${trimToPercent}%`}}>
                                    <span id="value">{trimToPercent}</span>
                                </div>
                            </InputBar>
                            <input ref={inputRefFrom} type="range" value={trimFromPercent} max="100" min="0" step="1"
                                onChange={(e) => {
                                    const inputValue = parseInt(e.target.value);
                                    const value = Math.min(inputValue, trimToPercent - 1);
                                    setTrimFromPercent(value)
                                }}
                            />
                            
                            <input ref={inputRefTo} type="range" value={trimToPercent} max="100" min="0" step="1" 
                                onChange={(e) => {
                                    const inputValue = parseInt(e.target.value)
                                    const value = Math.max(inputValue, trimFromPercent + 1);
                                    setTrimToPercent(value)
                                }}
                            />
                        </Slider>

                        {/* 
                            // oninput="
                            //     this.value=Math.max(this.value,this.parentNode.childNodes[3].value-(-1));
                            //     var value=(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.value)-(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.min);
                            //     var children = this.parentNode.childNodes[1].childNodes;
                            //     children[3].style.width=(100-value)+'%';
                            //     children[5].style.right=(100-value)+'%';
                            //     children[9].style.left=value+'%';children[13].style.left=value+'%';
                            //     children[13].childNodes[1].innerHTML=this.value;"
                        */}

                        <StyledButton onClick={() => addTransformation({type: "Trim"})}>Trim</StyledButton>
                    </div>
                )
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