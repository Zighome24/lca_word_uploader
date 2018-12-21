const fs = require('fs');
const key = require('./cred.json');
const {google} = require('googleapis');

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

function getFilesUnderParent(parentFolderId) {
    drive.files.list({
        q: "'" + parentFolderId + "' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'",
        fields: 'files(id, name)'
    }, (err, { data }) => {
        if (err) return console.log('The API return an error: ' + err);
        const files = data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log('%s ($s)', file.name, file.id);
            })
        } else {
            console.log('No files found');
        }
    });
}

function getFoldersUnderParent(parentFolderId) {
    drive.files.list({
        q: "'" + parentFolderId + "' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)'
    }, (err, { data }) => {
        if (err) return console.log('The API return an error: ' + err);
        const files = data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log('%s ($s)', file.name, file.id);
            })
        } else {
            console.log('No files found');
        }
    });
}

function getEverything() {
    console.log(jwToken.email);
    drive.files.list({
        auth: jwToken,
        pageSize: 10,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, parents)',
    }, (err, { data }) => {
        if (err) return console.log('The API return an error: ' + err);
        const files = data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log('%s (%s) m:%s ', file.name, file.id, file.mimeType, file.parents);
            })
        } else {
            console.log('No files found');
        }
    });
}

module.exports = {
    getFilesUnderParent,
    getFoldersUnderParent,
    getEverything
}
