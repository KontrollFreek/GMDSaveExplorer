# GMD Save Explorer
A tool for editing your GD savefiles
# Getting Started
## Prerequisites
To run this project, you must have the following
- Node.js v18.x.x
- NPM / Yarn
- All dependencies installed (`yarn install`)
- git
## Contributing
All main files are stored in `src/`, and the main logic is in `index.html`.

To run the project, run the following.
```shell
yarn install
yarn start
```
To contribute, create [a fork](https://github.com/KontrollFreek/GMDSaveExplorer/fork) of the repo and [submit a pull request](https://github.com/KontrollFreek/GMDSaveExplorer/compare) with all your updated code.
## Compiling
To compile for windows (default), run the following.
```shell
yarn build
```
To compile for other OS's, see the list below.
```shell
# Linux
npx electron-builder build -l
# MacOS / OSX
npx electron-builder build -m
```