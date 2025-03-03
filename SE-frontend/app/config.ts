// export const config = {
//   apiUrl: "http://localhost:3001",
// };
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || "http://localhost:5000",
};
