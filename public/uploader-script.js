// GLOBAL VARIABLE TO HOLD THE FILE AND MAPPING DATA
var data;
// GLOBAL VARIABLE TO HOLD THE HIGHEST ORDER SELECT / NEW FOLDER
var high_order = 0;
// GLOBAL VARIABLE TO HOLD THE NUMBER OF FOLDER LOCATIONS BEING SUBMITTED TO
var folder_submissions = 1;

/* Optional Javascript Global Variables for custom settings:
    root_select_elem (default: 'folder_selection') - set this to a custom
        value in a script tag on the page if you want to change the id
        used to identify the element to hold the select menus under.
    root_folder_name - set this to the name of the root folder on Google Drive
        that you want to show folder names under.
    folder_name_id (default: 'newfolder_txt') - set this to a custom value in a
        script tag on the page if you want to change the id used to identify
        the textbox that would provide the name for a new folder.
    folder_id_input_id (default: 'folder_id_input') - set this to a custom
        value in a script tag on the page if you want to change the id used to
        identify the hidden input that contains the folder id of the folder you
        want to add the file to
    folder_name_input_id (default: 'folder_name_input') - set this to a custom
        value in a script tag if you want to change the id used to identify
        the hidden input that contains the name of a new folder to add to the drive
    file_input_id (default: 'file') - set this to a custom value in a script tag
        if you want to change the id used to identify the input tag used to upload
        a file
    submit_button_id (default: 'submit_button') - set this to a custom value in
        a script tag if you want to change the id used to identify the button that
        activates the file upload and possibly folder creation
    clear_file_button_id (default: 'clear_button') - set this to a custom value in
        a script tage if you want to change the id used to identify the button that
        clears the files in the file upload element.
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
    let root_select_append;
    if (typeof root_select_elem !== 'undefined') {
        root_select_append = document.getElementById(root_select_elem);
    } else {
        root_select_append = document.getElementById('folder_selection');
    }

    let select_list = document.getElementsByTagName('select');
    for (var i = 0; i < select_list.length; i++) {
        let element = select_list[i];
        if (Number(element.name) >= (Number(order) + 1)) {
            if (element.selectedIndex >= 0 && element.options[element.selectedIndex].value === 'new folder') {
                if (typeof folder_name_id !== 'undefined') {
                    root_select_append.removeChild(document.getElementById(folder_name_id));
                } else {
                    root_select_append.removeChild(document.getElementById('newfolder_txt'));
                }
            }
            root_select_append.removeChild(element);
            // displace the iterator counter to account
            // for the live html collection that is dynamic
            i--;
        }
    }

    let children;

    if (folder_id === 'new folder') {
        let textbox = document.createElement('input');
        textbox.type = 'text';
        // undefine check for the upload_form_id
        if (typeof upload_form_id !== 'undefined') {
            textbox.form = document.getElementById(upload_form_id);
        } else {
            textbox.form = document.getElementById('file_upload_form');
        }
        // undefine check for the folder_name_id 
        if (typeof folder_name_id !== 'undefined') {
            textbox.id = folder_name_id;
        } else {
            textbox.id = 'newfolder_txt';
        }
        textbox.name = 'newfolder_txt';
        root_select_append.appendChild(textbox);
        high_order = order === 0 ? Number(order) + 1 : Number(order);
        return;
    } else {
        let textbox;
        if (typeof folder_name_id !== 'undefined') {
            textbox = document.getElementById(folder_name_id);
        } else {
            textbox = document.getElementById('newfolder_txt');
        }
        if (textbox !== null) {
            root_select_append.removeChild(textbox);
        }
    }

    let select = document.createElement('select');
    select.id = folder_id;
    select.name = Number(order) + 1;
    select.className = 'flex-column';

    // quick fix to make sure the root new folder selector works
    high_order = order === 0 ? Number(order) + 1 : Number(order);

    children = data.map[folder_id];
    if (children.length !== 0) {
        children.forEach(child => {
            let child_node = document.createElement('option');
            child_node.value = child.id;
            child_node.textContent = child.name;
            select.appendChild(child_node);
        });
    }
    let child_node = document.createElement('option');
    child_node.value = 'new folder';
    child_node.textContent = 'New Folder';
    select.appendChild(child_node);

    root_select_append.appendChild(select);
    select.value = 1;

    select.addEventListener('change', folderSelectionHandler);
}

function formSubmitMiddleware() {
    console.log('formSubmitMiddleware');
    let folder_id_selectors = document.getElementsByName(high_order);
    let new_folder_name;
    if (typeof folder_name_id !== 'undefined') {
        new_folder_name = document.getElementById(folder_name_id);
    } else {
        new_folder_name = document.getElementById('newfolder_txt');
    }

    if (folder_id_selectors.length === 0) {
        console.log('Error: the script was unable to find the folder element.');
        return;
    }

    let parent_folder_id = (folder_id_selectors[0]).options[(folder_id_selectors[0]).selectedIndex].value;

    // check for new folder in root select element
    // replace id 'new folder' with the actual id of the 
    if (parent_folder_id === 'new folder') {
        if (typeof root_folder_name !== 'undefined') {
            parent_folder_id = (data.files.find(value => value.name === root_folder_name)).id;
        } else {
            parent_folder_id = (data.files.find(value => value.name === 'Word_Testing')).id;
        }
    }
    
    // undefined check for a custom id for file input id
    if (typeof file_input_id !== 'undefined') {
        var file_input = document.getElementById(file_input_id);
    } else {
        var file_input = document.getElementById('file');
    }

    if (file_input.files.length === 0) {
        alert("You must choose at least one file to upload to the WORD before clicking submit.");
        return;
    }

    if (new_folder_name !== null && new_folder_name.value.length === 0) {
        alert('Failed to submit the file, the new folder name cannot be empty.');
        return;
    }

    // VARIABLES -> MEANINGS
    // new_folder_name -> either the textbox with the new folder name or NULL
    // user_elem -> the highest order select element
    // file_input -> input tag containing the files choosen for upload
    let form_data = new FormData();

    if (new_folder_name === null) {
        // no new folder, just the select menu item
        form_data.append('parent_folder_id', parent_folder_id);
        form_data.append('is_new_folder', false);
        for (const file of file_input.files) {
            form_data.append('files[]', file, file.name);
        }
    } else {
        // new folder, and grab the folder id to create the folder under
        form_data.append('parent_folder_id', parent_folder_id);
        form_data.append('is_new_folder', true);
        form_data.append('new_folders_path', new_folder_name.value);
        for (const file of file_input.files) {
            form_data.append('files[]', file, file.name);
        }
    }
    
    // upload fetch request to push the files to the server
    // handle the error response or take in the count of the new files
    // and make sure to reset the page and refetch the filesandmappings
    // (thinking of calling getFilesAndMappings() and making my own handler
    // instead of calling onpageload since I'm avoiding refreshing the page)
    fetch('/upload', {
        method: "POST",
        body: form_data,
        redirect: "manual"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } throw new Error('Network Response was not ok.');
    }).then((json) => {
        if (json.response === 'error') {
            throw new Error('There was an error on the server.' + json.error);
        } else if (json.response === 'ok') {
            alert('Your ' + json.file_count + ' files have been added to the WORD.');
            resetUI();
            getFilesAndMappings().then((response) => {
                data = response;
                console.log("Resetting the file select menus.");
                if (typeof root_folder_name !== 'undefined') {
                    rootFolderSelection(root_folder_name);
                } else {
                    rootFolderSelection('Word_Testing');
                }
            });
        } else {
            throw new Error('The server provided an unexpected response.');
        }
    }).catch((error) => {
        console.log('There was a problem when fetching files: ', error.message);
    });
}

function resetUI() {
    let root_select_append;
    // undefined check for custom id of root select menu div
    if (typeof root_select_elem !== 'undefined') {
        root_select_append = document.getElementById(root_select_elem);
    } else {
        root_select_append = document.getElementById('folder_selection');
    }

    root_select_append.innerHTML = '';

    let file_input;
    // undefined check for a custom id for file input id
    if (typeof file_input_id !== 'undefined') {
        file_input = document.getElementById(file_input_id);
    } else {
        file_input = document.getElementById('file');
    }

    file_input.value = '';
}

function onpageload() {
    getFilesAndMappings().then((response) => {
        data = response;
        if (typeof root_folder_name !== 'undefined') {
            rootFolderSelection(root_folder_name);
        } else {
            rootFolderSelection('Word_Testing');
        }
    });

    let submit_button;
    // undefine check for the upload_form_id
    if (typeof submit_button_id !== 'undefined') {
        submit_button = document.getElementById(submit_button_id);
    } else {
        submit_button = document.getElementById('submit_button');
    }

    submit_button.onclick = formSubmitMiddleware;

    let clear_button;
    // undefined check for a custom id for file input id
    if (typeof clear_file_button_id !== 'undefined') {
        clear_button = document.getElementById(clear_file_button_id);
    } else {
        clear_button = document.getElementById('clear_button');
    }
    
    clear_button.onclick = function() {
        // undefined check for a custom id for file input id
        if (typeof file_input_id !== 'undefined') {
            var file_input = document.getElementById(file_input_id);
        } else {
            var file_input = document.getElementById('file');
        }

        file_input.value = '';
    };
}

window.onload = onpageload;