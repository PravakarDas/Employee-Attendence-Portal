import api from './api';

export const faceService = {
  // Register face for authenticated user
  registerFace: async (imageBase64) => {
    try {
      const response = await api.post('/face/register', {
        image: imageBase64
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify face (returns matched employee if found)
  verifyFace: async (imageBase64) => {
    try {
      const response = await api.post('/face/verify', {
        image: imageBase64
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete face registration
  deleteFaceRegistration: async () => {
    try {
      const response = await api.delete('/face/register');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get face registration status
  getFaceStatus: async () => {
    try {
      const response = await api.get('/face/status');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default faceService;
