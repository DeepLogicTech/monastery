/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

function addTextBox(id, value) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const placeHolder = id;
  const inputElement = _createElement(parentContainer, id, value, placeHolder);
  parentContainer.appendChild(inputElement);
}

function addTextBoxesForMap(stringVariableValue, startPositionValue, noOfCharValue, repitionValue, stringFunctionValue) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForMap(parentContainer, stringVariableValue, startPositionValue, noOfCharValue, repitionValue, stringFunctionValue);
  parentContainer.appendChild(divElement);
};

function addTextBoxesForScrKeys(y_coordinateValue, x_coordinateValue, keyValue) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForScrKeys(parentContainer, y_coordinateValue, x_coordinateValue, keyValue);
  parentContainer.appendChild(divElement);
};

function addTextBoxesForScrRead(rowFromValue, columnFromValue, rowToValue, columnToValue) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForScrRead(parentContainer, rowFromValue, columnFromValue, rowToValue, columnToValue);
  parentContainer.appendChild(divElement);
};

function addContainerForRunsqlprc(typeOfParam, variable, type) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForRunsqlPrc(parentContainer, typeOfParam, variable, type);
  parentContainer.appendChild(divElement);
};

function _createElement(parentContainer, id, value, placeHolder, className, placeHolderType, type) {

  const inputElement = document.createElement("input");
  if (type != undefined) inputElement.setAttribute("type", "number");
  else inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `${id}-${parentContainer.children.length + 1}`);
  if (placeHolderType == "static") inputElement.setAttribute("placeholder", placeHolder);
  else inputElement.setAttribute("placeholder", `${placeHolder}-${parentContainer.children.length + 1}`);
  if (value != undefined) inputElement.setAttribute("value", `${value}`);
  if (className != undefined) inputElement.setAttribute("class", `${className}`);
  return inputElement
};


function _createDivElementForMap(parentContainer, stringVariableValue, startPositionValue, noOfCharValue, repitionValue, stringFunctionValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "map");
  const inputElement1 = _createElement(parentContainer, "string", stringVariableValue, "String Variable", "stringbox");
  const inputElement2 = _createElement(parentContainer, "start", startPositionValue, "Start Pos", "startbox", "static");
  const inputElement3 = _createElement(parentContainer, "count", noOfCharValue, "Num of Char", "countbox", "static");
  const inputElement4 = _createElement(parentContainer, "repetition", repitionValue, "Repetition No", "repitionbox", "static");
  const inputElement5 = _createElement(parentContainer, "function", stringFunctionValue, "String Function", "functionbox", "static");
  divElement.append(inputElement1, inputElement2, inputElement3, inputElement4, inputElement5);
  return divElement
}

function _createDivElementForScrKeys(parentContainer, y_coordinateValue, x_coordinateValue, keyValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "scr-keys");
  const inputElement1 = _createElement(parentContainer, "y", y_coordinateValue, "y-cordinate", "y-coordinates", "static");
  const inputElement2 = _createElement(parentContainer, "x", x_coordinateValue, "x-cordinate", "x-coordinates", "static");
  const inputElement3 = _createElement(parentContainer, "key", keyValue, "Key", "Keys");
  divElement.append(inputElement1, inputElement2, inputElement3);
  return divElement
}

function _createDivElementForScrRead(parentContainer, rowFromValue, columnFromValue, rowToValue, columnToValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "scr-read");
  const inputElement1 = _createElement(parentContainer, "screen-row-from", rowFromValue, "Screen Row From", "rows-from", "dynamic");
  const inputElement2 = _createElement(parentContainer, "screen-col-from", columnFromValue, "Screen Col From", "cols-from", "dynamic");
  const inputElement3 = _createElement(parentContainer, "screen-row-to", rowToValue, "Screen Row To", "rows-to", "dynamic");
  const inputElement4 = _createElement(parentContainer, "screen-col-to", columnToValue, "Screen Col To", "cols-to", "dynamic");
  divElement.append(inputElement1, inputElement2, inputElement3, inputElement4);
  return divElement
}

function _createDivElementForRunsqlPrc(parentContainer, typeOfParam, variable, type) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", 'runsqlprc');
  const inputElement1 = _createElement(parentContainer, "variable", variable, "Variable", "variablebox");
  const selectElement1 = _createDropDownElementForParam(parentContainer);
  const selectElement2 = _createDropDownElementFortype(parentContainer);
  divElement.append(selectElement1, inputElement1, selectElement2);

  if (typeOfParam != undefined) {
    for (let i = 0; i < selectElement1.options.length; ++i)  if (selectElement1.options[i].text == typeOfParam.slice(1))
      selectElement1.options[i].selected = true;
  }
  if (type != undefined) {
    for (let i = 0; i < selectElement2.options.length; ++i) if (selectElement2.options[i].text == type.slice(1))
      selectElement2.options[i].selected = true;
  }
  return divElement
}
function _createDropDownElementForParam(parentContainer) {
  const selectElement = document.createElement("select");
  selectElement.innerHTML = ' <option value="" selected   >Nature Of Param</option> <option value="&IN">IN</option><option value="&OUT">OUT</option><option value="&INOUT">INOUT</option>';
  selectElement.setAttribute("id", `param-${parentContainer.children.length + 1}`);
  selectElement.setAttribute("class", 'param');
  return selectElement;
}
function _createDropDownElementFortype(parentContainer) {
  const selectElement = document.createElement("select");
  selectElement.innerHTML = ' <option value="" selected  >Type Of Param </option> <option value=":NUM">NUM</option><option value=":CHAR">CHAR</option>';
  selectElement.setAttribute("id", `type-${parentContainer.children.length + 1}`);
  selectElement.setAttribute("class", 'type');
  return selectElement;
}
export const text_box = {
  trueWebComponentMode: true,
  addTextBox,
  addTextBoxesForScrKeys,
  addTextBoxesForMap,
  addTextBoxesForScrRead,
  addContainerForRunsqlprc

};

monkshu_component.register(
  "text-box",
  null,
  text_box
);
