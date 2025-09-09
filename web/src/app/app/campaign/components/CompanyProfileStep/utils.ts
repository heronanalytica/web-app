import { message, Upload } from "antd";

/**
 * Rejects files over 50MB, otherwise allows upload.
 */
export function beforeUpload50MB(file: File) {
  if (file.size > 52428800) {
    message.error("File must be smaller than 50MB!");
    return Upload.LIST_IGNORE;
  }
  return true;
}
