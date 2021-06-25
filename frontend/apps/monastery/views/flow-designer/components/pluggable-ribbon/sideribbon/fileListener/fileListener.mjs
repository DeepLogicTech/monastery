/** 
 * (C) 2020 TekMonks. All rights reserved.
 */

import {flowNode} from "../../lib/flowNode.mjs";
const thisNode = flowNode.newFlowNode();

const init = async (pluginData, pluginPath) => {await thisNode.init("FILE_LISTENER", "fileListener", pluginData, pluginPath); ; return true;}

const parentExports = {...thisNode}; delete parentExports["init"];
export const fileListener = {init, ...parentExports};
