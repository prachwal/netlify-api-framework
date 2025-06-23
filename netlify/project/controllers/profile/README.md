# Profile Controller

## Opis
Kontroler do zarządzania profilem użytkownika - zabezpieczony endpoint wymagający uwierzytelnienia przez Auth0 ID token.

## API Endpoints

### GET /api/profile
- **Opis**: Pobiera profil zalogowanego użytkownika
- **Uwierzytelnienie**: Wymagany ID token w nagłówku Authorization
- **Parametry**: Brak (użytkownik identyfikowany przez token)
- **Odpowiedź**: Dane profilu użytkownika z informacjami z Auth0

### PUT /api/profile
- **Opis**: Aktualizuje profil zalogowanego użytkownika
- **Uwierzytelnienie**: Wymagany ID token w nagłówku Authorization
- **Body**: JSON z polami do aktualizacji:
  - `name` (opcjonalne)
  - `email` (opcjonalne)
  - `preferences` (opcjonalne)
- **Odpowiedź**: Zaktualizowany profil użytkownika

**Przykładowe zapytanie GET:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6...
```

**Przykładowa odpowiedź GET:**
```json
{
  "id": "auth0|1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://gravatar.com/avatar/...",
  "email_verified": true,
  "sub": "auth0|1234567890",
  "iat": 1671234567,
  "exp": 1671321000,
  "aud": "your-auth0-client-id",
  "iss": "https://your-domain.auth0.com/"
}
```

## Typy

### UserProfile
```typescript
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
```

### UpdateProfileRequest
```typescript
interface UpdateProfileRequest {
  name?: string;
  email?: string;
  preferences?: Record<string, any>;
}
```

## Użycie w Frontend

### Komponenty
- **`src/components/api/SecuredApiTester.tsx`** - Główny komponent do testowania zabezpieczonych endpointów
  - Button "📊 GET /api/profile" (linia 224)
  - Button "✏️ PUT /api/profile" (linia 254)
  - Sekcja dokumentacji API (linie 329, 333)
  - Automatyczne dołączanie ID token z Auth0

### Auth Integration
- **`src/utils/jwtUtils.ts`** - Utility funkcje do obsługi ID token:
  - `requireIDToken()` - middleware do walidacji token
  - `createJsonResponse()` - helper do tworzenia odpowiedzi

### Context & State Management
- **`src/contexts/Auth0Context.tsx`** - Kontekst Auth0 dostarczający ID token
- **`src/contexts/AuthMachineContext.tsx`** - XState machine do zarządzania stanem uwierzytelnienia

## Zabezpieczenia

### ID Token Validation
- **Issuer verification**: Sprawdzanie czy token pochodz od prawidłowego Auth0 domain
- **Audience verification**: Sprawdzanie czy token jest przeznaczony dla tej aplikacji
- **Expiration check**: Sprawdzanie czy token nie wygasł
- **Signature verification**: Weryfikacja podpisu cyfrowego token
- **Max age check**: Sprawdzanie czy token nie jest starszy niż 24 godziny

### Environment Variables
```bash
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_DOMAIN=your-domain.auth0.com  # fallback
VITE_AUTH0_CLIENT_ID=your-client-id      # fallback
```

### Error Handling
- **401 Unauthorized**: Brak lub nieprawidłowy token
- **403 Forbidden**: Token prawidłowy ale brak uprawnień
- **500 Internal Error**: Błędy serwera przy walidacji

## Auth0 Setup
Kontroler wymaga prawidłowej konfiguracji Auth0:
1. **Application Type**: Single Page Application (SPA)
2. **Allowed Callback URLs**: Twoja domena aplikacji
3. **Allowed Web Origins**: Twoja domena aplikacji
4. **JWT Settings**: RS256 algorithm

## Implementacja
- **Kontroler**: `controller.ts` - implementacja endpointów profilu z Auth0 integration
- **Typy**: `types.ts` - definicje typów dla kontrolera
- **Export**: `index.ts` - re-export wszystkich elementów kontrolera

## Dokumentacja Auth0
Zobacz również: `docs/AUTH0_SETUP.md` - szczegółowy przewodnik konfiguracji Auth0
