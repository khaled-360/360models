[![N|Solid](https://360fabriek.nl/bmk.png)](https://360fabriek.nl)

# 360model.admin

## _**(React)** Organisation/Model administrator for the ModelViewer_

![Static Badge](<https://img.shields.io/badge/version-partially_functional_(update_in_progress)-D6161D>)

The **MODAPI** administrator React app.
CRUD app for clients/organisation and (their) 3D models.

### _How to use:_

- `npm install` / `yarn`.
- `npm run dev` / `yarn dev`.
- Log in using a valid **passcode**.

## Features

- `Login.jsx` is the login page, setting the required session when succesfully logged in with a valid passcode.
- `Organisations.jsx` is the main page. Here, all organisation are shown. Clicking one will load that project's models.
- `Models.jsx` is the project's models page. It lists all models within a project with options to `edit` and `delete` them, or add (a) new one(s).
- `/hooks` holds the API hooks file, with all API endpoints **_(API is as of now still set to localhost)_**.
- `AddModel.jsx` and `EditModel.jsx` do what the names suggest, through a modal over the `Models` readout.
