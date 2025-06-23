# Hello Controller

## Opis
Kontroler do prostego endpointu powitania, obsługuje podstawowe zapytania z opcjonalnym parametrem nazwy.

## API Endpoints

### GET /api/hello
- **Opis**: Zwraca powitanie "Hello, World!" lub spersonalizowane z parametrem
- **Parametry**: 
  - `name` (opcjonalny) - nazwa do powitania, może być w query params lub path params
- **Odpowiedź**: JSON z polem `message`, `timestamp` i standardowymi metadanymi API

**Przykładowe zapytania:**
```
GET /api/hello
GET /api/hello?name=John
GET /api/hello/John
```

**Przykładowa odpowiedź:**
```json
{
  "status": "ok",
  "payload": {
    "message": "Hello, John!",
    "timestamp": "2025-06-15T10:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2025-06-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Typy

### HelloResponse
```typescript
interface HelloResponse {
  message: string;
  timestamp: string;
}
```

## Użycie w Frontend

### Komponenty
- **`src/components/api/HelloComponent.tsx`** - Główny komponent UI do testowania endpointu hello
- **`src/pages/lab/Lab.tsx`** (linia 13) - Importuje HelloComponent jako lazy-loaded komponent

### State Management
- **`src/machines/api/helloMachine.ts`** - XState machine do zarządzania stanem zapytań hello API
  - Obsługuje GET /api/hello i GET /api/hello?name=...
  - Zawiera logikę retry i error handling

### Testy
- **`src/services/__tests__/apiServices.test.ts`** (linie 52, 69) - Testy jednostkowe dla endpointu hello
  - Test podstawowego powitania
  - Test spersonalizowanego powitania z parametrem name

## Implementacja
- **Kontroler**: `controller.ts` - implementacja endpointu hello
- **Typy**: `types.ts` - definicje typów dla kontrolera
- **Export**: `index.ts` - re-export wszystkich elementów kontrolera
