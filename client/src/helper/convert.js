/**image onto base64 */

export default function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const filReader = new FileReader();
    filReader.readAsDataURL(file);

    filReader.onload = () => {
      resolve(filReader.result);
    };
    filReader.onerror = (error) => {
      reject(error);
    };
  });
}
