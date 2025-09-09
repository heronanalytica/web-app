export interface CustomerFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  storageUrl: string;
}

export interface Props {
  setStepComplete?: (complete: boolean) => void;
  onFileSelected?: (fileId: string) => void;
}
