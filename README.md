# MySafex Android Wallet 

<p align="center">
  <img alt="MySafex" src="https://drive.google.com/file/d/1VQlytjffC6oST-TpHy6egVaH1Is6CooJ/view?usp=sharing">
</p>

<p align="center">
  MySafex Android Wallet
</p>

<p align="center">
  <a href="https://snyk.io/test/github/mysafex/mysafex-utils"><img src="https://drive.google.com/file/d/1VQlytjffC6oST-TpHy6egVaH1Is6CooJ/view?usp=sharing"></a>
  <a href="https://opensource.org/licenses/BSD-3-Clause"><img src="https://img.shields.io/badge/License-BSD%203--Clause-blue.svg"></a>
</p>

## Downloads

Download the latest version from our website at [Play Store](https://play.google.com/store/apps/details?id=com.mysafex.official_android_application) or from the [Releases tab](https://github.com/BlueDragon-Safex/mysafex-android-js/releases/latest).

Developers and pre-release testers who would like to use and work on the app can run it by obtaining the source and running one of the build commands below.

To get set up with the source code, please see **Getting the Source Code** below.

### Where is user data saved?

* Android: The data is encrypted and saved to the Android device using an implementation that leverages AndroidKeyStore and SharedPreferences.
* Web: The data is saved to the browser's local storage.

#### Data storage warnings: 

* Android API < 18 does not support AndroidKeyStore. Android API < 18 values are stored fallback to being stored as simple base64 encoded strings. 
* Since web browsers don't have an equivalent of Android's secure storage, data is base64-encoded before being stored in the browser's Local Storage.

## Reporting Bugs & Making Feature Requests

If you would like to report an issue or share a feature request, please create a Github [Issue](https://github.com/BlueDragon-Safex/safex-android-js/issues) on this project.

If you're reporting a bug, be sure to include all information which we would need to reproduce the issue, such as the operating system and app version on which you saw the bug, and the steps you took, if you can tell. 

Please don't use the Issues tracker for general support or inquiries. You can also [contact us](https://globalsafex.com/support) directly.

## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/). You will also need [Android Studio](https://developer.android.com/studio)

Clone the repo and install the dependencies.
```bash
git clone https://github.com/BlueDragon-Safex/mysafex-android-js.git
cd mysafex-android-js
```
```bash
npm install
```

To open the android app in Android studio, run the following
```bash
npm run build
```

To run the app in a web browser, run the following
```bash
npm start
```

This will build and package the web version of the application in the `browser_build` folder. Once that is done, it will initialise all necessary build files for your Android application. Finally, it will attempt to open the project in Android Studio.  

## Suggested development workflow

As the application is essentially a web application which gets transpiled into Java by Capacitor, rather than transpile and build each time, we do most of our development work by running a server that serves the browser_build folder, and accessing it in Chrome. Barring unusual cases, changes made and tested on Chrome will function properly once transpiled.

When developing in this fashion, one can run a server with hot-reload enabled by using the `npm run watch` command

## Debugging the Android application

Should you run into any issues with the transpiled application, you are able to debug the application by making use of Android WebView debugging and the Chrome browser. In order to do so, follow the instructions below: 

1. Add the following code snippet to the app/java/com.mysafex.android/MainActivity.java file inside the `onCreate()` function

```
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
    WebView.setWebContentsDebuggingEnabled(true);
}
```
2. Open Chrome
3. Navigate to chrome://inspect/#devices
4. Under "Remote Target", you should see a WebView titled "WebView in com.mysafex.android"
5. Click "inspect" to open the WebView in DevTools


## Building for Production

1. Follow the steps under `Download and Build`.
2. Use Android Studio to build the .APK file

## Contributing

### Testing

Please submit any bugs as Issues unless they have already been reported.

Suggestions and feedback are very welcome!


### Developing

If you have an improvement to the codebase and would like to have your code shipped in the production MySafex app, please submit a [pull request](https://help.github.com/articles/about-pull-requests/), even if it's still a WIP. We try to credit all contributors in app release notes.

* Merging PRs which involve integrating with any third-party services will require discussion and agreement.  

* We reserve the right to refuse to merge any PRs, such as those which introduce breaking changes.

### Donating

MySafex Donation Address (SFX): Safex5yti8n7NAZTzb3bzmPzq7V1u37Fv8b3B6PgjisyUkJphEJ9hcHShtrZBpHtvg7ZYFxQD2pEw12jJy8gdahKdkNGF3LecMC2r

Proceeds from donations are used to fund development on the MySafex back-end server (a performant version of which we soon™ plan to open-source for anyone to run their own server at home). Any remaining funds will go towards product (app UI) R&D, and hosting costs.

## License and Copyrights

See `LICENSE.txt` for license.

All app source code and assets copyright © 2014-2021 by MySafex. All rights reserved.

## Acknowledgements

Contributors to each release are credited in release notes.

### Core Contributors

* 💱 `jkarlos` ([Karl Buys](https://github.com/karlbuys)) Lead maintainer; core developer

* 🍕 `Tekkzbadger` ([Devin Pearson](https://github.com/devinpearson)) Maintainer; core developer

* 🦄 `fluffyponyza` ([Riccardo Spagni](https://github.com/fluffypony)) Advisor; MySafex founder; Safex core team member

* 🏂 `endogenic` ([Paul Shapiro](https://github.com/paulshapiro)) Former core maintainer; MySafex core contributor

* 😎 `vtnerd` ([Lee Clagett](https://github.com/vtnerd)) Lead back-end developer

* 🍄 `luigi` Safex tech advisor; Main MySafex JS core crypto contributor

* 🔥 `mds` ([Matt Smith](http://mds.is)) MVP designer

* 🌠 Your name here?

## License and Copyrights

See `LICENSE.txt` for license.

All app source code and assets copyright © 2014-2021 by MySafex. All rights reserved.
