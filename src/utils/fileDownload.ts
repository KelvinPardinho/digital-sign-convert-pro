
/**
 * Triggers download of a file from a URL
 */
export const downloadFile = (url: string, filename: string): void => {
  // Create a link to download the file
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads multiple files with a delay between them
 */
export const downloadMultipleFiles = (
  urls: string[], 
  filenamePrefix: string,
  fileExtension: string,
  delayBetweenDownloads = 1000
): void => {
  urls.forEach((url, i) => {
    setTimeout(() => {
      const partNumber = i + 1;
      downloadFile(url, `${filenamePrefix}${partNumber}${fileExtension}`);
    }, i * delayBetweenDownloads);
  });
};
