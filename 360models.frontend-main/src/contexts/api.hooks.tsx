// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import useSWR from 'swr';
//
// const API_URL = import.meta.env.VITE_BACKEND_URL;
// const fetcher = (url) =>
//   fetch(url, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   }).then((res) => res.json());
//
// export function useIsAdmin() {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const { data, error } = useSWR(`${API_URL}/users/me`, fetcher);
//
//   useEffect(() => {
//     if (data) {
//       const userRole = data?.role;
//       if (userRole === 'Admin') {
//         setIsAdmin(true);
//       } else {
//         setIsAdmin(false);
//       }
//     }
//   }, [data]);
//
//   return { isAdmin, error };
// }
//
// export type Organisation = {
//   id: string;
//   name: string;
//   language: string;
//   updatedAt: string;
//   models: Model[];
// };
//
// export function useOrganisations(organisationId: string = null) {
//   const { data, error, isLoading, mutate } = useSWR<Organisation[]>(`${API_URL}/organisations`, fetcher);
//   const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | undefined>(undefined);
//
//   useEffect(() => {
//     if (data) {
//       setSelectedOrganisation(data.find((organisation) => organisation.id === organisationId));
//       // console.log("Selected organisation:", organisationId);
//     }
//     // console.log("Organisation ID:", organisationId);
//     // console.log("Selected Organisation:", selectedOrganisation);
//   }, [data, organisationId]);
//
//   return {
//     data,
//     isLoading,
//     isError: error,
//     mutateOrganisations: mutate,
//     selectedOrganisation,
//   };
// }
//
// export function fetchUserOrganisations(organisationId: string = null) {
//   const { data, error, isLoading, mutate } = useSWR<Organisation[]>(`${API_URL}/organisations/me`, fetcher);
//   const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | undefined>(undefined);
//
//   useEffect(() => {
//     if (data) {
//       setSelectedOrganisation(data.find((organisation) => organisation.id === organisationId));
//     }
//   }, [data, organisationId]);
//
//   return {
//     data,
//     isLoading,
//     isError: error,
//     mutateOrganisations: mutate,
//     selectedOrganisation,
//   };
// }
//
// export const useKeys = (organisationId) => {
//   const [keys, setKeys] = useState([]);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const fetchKeys = async () => {
//       try {
//         if (!organisationId) {
//           console.warn("No organisationId provided");
//           return;
//         }
//
//         const response = await axios.get(`${API_URL}/organisations/${organisationId}/api-keys`, {
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           }
//         });
//         // console.log("Fetched keys:", response.data);
//         setKeys(response.data);
//       } catch (err) {
//         // console.error("Error fetching keys:", err);
//         setError(err);
//         setKeys([]); // Empty array in case of errors
//       }
//     };
//
//     fetchKeys();
//   }, [organisationId]);
//
//   return { keys, error, setKeys };
// };
//
// export async function addKey(name: string, organisationId) {
//   if (!organisationId) {
//     throw new Error('Organisation ID is required');
//   }
//
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ name, organisationId }),
//   };
//
//   try {
//     const response = await fetch(`${API_URL}/organisations/${organisationId}/api-keys`, requestOptions);
//
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Server response not OK: ${errorData.message}`);
//     }
//
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Failed to add API key:', error.message);
//     throw error;
//   }
// }
// export function useDeleteKey(organisationId) {
//   const [error, setError] = useState(null);
//
//   const deleteKey = async (key) => {
//     const requestOptions = {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ id: key }),
//     };
//
//     try {
//       const response = await fetch(`${API_URL}/organisation/api-keys/${key}/delete`, requestOptions);
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       const text = await response.text();
//       const data = text ? JSON.parse(text) : null;
//       if (data) {
//         console.log('Deletion data:', data);
//       }
//       return data;
//     } catch (error) {
//       console.error("Error deleting key:", error);
//       setError(error);
//       throw error;
//     }
//   };
//
//   return { deleteKey, error };
// }
//
// export type User = {
//   id: string;
//   email: string;
//   createdAt: string;
//   updatedAt: string;
//   users: User[];
// };
//
// export const useUsers = (organisationId) => {
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         if (!organisationId) {
//           console.warn("No organisationId provided");
//           return;
//         }
//
//         const response = await axios.get(`${API_URL}/organisations/${organisationId}/users`, {
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           }
//         });
//         // console.log("Fetched users:", response.data);
//         setUsers(response.data);
//       } catch (err) {
//         // console.error("Error fetching users:", err);
//         setError(err);
//         setUsers([]); // Empty array in case of errors
//       }
//     };
//
//     fetchUsers();
//   }, [organisationId]);
//
//   return { users, error, setUsers };
// };
//
// export const useDeleteUser = (organisationId) => {
//   const [error, setError] = useState(null);
//
//   const deleteUser = async (userId) => {
//     try {
//       const response = await axios.post(
//         `${API_URL}/organisations/me/users/delete`,
//         { userId },
//         {
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//           }
//         }
//       );
//       return response.data;
//     } catch (err) {
//       setError(err);
//       console.error("Error deleting user:", err);
//       throw err;
//     }
//   };
//
//   return { deleteUser, error };
// };
//
// export async function signupUser(email: string, password: string) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ email, password }),
//   };
//
//   try {
//     const response = await fetch(`${API_URL}/auth/signup`, requestOptions);
//
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Server response not OK: ${errorData.message}`);
//     }
//
//     const data = await response.json();
//     console.log('Signup successful, received token:', data.access_token);  // Debugging
//     return data.user.id;
//   } catch (error) {
//     console.error('Failed to sign up user:', error.message);
//     throw error;
//   }
// }
//
// export async function addUserToOrganisation(userId: string, organisationId: string) {
//   const token = localStorage.getItem('token');
//
//   if (!token) {
//     throw new Error('No token found in localStorage');
//   }
//
//   console.log('Using token:', token);
//
//   const requestOptions = {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//   };
//
//   try {
//     console.log(`Adding user ${userId} to organisation ${organisationId}`);
//     const response = await axios.post(
//       `${API_URL}/organisations/${organisationId}/users`,
//       { userId },
//       requestOptions
//     );
//
//     console.log('User successfully added to organisation', response.data);
//     return true;
//   } catch (error) {
//     if (error.response) {
//       console.error('Server response:', error.response.data);
//       if (error.response.status === 403) {
//         console.error('Forbidden: The server understood the request, but refuses to authorize it.');
//       }
//       throw new Error(`Server response not OK: ${error.response.data.message}`);
//     } else {
//       console.error('Failed to add user to organisation:', error.message);
//       throw new Error('Failed to add user to organisation');
//     }
//   }
// }
//
// export type Model = {
//   id: string;
//   name: string;
//   splat_file: string;
//   ply_file: string;
//   organisation_id: number;
//   createdAt: string;
//   updatedAt: string;
// };
//
// const useModels = (organizationId: string) => {
//   const [models, setModels] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//
//   const fetchModels = async () => {
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/organisations/${organizationId}/models`,
//         {
//           headers: {
//             'accept': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         }
//       );
//       setModels(response.data);
//     } catch (err) {
//       console.error('Error fetching models:', err);
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const addModel = async (name: string, placementType: string) => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/organisations/${organizationId}/models`,
//         { name, placement_type: placementType },
//         {
//           headers: {
//             'accept': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       setModels([...models, response.data]);
//     } catch (err) {
//       console.error('Error adding model:', err);
//       setError(err.response?.data?.message || err.message);
//     }
//   };
//
//   const editModel = async (model: any, modelId: string) => {
//     const url = `${import.meta.env.VITE_BACKEND_URL}/models/${modelId}/edit`;
//     console.log(`POST Request to: ${url}`, model);
//     try {
//       await axios.post(url, model, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (err) {
//       console.error('Error editing model:', err.response?.data?.message || err.message);
//       throw new Error('Error editing model');
//     }
//   };
//
//   useEffect(() => {
//     if (organizationId) {
//       fetchModels();
//     }
//   }, [organizationId]);
//
//   return { models, loading, error, addModel, fetchModels, editModel };
// };
//
// export default useModels;
//
// export const useFetchFiles = (modelId) => {
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const fetchFiles = async () => {
//       if (!modelId) {
//         console.warn("No modelId provided");
//         return;
//       }
//
//       setLoading(true);
//       setError(null);
//
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/models/${modelId}/files`, {
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         setFiles(response.data);
//       } catch (err) {
//         console.error('Error fetching files:', err);
//         setError(err.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchFiles();
//   }, [modelId]);
//
//   return { files, loading, error };
// };
//
// export const thisFile = (fileId) => {
//   const [file, setFile] = useState({});
//
//   useEffect(() => {
//     const fetchFile = async () => {
//       if (!fileId) {
//         console.warn("No fileId provided");
//         return;
//       }
//
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/files/${fileId}`, {
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         setFile(response.data);
//       } catch (err) {
//         console.error('Error fetching file:', err);
//       }
//     };
//
//     fetchFile();
//   }, [fileId]);
//
//   return { file };
// };
//
// export function deleteFile(fileId) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ id: fileId })
//   };
//
//   return fetch(`${API_URL}/files/${fileId}/delete`, requestOptions)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       return response.text()
//         .then(text => {
//           return text ? JSON.parse(text) : null; // Parse text if not empty
//         });
//     })
//     .then(data => {
//       if (data && data.success) {
//         console.log('Deletion successful');
//         return true;
//       } else if (data && data.error) {
//         throw new Error(data.error);
//       } else {
//         console.log('File deleted successfully');
//         return true;
//       }
//     })
//     .catch(error => {
//       console.error("Error deleting file:", error);
//       throw error;
//     });
// }
//
// export const editFile = async (data, fileId) => {
//   const url = `${import.meta.env.VITE_BACKEND_URL}/files/${fileId}/edit`;
//   try {
//     await axios.post(url, data, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (err) {
//     console.error('Error editing file:', err.response?.data?.message || err.message);
//     throw new Error('Error editing file');
//   }
// };
//
// export const useFetchViewerSettings = (modelId) => {
//   const [viewerSettings, setViewerSettings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//
//   const fetchViewerSettings = async () => {
//     if (!modelId) {
//       console.warn("No modelId provided");
//       return;
//     }
//
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/models/${modelId}/viewer-settings`, {
//         headers: {
//           'Accept': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       setViewerSettings(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const editViewerSetting = async (data, viewerSettingId) => {
//     const url = `${import.meta.env.VITE_BACKEND_URL}/model/viewer-settings/${viewerSettingId}/edit`;
//     try {
//       await axios.post(url, data, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (err) {
//       console.error('Error editing viewer setting:', err.response?.data?.message || err.message);
//       throw new Error('Error editing viewer setting');
//     }
//   };
//
//   const deleteViewerSetting = async (viewerSettingId) => {
//     const url = `${import.meta.env.VITE_BACKEND_URL}/model/viewer-settings/${viewerSettingId}/delete`;
//     try {
//       await axios.post(url, {}, {  // Send an empty object instead of null to prevent issues
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (err) {
//       console.error('Error deleting viewer setting:', err.response?.data?.message || err.message);
//       throw new Error('Error deleting viewer setting');
//     }
//   };
//
//   useEffect(() => {
//     if (modelId) {
//       fetchViewerSettings();
//     }
//   }, [modelId]);
//
//   return { viewerSettings, fetchViewerSettings, editViewerSetting, deleteViewerSetting, loading, error };
// };
//
// export async function login(email: string, password: string) {
//   try {
//     const response = await fetch(`${API_URL}/auth/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await response.json();
//     if (data.access_token) {
//       return data.access_token;
//     }
//     throw new Error(data.message);
//   } catch (error) {
//     console.error('Failed to log in:', error);
//     return null;
//   }
// }
//
// export function createModel(data) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//     body: data,
//   };
//
//   return fetch(`${API_URL}/models`, requestOptions)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (data.success) {
//         return true;
//       }
//       throw new Error(data.error);
//     });
// }
//
// export function editModel(data, modelId) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   };
//
//   return fetch(`${API_URL}/models/${modelId}/edit`, requestOptions)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       return response.json();
//     })
// }
//
// export function editOrganisation(data, organisationId) {
//   console.log(data, organisationId, localStorage.getItem('token'));
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   };
//
//   return fetch(`${API_URL}/organisations/${organisationId}/edit`, requestOptions)
//     .then((response) => {
//       console.log(response);
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       return response.json();
//     })
// }
//
// export function deleteModel(modelId) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json'  // Ensuring Content-Type is set for JSON
//     },
//     body: JSON.stringify({ id: modelId })
//   };
//
//   return fetch(`${API_URL}/models/${modelId}/delete`, requestOptions)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       // Convert response to text first, then decide to parse or not
//       return response.text() // Convert response to text first
//         .then(text => {
//           return text ? JSON.parse(text) : null; // Parse text if not empty
//         });
//     })
//     .then(data => {
//       if (data && data.success) {
//         console.log('Deletion successful');
//         return true;
//       } else if (data && data.error) {
//         throw new Error(data.error);
//       } else {
//         console.log('Model deleted successfully');
//         return true;  // Assuming success if no data but response was OK
//       }
//     })
//     .catch(error => {
//       console.error("Error deleting model:", error);
//       throw error;  // rethrow to allow catching by caller
//     });
// }
//
// export function createOrganisation(data) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   };
//
//   return fetch(`${API_URL}/organisations`, requestOptions)
//     .then((response) => {
//       return response.json().then((data) => {
//         if (!response.ok) {
//           console.error('Server error data:', data);
//           throw new Error(`Server response not OK: ${response.status} - ${data.message}`);
//         }
//         return data;
//       });
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//       throw error;
//     });
// }
//
// export function deleteOrganisation(organisationId) {
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ id: organisationId })
//   };
//
//   return fetch(`${API_URL}/organisations/${organisationId}/delete`, requestOptions)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Server response not OK');
//       }
//       // Attempt to parse JSON, but handle empty responses gracefully
//       return response.text()  // First convert response to text
//         .then(text => {
//           return text ? JSON.parse(text) : null;  // Parse text if it's not empty
//         });
//     })
//     .then(data => {
//       if (data) {
//         console.log('Deletion data:', data);
//       } else {
//         console.log('Organisation deleted successfully');
//       }
//       return data;  // return data or null depending on the response
//     })
//     .catch(error => {
//       console.error("Error deleting organisation:", error);
//       throw error;  // rethrow to allow catching by caller
//     });
// }
//
// export function useDownloadFile() {
//   const downloadFile = async (fileId: string) => {
//     try {
//       const response = await axios.get(`${API_URL}/files/${fileId}/signedUrl?expiry=0`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//
//       const signedUrl = response.data;
//       if (!signedUrl) {
//         throw new Error('Failed to obtain signed URL');
//       }
//
//       const link = document.createElement('a');
//       link.href = signedUrl;
//       link.setAttribute('download', `${fileId}`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//
//     } catch (error) {
//       console.error('Failed to download file:', error);
//       throw error;
//     }
//   };
//
//   return { downloadFile };
// }
