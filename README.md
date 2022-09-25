# About the Aegos App

This dapp is inspired by the idea of people from a closed community coming together to save, invest and borrow funds, also known as a form of rotating savings and credit association (ROSCA), around the world. Aegos addresses the issue that this community faces, which involves low trust in participants and low security of funds as well as fund management costs. With Aegos, there is no middleman involved and the smart contract itself is the fund manager. Here, every fund participant is to pledge crypto collateral of a value 120% greater than their individual fund value (duration * monthly amount), providing security from deposit defaulters. If there is a default in depositing, then all of the crypto collateral is sold, thus keeping the fund alive.   

## Available Scripts

In the project directory, run 'npm install / yarn install' in order to install all the necessary dependencies, after that run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `Browser Issues`

There could be certain function calls to the blockchain that are not working always, for e.g: publicly viewable funds are not loading. Either refresh or try with other browsers.

**Note : You might run into errors due to incorrect filling up of the form. Please use icons if that is the case. 

