# lca_word_uploader
### Created by Justin Ziegler
## Lambda Chi Alpha Beta Kappa document uploader to the Academic Word

This is a project started in December 2018 by Justin Ziegler to create the foundations for a page that could provide users the ability to upload files to specific folders in our WORD or common file repository. With a different cred.json file (obtained from the Google Developer Console under Credentials->"Service Accounts") and some Global JS variables set in a script tag on your page, anyone should be able to use the code in this repository to create their own folder selection and (eventually) file upload web pages either for an organization (like in the original case of this project) or for themselves.

## Goals

- To solve the problem of people not uploading files to the common file repository because it takes time and effort.
- To avoid using heavy and/or slow frameworks like jQuery, Bootstrap, etc.
- To use native JavaScript and browser features wherever possible to reduce execution and load time.

## How-to: get started

This how-to is going to assume you have NodeJs, Express, npm, an internet connection, git, a brain, some time, a Google Account, and a focus greater than that of a 4 year-old (the last one isn't actually required, I managed to write this despite that).

1. Clone the git repository [here](https://github.com/Zighome24/lca_word_uploader.git)
2. Go to [Google Developer Console](https://console.developers.google.com)
3. Sign-in using your Google Account
4. Create a new project

    - Name the project, etc.

5. Enable the Google Drive API
6. Go to the credentials tab
7. Create a new service account key

    - Create a new service account, give it a name, role -> owner
    - Use the JSON key type
    - Create and Download

8. Put the downloaded file in the root folder the git repository you downloaded earlier
9. Copy the email of the service account to your clipboard

    - This can be found in the json file you downloaded under client_email

10. Share the google drive folder you want to use with the program with the email of the service account.
11. Open the index.html file in the public/ folder of the repository wth a text editor of your choice.
12. Modify the line "var root_folder_name;" to be "var root_folder_name = '[YOUR FOLDER HERE]';" where the "[YOUR FOLDER HERE]" (including the square brackets) gets changed to the name of the folder you shared with the service account in step 10.
13. Open up the shell/terminal of your choice and go to the root directory of the repository.
14. Run "npm start"

    - You should see some stuff pop up in the console.
    - Importantly you should see a message say "Running on [some web address]" and on the next line "Authorized"

15. Go to the web address (see the step above to get it) listed in the console and see if it works.
16. If it did, awesome! You can use CTRL+C to stop the serve. If it didn't see below.

    - "Authorized" didn't show up in the console after the "Running on..." message
        - Check the error message it gave
        - Go back and check to make sure all directions were followed
        - Google away!
    - No messages appear in the console
        - Make sure you typed the right command and everything is installed
    - No folder selection menus showup
        - Check the console to make sure no errors showed up in it
        - Make sure the folder is shared with the service account
