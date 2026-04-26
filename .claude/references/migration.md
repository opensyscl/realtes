# Migration to Symfony API Reference

## Migration Strategy (Legacy → Symfony API)

### Phase 1: Assessment
1. Map all existing endpoints/routes
2. Identify data models / DB schema
3. List authentication mechanism (sessions, basic auth, custom tokens)
4. Find business logic locations (controllers, models, helpers)
5. Identify external service integrations

### Phase 2: Parallel Run (Strangler Fig Pattern)
Run Symfony API alongside legacy app.
Migrate endpoints one by one, redirect traffic gradually.

```
Legacy App  ←→  Nginx/Proxy  ←→  Symfony API
                    ↓
            Route by path prefix:
            /api/v2/* → Symfony
            /* → Legacy (until fully migrated)
```

### Phase 3: Migration Order (recommended)
1. Auth endpoints first (login, register, logout)
2. Read-only GET endpoints (low risk)
3. Simple write endpoints (POST/PUT/DELETE)
4. Complex business logic endpoints last

---

## Common Migration Patterns

### From Raw PHP / Legacy Framework

```php
// BEFORE (legacy):
$result = mysql_query("SELECT * FROM users WHERE id = " . $_GET['id']);
$user = mysql_fetch_assoc($result);
echo json_encode($user);

// AFTER (Symfony):
#[Route('/api/v1/users/{id}', methods: ['GET'])]
public function show(int $id): JsonResponse
{
    $user = $this->userRepository->find($id)
        ?? throw $this->createNotFoundException("User $id not found");
    
    $this->denyAccessUnlessGranted('USER_VIEW', $user);
    
    return $this->json(UserResponse::fromEntity($user));
}
```

### From Laravel

| Laravel | Symfony Equivalent |
|---|---|
| `routes/api.php` | `#[Route]` attributes in controllers |
| `app/Http/Controllers` | `src/Controller/Api/` |
| `app/Models` | `src/Entity/` (Doctrine) |
| `app/Http/Requests` | DTOs with `#[Assert\*]` |
| `app/Http/Resources` | Response DTOs |
| `app/Policies` | Security Voters |
| `Middleware` | EventListeners or RequestEvent |
| `Eloquent::find()` | `$repository->find()` |
| `$request->validate()` | `#[MapRequestPayload]` |
| `.env` | `.env` + `.env.local` |

### From Node.js/Express

| Express | Symfony Equivalent |
|---|---|
| `express.Router()` | `#[Route]` attributes |
| `req.body` | `#[MapRequestPayload] DTO` |
| `req.params` | Route parameters `{id}` |
| `req.query` | `$request->query->get()` |
| `passport-jwt` | `lexik/jwt-authentication-bundle` |
| `express-validator` | Symfony Validator |
| `sequelize` | Doctrine ORM |
| `res.json()` | `$this->json()` |
| middleware | EventListener / Subscriber |

---

## Database Migration from Legacy Schema

```bash
# If you have existing DB and want Doctrine to manage it:

# Option A: Import existing schema (generate entities from DB)
php bin/console doctrine:mapping:import App\\Entity annotation --path=src/Entity

# Option B: Create migrations from existing schema
php bin/console doctrine:migrations:diff

# Review the generated migration CAREFULLY before running
php bin/console doctrine:migrations:migrate
```

### Doctrine Migration Template
```php
<?php
declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema from legacy migration';
    }

    public function up(Schema $schema): void
    {
        // Always use parameterized queries even in migrations
        $this->addSql('CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(180) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            roles JSON NOT NULL DEFAULT \'[]\',
            active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE users');
    }
}
```

---

## Password Migration (Legacy Hashes → Symfony)

If legacy app uses MD5/SHA1/weak hashing:

```php
<?php
declare(strict_types=1);

namespace App\Security;

use Symfony\Component\PasswordHasher\Hasher\CheckPasswordLengthTrait;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;

/**
 * Temporary hasher for migrating legacy MD5 passwords.
 * After user logs in with this, re-hash with modern algorithm.
 * Remove this class once all passwords migrated.
 */
final class LegacyMd5PasswordHasher implements PasswordHasherInterface
{
    use CheckPasswordLengthTrait;

    public function hash(string $plainPassword): string
    {
        return md5($plainPassword); // Only for VERIFICATION of old hashes
    }

    public function verify(string $hashedPassword, string $plainPassword, ?string $salt = null): bool
    {
        return hash_equals($hashedPassword, md5($plainPassword));
    }

    public function needsRehash(string $hashedPassword): bool
    {
        return true; // Always rehash legacy passwords
    }
}
```

```yaml
# config/packages/security.yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: auto  # New hashes: bcrypt/sodium
        App\Entity\LegacyUser:  # Temporary entity for migration
            id: App\Security\LegacyMd5PasswordHasher
```

---

## Checklist: Pre-Migration Audit

- [ ] Document all existing API contracts (request/response shapes)
- [ ] Write integration tests for existing endpoints BEFORE migrating
- [ ] Identify all DB queries (look for N+1, missing indexes)
- [ ] Check for raw SQL — all must be converted to Doctrine
- [ ] List all business rules / validations (must be preserved)
- [ ] Identify cron jobs / async tasks (use Symfony Messenger for these)
- [ ] Check for file uploads (use Symfony HttpFoundation File handling)
- [ ] List third-party API integrations (use Symfony HttpClient)
- [ ] Document authentication flows
- [ ] Check for email sending (use Symfony Mailer + Messenger)