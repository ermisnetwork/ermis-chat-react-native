import axios from 'axios';
import Config from 'react-native-config';
// config

// ----------------------------------------------------------------------

const axiosWalletInstance = axios.create({ baseURL: "https://oauth-staging.ermis.network" });

axiosWalletInstance.interceptors.response.use(
    response => response,
    error => Promise.reject((error.response && error.response.data) || 'Something went wrong'),
);

export default axiosWalletInstance;