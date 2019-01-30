const fs = require('fs');
const key = require('./cred.json');
const {google} = require('googleapis');
const stream = require('stream');

const jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null
);

jwToken.authorize((authErr) => {
    if (authErr) {
        console.log("Authorization Error: " + authErr);
    } else {
        console.log("Authorized");
    }
});

const drive = google.drive({version: 'v3'})

function getEverything(callback) {
    drive.files.list({
        auth: jwToken,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, parents)',
    }, callback);
}

function uploadFiles(files, parent_folder_id) {
    console.log('uploadFiles');

    // a list containing all of the promises with the drive calls
    let promise_list = [];

    // iterate through and create the promise for each drive call
    for (const file of files) {
        let bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        promise_list.push(new Promise((resolve, reject) => {
            let file_metadata = {
                'name': file.originalname,
                parents: [parent_folder_id]
            };
            let media = {
                mimeType: file.mimetype,
                body: bufferStream
            };

            drive.files.create({
                auth: jwToken,
                resource: file_metadata,
                media: media,
                fields: 'id'
            }, (err, file) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(file.id);
                }
            });
        }));
    }

    // return a single promise wrapping all of the drive calls into a single callback
    return Promise.all(promise_list);
}

async function createFolders(folder_string, parent_folder_id) {
    console.log('createFolders');
    // replace '\' with '/' and remove quotes and double quotes
    let path = folder_string.replace('\\', '/').replace('\"', '').replace('\'', '');
    // Split the elements by a slash and remove any empty strings caused
    // by double slashes or slashes at the beginning and/or end of the path
    var path_arr = path.split('/').filter(str => str !== '');

    let nextId = parent_folder_id;
    for (const dir of path_arr) {
        await new Promise(resolve => {
            var folder_meta_data = {
                name: dir,
                parents: [nextId],
                mimeType: 'application/vnd.google-apps.folder'
            }
            drive.files.create({
                auth: jwToken,
                resource: folder_meta_data
            }, (err, response) => {
                // TODO fix this please
                if (err) console.log(`err: ${err}`);
                console.log(`response: ${response}`)
                nextId = response.data.id;
                resolve();
            });
        });

        console.log(nextId);
    }

    return nextId;
}

module.exports = {
    //getFilesUnderParent,
    //getFoldersUnderParent,
    getEverything,
    uploadFiles,
    createFolders
}
