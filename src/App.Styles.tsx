import styled from "styled-components";
import {Flex} from "./components/common";

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

export const VideoOverlay = styled.div<{$isUnplayable: boolean}>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: ${(props) => props.$isUnplayable ? "1px solid white" : "none"};
  border-radius: 1rem;

  video {
    opacity: ${(props) => props.$isUnplayable ? "0.5" : "1"};
    width: 100%;
    height: 100%;
    border-radius: 1rem; 
  }
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