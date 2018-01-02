import parseASS from "ass-parser";
import * as ASSParser from "ass-parser";

main();

function main() {
    const ass = parseASS("abc");

    const info: WebVTTNote[] = [];
    const styles: (WebVTTStyle | WebVTTNote)[] = [];
    const body: (VTTCueData | WebVTTNote)[] = [];
    for (const section of ass) {
        if (section.section === "Script Info") {
            for (const item of section.body) {
                if (isASSComment(item)) {
                    info.push({ type: "note", value: item.value });
                }
                else {
                    info.push({ type: "note", value: `${item.key}: ${item.value}` });
                }
            }
        }
        else if (section.section === "V4 Styles") {
            for (const item of section.body) {
                if (isASSComment(item)) {
                    info.push({ type: "note", value: item.value });
                }
                else if (item.key !== "Format") {
                
                }
            }
        }
        else if (section.section === "Events") {
            for (const item of section.body) {
                if (isASSComment(item)) {
                    info.push({ type: "note", value: item.value });
                }
                else if (item.key !== "Format") {
                
                }
            }
        }
        else {
            console.warn(`Ignoring unsupported section ${section!.section}`);
        }
    }

    return [...info, ...styles, ...body];
}

interface WebVTTNote {
    type: "note"
    value: string;
}

interface WebVTTStyle {
    type: "style";
    value: string;
}

/** This interface should be largely compatible with VTTCue */
interface VTTCueData {
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
    align: "start" | "end" | "left" | "right";
    text: string;
}

interface VTTRegion {
    id: string;
    width: number;
    lines: number;
    regionAnchorX: number;
    regionAnchorY: number;
    viewportAnchorX: number;
    viewportAnchorY: number;
    scroll: "" | "up";
};

function isASSComment(obj: ASSParser.ASSCommentItem | ASSParser.ASSSectionBodyFormatItem | ASSParser.ASSSectionBodyStringItem | ASSParser.ASSSectionBodyStringDictionaryItem): obj is ASSParser.ASSCommentItem {
    return "type" in obj && (obj as any).type === "comment";
}
