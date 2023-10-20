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
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  box-shadow: rgb(153, 153, 153) 0 0 15px;
  width: 90%;
  height: 90%;
  border-radius: 12px;
  border: 1px solid white;
  padding: 2rem;
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
  background: black;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  
  &:hover {
    background: #333333;
  }
`;

export const Line = styled.div`
  width: 100%;
  height: 1px;
  background: white;
`;