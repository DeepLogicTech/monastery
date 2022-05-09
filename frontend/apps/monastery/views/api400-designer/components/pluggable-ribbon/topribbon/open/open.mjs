/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {view} from "../../../../view.mjs"
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {serverManager} from "../../../../js/serverManager.js";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

let xCounter = 100, yCounter = 30;

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_FILE_UPLOADED = "FILE_UPLOADED", 
    CONTEXT_MENU = window.monkshu_env.components["context-menu"], CONTEXT_MENU_ID = "contextmenumain",
    DIALOG_RET_PROPS = ["name", "server", "port", "adminid", "adminpassword"], 
    DIALOG = window.monkshu_env.components["dialog-box"], VIEW_PATH=`${PLUGIN_PATH}/../../../../`;
let IMAGE, I18N, saved_props;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/open.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/open.i18n.mjs`)).i18n; 
    return true;
}

async function clicked(element, event) {
    event.stopPropagation(); const lang = i18n.getSessionLang();
    const menus = {}; menus[`${I18N.NEW[lang]}`] = _=>view.reset(); menus[`${I18N.OPEN_FROM_DISK[lang]}`] = _=>_uploadFile();
    menus[`${I18N.OPEN_FROM_SERVER[lang]}`] = _=>_getFromServer();
    const boundingRect = element.getBoundingClientRect(), x = boundingRect.x, y = boundingRect.bottom;
    CONTEXT_MENU.showMenu(CONTEXT_MENU_ID, menus, x, y, 0, 5);
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

const allowDrop = event => _isDraggedItemAJSONFile(event);

async function droppedFile(event) {
    event.preventDefault(); if (!_isDraggedItemAJSONFile(event)) return; // can't support whatever was dropped
    const file = event.dataTransfer.items[0].getAsFile(); 
    try {
        const {name, data} = await util.getFileData(file);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}

async function _uploadFile() {
    try {
        let {name, data} = await util.uploadAFile("application/json");
      data = JSON.stringify(_apiclParser(data));
        console.log(data);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}
    
async function _getFromServer() {
    const pageFile =  util.resolveURL(`${VIEW_PATH}/dialogs/dialog_openserver.page`);

    let html = await page_generator.getHTML(new URL(pageFile));

    const dom = new DOMParser().parseFromString(html, "text/html");
    if (saved_props) for (const id in saved_props) dom.querySelector(`#${id}`).setAttribute("value", saved_props[id]);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = util.resolveURL(`${VIEW_PATH}/dialogs/dialogPropertiesopenserver.json`);
    DIALOG.showDialog(dialogPropertiesPath, html, null, DIALOG_RET_PROPS, 
        async (typeOfClose, result) => { if (typeOfClose == "submit") {
            saved_props = util.clone(result, ["adminpassword"]); // don't save password, for security
            const selectedModel = result.packages, readModelResult = serverManager.getModel(selectedModel, result.server,
                result.port, result.adminid, result.adminpassword);
            if (!pubResult.result) DIALOG.showError(dialogElement, await i18n.get(readModelResult.key)); 
            else blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name: selectedModel, 
                data: readModelResult.model});
        } 
    });
}

const _apiclParser = function(data) {
    let dependencies = [];
    let counter=1;
    const apicl = JSON.parse(data);
    let result = Object.keys(apicl).map(e => {
        return _parseCommand(apicl[e],counter++,dependencies);
    });

    return {"apicl" : [ { "commands" : result , "name" : "commands" , "id" : counter} ] }

}
const _parseCommand = function(command,counter,dependencies) {

    let ret = {}, nodeNameAsSubCmd = '';
    let cmd = command.split(' ');
    let nodeName = cmd[0].toLowerCase();

    if (nodeName=='chgvar') { 
        nodeNameAsSubCmd = _checkChgvarSubCommand(command).toLowerCase()||nodeName;
    }

    let isThisSubCmd = (nodeNameAsSubCmd)?true:false;
    nodeName = (nodeNameAsSubCmd)?nodeNameAsSubCmd:nodeName;

    ret["nodeName"] = nodeName;
    ret["description"] = nodeName.charAt(0).toUpperCase() + nodeName.slice(1).toLowerCase();
    

    
    if (nodeName=='strapi' || nodeName=='sndapimsg') { ret["listbox"] = _parseStrapi(command) }
    else if (nodeName=='scr') { ret = _parseScr(command,isThisSubCmd) }
    else if (nodeName=='rest') { ret["listbox"] = _parseRest(command,isThisSubCmd) }
    
    ret["id"] = _getUniqueID();
    dependencies.push(ret.id);
    
    if (counter>=2) { 
        ret["dependencies"] = _putDependency(dependencies[counter-2]);
        ret["x"] = xCounter;
        ret["y"] = yCounter;
        xCounter = xCounter + 100
    }

    console.log(ret);

    return ret;
}

const _putDependency = function(counter) {
    return [`${counter}`];
};

const _checkChgvarSubCommand = function(command) {

    //CHGVAR     VAR(&val)     VALUE(SCR    NAME(SESS1)    READ(6,7,6,80))
    //CHGVAR     VAR(&REST_RESP)    VALUE(REST  URL(http://dummy.restapiexample.com/api/v1/create) METHOD(POST) HEADERS() PARM(&REQUEST))
    let subCommands = ['SCR','REST'];
    let nodeName = "";
    subCommands.forEach((subCommand) => {
        if (command.includes(subCommand)) { nodeName = subCommand; }
    })
    return nodeName;
};


const _parseStrapi = function(command) {
    // regex to return the string inside round braces ()
    return command.match(/\(([^)]+)\)/)[1].split(" ").filter(Boolean).map(s => s.slice(1));
};

const _parseScr = function(command,isThisSubCmd) {

    let ret = {};
    let subCmdVar,sessionName,readParams;
    if (isThisSubCmd) {
        // convert it as subcommand
        //CHGVAR     VAR(&val)     VALUE(SCR    NAME(SESS1)    READ(6,7,6,80))
        ret["result"] = _subStrUsingNextIndex(command,"VAR(",")").slice(1);
        subCmdVar = _subStrUsingLastIndex(command,"VALUE(",")")
    }
    ret["session"] = _subStrUsingNextIndex(subCmdVar,"NAME(",")");
    if (subCmdVar.includes("READ")) {
        readParams = _subStrUsingLastIndex(subCmdVar,"READ(",")");
        console.log(readParams);
        let allReads = [];
        readParams.split(':').forEach(function(value) {
            allReads.push(value.trim().split(','));
        });

        ret["nodeName"] = "scrread";
        ret["description"] = "Scrread";
        ret["listbox"] = allReads;
    } else if (subCmdVar.includes("KEYS")) {
        
    } else if (subCmdVar.includes("START") || subCmdVar.includes("STOP") || subCmdVar.includes("RELEASE")) {

    }
    return ret;
};

const _subStrUsingLastIndex = function(str,startStr,nextIndex) {
    return str.substring(str.indexOf(startStr)+startStr.length , str.lastIndexOf(nextIndex));
};

const _subStrUsingNextIndex = function(str,startStr,lastIndex) {
    return str.substring(str.indexOf(startStr)+startStr.length , str.indexOf(lastIndex));
};

const _parseRest = function(command,isThisSubCmd) {
    
    if (!isThisSubCmd) {
        // convert it as main command
        //REST  URL(http://dummy.restapiexample.com/api/v1/create) METHOD(POST) HEADERS() PARM(&REQUEST)


    } else {
        // convert it as subcommand
        //CHGVAR     VAR(&val)     VALUE(SCR    NAME(SESS1)    READ(6,7,6,80))


    }

};

const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    

const _isDraggedItemAJSONFile = event => event.dataTransfer.items?.length && event.dataTransfer.items[0].kind === "file"
    && event.dataTransfer.items[0].type.toLowerCase() === "application/json";

export const open = {init, clicked, getImage, getHelpText, getDescriptiveName, allowDrop, droppedFile}