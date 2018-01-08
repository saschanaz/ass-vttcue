declare module "ass-parser" {
    function parseASS(text: string, options?: { comments?: boolean }): (ASSScriptInfoSection | ASSScriptV4StylesSection | ASSEventsSection)[];
    export default parseASS;

    export interface ASSScriptInfoSection {
        section: "Script Info";
        body: (ASSSectionBodyStringItem | ASSCommentItem)[];
    }
    export interface ASSScriptV4StylesSection {
        section: "V4 Styles";
        body: (ASSSectionBodyFormatItem | ASSStyle | ASSCommentItem)[];
    }
    export interface ASSEventsSection {
        section: "Events";
        body: (ASSSectionBodyFormatItem | ASSDialogue | ASSCommentItem)[];
    }
    export interface ASSCommentItem {
        type: string;
        value: string;
    }
    export interface ASSSectionBodyStringItem {
        key: string;
        value: string;
    }
    export interface ASSSectionBodyFormatItem {
        key: "Format";
        value: string[];
    }

    export interface ASSStyle {
        key: "Style";
        value: {
            [key in ASSStyleFormatKeys]: string;
        };
    }

    export type ASSStyleFormatKeys = "Name" | "Fontname" | "Fontsize" | "PrimaryColour" | "SecondaryColour" | "TertiaryColour" | "BackColour" | "Bold" | "Italic" | "BorderStyle" | "Outline" | "Shadow" | "Alignment" | "MarginL" | "MarginR" | "MarginV" | "AlphaLevel" | "Encoding";

    export interface ASSDialogue {
        key: "Dialogue";
        value: {
            [key in ASSEventFormatKeys]: string;
        };
    }

    export type ASSEventFormatKeys = "Marked" | "Start" | "End" | "Style" | "Name" | "MarginL" | "MarginR" | "MarginV" | "Effect" | "Text";
}
