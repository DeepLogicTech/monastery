/** 
 * Some algorithms for API400 application.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
let apicl = {}, laterAPICLCmd = {}, nodeAlreadyAdded = [], nodeToAddLater = [];
const DIALOG = window.monkshu_env.components["dialog-box"];

/**
* Sorts a graph into a linear list with increasing order of indexing
* @param nodes The incoming graph to sort, the format should be {id:, dependencies:[array_of_ids]}
* @returns The sorted graph in which they have the connection , {id:, dependencies:[array_of_ids]}
*/
function sortDependencies(nodes) {

    const nodesToWorkOn = util.clone(nodes.commands), sortedSet = [], stopNodeIds = [], futureCurrentNode = [];
    let nextCurrentNodeId;

    for (const node of nodesToWorkOn) if ((!node.dependencies) || (!node.dependencies.length)) sortedSet.push(_arrayDelete(nodesToWorkOn, node));

    let icounter = [], dependencyCheck;
    let currentNodeId = sortedSet.slice(-1)[0].id; // last command id , to be searched in dependencies of remaininge nodes/commands
    for (let i = 0; i < nodesToWorkOn.length; i++) {
        let flag = 0;
        dependencyCheck = 0;
        currentNodeId = (nextCurrentNodeId ? nextCurrentNodeId : currentNodeId);
        if (stopNodeIds && stopNodeIds.length > 0 && stopNodeIds.includes(currentNodeId) && futureCurrentNode && futureCurrentNode.length > 0) {
            sortedSet.push(futureCurrentNode[0]);
            currentNodeId = futureCurrentNode[0].id;
            _arrayDelete(futureCurrentNode, futureCurrentNode[0]);
        }
        for (let nodeIn of nodesToWorkOn) {
            if (nodeIn.dependencies?.includes(currentNodeId)) {
                if (nodeIn.dependencies.length > 1) {
                    //- more than 2 dependencies 
                    if (stopNodeIds.indexOf(nodeIn.id) === -1) { stopNodeIds.push(nodeIn.id); }
                }
                if (flag == 1) { futureCurrentNode.push(nodeIn); icounter.push(i); }
                else { sortedSet.push(nodeIn); nextCurrentNodeId = nodeIn.id; flag = 1; }
                dependencyCheck = 1;
            }
        }
        if (icounter && icounter.length > 0 && dependencyCheck == 0) {
            i = icounter[0]; _arrayDelete(icounter, i);
            if (futureCurrentNode[0] && futureCurrentNode[0].id) {
                sortedSet.push(futureCurrentNode[0]);
                nextCurrentNodeId = futureCurrentNode[0].id;
                _arrayDelete(futureCurrentNode, futureCurrentNode[0]);
            }

        }
    }
    return sortedSet;
}

const _arrayDelete = (array, element) => { if (array.includes(element)) array.splice(array.indexOf(element), 1); return element; }


/**
 * Convert the sorted dependencies into the final APICL for output
 * @param nodes The incoming sorted graph, the format should be {commands:,[array_of_command]}
 * @returns The json with collection of key value pair, { "index:" : "command" }
 */
const convertIntoAPICL = function (nodes) {

    apicl = {}, laterAPICLCmd = {}, nodeToAddLater = [];
    let cmdString, addLaterflag;

    for (const node of nodes) {
        cmdString = '';
        addLaterflag = 0;
        if (nodeToAddLater.includes(node.id)) { addLaterflag = 1; }

        if (node.nodeName == 'strapi')                                                  { cmdString = _convertForStrapi(node) }
        else if (node.nodeName == 'runsql' && !nodeAlreadyAdded.includes(node.id))      { cmdString = _convertForRunsql(node) }
        else if (node.nodeName == 'runjs' && !nodeAlreadyAdded.includes(node.id))       { cmdString = _convertForRunjs(node) }
        else if (node.nodeName == 'sndapimsg' && !nodeAlreadyAdded.includes(node.id))   { cmdString = _convertForSndapimsg(node) }
        else if (node.nodeName == 'chgvar' && !nodeAlreadyAdded.includes(node.id))      { cmdString = _convertForChgvar(node) }
        else if (node.nodeName == 'condition')                                          { cmdString = _convertForCondition(node, nodes) }
        else if (node.nodeName == 'goto' && !nodeAlreadyAdded.includes(node.id))        { cmdString = _convertForGoto(node, nodes) }
        else if (node.nodeName == 'endapi')                                             { cmdString = _convertForEndapi(node) }
        else if (node.nodeName == 'chgdtaara' && !nodeAlreadyAdded.includes(node.id))   { cmdString = _convertForChgdtaara(node) }
        else if (node.nodeName == 'rtvdtaara' && !nodeAlreadyAdded.includes(node.id))   { cmdString = _convertForRtvdtaara(node) }
        else if (node.nodeName == 'qrcvdtaq' && !nodeAlreadyAdded.includes(node.id))    { cmdString = _convertForQrcvdtaq(node) }
        else if (node.nodeName == 'qsnddtaq' && !nodeAlreadyAdded.includes(node.id))    { cmdString = _convertForQsnddtaq(node) }
        else if (node.nodeName == 'dsppfm' && !nodeAlreadyAdded.includes(node.id))      { cmdString = _convertForDsppfm(node) }
        else if (node.nodeName == 'log' && !nodeAlreadyAdded.includes(node.id))         { cmdString = _convertForLog(node) }
        else if (node.nodeName == 'call' && !nodeAlreadyAdded.includes(node.id))        { cmdString = _convertForCall(node) }
        else if (node.nodeName == 'runsqlprc' && !nodeAlreadyAdded.includes(node.id))   { cmdString = _convertForRunsqlprc(node) }
        else if (node.nodeName == 'rest' && !nodeAlreadyAdded.includes(node.id))        { cmdString = _convertForRest(node) }
        else if (node.nodeName == 'jsonata' && !nodeAlreadyAdded.includes(node.id))     { cmdString = _convertForJsonata(node) }
        else if (node.nodeName == 'map' && !nodeAlreadyAdded.includes(node.id))         { cmdString = _convertForMap(node) }
        else if (node.nodeName == 'scrread' && !nodeAlreadyAdded.includes(node.id))     { cmdString = _convertForScrread(node) }
        else if (node.nodeName == 'scrkeys' && !nodeAlreadyAdded.includes(node.id))     { cmdString = _convertForScrkeys(node) }
        else if (node.nodeName == 'scrops' && !nodeAlreadyAdded.includes(node.id))      { cmdString = _convertForScrops(node) }
        else if (node.nodeName == 'mod' && !nodeAlreadyAdded.includes(node.id))         { cmdString = _convertForMod(node) }
        else if (node.nodeName == 'substr' && !nodeAlreadyAdded.includes(node.id))      { cmdString = _convertForSubstr(node) }

        // checking for condition cases , to add the set of command after one case of condition, either true or false
        if (cmdString != '') {
            if (addLaterflag) { laterAPICLCmd[node.id] = cmdString; }
            else { apicl[node.id] = cmdString; }
        }
    }

    apicl = Object.assign(apicl, laterAPICLCmd);
    apicl = _putGotoIndexing(apicl);
    laterAPICLCmd = {};

    return apicl;
};

const _convertForStrapi = function (node) {

    const cmdString = 'STRAPI PARM()';
    if (node.listbox) return cmdString.replace(`()`, `(${JSON.parse(node.listbox).filter(Boolean).join(' ')})`);
    else return cmdString; 
};

const _convertForRunsql = function (node) {

    let cmdString = `RUNSQL SQL(${node.sql || ''})`;
    if (node.sql && node.sql.includes("SELECT"))
        cmdString += ` TRIM(TRUE)`;
    if (node.sql && node.sql.includes("INSERT") && node.sql.split("INSERT").length - 1 > 1)
        cmdString += ` BATCH(TRUE)`;
    if (node.result && node.result != '')
        cmdString = `CHGVAR  VAR(${node.result})  VALUE(${cmdString})`;
    return cmdString;
};

const _convertForRunjs = function (node) {
    if (!node.result) return `RUNJS JS(${node.code || ''})`;
    else return `CHGVAR VAR(${node.result}) VALUE(RUNJS JS(${node.code || ''}))`;
};

const _convertForSndapimsg = function (node) {

    const cmdString = 'SNDAPIMSG  MSG()';
    if (node.listbox) return cmdString.replace(`()`, `(${JSON.parse(node.listbox).filter(Boolean).join(' ')})`);
    else return cmdString;
};

const _convertForChgvar = function (node) {
    return `CHGVAR  VAR(${node.variable ? node.variable.trim() : ''})  VALUE(${node.value ? node.value.trim() : ''})`;
};

const _convertForCondition = function (node, nodes) {
    let nextIdentifiedNodeObj;
    let cmdString = [];
    cmdString[0] = `IF COND(${node.condition || ''})`; // first add the condition command
    for (const nodeObj of nodes) {
        if (nodeObj && nodeObj.dependencies && nodeObj.dependencies.length > 0) {
            if (nodeObj.dependencies.includes(node.id)) {
                if (nodeObj.nodeName == 'iftrue' || nodeObj.nodeName == 'iffalse') {
                    const isThenElse = (nodeObj.nodeName == 'iftrue') ? `THEN` : `ELSE`;
                    nextIdentifiedNodeObj = checkNodeInAllNodes(nodeObj, nodes); // check which command to be add inside THEN and ELSE
                    if (nextIdentifiedNodeObj) {
                        let subCmdStr = '';
                        if (nextIdentifiedNodeObj.nodeName == 'runsql') { subCmdStr = _convertForRunsql(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'goto') { subCmdStr = _convertForGoto(nextIdentifiedNodeObj, nodes); _saveNextNodeIdsInFlow(nextIdentifiedNodeObj, nodes); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrops') { subCmdStr = _convertForScrops(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'runjs') { subCmdStr = _convertForRunjs(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrkeys') { subCmdStr = _convertForScrkeys(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrread') { subCmdStr = _convertForScrread(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'chgvar') { subCmdStr = _convertForChgvar(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'map') { subCmdStr = _convertForMap(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'jsonata') { subCmdStr = _convertForJsonata(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'rest') { subCmdStr = _convertForRest(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'runsqlprc') { subCmdStr = _convertForRunsqlprc(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'call') { subCmdStr = _convertForCall(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'log') { subCmdStr = _convertForLog(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'dsppfm') { subCmdStr = _convertForDsppfm(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'qsnddtaq') { subCmdStr = _convertForQsnddtaq(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'qrcvdtaq') { subCmdStr = _convertForQrcvdtaq(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'rtvdtaara') { subCmdStr = _convertForRtvdtaara(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'chgdtaara') { subCmdStr = _convertForChgdtaara(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'sndapimsg') { subCmdStr = _convertForSndapimsg(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'mod') { subCmdStr = _convertForMod(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'substr') { subCmdStr = _convertForSubstr(nextIdentifiedNodeObj); }

                        // add the THEN and ELSE part , also add any COMMAND inside THEN and ELSE
                        (nodeObj.nodeName == 'iftrue') ? cmdString[1] = ` ${isThenElse}(${subCmdStr})` : cmdString[2] = ` ${isThenElse}(${subCmdStr})`;
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    }
                    else
                        cmdString = cmdString.concat(` ${isThenElse}()`);
                }
            }
        }
    }

    return cmdString.join(' ');
};

const _convertForGoto = function (node, nodes) {
    const gotoNextNode = checkNodeInAllNodes(node, nodes); // put the id of next Command , which will be sorted with index later in _putGotoIndexing
    return `GOTO ${gotoNextNode.id || ''}`;
};

const _convertForMod = function (node) {
    if (node.result) return `RUNJS MOD(${node.result || ''})`;
    else return `RUNJS MOD()`;

};




const _saveNextNodeIdsInFlow = function (nodeObj, nodes) {

    let nextNodeObj = checkNodeInAllNodes(nodeObj, nodes);
    if (nextNodeObj && nextNodeObj.id && nextNodeObj.nodeName != 'condition') {
        nodeToAddLater.push(nextNodeObj.id);
        _saveNextNodeIdsInFlow(nextNodeObj, nodes);
    } else {
        return;
    }
}

const checkNodeInAllNodes = function (node, allnodes) {

    if (allnodes && allnodes.length > 0)
        for (const nodeObj of allnodes) {
            if (nodeObj && nodeObj.dependencies && nodeObj.dependencies.length > 0) {
                if (nodeObj.dependencies.includes(node.id)) {
                    return nodeObj;
                }
            }
        }
}


const _convertForEndapi = function (node) {
    return `ENDAPI`;
};

const _convertForChgdtaara = function (node) {
    let cmdString;
    if ((node.libraryname || node.dataarea) && node.value && node.dropdown) {
        if (node.libraryname && node.libraryname != '' && node.dataarea && node.dataarea != '') cmdString = `CHGDTAARA DTAARA(${node.libraryname.trim()}/${node.dataarea.trim()})`;
        else cmdString = `CHGDTAARA DTAARA(${node.libraryname ? node.libraryname.trim() : ''})`
        if (node.dropdown.includes("Character"))
            cmdString += ` TYPE(*CHAR)`;
        else if (node.dropdown.includes("BigDecimal"))
            cmdString += ` TYPE(*BIGDEC)`;
        cmdString += ` VALUE(${node.value.trim()})`;
        return cmdString;
    }
    else return `CHGDTAARA DTAARA() TYPE() VALUE()`;
};


const _convertForRtvdtaara = function (node) {
    let cmdString;
    if ((node.libraryname || node.dataarea) && node.value && node.dropdown) {
        if (node.libraryname && node.libraryname != '' && node.dataarea && node.dataarea != '') cmdString = `RTVDTAARA DTAARA(${node.libraryname.trim()}/${node.dataarea.trim()})`;
        else cmdString = `RTVDTAARA DTAARA(${node.libraryname ? node.libraryname.trim() : ''})`
        if (node.dropdown.includes("Character"))
            cmdString += `  TYPE(*CHAR)`;
        else if (node.dropdown.includes("BigDecimal"))
            cmdString += `  TYPE(*BIGDEC)`;
        cmdString += ` RTNVAR(${node.value.trim()})`;
        return cmdString;
    }
    else return `RTVDTAARA DTAARA() TYPE() RTNVAR()`;
};

const _convertForQrcvdtaq = function (node) {
    if ((node.libraryname || node.queue) && node.wait && node.dropdown && node.data) {
        if (node.libraryname && node.libraryname != '' && node.queue && node.queue != '')
            return `QRCVDTAQ PARM(${node.libraryname.trim()}/${node.queue.trim()} ${node.wait.trim()} ${node.dropdown} ${node.data.trim()})`;
        else return `QRCVDTAQ PARM(${node.libraryname ? node.libraryname.trim() : ''} ${node.wait.trim()} ${node.dropdown} ${node.data.trim()})`
    }
    else return `QRCVDTAQ  PARM()`
};

const _convertForQsnddtaq = function (node) {
    if ((node.libraryname || node.dataqueue) && node.value) {
        if (node.libraryname && node.libraryname != '' && node.dataqueue && node.dataqueue != '')
            return `QSNDDTAQ PARM(${node.libraryname.trim()}/${node.dataqueue.trim()} ${node.value.trim()})`;
        else return `QSNDDTAQ PARM(${node.libraryname ? node.libraryname.trim() : ''} ${node.value.trim()})`;
    }
    else return `QSNDDTAQ PARM()`
};

const _convertForDsppfm = function (node) {
    if (node.libraryname && node.libraryname != '' && node.physical && node.physical != '')
        return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})    VALUE(DSPPFM FILE(${node.libraryname.trim()}/${node.physical.trim()}) MBR(${node.member ? node.member.trim() : ''}))`;
    else return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})    VALUE(DSPPFM FILE(${node.libraryname ? node.libraryname.trim() : ''}) MBR(${node.member ? node.member.trim() : ''}))`
};

const _convertForLog = function (node) {
    return `LOG MSG(${node.log ? node.log.trim() : ''})`;
};

const _convertForCall = function (node) {
    let cmdString;
    if (node.libraryname && node.libraryname != '' && node.programname && node.programname != '')
        cmdString = `CALL PGM(${node.libraryname.trim()}/${node.programname.trim()})`;
    else cmdString = `CALL PGM(${node.libraryname ? node.libraryname.trim() : ''})`;
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0)
            cmdString += ` PARM(${listBoxValues.filter(Boolean).join(" ")})`;
    }
    else cmdString += ` PARM()`
    return cmdString;
};


const _convertForRunsqlprc = function (node) {
    let cmdString;
    if (node.libraryname && node.libraryname != '' && node.procedurename && node.procedurename != '')
        cmdString = `RUNSQLPRC PRC(${node.libraryname.trim()}/${node.procedurename.trim()})`;
    else cmdString = `RUNSQLPRC PRC(${node.libraryname ? node.libraryname.trim() : ''})`;

    let paramString = '';
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0) for (let values of listBoxValues) if (values.some(value => value != "")) paramString += values.join("") + " ";
        cmdString += ` PARM(${paramString.trim()})`;
    }
    else cmdString += ` PARM()`
    return cmdString;
};

const _convertForRest = function (node) {

    let cmdString = `REST URL(${node.url ? node.url.trim() : ''}) METHOD(${node.method ? node.method.trim() : ''}) ` +
        ` HEADERS(${node.headers ? node.headers.trim() : ''}) PARM(${node.parameter ? node.parameter.trim() : ''})`;
    if (node.result)
        cmdString = `CHGVAR VAR(${node.result ? node.result.trim() : ''}) VALUE(${cmdString})`;
    return cmdString;
};


const _convertForJsonata = function (node) {
    return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})    VALUE(JSONATA EXPRESSION(${node.jsonata ? node.jsonata.trim() : ''}))`;
};

const _convertForMap = function (node) {
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        let mapVariables = [];
        if (listBoxValues && listBoxValues.length > 0)
            for (const variableObj of listBoxValues) {
                if (variableObj.some(value => value != "")) {
                    if (variableObj[4]) {
                        if (variableObj[0]) mapVariables.push(`${variableObj[0].trim()}:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}:${variableObj[4].trim()}`);
                        else mapVariables.push(`-:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}:${variableObj[4].trim()}`);
                    }
                    else {
                        if (variableObj[0]) mapVariables.push(`${variableObj[0].trim()}:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}`);
                        else mapVariables.push(`-:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}`);
                    }
                }
            }

        return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})   VALUE(MAP DO(${mapVariables.join(",")}))`;
    }
    else return `CHGVAR     VAR()   VALUE(MAP DO())`
};

const _convertForScrread = function (node) {
    let readVariables = [];
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0)
            for (const scrPropertiesObj of listBoxValues) {
                if (scrPropertiesObj.some(value => value != "")) readVariables.push(`${scrPropertiesObj[0].trim()},${scrPropertiesObj[1].trim()},${scrPropertiesObj[2].trim()},${scrPropertiesObj[3].trim()}`);
            }
        if (!node.result) return `SCR NAME(${node.session})   READ(${readVariables.join(" : ")})`;
        else return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})   VALUE(SCR NAME(${node.session ? node.session.trim() : ''})   READ(${readVariables.join(" : ")}))`;
    }
    else return `SCR NAME()   READ()`
};

const _convertForScrkeys = function (node) {
    let keysVariables = [];
    let listBoxValues = JSON.parse(node.listbox);
    if (node.listbox) {
        if (listBoxValues && listBoxValues.length > 0)
            for (const scrPropertiesObj of listBoxValues) {
                if (scrPropertiesObj.some(value => value != "")) keysVariables.push(`${scrPropertiesObj[0].trim()},${scrPropertiesObj[1].trim()},${scrPropertiesObj[2].trim()}`);
            }
        return `SCR NAME(${node.session ? node.session : ''})   KEYS(${keysVariables.join(" : ")})`;
    }
    else return `SCR NAME()   KEYS()`
};

const _convertForScrops = function (node) {
    return `SCR NAME(${node.session ? node.session : ''}) ${node.radiobutton ? node.radiobutton.toUpperCase() : 'START'}`;
};

const _convertForSubstr = function (node) {
    return `CHGVAR     VAR(${node.variable ? node.variable.trim() : ''})     VALUE(SUBSTR DO(${node.string ? node.string.trim() : ''}:${node.index ? node.index.trim() : ''}:${node.noofchar ? node.noofchar.trim() : ''}))`
};





const _putGotoIndexing = function (apicl) {

    let finalAPICL = {};
    let index = 0;
    let idIndexMapping = {};
    for (const id in apicl) {
        finalAPICL[++index] = apicl[id];
        idIndexMapping[id] = index;
    }
    return _assignIndexIfInGOTO(idIndexMapping, finalAPICL);

};

const _assignIndexIfInGOTO = function (idIndexMapping, finalAPICL) {

    let chgArr = [], index;
    let apiclString = JSON.stringify(finalAPICL);
    for (let id in idIndexMapping) {
        index = idIndexMapping[id];
        if (id.includes("_")) { chgArr = id.split("_"); }
        id = (chgArr && chgArr.length > 0) ? chgArr[0] : id;
        apiclString = apiclString.replaceAll(id, index);
    }

    return JSON.parse(apiclString);
}


export const algos = { sortDependencies, convertIntoAPICL, _convertForStrapi, checkNodeInAllNodes };