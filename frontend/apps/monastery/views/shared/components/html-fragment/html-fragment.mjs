/** 
 * Just embeds the given HTML as a Web component.
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const elementConnected = async element => {
    const htmlContent = element.getAttribute("htmlcontent") ? decodeURIComponent(element.getAttribute("htmlcontent")) : 
        element.getAttribute("htmlfile") ? await $$.requireText(element.getAttribute("htmlfile")) : "";

    html_fragment.setTemplateHTML(element, htmlContent); 
}

// convert this all into a WebComponent so we can use it
export const html_fragment = {trueWebComponentMode: true, elementConnected}
monkshu_component.register("html-fragment", null, html_fragment);