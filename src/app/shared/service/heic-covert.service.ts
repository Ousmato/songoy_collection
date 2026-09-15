import { Injectable } from '@angular/core';

export type HeicProcessResult = {
  file: File;
  url: string;
  converted: boolean;
};

type ImageProcessOptions = {
  toType?: 'image/png' | 'image/jpeg';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
};

@Injectable({ providedIn: 'root' })
export class HeicConvertService {
  private async loadHeic2Any(): Promise<(opts: any) => Promise<Blob | Blob[]>> {
    // Lazy-load only in the browser to avoid SSR evaluating a window-dependent lib
    if (typeof window === 'undefined') {
      throw new Error('HEIC conversion is browser-only');
    }
    // Import dynamique hors analyse du bundler : la librairie est optionnelle
    // et n'est chargée que lorsqu'un fichier HEIC est sélectionné.
    const load = new Function('return import("heic2any")') as () => Promise<any>;
    const mod = await load();
    // heic2any uses default export
    return (mod as any).default as (opts: any) => Promise<Blob | Blob[]>;
  }
  isHeic(file: File): boolean {
    const type = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return (
      type === 'image/heic' ||
      type === 'image/heif' ||
      name.endsWith('.heic') ||
      name.endsWith('.heif')
    );
  }

  private renameWithExt(name: string, newExt: string): string {
    const idx = name.lastIndexOf('.');
    return (idx > 0 ? name.slice(0, idx) : name) + '.' + newExt;
  }

  async convertIfHeic(
    file: File,
    options?: ImageProcessOptions
  ): Promise<File> {
    if (!this.isHeic(file)) return file;

    const toType = options?.toType ?? 'image/png';
    const quality = options?.quality ?? 0.92;

    const heic2any = await this.loadHeic2Any();
    const outBlob = (await heic2any({
      blob: file,
      toType,
      quality,
    })) as Blob;

    const newExt = toType === 'image/png' ? 'png' : 'jpg';
    return new File([outBlob], this.renameWithExt(file.name, newExt), {
      type: toType,
      lastModified: Date.now(),
    });
  }

  async toDataURL(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async optimizeImage(
    file: File,
    options?: ImageProcessOptions
  ): Promise<File> {
    const sourceFile = await this.convertIfHeic(file, options);
    const toType = options?.toType ?? 'image/jpeg';
    const quality = options?.quality ?? 0.82;
    const maxWidth = options?.maxWidth ?? 1600;
    const maxHeight = options?.maxHeight ?? 1600;

    if (!sourceFile.type.startsWith('image/')) {
      return sourceFile;
    }

    const imageUrl = URL.createObjectURL(sourceFile);

    try {
      const image = await this.loadImage(imageUrl);
      const ratio = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));

      const shouldRebuild =
        sourceFile.type !== toType ||
        width !== image.naturalWidth ||
        height !== image.naturalHeight ||
        sourceFile.size > 900 * 1024;

      if (!shouldRebuild) {
        return sourceFile;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        return sourceFile;
      }

      context.drawImage(image, 0, 0, width, height);
      const blob = await this.canvasToBlob(canvas, toType, quality);
      const newExt = toType === 'image/png' ? 'png' : 'jpg';

      return new File([blob], this.renameWithExt(sourceFile.name, newExt), {
        type: toType,
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Impossible de lire l'image selectionnee."));
      image.src = url;
    });
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: 'image/png' | 'image/jpeg',
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error("Impossible d'optimiser l'image selectionnee."));
        },
        type,
        quality
      );
    });
  }

  async processFileForPreview(
    file: File,
    options?: ImageProcessOptions
  ): Promise<HeicProcessResult> {
    const convertedFile = await this.optimizeImage(file, options);
    const url = await this.toDataURL(convertedFile);
    return { file: convertedFile, url, converted: convertedFile !== file };
  }

  async processFileList(
    fileList: FileList | File[],
    options?: ImageProcessOptions
  ): Promise<HeicProcessResult[]> {
    const results: HeicProcessResult[] = [];
    for (const f of Array.from(fileList)) {
      try {
        results.push(await this.processFileForPreview(f, options));
      } catch (err) {
        try {
          const url = await this.toDataURL(f);
          results.push({ file: f, url, converted: false });
        } catch {
          results.push({ file: f, url: '', converted: false });
        }
      }
    }
    return results;
  }
}
