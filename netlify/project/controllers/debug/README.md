# Debug Controller

## Opis
Kontroler do debugowania i sprawdzania zmiennych środowiskowych aplikacji. Pomocny podczas rozwoju i rozwiązywania problemów konfiguracyjnych.

## API Endpoints

### GET /api/debug-env
- **Opis**: Zwraca informacje o środowisku i konfiguracji aplikacji
- **Parametry**: Brak
- **Odpowiedź**: JSON z informacjami o środowisku, zmiennych Auth0, MongoDB i systemie

**Przykładowa odpowiedź:**
```json
{
  "status": "ok",
  "payload": {
    "nodeEnv": "development",
    "auth0Domain": "your-domain.auth0.com",
    "auth0ClientId": "your-client-id",
    "mongoUri": "***configured***",
    "timestamp": "2025-06-15T10:30:00.000Z",
    "platform": "win32",
    "processEnv": {
      "isDev": true,
      "isProd": false
    }
  },
  "metadata": {
    "timestamp": "2025-06-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Typy

### DebugEnvironmentInfo
```typescript
interface DebugEnvironmentInfo {
  nodeEnv?: string;
  auth0Domain?: string;
  auth0ClientId?: string;
  mongoUri: string;
  timestamp: string;
  platform: string;
  processEnv: {
    isDev: boolean;
    isProd: boolean;
  };
}
```

## Użycie w Frontend

### Komponenty
- **`src/components/api/SecuredApiTester.tsx`** - Główny komponent używający debug endpoint
  - Button "🐞 GET /api/debug-env" (linia 269)
  - Funkcja `testDebugEnvironment()` (linia 141)
  - Sekcja dokumentacji API (linia 341)

### Use Cases w Frontend
1. **Troubleshooting**: Sprawdzanie konfiguracji gdy coś nie działa
2. **Environment verification**: Potwierdzenie że zmienne środowiskowe są prawidłowo ustawione
3. **Auth0 debugging**: Sprawdzanie czy Auth0 domain i client ID są poprawne
4. **Database connectivity**: Potwierdzenie że MongoDB URI jest skonfigurowane

## Funkcje

### Environment Information
- **NODE_ENV**: Aktualne środowisko (development/production/staging)
- **Auth0 Configuration**: Domain i Client ID (z fallback na VITE_ variants)
- **MongoDB Status**: Informacja czy URI jest skonfigurowane (bez ujawniania samego URI)
- **Platform Info**: System operacyjny i inne info systemowe
- **Process Environment**: Flagi środowiska

### Security Features
- **Sensitive data masking**: MongoDB URI jest maskowane jako "***configured***"
- **No secrets exposure**: Nie ujawnia pełnych wartości wrażliwych zmiennych
- **Environment awareness**: Różne zachowanie w zależności od środowiska

### Monitoring & Debugging
- **Configuration validation**: Sprawdzenie kompletności konfiguracji
- **Integration testing**: Weryfikacja połączeń z zewnętrznymi serwisami
- **Environment consistency**: Sprawdzenie zgodności między różnymi środowiskami

## Environment Variables Checked
```bash
NODE_ENV=development|production|staging
AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_DOMAIN=your-domain.auth0.com  # fallback
AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_CLIENT_ID=your-client-id      # fallback
MONGODB_URI=mongodb://localhost:27017/database
```

## Security Considerations
- **Production usage**: Rozważ wyłączenie lub ograniczenie dostępu w produkcji
- **Data masking**: Wrażliwe dane są automatycznie maskowane
- **Access control**: Może wymagać uwierzytelnienia w przyszłości
- **Rate limiting**: Rozważ rate limiting dla tego endpointu

## Development Usage
Idealny do:
- **Setup verification**: Sprawdzenie czy wszystkie zmienne są ustawione
- **Configuration debugging**: Diagnozowanie problemów z konfiguracją
- **Environment comparison**: Porównywanie ustawień między środowiskami
- **CI/CD validation**: Weryfikacja konfiguracji w pipeline

## Implementacja
- **Kontroler**: `controller.ts` - implementacja endpointu debug
- **Typy**: `types.ts` - definicje typów dla kontrolera
- **Export**: `index.ts` - re-export wszystkich elementów kontrolera

## Przyszłe Rozszerzenia
- Dodanie autoryzacji dla endpointu
- Więcej informacji systemowych
- Health checks dla external services
- Performance metrics
- Log level configuration
