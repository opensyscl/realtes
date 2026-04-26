# Security Reference — Symfony API

## 1. JWT Authentication (Lexik Bundle)

### config/packages/lexik_jwt_authentication.yaml
```yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600  # 1 hour — adjust per risk level
    # Refresh token handled separately (gesdinet/jwt-refresh-token-bundle)
    token_extractors:
        authorization_header:
            enabled: true
            prefix: Bearer
            name: Authorization
        # Disable cookie extractor unless you need it (CSRF risk)
        cookie:
            enabled: false
```

### config/packages/security.yaml
```yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: auto  # bcrypt or sodium depending on PHP build

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        login:
            pattern: ^/api/v1/auth/login
            stateless: true
            json_login:
                check_path: /api/v1/auth/login
                success_handler: lexik_jwt_authentication.handler.authentication_success
                failure_handler: lexik_jwt_authentication.handler.authentication_failure

        api:
            pattern: ^/api
            stateless: true
            jwt: ~

    access_control:
        - { path: ^/api/v1/auth/login, roles: PUBLIC_ACCESS }
        - { path: ^/api/v1/auth/register, roles: PUBLIC_ACCESS }
        - { path: ^/api/docs, roles: PUBLIC_ACCESS }  # Swagger UI
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

### Login Controller
```php
<?php
declare(strict_types=1);

namespace App\Controller\Api\V1\Auth;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

// This endpoint is handled by lexik_jwt_authentication via json_login
// No controller needed — just configure the firewall
// BUT you need a LoginDTO for documentation purposes:

#[Route('/api/v1/auth')]
final class AuthController extends AbstractController
{
    // POST /api/v1/auth/login -> handled by lexik firewall
    // POST /api/v1/auth/refresh -> if using refresh tokens
}
```

---

## 2. Voters — Resource-Level Authorization

Never use `isGranted('ROLE_X')` for ownership checks. Use Voters.

```php
<?php
declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Post;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class PostVoter extends Voter
{
    public const EDIT = 'POST_EDIT';
    public const DELETE = 'POST_DELETE';
    public const VIEW = 'POST_VIEW';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE, self::VIEW], true)
            && $subject instanceof Post;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Post $post */
        $post = $subject;

        return match ($attribute) {
            self::VIEW => $this->canView($post, $user),
            self::EDIT => $this->canEdit($post, $user),
            self::DELETE => $this->canDelete($post, $user),
            default => false,
        };
    }

    private function canView(Post $post, User $user): bool
    {
        // Public posts or own posts
        return $post->isPublished() || $post->getOwner() === $user;
    }

    private function canEdit(Post $post, User $user): bool
    {
        return $post->getOwner() === $user;
    }

    private function canDelete(Post $post, User $user): bool
    {
        return $post->getOwner() === $user || in_array('ROLE_ADMIN', $user->getRoles(), true);
    }
}
```

**Usage in controller:**
```php
$this->denyAccessUnlessGranted(PostVoter::EDIT, $post);
```

---

## 3. Rate Limiting

### config/packages/rate_limiter.yaml
```yaml
framework:
    rate_limiter:
        login_limiter:
            policy: sliding_window
            limit: 5
            interval: '1 minute'
        api_limiter:
            policy: token_bucket
            limit: 100
            rate: { interval: '1 minute', amount: 100 }
```

### Usage in controller or EventListener
```php
<?php
declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\HttpFoundation\JsonResponse;

final class RateLimitListener
{
    public function __construct(
        private readonly RateLimiterFactory $loginLimiterFactory,
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), '/api/v1/auth/login')) {
            return;
        }

        $limiter = $this->loginLimiterFactory->create($request->getClientIp());
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            $event->setResponse(new JsonResponse([
                'type' => 'https://tools.ietf.org/html/rfc6585#section-4',
                'title' => 'Too Many Requests',
                'status' => 429,
                'detail' => 'Rate limit exceeded. Try again in ' . $limit->getRetryAfter()->getTimestamp() - time() . ' seconds.',
            ], 429, [
                'X-RateLimit-Remaining' => $limit->getRemainingTokens(),
                'Retry-After' => $limit->getRetryAfter()?->getTimestamp(),
            ]));
        }
    }
}
```

---

## 4. CORS Configuration

### config/packages/nelmio_cors.yaml
```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization', 'X-Requested-With']
        expose_headers: ['X-Total-Count', 'X-RateLimit-Remaining']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
            allow_credentials: false  # true only if cookies used
```

### .env
```dotenv
CORS_ALLOW_ORIGIN=^https://(www\.)?yourdomain\.com$
# Dev only:
# CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
```

---

## 5. Input Sanitization Principles

- Never use `$request->request->all()` directly into entities
- Always map to DTOs first, then validate
- Use `$request->toArray()` for JSON body (throws on invalid JSON)
- Trim and normalize string inputs in DTO constructors or using `#[Assert\]`

```php
// BAD:
$entity->setName($request->get('name'));

// GOOD:
$dto = new CreateUserRequest(
    email: $request->toArray()['email'] ?? '',
    name: $request->toArray()['name'] ?? '',
);
$errors = $this->validator->validate($dto);
```

---

## 6. Sensitive Data Checklist

- Passwords: always hash, never log, never return in API responses
- Tokens: use HTTPS only, short TTL, rotate on password change
- PII: don't log email/phone in production, use `%email%` placeholders if needed
- API keys: store in `.env.local`, never commit to git
- Error messages: don't expose stack traces in production (`APP_ENV=prod`)

### config/packages/prod/monolog.yaml
```yaml
monolog:
    handlers:
        main:
            type: fingers_crossed
            action_level: error
            handler: nested
            excluded_http_codes: [404, 405]
        nested:
            type: stream
            path: '%kernel.logs_dir%/%kernel.environment%.log'
            level: debug
        # Never log to console in prod — it can expose data
```