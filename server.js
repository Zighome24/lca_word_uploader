const express = require('express');
const api = require('./driveAPI');
const multer = require('multer');

const PORT = 12345;
const HOST = '127.0.0.1';

//App
const app = express();

//File-Upload Handling
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.get('/', (req, res) => {
    let filename = 'index.html';
    var options = {
        root: __dirname + '/public/',
        dotfiles: 'ignore',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.set('Content-Type', 'text/html');
    res.sendFile(filename, options, (err) => {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log('Sent: ', filename);
        }
    })
});

app.post('/upload', upload.any(), (req, res) => {
    let filedata = {};
    // multiple file submissions found under req.files
    console.log('/upload');
    console.log(req.files);
    console.log(req.body);

    // check for bad request
    if (req.files.length === 0) {
        res.send({
            'response': 'error',
            'error' : 'No files were sent to the server. Invalid request.'
        });
    }

    let parent_folder_id = req.body.parent_folder_id;
    // create parent folders if necessary and set the parent folder id for the files
    if (req.body.is_new_folder === 'true') {
        // new folders to be added
        api.createFolders(req.body.new_folders_path, parent_folder_id).then(new_p_folder_id => {
            api.uploadFiles(req.files, new_p_folder_id).then(files => {
                res.send({
                    'response':'ok',
                    'file_count': files.length
                });
            }).catch(reject => {
                console.log('There was an error with the file upload.');
                res.send({
                    'response': 'error',
                    'error' : reject.message
                });
            }).catch(_ => {
                res.send({
                    'response': 'error',
                    'error': 'error'
                });
            });
        }).catch(err => {
            console.log('There was an error with the nested folder creation.');
            res.send({
                'response': 'error',
                'error': err
            });
        }).catch(_ => {
            res.send({
                'response': 'error',
                'error': 'error'
            });
        });
    } else {
        api.uploadFiles(req.files, parent_folder_id).then(files => {
            res.send({
                'response':'ok',
                'file_count': files.length
            });
        }).catch(reject => {
            console.log('There was an error with the file upload.');
            res.send({
                'response': 'error',
                'error' : reject
            });
        });
    }
});

app.get('/files', (req , res) => {
    console.log("Fetching Files...");
    api.getEverything((err, response) => {
        if (err) return res.send({'response': 'error', 'error' : err});
        const files = response.data.files;
        if (files.length) {
            console.log('%d Files found', files.length);
        } else {
            console.log('No files found');
        }

        let mapping = makeParentMapping(files);
        //files holds the file info for the shared files
        //mapping holds the parent -> child folder mappings
        res.send({files: files, map: mapping});
    });
});

app.get('/uploader-script', (req, res) => {
    let filename = 'uploader-script.js';
    var options = {
        root: __dirname + '/public/',
        dotfiles: 'ignore',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.set('Content-Type', 'text/javascript');
    res.sendFile(filename, options, (err) => {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log('Sent: ', filename);
        }
    });
});

app.get('/stylesheet', (req, res) => {
    let filename = 'application.css';
    var options = {
        root: __dirname + '/public/',
        dotfiles: 'ignore',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.set('Content-Type', 'text/css');
    res.sendFile(filename, options, (err) => {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log('Sent: ', filename);
        }
    });
});

app.get('/favicon.ico', (req, res) => {
    let filename = 'favicon.ico';
    var options = {
        root: __dirname + '/public/',
        dotfiles: 'ignore',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(filename, options, (err) => {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log('Sent: ', filename);
        }
    });
});

function makeParentMapping(raw_files) {
    let mapping = {};
    if (raw_files == undefined) {
        return mapping;
    }
    raw_files.map((file) => {
        if (file.mimeType == 'application/vnd.google-apps.folder') {
            mapping[file.id] = [];
        }
    });
    raw_files.map((file) => {
        if (file.parents != undefined) {
            let parent = file.parents[0];
            if (mapping[parent] != undefined && file.mimeType == 'application/vnd.google-apps.folder') {
                mapping[parent].push(file);
            }
        }
    });
    return mapping;
}

app.listen(PORT, HOST);
console.log('Running on http://%s:%d', HOST, PORT);