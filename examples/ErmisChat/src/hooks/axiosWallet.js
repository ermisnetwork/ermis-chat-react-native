import axios from 'axios';
import Config from 'react-native-config';
// config

// ----------------------------------------------------------------------

const axiosWalletInstance = axios.create({ baseURL: Config.REACT_APP_API_URL_WALLET || "https://oauth.ermis.network" });
axiosWalletInstance.interceptors.response.use(
    response => response,
    error => Promise.reject((error.response && error.response.data) || 'Something went wrong'),
);

export default axiosWalletInstance;