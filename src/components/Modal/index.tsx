import React from "react";
import * as Styles from "./Modal.styles";

type ModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal = (props: ModalProps) => {
    const { isModalOpen, setIsModalOpen } = props;

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
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                    <Styles.Line/>
                    <Styles.TransformationOption>Hey</Styles.TransformationOption>
                </Styles.TransformationsContainer>
            </Styles.ModalContentContainer>
        </Styles.ModalContainer>
    ) : (
        <></>
    );
};

export default Modal;