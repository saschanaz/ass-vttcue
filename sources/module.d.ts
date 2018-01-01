declare module "ass-parser" {
    function parseASS(text: string, options?: { comments?: boolean }): (ASSScriptInfoSection | ASSScriptV4StylesSection | ASSEventsSection)[];
    export = parseASS;

    interface ASSScriptInfoSection {
        section: "Script Info";
        body: ASSSectionBodyStringItem[];
    }
    interface ASSScriptV4StylesSection {
        section: "V4 Styles";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem)[];
    }
    interface ASSEventsSection {
        section: "Events";
        body: (ASSSectionBodyFormatItem | ASSSectionBodyStringDictionaryItem)[];
    }
    interface ASSSectionBodyStringItem {
        type: string;
        value: string;
    }
    interface ASSSectionBodyFormatItem {
        type: "Format";
        value: string[];
    }
    interface ASSSectionBodyStringDictionaryItem {
        type: string;
        value: { [key: string]: string };
    }
}
