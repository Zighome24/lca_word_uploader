// GLOBAL VARIABLE TO HOLD THE FILE AND MAPPING DATA
var data;

/* Optional Javascript Global Variables for custom settings:
    root_select_elem - set this to a custom value in a script tag on the 
        page if you want to change the id used to identify the element
        to hold the select menus under.
    root_folder_name - set this to the name of the root folder on Google Drive
        that you want to show folder names under.
*/

function getFilesAndMappings() {
    return fetch('/files', {
        method: "GET",
        redirect: "manual"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    }).catch((error) => {
        console.log('There was a problem when fetching files: ', error.message);
    });
}

function rootFolderSelection(folder_name) {
    let root_folder_id = (data.files.find(value => value.name === folder_name)).id;
    createFolderSelector(root_folder_id, 0);
}

function folderSelectionHandler() {
    createFolderSelector(this.options[this.selectedIndex].value, this.name);
}

function createFolderSelector(folder_id, order) {
    let root_append;
    if (typeof root_select_elem !== 'undefined') {
        root_append = document.getElementById(root_select_elem);
    } else {
        root_append = document.getElementById('folder_selection');
    }

    let select_list = document.getElementsByTagName('select');
    for (var i = 0; i < select_list.length; i++) {
        let element = select_list[i];
        if (Number(element.name) >= (Number(order) + 1)) {
            root_append.removeChild(element);
            // displace the iterator counter to account
            // for the live html collection that is dynamic
            i--;
        }
    }

    let children = data.map[folder_id];
    if (children.length === 0) {
        return;
    }

    let select = document.createElement('select');
    select.id = folder_id;
    select.name = Number(order) + 1;
    select.className = 'flex-column';

    children.forEach(child => {
        let child_node = document.createElement('option');
        child_node.value = child.id;
        child_node.textContent = child.name;
        select.appendChild(child_node);
    });

    root_append.appendChild(select);
    select.value = 1;

    select.addEventListener('change', folderSelectionHandler);
}

function onpageload() {
    getFilesAndMappings().then((response) => {
        data = response;
        if (typeof root_folder_name !== 'undefined') {
            rootFolderSelection(root_folder_name);
        } else {
            rootFolderSelection('word_tester2');
        }
    });
}

window.onload = onpageload;