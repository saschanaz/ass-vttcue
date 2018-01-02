declare module "ass-parser" {
    function parseASS(text: string, options?: { comments?: boolean }): (ASSScriptInfoSection | ASSScriptV4StylesSection | ASSEventsSection)[];
    export default parseASS;

    export interface ASSScriptInfoSection {
        section: "Script Info";
        body: (ASSSectionBodyStringItem | ASSCommentItem)[];
    }
    export interface ASSScriptV4StylesSection {
        section: "V4 Styles";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem | ASSCommentItem)[];
    }
    export interface ASSEventsSection {
        section: "Events";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem | ASSCommentItem)[];
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
    export interface ASSSectionBodyStringDictionaryItem {
        key: string;
        value: { [key: string]: string };
    }
}
