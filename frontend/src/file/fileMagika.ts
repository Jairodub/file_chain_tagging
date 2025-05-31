import { Magika } from 'magika';

export class MagikaService {
    private magika: Magika | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        if (!this.magika) {
            this.magika = await Magika.create();
        }
    }

    async analyzeFile(file: File): Promise<{
        fileType: string;
        confidence: number;
    }> {
        if (!this.magika) {
            await this.initialize();
        }

        const buffer = await file.arrayBuffer();
        const result = await this.magika!.identifyBytes(new Uint8Array(buffer));
        
        return {
            fileType: result.prediction.dl.label,
            confidence: result.prediction.score
        };
    }

    async dispose() {
        this.magika = null;
    }
}