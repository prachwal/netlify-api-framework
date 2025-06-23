# Database Controller

## Opis
Kontroler do operacji bazodanowych i sprawdzania stanu połączenia z bazą danych MongoDB.

## API Endpoints

### GET /api/database/health
- **Opis**: Sprawdza stan połączenia z bazą danych
- **Parametry**: Brak
- **Odpowiedź**: Status zdrowia bazy danych z szczegółami połączenia

### POST /api/database/init
- **Opis**: Inicjalizuje bazę danych (tylko development/staging)
- **Środowisko**: Dostępne tylko gdy NODE_ENV !== 'production'
- **Parametry**: Brak
- **Odpowiedź**: Status inicjalizacji bazy danych

**Przykładowa odpowiedź health check:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Database connection is healthy",
    "timestamp": "2025-06-15T10:30:00.000Z",
    "details": {
      "connected": true,
      "readyState": 1,
      "host": "mongodb-host",
      "database": "app-database"
    }
  },
  "message": "Database connection is healthy"
}
```

**Przykładowa odpowiedź init (error w production):**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Database initialization is not allowed in production"
}
```

## Typy

### DatabaseHealthResponse
```typescript
interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy' | 'connecting';
  message: string;
  timestamp: string;
  details?: {
    connected: boolean;
    readyState: number;
    host?: string;
    database?: string;
  };
}
```

### DatabaseInitResponse
```typescript
interface DatabaseInitResponse {
  success: boolean;
  message: string;
  data?: {
    timestamp: string;
    collections?: string[];
    indexes?: string[];
  };
}
```

## Użycie w Frontend

### Brak bezpośredniego użycia
Obecnie brak komponentów frontend bezpośrednio używających tego kontrolera. Endpointy są wykorzystywane głównie do:

- **Monitoring**: Sprawdzanie stanu bazy w narzędziach monitoringu
- **Health checks**: Automatyczne sprawdzanie zdrowia aplikacji
- **Development**: Inicjalizacja bazy podczas rozwoju aplikacji
- **DevOps**: Sprawdzanie połączenia podczas wdrożeń

### Potencjalne użycie
Kontroler może być używany w przyszłości przez:
- **Admin Dashboard**: Panel administracyjny z monitoringiem bazy
- **Debug Components**: Komponenty debugowania stanu systemu
- **Health Status UI**: Komponenty wyświetlające status systemu

## Funkcje

### Health Check
- **Connection status**: Sprawdzenie połączenia MongoDB
- **Ready state**: Status gotowości połączenia
- **Response time**: Czas odpowiedzi bazy
- **Error detection**: Wykrywanie problemów z połączeniem

### Database Initialization
- **Environment protection**: Blokada inicjalizacji w produkcji
- **Schema setup**: Tworzenie kolekcji i indeksów
- **Default data**: Wstawianie danych początkowych (w przyszłości)
- **Migration support**: Wsparcie dla migracji bazy (w przyszłości)

### Framework Integration
- **`checkDatabaseHealth()`** - funkcja z framework utils
- **`initializeDatabase()`** - funkcja inicjalizacji
- **`connectToDatabase()`** - helper do połączenia

## Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/app-database
NODE_ENV=development|production|staging
```

## Zabezpieczenia
- **Production protection**: Blokada init endpoint w produkcji
- **Connection validation**: Walidacja parametrów połączenia
- **Error sanitization**: Ukrywanie wrażliwych informacji w błędach

## Implementacja
- **Kontroler**: `controller.ts` - implementacja endpointów bazy danych
- **Typy**: `types.ts` - definicje typów dla kontrolera
- **Export**: `index.ts` - re-export wszystkich elementów kontrolera
- **Framework utilities**: `netlify/framework/utils/database.ts` - funkcje pomocnicze
