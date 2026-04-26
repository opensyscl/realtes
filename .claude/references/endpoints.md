# Endpoints & Controllers Reference — Symfony API

## Controller Template (Gold Standard)

```php
<?php
declare(strict_types=1);

namespace App\Controller\Api\V1;

use App\DTO\Request\CreatePostRequest;
use App\DTO\Response\PostResponse;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/v1/posts', name: 'api_v1_posts_')]
final class PostController extends AbstractController
{
    public function __construct(
        private readonly PostService $postService,
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        $result = $this->postService->getPaginatedPosts($page, $limit);

        return $this->json($result, Response::HTTP_OK, [
            'X-Total-Count' => $result->total,
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $post = $this->postService->findOrFail($id);
        $this->denyAccessUnlessGranted('POST_VIEW', $post);

        return $this->json(PostResponse::fromEntity($post));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreatePostRequest $dto,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $post = $this->postService->create($dto, $user);

        return $this->json(PostResponse::fromEntity($post), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(
        int $id,
        #[MapRequestPayload] CreatePostRequest $dto,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $post = $this->postService->findOrFail($id);
        $this->denyAccessUnlessGranted('POST_EDIT', $post);

        $updated = $this->postService->update($post, $dto);

        return $this->json(PostResponse::fromEntity($updated));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $post = $this->postService->findOrFail($id);
        $this->denyAccessUnlessGranted('POST_DELETE', $post);

        $this->postService->delete($post);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
```

---

## Request DTO (with Validation)

```php
<?php
declare(strict_types=1);

namespace App\DTO\Request;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class CreatePostRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(min: 3, max: 255)]
        public string $title,

        #[Assert\NotBlank]
        #[Assert\Length(min: 10, max: 10000)]
        public string $content,

        #[Assert\Choice(choices: ['draft', 'published', 'archived'])]
        public string $status = 'draft',

        #[Assert\All([
            new Assert\Type('string'),
            new Assert\Length(max: 50),
        ])]
        public array $tags = [],
    ) {}
}
```

**Note:** `#[MapRequestPayload]` automatically deserializes + validates. On failure, Symfony returns 422 automatically (Symfony 6.3+).

---

## Response DTO

```php
<?php
declare(strict_types=1);

namespace App\DTO\Response;

use App\Entity\Post;

final readonly class PostResponse
{
    public function __construct(
        public int $id,
        public string $title,
        public string $content,
        public string $status,
        public array $tags,
        public string $createdAt,
        public string $updatedAt,
        public AuthorResponse $author,
    ) {}

    public static function fromEntity(Post $post): self
    {
        return new self(
            id: $post->getId(),
            title: $post->getTitle(),
            content: $post->getContent(),
            status: $post->getStatus(),
            tags: $post->getTags(),
            createdAt: $post->getCreatedAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $post->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            author: AuthorResponse::fromEntity($post->getAuthor()),
        );
    }
}
```

---

## Paginated Response

```php
<?php
declare(strict_types=1);

namespace App\DTO\Response;

final readonly class PaginatedResponse
{
    public function __construct(
        public array $items,
        public int $total,
        public int $page,
        public int $limit,
        public int $pages,
    ) {}

    public static function create(array $items, int $total, int $page, int $limit): self
    {
        return new self(
            items: $items,
            total: $total,
            page: $page,
            limit: $limit,
            pages: (int) ceil($total / $limit),
        );
    }
}
```

---

## Global Exception Handler (RFC 7807 Problem Details)

```php
<?php
declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

#[AsEventListener(event: KernelEvents::EXCEPTION, priority: 10)]
final class ApiExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        // Only handle API routes
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $exception = $event->getThrowable();
        $response = $this->buildResponse($exception);
        $event->setResponse($response);
    }

    private function buildResponse(\Throwable $exception): JsonResponse
    {
        if ($exception instanceof HttpExceptionInterface) {
            return new JsonResponse([
                'type' => 'https://tools.ietf.org/html/rfc7231',
                'title' => Response::$statusTexts[$exception->getStatusCode()] ?? 'Error',
                'status' => $exception->getStatusCode(),
                'detail' => $exception->getMessage(),
            ], $exception->getStatusCode());
        }

        // Hide internal errors in prod
        $detail = $_ENV['APP_ENV'] === 'dev' ? $exception->getMessage() : 'An internal error occurred.';

        return new JsonResponse([
            'type' => 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
            'title' => 'Internal Server Error',
            'status' => 500,
            'detail' => $detail,
        ], 500);
    }
}
```

---

## Versioning Strategy

### URL Versioning (recommended for public APIs)
```
/api/v1/users
/api/v2/users
```

### Route prefix approach
```php
// config/routes/api_v1.yaml
api_v1:
    resource: ../src/Controller/Api/V1/
    type: attribute
    prefix: /api/v1

api_v2:
    resource: ../src/Controller/Api/V2/
    type: attribute
    prefix: /api/v2
```

---

## Useful #[Route] Patterns

```php
// UUID param
#[Route('/{id}', requirements: ['id' => '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'])]

// Integer param
#[Route('/{id}', requirements: ['id' => '\d+'])]

// Slug param
#[Route('/{slug}', requirements: ['slug' => '[a-z0-9-]+'])]

// Nested resource
#[Route('/users/{userId}/posts/{id}', requirements: ['userId' => '\d+', 'id' => '\d+'])]
```