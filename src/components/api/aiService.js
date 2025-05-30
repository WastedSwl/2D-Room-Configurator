import axiosInstance from './axiosConfig';

const API_URL = '/api/ai';

const generateModuleConfig = (userQuery) => {
  return axiosInstance.post(`${API_URL}/generate-module`, { userQuery });
};

const aiService = {
  generateModuleConfig,
};

export default aiService;