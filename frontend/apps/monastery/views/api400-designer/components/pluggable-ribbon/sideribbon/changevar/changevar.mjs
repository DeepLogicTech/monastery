/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
 import {util} from "/framework/js/util.mjs";
 import {newFlowNode} from "../../lib/flowNode.mjs";
 
 const parentNode = newFlowNode();
 const init = async _ => {await parentNode.init("changevar", util.getModulePath(import.meta)); return true;}
 export const changevar = {init, ...parentNode};