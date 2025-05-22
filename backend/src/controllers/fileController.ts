import { Request, Response } from 'express';
import { FileRegistrationService } from '../services/fileRegistrationService';
import { FileVerificationService } from '../services/fileVerificationService';
import { FileRegistrationRequest, FileVerificationResult, ApiResponse } from '../types/fileTypes';

export class FileController {
  private registrationService: FileRegistrationService;
  private verificationService: FileVerificationService;

  constructor() {
    this.registrationService = new FileRegistrationService();
    this.verificationService = new FileVerificationService();
  }

  registerFile = async (req: Request, res: Response) => {
    try {
      const registrationData: FileRegistrationRequest = req.body;

      // Validate required fields
      if (!registrationData.fileHash || !registrationData.fileType || !registrationData.description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: fileHash, fileType, or description'
        });
      }

      const txHash = await this.registrationService.registerFile({
        ...registrationData,
        tags: registrationData.tags || [],
        permission: registrationData.permission || 1
      });

      const response: ApiResponse<{ txHash: string }> = {
        success: true,
        data: { txHash },
        message: 'File registered successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Registration error:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : 'File registration failed'
      };
      res.status(500).json(response);
    }
  }

  verifyFile = async (req: Request, res: Response) => {
    try {
      const { hash } = req.params;
      
      if (!hash) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'File hash is required'
        };
        return res.status(400).json(response);
      }

      const result = await this.verificationService.verifyAndGetDetails(hash);

      if (!result || !result.isRegistered) {
        const response: ApiResponse<never> = {
          success: false,
          message: 'File not found on blockchain'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<FileVerificationResult> = {
        success: true,
        data: {
          isRegistered: true,
          entry: result.entry,
          history: result.history
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Verification error:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : 'File verification failed'
      };
      res.status(500).json(response);
    }
  }

  getFileHistory = async (req: Request, res: Response) => {
    try {
      const { hash } = req.params;

      if (!hash) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'File hash is required'
        };
        return res.status(400).json(response);
      }

      const owner = await this.verificationService.getFileOwnerByHash(hash);
      const history = await this.verificationService.getFileHistory(owner, hash);

      const response: ApiResponse<typeof history> = {
        success: true,
        data: history
      };

      res.json(response);
    } catch (error) {
      console.error('History fetch error:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch file history'
      };
      res.status(500).json(response);
    }
  }
}