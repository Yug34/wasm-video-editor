export type Format = "avi" | "mov" | "mp4" | "webm" | "wmv";

export type FormatInfo = {
    name: string;
    extension: string;
    type: string;
    codecs: Codec[];
}

export type TransformationTypes = "Convert" | "Greyscale";

export type Transformation = {
    type: TransformationTypes;
    to: Format;
}

export type Codec = "h264" | "vp8" | "vp9" | "windows" | "mpeg4";

export type CodecInfo = {
    name: string;
    compressionRange: {
        min: number;
        max: number;
    };
    ffmpegLib: string;
};