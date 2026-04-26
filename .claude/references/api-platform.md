# API Platform 3.x Reference — Symfony API

## Installation

```bash
composer require api-platform/core
composer require api-platform/symfony
```

---

## Basic Resource Configuration

```php
<?php
declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\State\PostProvider;
use App\State\PostProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['post:list']],
            paginationMaximumItemsPerPage: 50,
        ),
        new Get(
            normalizationContext: ['groups' => ['post:read']],
            provider: PostProvider::class,
        ),
        new Post(
            denormalizationContext: ['groups' => ['post:write']],
            validationContext: ['groups' => ['Default', 'post:create']],
            processor: PostProcessor::class,
            security: "is_granted('ROLE_USER')",
        ),
        new Put(
            denormalizationContext: ['groups' => ['post:write']],
            security: "is_granted('POST_EDIT', object)",
        ),
        new Patch(
            denormalizationContext: ['groups' => ['post:write']],
            security: "is_granted('POST_EDIT', object)",
        ),
        new Delete(
            security: "is_granted('POST_DELETE', object)",
        ),
    ],
    normalizationContext: ['groups' => ['post:read']],
    denormalizationContext: ['groups' => ['post:write']],
)]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Post
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['post:read', 'post:list'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    #[Groups(['post:read', 'post:list', 'post:write'])]
    private string $title;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['post:read', 'post:write'])]
    private string $content;
}
```

---

## State Provider (Custom Data Source)

```php
<?php
declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Post;
use App\Repository\PostRepository;

final class PostProvider implements ProviderInterface
{
    public function __construct(
        private readonly PostRepository $postRepository,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $id = $uriVariables['id'] ?? null;

        if ($id === null) {
            return $this->postRepository->findPublished();
        }

        return $this->postRepository->find($id);
    }
}
```

---

## State Processor (Custom Write Logic)

```php
<?php
declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

final class PostProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Post
    {
        /** @var Post $data */
        $data->setAuthor($this->security->getUser());

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
```

---

## Custom Filter

```php
<?php
declare(strict_types=1);

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class StatusFilter extends AbstractFilter
{
    protected function filterProperty(
        string $property,
        mixed $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($property !== 'status') {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $paramName = $queryNameGenerator->generateParameterName($property);

        $queryBuilder
            ->andWhere("$alias.$property = :$paramName")
            ->setParameter($paramName, $value);
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'status' => [
                'property' => 'status',
                'type' => 'string',
                'required' => false,
                'openapi' => ['description' => 'Filter by status: draft, published, archived'],
            ],
        ];
    }
}
```

**Apply to entity:**
```php
use ApiPlatform\Metadata\ApiFilter;

#[ApiResource(...)]
#[ApiFilter(StatusFilter::class)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'partial', 'author.name' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'title'])]
class Post { ... }
```

---

## config/packages/api_platform.yaml

```yaml
api_platform:
    title: 'My API'
    description: 'REST API built with Symfony & API Platform'
    version: '1.0.0'
    
    formats:
        json: ['application/json']
        # jsonld: ['application/ld+json']  # Disable if not needed
    
    docs_formats:
        json: ['application/json']
        html: ['text/html']  # Swagger UI
    
    defaults:
        pagination_enabled: true
        pagination_items_per_page: 20
        pagination_maximum_items_per_page: 100
        pagination_client_items_per_page: true
    
    serializer:
        groups: []
    
    swagger:
        versions: [3]  # OpenAPI 3 only
    
    # Disable formats you don't use
    enable_entrypoint: false  # Disable if not using JSON-LD
    enable_docs: '%kernel.debug%'  # Disable Swagger in production if needed
```