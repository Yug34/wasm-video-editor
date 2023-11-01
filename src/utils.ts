import { VideoDuration } from "./types";

//TODO: Probably a better idea to just have a VideoDuration class instead of this:

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