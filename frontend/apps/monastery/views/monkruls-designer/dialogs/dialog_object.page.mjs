/**
 * Returns the page to display for the object dialog.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {i18n} from "/framework/js/i18n.mjs";

function getPage(viewPath, savedDialogProperties) {
    if (savedDialogProperties?.type == "JSON") return `${viewPath}/dialogs/dialog_object.code.page`;
    if (savedDialogProperties?.type == "CSV") return `${viewPath}/dialogs/dialog_object.sheet.page`;
    
    return new Promise(async (resolve, reject) => {
        window.monkshu_env.components["dialog-box"].showChoice( {message: await i18n.get("PickOption"), choices:["JSON", "CSV"]}, 
            option => { if (option) resolve(`${viewPath}/dialogs/dialog_object.${option=="CSV"?"sheet":"code"}.page`);
                else reject(); } );
    });
}

export const page = {getPage};