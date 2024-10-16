## How to run the app

- Please make sure you have installed necessary dependencies depending on your development OS and target OS. Follow the guidelines given on official React Native documentation for installing dependencies: <https://facebook.github.io/react-native/docs/getting-started>
- Make sure node version is >= v10.13.0

### Clone the project

```bash
git clone https://github.com/ermisnetwork/ermis-chat-react-native.git
```
### Install the dependencies

1. In the root install the dependencies:

```bash
yarn install
```

2. Move to the `package` directory and install the dependencies:

```bash
cd package && yarn install
```

3. Move to the `native-package` directory and install the dependencies:

```bash
cd native-package && yarn install
```

4. Finally, Move to the app directory and install the dependencies:

```bash
cd ../../examples/ErmisChat && yarn install
```

### Install Pods for iOS

```bash
cd ios && pod install
```

### Run

To run the application for different platforms, use the following commands:

```bash
yarn start
```

- For iOS

```bash
yarn ios
```

- For android

```bash
yarn android
```

If you run into following error on android:

```bash
Execution failed for task ':app:validateSigningDebug'.
> Keystore file '/path_to_project/ermit-chat-react-native/examples/ErmitChat/android/app/debug.keystore' not found for signing config 'debug'.
```

You can generate the debug Keystore by running this command in the `android/app/` directory: `keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000` - [Reference](https://github.com/facebook/react-native/issues/25629#issuecomment-511209583)