import styled from "styled-components";
import {Flex} from "../common";

export const ModalContainer = styled(Flex)`
  flex-direction: column;
  position: absolute;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  width: 100%;
  height: 100%;
`;

export const ModalContentContainer = styled(Flex)`
  position: relative;
  flex-direction: row;
  justify-content: flex-start;
  column-gap: 2rem;
  align-items: center;
  box-shadow: rgb(153, 153, 153) 0 0 15px;
  width: 90%;
  height: 90%;
  border-radius: 12px;
  border: 1px solid white;
  padding: 2rem;
`;

export const ModalView = styled(Flex)`
  flex-direction: column;
  width: auto;
  padding: 4rem 2rem;
`;

export const CodeContainer = styled.code`
	border: 1px solid #999999;
	border-radius: 12px;
	padding: 4px 12px;
    margin: 0 8px;
`;

export const ModalCloseCTA = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  border: 1px solid white;
  box-shadow: rgb(153, 153, 153) 0 0 15px;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #333333;
  }
`;

export const TransformationsContainer = styled(Flex)`
  flex-direction: column;
  width: 400px;
  border-right: 1px solid white;
`;

export const TransformationOption = styled.div`
  display: flex;
  column-gap: 1rem;
  background: black;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  
  &:hover {
    background: #333333;
  }
`;

export const Arrow = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
);

export const TransformationMenuOptions = styled.div`
  background: inherit;
  display: flex;
  column-gap: 12px;
  align-items: center;
  justify-content: center;
  
  svg {
    background: inherit;
  }
`;

export const Line = styled.div`
  width: 100%;
  height: 1px;
  background: white;
`;