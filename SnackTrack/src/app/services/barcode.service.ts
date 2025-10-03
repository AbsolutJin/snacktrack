import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

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

  // Die Methode 'requestPermissions' ist nicht mehr nötig.
  // Capacitor/camera kümmert sich beim Aufruf von getPhoto() selbst darum.

  /**
   * Öffnet die Gerätekamera, um ein einzelnes Bild aufzunehmen und einen Barcode darin zu scannen.
   */
  public async startScan(): Promise<ScanResult> {
    try {
      // 1. Foto mit Capacitor Camera aufnehmen
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false, // Wichtig für Barcodes, um Zuschnitt zu vermeiden
        resultType: CameraResultType.DataUrl, // Gibt eine Base64-repräsentierte Bild-URL zurück
        source: CameraSource.Camera, // Öffnet direkt die Kamera
      });

      // Wenn der Nutzer ein Bild aufgenommen hat
      if (image && image.dataUrl) {
        try {
          // 2. Barcode aus den Bilddaten dekodieren
          const result = await this.decodeBarcodeFromImage(image.dataUrl);
          return { text: result, cancelled: false };
        } catch (error) {
          // ZXing konnte keinen Barcode finden
          console.log('Barcode nicht gefunden im Bild', error);
          return { text: '', cancelled: false }; // Nicht abgebrochen, aber nichts gefunden
          
        }
      } else {
        // Sollte nicht passieren, wenn kein Fehler geworfen wird, aber sicher ist sicher
        return { text: '', cancelled: true };
      }

    } catch (error: any) {
      // 3. Fehler oder Abbruch durch den Benutzer behandeln
      // Capacitor wirft einen Fehler mit der Nachricht 'User cancelled photos app', wenn der Nutzer abbricht
      if (error.message && error.message.includes('cancelled')) {
        console.log('Scan wurde vom Benutzer abgebrochen.');
        return { text: '', cancelled: true };
      } else {
        console.error('Fehler bei der Kameraaufnahme:', error);
        // Anderer Kamerafehler (z.B. Berechtigung verweigert)
        throw error; // Den Fehler weiterwerfen, damit die Komponente ihn fangen kann
      }
    }
  }

  /**
   * Dekodiert einen Barcode aus einer DataUrl (Base64-String).
   */
  private async decodeBarcodeFromImage(dataUrl: string): Promise<string> {
  // Erstelle ein Image-Element im Speicher
  const img = document.createElement('img');
  img.src = dataUrl;

  // Warte, bis das Bild vollständig geladen ist
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });

  // Jetzt, da das Bild geladen ist, dekodiere es.
  // Wichtig: 'await' hier, da decodeFromImageElement ein Promise zurückgibt.
  try {
    const result = await this.codeReader.decodeFromImageElement(img);
    return result.getText();
  } catch (error) {
    // Fange den Fehler hier und werfe ihn weiter, damit die aufrufende Funktion ihn behandeln kann
    console.error('ZXing decode error:', error);
    throw error;
  }
}

  // Die Methode 'stopScan' ist ebenfalls nicht mehr nötig, da es keinen dauerhaften Stream gibt.
}