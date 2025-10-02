import { Injectable } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/library';

export interface ScanResult {
  text: string;
  cancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private codeReader = new BrowserMultiFormatReader();

  constructor() {}

  async requestPermissions(): Promise<boolean> {
    // PWA/Web: Basic camera support check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera not supported in this browser');
      return false;
    }

    // Check if permission already granted
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissionStatus.state === 'granted') {
          return true;
        }
        if (permissionStatus.state === 'denied') {
          return false;
        }
      } catch (error) {
        console.log('Permissions API not available');
      }
    }

    // Request camera permission with minimal stream
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1 },
          height: { ideal: 1 }
        }
      });

      // Permission granted - stop test stream immediately
      testStream.getTracks().forEach(track => track.stop());
      return true;

    } catch (error: any) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async startScan(): Promise<ScanResult> {
    return this.startWebScan();
  }

  private async startWebScan(): Promise<ScanResult> {
    return new Promise(async (resolve) => {
      try {
        //tatsächliche Berechtigung
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });

        const videoElement = document.createElement('video');
        videoElement.style.position = 'fixed';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.zIndex = '9999';
        videoElement.style.backgroundColor = 'black';
        videoElement.style.objectFit = 'cover';

        const cancelButton = document.createElement('button');
        cancelButton.innerText = 'Abbrechen';
        cancelButton.style.position = 'fixed';
        cancelButton.style.top = '20px';
        cancelButton.style.right = '20px';
        cancelButton.style.zIndex = '10000';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.backgroundColor = '#fff';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.cursor = 'pointer';

        const cleanup = () => {
          stream.getTracks().forEach(track => track.stop());
          if (document.body.contains(videoElement)) {
            document.body.removeChild(videoElement);
          }
          if (document.body.contains(cancelButton)) {
            document.body.removeChild(cancelButton);
          }
          this.codeReader.reset();
        };

        cancelButton.onclick = () => {
          cleanup();
          resolve({ text: '', cancelled: true });
        };

        videoElement.srcObject = stream;
        document.body.appendChild(videoElement);
        document.body.appendChild(cancelButton);

        this.codeReader.decodeFromVideoDevice(null, videoElement, (result, error) => {
          if (result) {
            cleanup();
            resolve({ text: result.getText(), cancelled: false });
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Web barcode scan error:', error);
          }
        });

      } catch (error) {
        console.error('Camera access denied or failed:', error);
        resolve({ text: '', cancelled: true });
      }
    });
  }

  async stopScan(): Promise<void> {
    this.codeReader.reset();
  }
}