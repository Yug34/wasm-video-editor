import { Format, VideoDuration } from "./types";
import { FORMATS } from "./constants";

export class VideoDurationWrapper {
    constructor(public hours: number, public minutes: number, public seconds: number) {}

    static fromVideoDuration(videoDuration: VideoDuration): VideoDurationWrapper {
        const hours = videoDuration.hours;
        const minutes = videoDuration.minutes;
        const seconds = videoDuration.seconds;

        return new VideoDurationWrapper(hours, minutes, seconds);
    }

    static fromSeconds(timeInSeconds: number): VideoDurationWrapper {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        return new VideoDurationWrapper(hours, minutes, seconds);
    }

    toSeconds(): number {
        return this.hours * 3600 + this.minutes * 60 + this.seconds;
    }

    toTimeStamp(): string {
        const hh = this.hours < 10 ? `0${this.hours}` : `${this.hours}`;
        const mm = this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
        const ss = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;

        return `${hh}:${mm}:${ss}`;
    }

    toString(): string {
        const hh = this.hours < 10 ? `0${this.hours}` : `${this.hours}`;
        const mm = this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
        const ss = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;

        if (hh === "00") {
            if (mm === "00") {
                return `${ss}s`
            } else {
                return `${mm}:${ss}`
            }
        } else {
            return `${hh}:${mm}:${ss}`
        }
    }

    toShortString(): string {
        const hh = this.hours < 10 ? `0${this.hours}` : `${this.hours}`;
        const mm = this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
        const ss = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;

        if (hh === "00") {
            if (mm === "00") {
                return `${roundFloat(parseFloat(ss))}s`
            } else {
                return `${mm}:${ss}`
            }
        } else {
            return `${hh}:${mm}:${ss}`
        }
    }

    toShortStringAtPercent(percentage: number): string {
        const videoDurationAtPercent = VideoDurationWrapper.fromSeconds(this.toSeconds() * (percentage / 100));
        return videoDurationAtPercent.toShortString();
    }

    toTimeStampAtPercent(percentage: number): string {
        const videoDurationAtPercent = VideoDurationWrapper.fromSeconds(this.toSeconds() * (percentage / 100));
        return videoDurationAtPercent.toTimeStamp();
    }

    static subtract(to: VideoDuration, from: VideoDuration): VideoDurationWrapper {
        const fromInSeconds = VideoDurationWrapper.fromVideoDuration(from).toSeconds();
        const toInSeconds = VideoDurationWrapper.fromVideoDuration(to).toSeconds();

        const difference = toInSeconds - fromInSeconds;

        return VideoDurationWrapper.fromSeconds(difference);
    }
}

export const roundFloat = (num: number) => (Math.round(num * 100) / 100).toFixed(2);

export const isVideoFormatBrowserCompatible = (videoFormat: Format): boolean => {
    return FORMATS[videoFormat].isPlayable;
}

export const px2vw = (size: number, width: number = 1920) =>
    `${(size / width) * 100}vw`;
export const px2vh = (size: number, height: number = 1080) =>
    `${(size / height) * 100}vh`;