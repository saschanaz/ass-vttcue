declare module "ass-parser" {
    function parseASS(text: string, options?: { comments?: boolean }): (ASSScriptInfoSection | ASSScriptV4StylesSection | ASSEventsSection)[];
    export = parseASS;

    interface ASSScriptInfoSection {
        section: "Script Info";
        body: (ASSSectionBodyStringItem | ASSCommentItem)[];
    }
    interface ASSScriptV4StylesSection {
        section: "V4 Styles";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem | ASSCommentItem)[];
    }
    interface ASSEventsSection {
        section: "Events";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem | ASSCommentItem)[];
    }
    interface ASSCommentItem {
        type: string;
        value: string;
    }
    interface ASSSectionBodyStringItem {
        key: string;
        value: string;
    }
    interface ASSSectionBodyFormatItem {
        key: "Format";
        value: string[];
    }
    interface ASSSectionBodyStringDictionaryItem {
        key: string;
        value: { [key: string]: string };
    }
}
