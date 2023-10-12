// let users apply filters and so on in a layered (?) way
// so basically steps through different transformations and applies all the effects sequentially
// i think just load ffmpeg when they click on upload video

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useRef, useState } from "react";
import Editor from "./components/Editor";
import styled from "styled-components";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: black;
  color: white;
`;

export const StyledButton = styled.button`
  background: black;
  color: white;
  cursor: pointer;
  border: 1px solid white;
  border-radius: 12px;
  padding: 1rem;
  
  &:hover {
    background: #333333;
  }
`;

const App = () => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef(new FFmpeg());

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        const ffmpeg = ffmpegRef.current;

        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });

        setLoaded(true);
    }

    return (
      <Layout>
        {loaded ? (
            <Editor ffmpeg={ffmpegRef.current}/>
        ) : (
            <StyledButton onClick={load}>
                Load ffmpeg
            </StyledButton>
        )}
      </Layout>
  );
}

export default App;