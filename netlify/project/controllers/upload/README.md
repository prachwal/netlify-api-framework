# Upload Controller

## Opis
Kontroler do obsługi przesyłania plików z walidacją typu, rozmiaru i bezpiecznego przetwarzania danych.

## API Endpoints

### POST /api/upload
- **Opis**: Przesyła plik na serwer z walidacją i zabezpieczeniami
- **Content-Type**: 
  - `application/json` - dla danych JSON (symulacja przesyłania)
  - `multipart/form-data` - dla rzeczywistych plików (w przyszłości)
- **Body**: JSON z polami:
  - `fileName` (wymagane) - nazwa pliku
  - `fileSize` (wymagane) - rozmiar pliku w bajtach
  - `fileType` (wymagane) - typ MIME pliku
  - `content` (opcjonalne) - zawartość pliku (dla JSON)
- **Odpowiedź**: Informacje o przesłanym pliku

**Przykładowe zapytanie:**
```json
{
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "content": "base64-encoded-content"
}
```

**Przykładowa odpowiedź:**
```json
{
  "status": "ok",
  "payload": {
    "id": "upload_abc123",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedAt": "2025-06-15T10:30:00.000Z",
    "status": "uploaded"
  },
  "metadata": {
    "timestamp": "2025-06-15T10:30:00.000Z",
    "requestId": "req_xyz789",
    "version": "1.0.0"
  }
}
```

## Typy

### UploadFileRequest
```typescript
interface UploadFileRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  content?: string;
}
```

### UploadFileResponse
```typescript
interface UploadFileResponse {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: 'uploaded' | 'processing' | 'failed';
}
```

## Użycie w Frontend

### Komponenty
- **`src/components/api/UploadComponent.tsx`** - Główny komponent UI do przesyłania plików
  - Formularz z drag-and-drop
  - Podgląd wybranego pliku
  - Progress bar dla przesyłania
  - Walidacja po stronie klienta
- **`src/pages/lab/Lab.tsx`** (linia 11) - Importuje UploadComponent jako lazy-loaded komponent

### Testy
- **`src/services/__tests__/apiServices.test.ts`** (linie 372, 405, 428) - Testy API:
  - Test udanego przesłania pliku
  - Test limitu rozmiaru pliku
  - Test nieprawidłowego typu pliku

## Funkcje i Zabezpieczenia

### Walidacja
- **Rozmiar pliku**: Maksymalnie 10MB
- **Typy plików**: Dozwolone typy MIME (obrazy, dokumenty, teksty)
- **Nazwa pliku**: Sanityzacja nazwy, usuwanie niebezpiecznych znaków
- **Content validation**: Sprawdzanie zgodności typu z zawartością

### Zabezpieczenia
- **Sanityzacja**: Czyszczenie wszystkich danych wejściowych
- **Rate limiting**: Ograniczenie liczby zapytań (w przyszłości)
- **Virus scanning**: Skanowanie antywirusowe (w przyszłości)
- **Storage isolation**: Izolacja przesłanych plików

### Supported File Types
- **Images**: jpg, jpeg, png, gif, webp
- **Documents**: pdf, doc, docx, txt
- **Archives**: zip (w przyszłości)

## Implementacja
- **Kontroler**: `controller.ts` - implementacja endpointu upload z walidacją
- **Typy**: `types.ts` - definicje typów dla kontrolera
- **Export**: `index.ts` - re-export wszystkich elementów kontrolera

## Przyszłe Rozszerzenia
- Rzeczywista obsługa multipart/form-data
- Integration z cloud storage (AWS S3, Google Cloud)
- Thumbnails dla obrazów
- Batch upload
- Resume upload dla dużych plików
