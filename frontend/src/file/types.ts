export interface FileEntry {
    file_hash: string;
    root_hash: string;
    owner: string;
    signer: string;
    timestamp: number;
    parent_hash: string;
    file_type: string;
    description: string;
    tags: string[];
    permission: number;
  }
  
  export interface FileHistory {
    versions: string[];
  }
  
  export interface FileRegistrationParams {
    fileHash: string;
    parentHash?: string;
    fileType: string;
    description: string;
    tags: string[];
    permission: number;
  }
  export interface FileRegistrationRequest {
    fileHash: string;
    parentHash?: string;
    fileType: string;
    description: string;
    tags?: string[];
    permission?: number;
  }
  
  export interface FileVerificationResult {
    isRegistered: boolean;
    entry?: FileEntry;
    history?: FileHistory;
  }

  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }