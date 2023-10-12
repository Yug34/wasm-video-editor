import { fetchFile } from '@ffmpeg/util';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import {StyledButton} from "../App";
import styled from "styled-components";

const StyledLabel = styled.label`
  color: white;
  cursor: pointer;
  border: 1px solid white;
  border-radius: 12px;
  padding: 1rem;

  &:hover {
    background: #333333;
  }
`;

type EditorProps = {
    ffmpeg: any;
};

const Editor = ({ffmpeg}: EditorProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [video, setVideo] = useState<Uint8Array | null>(null);

    useEffect(() => {
        // @ts-ignore
        ffmpeg.on('log', ({ message }) => {
            messageRef.current!.innerHTML = message;
            console.log(message);
        });
    }, []);

    const transcode = async () => {
        await ffmpeg.writeFile('input.webm', video!);
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data: FileData = await ffmpeg.readFile('output.mp4');
        videoRef.current!.src = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
    }

    return (
        <div>
            {video ? (
                <>
                    <video ref={videoRef} controls />
                    <StyledButton onClick={transcode}>Transcode webm to mp4</StyledButton>
                    <p ref={messageRef}></p>
                </>
            ) : (
                <>
                    <StyledLabel htmlFor="file-upload" className="custom-file-upload">Custom Upload</StyledLabel>
                    <input style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef} onChange={async (e: ChangeEvent) => {
                        console.log("Uploaded video");
                        setVideo(await fetchFile((e.target as HTMLInputElement)!.files![0]));
                    }}/>
                </>
            )}
        </div>
    );
}

export default Editor;