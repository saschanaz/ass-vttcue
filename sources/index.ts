import parseASS from "ass-parser";
import * as ASSParser from "ass-parser";

const timestampRegex = /(\d{1,}):(\d{2}):(\d{2})\.(\d{2})/;

export function convert(text: string) {
    const ass = parseASS(text, { comments: true });

    const info: WebVTTNote[] = [];
    let height: number;
    const styles: (WebVTTStyle | WebVTTNote)[] = []; // WebVTT spec prevents styles from appearing after cues
    const body: (VTTCueData | WebVTTNote)[] = [];
    for (const section of ass) {
        if (section.section === "Script Info") {
            for (const item of section.body) {
                if (isASSComment(item)) {
                    info.push({ type: "note", text: item.value });
                }
                else {
                    info.push({ type: "note", text: `${item.key}: ${item.value}` });
                    if (item.key === "PlayResY") {
                        height = +item.value;
                    }
                }
            }
        }
        else if (section.section === "V4 Styles" || section.section === "V4+ Styles") {
            if (!height) {
                throw new Error("Header didn't include PlayResY info")
            }
            for (const item of section.body) {
                if (isASSComment(item)) {
                    styles.push({ type: "note", text: item.value });
                }
                else if (item.key !== "Format") {
                    styles.push(convertStyle(item, height));
                }
            }
        }
        else if (section.section === "Events") {
            for (const item of section.body) {
                if (isASSComment(item)) {
                    body.push({ type: "note", text: item.value });
                }
                else if (item.key !== "Format") {
                    body.push(convertEvent(item));
                }
            }
        }
        else {
            console.warn(`Ignoring unsupported section ${section!.section}`);
        }
    }

    return [...info, ...styles, ...body];
}

function convertStyle(style: ASSParser.ASSStyle, playHeight: number): WebVTTStyle {
    const vttStyle: WebVTTStyle = { type: "style", name: style.value.Name, dict: {} };
    const styleObject = vttStyle.dict as any as CSSStyleDeclaration;

    if (style.value.Fontname) {
        styleObject.fontFamily = style.value.Fontname;
    }
    if (style.value.Fontsize) {
        styleObject.fontSize = `${(+style.value.Fontsize / playHeight * 100).toFixed(2)}vh`; // assuming Fontsize uses px
    }
    if (style.value.PrimaryColour) {
        styleObject.color = convertColor(style.value.PrimaryColour);
    }
    if (style.value.BackColour) {
        // text stroke is not supported because of WebVTT CSS restriction
        // https://w3c.github.io/webvtt/#the-cue-pseudo-element
        // text-shadow does not support individual color property
        // so this should be processed in special way
        vttStyle.dict['--text-shadow-color'] = convertColor(style.value.BackColour);
    }
    if (style.value.Bold) {
        styleObject.fontWeight = "bold";
    }
    if (style.value.Italic) {
        styleObject.fontStyle = "italic";
    }
    if (style.value.Underline) {
        styleObject.textDecoration = "underline";
    }
    if (style.value.Strikeout) {
        // Note that CSS does not support underline and strikeout together
        styleObject.textDecoration = "line-through";
    }
    // ScaleX, ScaleY, Spacing, Angle, Outline are not supported because of WebVTT CSS restriction
    // https://w3c.github.io/webvtt/#the-cue-pseudo-element
    if (style.value.BorderStyle === "1") {
        if (style.value.Shadow) {
            // TODO: this is not an absolute value and rather arbitrary, but what happens we use px?
            // Will a browser zoom it when needed?
            styleObject.textShadow = `${+style.value.Shadow / 36}em`
        }
    }

    return vttStyle;
}

function convertEvent(event: ASSParser.ASSDialogue): VTTCueData {
    const cue: VTTCueData = {
        type: "cue",

        id: event.value.Name,
        startTime: convertTimestamp(event.value.Start),
        endTime: convertTimestamp(event.value.End),
        pauseOnExit: false,

        vertical: "",
        snapToLines: true,
        line: "auto",
        lineAlign: "start",
        position: 50,
        positionAlign: "auto",
        size: 100,
        align: "center",
        // TODO: process ASS specific syntax
        text: event.value.Text.replace(/\\N/g, "\n").replace(/\n{2,}/g, n => Array.from(n).join(' '))
    };

    // TODO: process other properties

    return cue;
}

function convertTimestamp(timestamp: string) {
    const matches = timestamp.match(timestampRegex);
    return +matches[1] * 3600 + +matches[2] * 60 + +matches[3] + +matches[4] / 100;
}

function convertColor(color: string) {
    let num = color.startsWith("&H") ? parseInt(color, 16) : +color;
    if (num < 0) {
        // some tools generates negative integer if the value >= 2 ** 31
        num += 2 ** 31;
    }
    // parse as (A)BGR
    const R = num & 0xFF;
    const G = (num & 0xFF00) >> 8;
    const B = (num & 0xFF0000) >> 16;
    // 1 by default. Note that this also converts explicit 0 value to 1
    // (It seems some real world examples uses explicit 0 values with unknown reason)
    const A = (num & 0xFF0000) >> 24 || 255;
    if (A === 255) {
        return `#${R.toString(16)}${G.toString(16)}${B.toString(16)}`;
    }
    else {
        // MSEdge 16 does not support #RGBA
        return `rgba(${R}, ${G}, ${B}, ${A / 255})`;
    }
}

export interface WebVTTNote {
    type: "note"
    text: string;
}

export interface WebVTTStyle {
    type: "style";
    name: string;
    dict: {
        [key: string]: string;
    };
}

/** This interface should be largely compatible with VTTCue */
export interface VTTCueData {
    type: "cue";

    id: string;
    startTime: number;
    endTime: number;
    pauseOnExit: boolean;

    region?: VTTRegion;
    vertical: "" | "rl" | "lr";
    snapToLines: boolean;
    line: number | "auto";
    lineAlign: "start" | "center" | "end";
    position: number | "auto";
    positionAlign: "line-left" | "center" | "line-right" | "auto";
    size: number;
    align: "start" | "center" | "end" | "left" | "right";
    text: string;
}

export interface VTTRegion {
    id: string;
    width: number;
    lines: number;
    regionAnchorX: number;
    regionAnchorY: number;
    viewportAnchorX: number;
    viewportAnchorY: number;
    scroll: "" | "up";
};

function isASSComment(obj: ASSParser.ASSCommentItem | ASSParser.ASSSectionBodyFormatItem | ASSParser.ASSSectionBodyStringItem | ASSParser.ASSStyle | ASSParser.ASSDialogue): obj is ASSParser.ASSCommentItem {
    return "type" in obj && (obj as any).type === "comment";
}
