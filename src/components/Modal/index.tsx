import React, {SetStateAction, useEffect, useState} from "react";
import * as Styles from "./Modal.styles";
import {Codec, Format, Transformation, TransformationTypes} from "../../types";
import {CODEC_NAMES, FORMAT_NAMES, FORMATS, TRANSFORMATION_NAMES} from "../../contants";
import {CodeContainer} from "./Modal.styles";
import {StyledButton} from "../../App";

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

    useEffect(() => {
        setVideoConvertCodec(FORMATS[videoConvertFormat].codecs[0] as Codec);
    }, [videoConvertFormat]);

    const addTransformation = (transformation: Transformation) => {
        setTransformations(prevTransformations => [...prevTransformations, transformation])
    }

    const closeModal = () => {
        setIsModalOpen(false);
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
                <Styles.ModalView>
                    {currentTransformation === "Convert" && (
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
                    )}
                    {currentTransformation === "Greyscale" && <div>Greyscale</div>}
                </Styles.ModalView>
            </Styles.ModalContentContainer>
        </Styles.ModalContainer>
    ) : (
        <></>
    );
};

export default Modal;