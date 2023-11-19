import styled from "styled-components";
import {Flex} from "../common";

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
  height: 100%;
  margin: 0 auto;
  padding: 20px;
  border: ${(props) => props.$isUnplayable ? "1px solid white" : "none"};
  border-radius: 1rem;

  @media (max-width: 1024px) {
    width: 100%;
    height: auto;
  }

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

  @media(max-width: 1024px) {
    display: none;
  }
`;

export const StepsContainer = styled(Flex)`
  margin-top: auto;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 20px;

  @media(max-width: 768px) {
    flex-direction: column;
    row-gap: 2rem;
    margin-top: 0;
    height: auto;
  }
`;

export const Step = styled.div<{$completed?: boolean; disabled?: boolean;}>`
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
  width: 75%;
  position: absolute;

  @media(max-width: 768px) {
    height: 200px;
    width: 1px;
  }
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

  @media(max-width: 768px) {
    padding: 2rem;
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

  @media(max-width: 768px) {
    margin-top: 2rem;
    flex-direction: column;
    row-gap: 1rem;
    max-width: 90%;
    padding: 2rem 0 0 0;
  }
`;

export const InfoLine = styled.div`
  height: 100%;
  background: white;
  width: 1px;
  margin: 0 1rem;

  @media(max-width: 768px) {
    align-self: center;
    height: 1px;
    width: 90%;
    margin: 0;
  }
`;

export const InfoCard = styled(Flex)`
  flex-direction: column;
  height: fit-content;
  align-items: center;
  row-gap: 0.5rem;
`;

export const LandingPageInputContainer = styled(Flex)`
  height: fit-content;
  justify-content: center;
  align-items: center;
  column-gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    row-gap: 2rem;
  }
`;

export const InfoHeading = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-style: italic;
`;