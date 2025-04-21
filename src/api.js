import axios from 'axios';

// Backend API URL
const API_URL = 'http://localhost:8000'; // Change this URL to your backend if it's hosted elsewhere

// Function to upload a file to the backend
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // Append the file to the form data

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error('File upload failed');
  }
};

// Function to get the summary from the backend
export const getSummary = async (query) => {
  try {
    const response = await axios.post(`${API_URL}/summarize`, {
      query: query,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting summary:", error);
    throw new Error('Summary generation failed');
  }
};
