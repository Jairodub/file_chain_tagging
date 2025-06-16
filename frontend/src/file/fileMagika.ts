import { Magika } from 'magika';

export class MagikaService {
    private magika: Magika | null = null;
    private isInitializing = false;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Prevent multiple simultaneous initializations
        if (this.isInitializing || this.magika) {
            return;
        }

        try {
            this.isInitializing = true;
            this.magika = await Magika.create();
        } catch (error) {
            console.error('Failed to initialize Magika:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async analyzeFile(file: File): Promise<{
        fileType: string;
        confidence: number;
    }> {
        if (!this.magika) {
            await this.initialize();
        }

        try {
            const buffer = await file.arrayBuffer();
            const result = await this.magika!.identifyBytes(new Uint8Array(buffer));
            
            return {
                fileType: result.prediction.dl.label,
                confidence: result.prediction.score
            };
        } catch (error) {
            console.error('File analysis failed:', error);
            throw error;
        }
    }

   async dispose() {
        if (this.magika) {
            this.magika = null;
        }
    }
}