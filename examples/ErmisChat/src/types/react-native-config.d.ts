declare module 'react-native-config' {
    export interface NativeConfig {
        REACT_APP_API_URL: string;
        REACT_APP_API_URL_WALLET: string;
        REACT_APP_PROJECT_ID: string;
        PORT: string;
        HOST: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
