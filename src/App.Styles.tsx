import styled from "styled-components";
import {Flex} from "./components/common";
import React from "react";

export const StyledLabel = styled.label`
  color: white;
  cursor: pointer;
  border: 1px solid white;
  border-radius: 12px;
  padding: 1rem;

  &:hover {
    background: #333333;
  }
`;

export const VideoOverlay = styled.div`
  width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

export const MessageContainer = styled.div`
  position: relative;
  margin-top: 1rem;
  border-top: 1px solid white;
  column-gap: 12px;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 2rem 3rem;
`;

export const IconsContainer = styled.div`
  display: flex;
  column-gap: 8px;
  position: absolute;
  color: white;
  right: 2rem;
  padding: 1rem;
`;

export const TransformationsContainer = styled(Flex)`
  text-align: center;
  flex-direction: column;
  padding: 1rem 0 1rem 1rem;
  row-gap: 1rem;
  justify-content: space-between;
  width: 300px;
  min-width: 300px;
  height: 100%;
  border-left: 1px solid white;
`;

export const StepsContainer = styled(Flex)`
  margin-top: auto;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 20px;
`;

export const Step = styled.div<{$completed?: boolean}>`
  margin: 0 auto;
  display: flex;
  height: 4rem;
  column-gap: 8px;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 1rem;
  border-radius: 1rem;
  border: ${(props) => props.$completed ? "2px solid white" : "1px solid #666666"};
  cursor: ${(props) => props.$completed ? "default" : "pointer"};
`;

export const StepsLine = styled.div`
  background: white; 
  height: 1px;
  width: 80%;
  position: absolute;
`;

export const GHSvg = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
    </svg>
);

export const HeadingContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  h1 {
    margin: 0 0 0.5rem 0;
  }
  
  h3 {
    font-weight: 500;
  }
`;

export const EmptyTransformationsContainer = styled.div`
  cursor: pointer;
  border: 1px solid #999999;
  padding: 1rem;
  border-radius: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover, &:hover div, &:hover svg {
    background: #333333;
  }
`;

export const InfoContainer = styled(Flex)`
  height: fit-content;
  border-top: 1px solid white;
  max-width: 750px;
  margin-top: 1.5rem;
  padding: 1rem;
`;

export const InfoLine = styled.div`
  height: 100%;
  background: white;
  width: 1px;
  margin: 0 1rem;
`;

export const InfoCard = styled(Flex)`
  flex-direction: column;
  height: fit-content;
  align-items: center;
  row-gap: 0.5rem;
`;

export const InfoHeading = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-style: italic;
`;