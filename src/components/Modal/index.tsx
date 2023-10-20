import React, {SetStateAction, useState} from "react";
import * as Styles from "./Modal.styles";
import {Transformation, TransformationTypes} from "../../types";

type ModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transformations: Transformation[];
    setTransformations: React.Dispatch<SetStateAction<Transformation[]>>;
}

const Modal = (props: ModalProps) => {
    const { isModalOpen, setIsModalOpen, transformations, setTransformations } = props;
    const [currentTransformation, setCurrentTransformation] = useState<TransformationTypes>("Convert");

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
                    <Styles.TransformationOption onClick={() => addTransformation({type: "Convert", to: "mp4"})}>
                        Convert
                    </Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                </Styles.TransformationsContainer>
                <Styles.ModalView></Styles.ModalView>
            </Styles.ModalContentContainer>
        </Styles.ModalContainer>
    ) : (
        <></>
    );
};

export default Modal;