import parseASS = require("ass-parser");

main();

function main() {
    const ass = parseASS("abc");
    for (const section of ass) {
        if (section.section === "Script Info") {

        }
        else if (section.section === "V4 Styles") {

        }
        else if (section.section === "Events") {

        }
        else {
            console.warn(`Ignoring unsupported section ${section!.section}`);
        }
    }
}

