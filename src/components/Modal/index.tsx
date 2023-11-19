import React, {SetStateAction, useEffect, useRef, useState} from "react";
import * as Styles from "./Modal.styles";
import {Codec, Format, Transformation, TransformationTypes} from "../../types";
import {FORMAT_NAMES, FORMATS, TRANSFORMATION_NAMES} from "../../constants";
import * as ModalView from "./ModalViews";
import { VideoDurationWrapper } from "../../utils";

type ModalProps = {
    videoDuration: VideoDurationWrapper;
    isModalOpen: boolean;
    videoFormat: Format;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transformations: Transformation[];
    setTransformations: React.Dispatch<SetStateAction<Transformation[]>>;
    sourceVideoURL: string;
}

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
                    <ModalView.ConvertVideoView
                        videoFormat={videoFormat}
                        videoConvertFormat={videoConvertFormat}
                        videoConvertCodec={videoConvertCodec}
                        addTransformation={addTransformation}
                        setVideoConvertCodec={setVideoConvertCodec}
                        setVideoConvertFormat={setVideoConvertFormat}
                    />
                );
            case "Grayscale":
                return <ModalView.GrayscaleView addTransformation={addTransformation} videoFormat={videoFormat} />
            case "Mute":
                return <ModalView.MuteView addTransformation={addTransformation} videoFormat={videoFormat} />
            case "Trim":
                return (
                    <ModalView.TrimView
                        sourceVideoURL={sourceVideoURL}
                        videoDuration={videoDuration}
                        trimFromPercent={trimFromPercent}
                        trimToPercent={trimToPercent}
                        thumbnailVideoRef={thumbnailVideoRef}
                        trimThumbnailPercent={trimThumbnailPercent}
                        inputRefFrom={inputRefFrom}
                        inputRefTo={inputRefTo}
                        inputRefThumbnail={inputRefThumbnail}
                        addTrimTransformation={addTrimTransformation}
                        handleTrimFromChange={handleTrimFromChange}
                        handleTrimToChange={handleTrimToChange}
                        handleTrimThumbChange={handleTrimThumbChange}
                    />
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
