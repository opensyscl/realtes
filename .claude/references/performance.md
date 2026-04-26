# Performance Reference — Symfony API

## 1. HTTP Cache Headers

```php
// In controllers — use HTTP cache headers aggressively
use Symfony\Component\HttpFoundation\Response;

// Public resources (CDN-cacheable)
$response = $this->json($data);
$response->setPublic();
$response->setMaxAge(3600);       // 1 hour browser cache
$response->setSharedMaxAge(3600); // 1 hour CDN/proxy cache
$response->setEtag(md5(serialize($data)));
$response->setLastModified($entity->getUpdatedAt());

// Check conditional request (304 Not Modified)
if ($response->isNotModified($request)) {
    return $response; // returns 304, no body sent
}

return $response;

// Private resources (per-user, no CDN)
$response->setPrivate();
$response->setMaxAge(300);
```

---

## 2. Doctrine Query Optimization

### ❌ N+1 Problem
```php
// BAD: N+1 — 1 query for posts + N queries for each author
$posts = $postRepo->findAll();
foreach ($posts as $post) {
    echo $post->getAuthor()->getName(); // triggers a query per post
}
```

### ✅ Eager Loading with JOIN FETCH
```php
// GOOD: Single query with JOIN
public function findAllWithAuthors(): array
{
    return $this->createQueryBuilder('p')
        ->select('p', 'a')
        ->leftJoin('p.author', 'a')
        ->addSelect('a')
        ->where('p.status = :status')
        ->setParameter('status', 'published')
        ->orderBy('p.createdAt', 'DESC')
        ->setMaxResults(20)
        ->getQuery()
        ->getResult();
}
```

### ✅ Partial Object (when you don't need the full entity)
```php
public function findPostSummaries(): array
{
    return $this->createQueryBuilder('p')
        ->select('p.id', 'p.title', 'p.createdAt', 'a.name AS authorName')
        ->leftJoin('p.author', 'a')
        ->where('p.status = :status')
        ->setParameter('status', 'published')
        ->getQuery()
        ->getArrayResult(); // returns arrays, not entities = faster
}
```

### ✅ Pagination with COUNT optimization
```php
public function getPaginatedPosts(int $page, int $limit): array
{
    $qb = $this->createQueryBuilder('p')
        ->where('p.status = :status')
        ->setParameter('status', 'published');

    // Count query (no ordering needed for COUNT)
    $countQb = clone $qb;
    $total = (int) $countQb->select('COUNT(p.id)')
        ->getQuery()
        ->getSingleScalarResult();

    // Data query
    $items = $qb
        ->select('p', 'a')
        ->leftJoin('p.author', 'a')
        ->addSelect('a')
        ->orderBy('p.createdAt', 'DESC')
        ->setFirstResult(($page - 1) * $limit)
        ->setMaxResults($limit)
        ->getQuery()
        ->getResult();

    return ['items' => $items, 'total' => $total];
}
```

---

## 3. Result Caching

### config/packages/cache.yaml
```yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
        pools:
            doctrine.result_cache_pool:
                adapter: cache.adapter.redis
                default_lifetime: 3600
            app.api_cache:
                adapter: cache.adapter.redis
                default_lifetime: 300
```

### In service (cache-aside pattern)
```php
<?php
declare(strict_types=1);

namespace App\Service;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final class PostService
{
    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly CacheInterface $appApiCache,
    ) {}

    public function getFeaturedPosts(): array
    {
        return $this->appApiCache->get(
            'featured_posts',
            function (ItemInterface $item): array {
                $item->expiresAfter(300); // 5 minutes
                $item->tag(['posts']); // for cache invalidation
                return $this->postRepository->findFeatured();
            }
        );
    }

    public function invalidatePostCache(): void
    {
        // Invalidate all items tagged 'posts'
        if ($this->appApiCache instanceof \Symfony\Contracts\Cache\TagAwareCacheInterface) {
            $this->appApiCache->invalidateTags(['posts']);
        }
    }
}
```

---

## 4. Doctrine Result Cache (Query Level)

```php
public function findFrequentlyAccessedData(): array
{
    return $this->createQueryBuilder('c')
        ->select('c')
        ->where('c.active = true')
        ->getQuery()
        ->enableResultCache(3600, 'active_categories_cache')  // TTL + cache key
        ->getResult();
}
```

---

## 5. Serializer Performance

```php
// Use context to minimize serialization work
$response = $this->json($entity, 200, [], [
    'groups' => ['post:read'],      // only serialize needed fields
    'enable_max_depth' => true,     // prevent infinite recursion
]);

// Better: Map to DTO manually for hot endpoints (fastest option)
$dto = PostResponse::fromEntity($entity); // plain PHP = no reflection overhead
return $this->json($dto);
```

---

## 6. OPcache & PHP Config (production)

```ini
; php.ini / php-fpm.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  ; DISABLE in production (no file change detection)
opcache.save_comments=1        ; Required for Doctrine annotations
realpath_cache_size=4096k
realpath_cache_ttl=600
```

---

## 7. Symfony Performance Config

### config/packages/prod/framework.yaml
```yaml
framework:
    router:
        strict_requirements: false  # Disable strict route requirement checks in prod

when@prod:
    services:
        _defaults:
            autowire: true
            autoconfigure: true
```

### Enable Preloading (PHP 8+)
```bash
# Generate preload file
php bin/console cache:warmup
```

```ini
; php.ini
opcache.preload=/path/to/project/var/cache/prod/App_KernelProdContainer.preload.php
opcache.preload_user=www-data
```

---

## 8. Database Indexes (Doctrine)

```php
<?php
declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Index(columns: ['status', 'created_at'], name: 'idx_post_status_date')]
#[ORM\Index(columns: ['author_id', 'status'], name: 'idx_post_author_status')]
class Post
{
    #[ORM\Column(length: 20, options: ['default' => 'draft'])]
    private string $status = 'draft';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;
}
```

---

## 9. Performance Monitoring

```bash
# Install Blackfire (profiling)
composer require blackfire/php-sdk --dev

# Symfony profiler in dev only
composer require --dev symfony/profiler-pack
```

### Key Metrics to Watch
- Response time: < 100ms for simple reads, < 300ms for writes
- SQL queries per request: < 10 (use Symfony profiler to verify)
- Memory per request: < 32MB
- Cache hit rate: > 80% for read-heavy endpoints