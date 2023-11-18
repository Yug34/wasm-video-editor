import { VideoDuration } from "./types";

//TODO: Probably a better idea to just have a VideoDuration class instead of this:

class VideoDurationWrapper {
    constructor(public hours: number, public minutes: number, public seconds: number) {}

    static fromSeconds(timeInSeconds: number): VideoDurationWrapper {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        return new VideoDurationWrapper(hours, minutes, seconds);
    }

    toSeconds(): number {
        return this.hours * 3600 + this.minutes * 60 + this.seconds;
    }

    toString(): string {
        const hh = this.hours < 10 ? `0${this.hours}` : `${this.hours}`;
        const mm = this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
        const ss = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;

        return `${hh}:${mm}:${ss}`;
    }

    toStringAtPercent(percentage: number): string {
        const videoDurationAtPercent = VideoDurationWrapper.fromSeconds(this.toSeconds() * (percentage / 100));

        return videoDurationAtPercent.toString();
    }

    static subtract(to: VideoDurationWrapper, from: VideoDurationWrapper): VideoDuration {
        const fromInSeconds = from.toSeconds();
        const toInSeconds = to.toSeconds();

        const difference = toInSeconds - fromInSeconds;

        return VideoDurationWrapper.fromSeconds(difference);
    }
}

export const getVideoDurationInSeconds = (videoDuration: VideoDuration): number => {
    return videoDuration.hours * 3600 + videoDuration.minutes * 60 + videoDuration.seconds;
};

export const getVideoDurationFromSeconds = (timeInSeconds: number): VideoDuration => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
};

export const getVideoDurationAsString = (videoDuration: VideoDuration) => {
    const hh = videoDuration.hours < 10 ? `0${videoDuration.hours}` : `${videoDuration.hours}`;
    const mm = videoDuration.minutes < 10 ? `0${videoDuration.minutes}` : `${videoDuration.minutes}`;
    const ss = videoDuration.seconds < 10 ? `0${videoDuration.seconds}` : `${videoDuration.seconds}`;

    return `${hh}:${mm}:${ss}`;
}

export const subtractVideoDuration = (to: VideoDuration, from: VideoDuration) => {
    const fromInSeconds = getVideoDurationInSeconds(from)
    const toInSeconds = getVideoDurationInSeconds(to)

    const difference = toInSeconds - fromInSeconds;

    return getVideoDurationFromSeconds(difference);
}

export const roundFloat = (num: number) => (Math.round(num * 100) / 100).toFixed(2);
