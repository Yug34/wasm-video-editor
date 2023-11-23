import styled from "styled-components";
import {Flex} from "../common";
import {px2vw} from "../../utils";

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
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ModalView = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
`;

export const CommandHLine = styled.span`
  height: 100%;
  width: 1px;
  background: white;
  margin: 0 1rem;
`;

export const CommandContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: fit-content;
  border: 1px solid white;
  border-radius: 0.5rem;
  height: 2.5rem;
  padding: 0 1rem;
  cursor: pointer;
`;

export const CodeContainer = styled.code`
	border: 1px solid #999999;
	border-radius: 12px;
	padding: 4px 12px;
    margin: 0 8px;
`;

export const ModalCloseCTA = styled.button`
  z-index: 99;
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
  width: clamp(300px, ${px2vw(400)}, 400px);
  border-right: 1px solid white;
  border-radius: 1rem;
  box-shadow: -10px 0 5px 0 rgba(255,255,255,0.15) inset;
  
  @media (max-width: 768px) {
    margin-top: 4rem;
    border-bottom: 1px solid white;
    border-right: none;
    box-shadow: 0 -10px 5px 0 rgba(255,255,255,0.15) inset;
    height: fit-content;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const TransformationOption = styled.div<{$selected: boolean; $isFirst: boolean; $isLast: boolean;}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 1rem;
  background: black;
  padding: 0.75rem 0.5rem;
  cursor: pointer;

  border-top-left-radius: ${(props) => props.$isFirst ? "1rem" : "0"};
  border-top-right-radius: ${(props) => props.$isFirst ? "1rem" : "0"};

  background: ${(props) => props.$selected ? "white" : "transparent"};
  color: ${(props) => props.$selected ? "black" : "white"};

  &:hover {
    background: ${(props) => props.$selected ? "#999999" : "#333333"};
  }

  @media (max-width: 768px) {
    height: 40px;
    width: 100%;
    justify-content: center;
    border-radius: 0; // reset
    border-top-left-radius: ${(props) => props.$isFirst ? "1rem" : "0"};
    border-bottom-left-radius: ${(props) => props.$isFirst ? "1rem" : "0"};

    border-top-right-radius: ${(props) => props.$isLast ? "1rem" : "0"};
    border-bottom-right-radius: ${(props) => props.$isLast ? "1rem" : "0"};
  }
`;

export const RemoveTransformationCTA = styled.div<{$selected: boolean;}>`
  background: ${(props) => props.$selected ? "white" : "black"};
  color: ${(props) => props.$selected ? "black" : "white"};
  border: 1px solid ${(props) => props.$selected ? "black" : "white"};
  padding: 0.5rem;
  border-radius: 12px;

  &:hover {
    background: ${(props) => props.$selected ? "black" : "white"};
    color: ${(props) => props.$selected ? "white" : "black"};
  }
`;

export const Line = styled.div<{$isLast: boolean;}>`
  width: 100%;
  height: 1px;
  background: white;

  @media (max-width: 768px) {
    height: 100%;
    width: 1px;
     display: ${(props) => props.$isLast ? "none" : "block"};
  }
`;

export const EmptyBar = styled.div`
    position: absolute;
    height: 13px;
`;

export const RangeBar = styled.div`
    position: absolute;
    left: 0;
    height: 13px;
    background-color: white;
`;

export const SliderContainer = styled.div`
    width: 100%;
    position: relative;
    height: 15px;
    text-align: left;
    margin-bottom: 2rem;

    & > div > .sign {
        position: absolute;
        margin-left: -19px;
        z-index:3;
        background-color: transparent;
        color: #fff;
        width: 28px;
        height: 28px;
        align-items: center;
        -webkit-justify-content: center;
        justify-content: center;
        text-align: center;
    }
    
    & > div > .sign > span {
        font-size: 14px;
        line-height: 24px;
    }
`;

export const Slider = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    height: 14px;
    border: 1px solid white;
`;

export const Thumb = styled.span`
    position: absolute;
    top: -7px;
    z-index: 2;
    height: 28px;
    width: 12px;
    text-align: left;
    margin-left: -11px;
    background-color: black;
    border: 1px solid white;
    outline: none;
`;

export const SliderInput = styled.input`
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

    &::-ms-track {
        -webkit-appearance: none;
        background: transparent;
        color: transparent;
    }
  
    &::-moz-range-track {
        -moz-appearance: none;
        background: transparent;
        color: transparent;
    }
  
    &:focus::-webkit-slider-runnable-track {
        background: transparent;
        border: transparent;
    }
    
    &:focus {
        outline: none;
    }
    
    &::-ms-thumb {
        pointer-events: all;
        width: 12px;
        height: 28px;
        border-radius: 0;
        border: 0 none;
        background: red;
        cursor: pointer;
    }
    
    &::-moz-range-thumb {
        pointer-events: all;
        width: 12px;
        height: 28px;
        border-radius: 0;
        border: 0 none;
        background: red;
        cursor: pointer;
    }
    
    &::-webkit-slider-thumb {
        pointer-events: all;
        width: 12px;
        height: 28px;
        border-radius: 0;
        border: 0 none;
        background: red;
        -webkit-appearance: none;
        cursor: pointer;
    }
    
    &::-ms-fill-lower {
        background: transparent;
        border: 0 none;
    }
    
    &::-ms-fill-upper {
        background: transparent;
        border: 0 none;
    }
    
    &::-ms-tooltip {
        display: none;
    }
`;

export const ConvertSelect = styled.select`
  border: 1px solid #999999;
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  
  outline: none;
  
  &:focus {
    border: 1px solid white;
  }
`;
export const ConvertSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  row-gap: 1rem;
`;

export const ConvertSelectDescription = styled(Flex)`
  column-gap: 1rem;
  align-items: center;
`;

export const TrimVideoContainer = styled(Flex)`
  margin-bottom: 2rem;
  width: auto;
  row-gap: 2rem;
  flex-direction: column;
`;

export const TrimVideoPreview = styled.video`
  width: 100%;
  height: 100%;
`;