import parseASS from "ass-parser";
import * as ASSParser from "ass-parser";

const timestampRegex = /(\d{1,}):(\d{2}):(\d{2})\.(\d{2})/;

export function convert(text: string) {
    const ass = parseASS(text, { comments: true });

    const info: WebVTTNote[] = [];
    let height: number;
    const styles: (WebVTTStyle | WebVTTNote)[] = []; // by WebVTT spec, styles cannot appear after cues
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
        else if (section.section === "V4 Styles") {
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
        styleObject.fontSize = `${+style.value.Fontsize / playHeight * 100}vh`; // assuming Fontsize uses px
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
    return +matches[1] * 3600 + +matches[2] * 60 + +matches[3] + +matches[4] / 100
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
