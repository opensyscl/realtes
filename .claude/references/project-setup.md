# Project Setup Reference — Symfony API

## Initial Setup (New Project)

```bash
# Create project
composer create-project symfony/skeleton:"7.*" my-api
cd my-api

# Required for API
composer require symfony/framework-bundle
composer require symfony/security-bundle
composer require symfony/serializer-pack
composer require symfony/validator
composer require symfony/property-access
composer require doctrine/orm doctrine/dbal doctrine/doctrine-bundle
composer require doctrine/doctrine-migrations-bundle
composer require lexik/jwt-authentication-bundle
composer require nelmio/cors-bundle
composer require symfony/http-client  # for external HTTP calls

# Optional but recommended
composer require api-platform/core   # if using API Platform
composer require gesdinet/jwt-refresh-token-bundle  # refresh tokens
composer require predis/predis        # Redis support

# Dev dependencies
composer require --dev symfony/maker-bundle
composer require --dev doctrine/doctrine-fixtures-bundle
composer require --dev symfony/profiler-pack
composer require --dev phpunit/phpunit symfony/test-pack
composer require --dev zenstruck/foundry  # factories for tests
```

---

## .env Template

```dotenv
APP_ENV=dev
APP_SECRET=change_me_in_production_use_32char_random_string

# Database
DATABASE_URL="postgresql://app:password@127.0.0.1:5432/my_api?serverVersion=16&charset=utf8"
# OR MySQL:
# DATABASE_URL="mysql://app:password@127.0.0.1:3306/my_api?serverVersion=8.0&charset=utf8mb4"

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=change_me_secure_passphrase
JWT_TTL=3600

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$

# Mailer (if needed)
MAILER_DSN=smtp://localhost:1025
```

---

## config/packages/framework.yaml

```yaml
framework:
    secret: '%env(APP_SECRET)%'
    http_method_override: false

    # Disable sessions for stateless API
    session:
        enabled: false

    # Strict parameter bag
    router:
        utf8: true
        strict_requirements: '%kernel.debug%'

    # Serializer
    serializer:
        enable_annotations: false  # Use PHP attributes instead
        mapping:
            paths: ['%kernel.project_dir%/config/serializer']

    # Validation
    validation:
        email_validation_mode: html5
        not_compromised_password: true  # Check HaveIBeenPwned for passwords

    # PHP 8 attributes for routing
    php_errors:
        log: '%kernel.debug%'
```

---

## config/packages/doctrine.yaml

```yaml
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
        profiling_collect_backtrace: '%kernel.debug%'
        # Connection pooling
        options:
            1002: "SET SESSION sql_mode='STRICT_TRANS_TABLES'"  # MySQL strict mode

    orm:
        auto_generate_proxy_classes: true
        enable_lazy_ghost_objects: true  # Doctrine 3 - use lazy ghosts
        naming_strategy: doctrine.orm.naming_strategy.underscore_number_aware
        auto_mapping: true
        mappings:
            App:
                type: attribute
                is_bundle: false
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
                alias: App

when@prod:
    doctrine:
        orm:
            auto_generate_proxy_classes: false
            query_cache_driver:
                type: pool
                pool: doctrine.system_cache_pool
            result_cache_driver:
                type: pool
                pool: doctrine.result_cache_pool

when@test:
    doctrine:
        dbal:
            dbname_suffix: '_test%env(default::TEST_TOKEN)%'
```

---

## Entity Base Class (Timestamps)

```php
<?php
declare(strict_types=1);

namespace App\Entity\Trait;

use Doctrine\ORM\Mapping as ORM;

trait TimestampableTrait
{
    #[ORM\Column(updatable: false)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    #[ORM\PrePersist]
    public function initializeTimestamps(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
```

**Enable lifecycle events in doctrine.yaml:**
```yaml
doctrine:
    orm:
        mappings:
            App:
                # ...
        # Enable lifecycle callbacks
```

Also add `#[ORM\HasLifecycleCallbacks]` to the entity class.

---

## User Entity

```php
<?php
declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableTrait;
use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
#[ORM\UniqueConstraint(columns: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private string $email;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private string $password;

    #[ORM\Column(default: true)]
    private bool $active = true;

    public function getId(): ?int { return $this->id; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }
    public function getUserIdentifier(): string { return $this->email; }
    public function getRoles(): array { return array_unique([...$this->roles, 'ROLE_USER']); }
    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }
    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }
    public function eraseCredentials(): void {} // Clear temp plain-text password if stored
}
```

---

## Makefile (Development Shortcuts)

```makefile
.PHONY: up down reset migrate fixtures test cs

up:
	docker compose up -d

down:
	docker compose down

reset: down
	docker compose up -d
	sleep 2
	$(MAKE) migrate
	$(MAKE) fixtures

migrate:
	php bin/console doctrine:migrations:migrate --no-interaction

fixtures:
	php bin/console doctrine:fixtures:load --no-interaction

test:
	php bin/phpunit --testdox

cs:
	vendor/bin/php-cs-fixer fix

jwt-keys:
	php bin/console lexik:jwt:generate-keypair --overwrite

warmup:
	php bin/console cache:warmup --env=prod
```

---

## Docker Compose (Dev Environment)

```yaml
# docker-compose.yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: my_api
      POSTGRES_USER: app
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
```