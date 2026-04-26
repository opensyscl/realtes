# Serialization, Validation & Error Handling — Symfony API

## Symfony Serializer Groups

```php
<?php
declare(strict_types=1);

namespace App\Entity;

use Symfony\Component\Serializer\Attribute\Groups;

class Post
{
    #[Groups(['post:read', 'post:list'])]
    private int $id;

    #[Groups(['post:read', 'post:list', 'post:write'])]
    private string $title;

    #[Groups(['post:read'])]  // NOT in list — too heavy
    private string $content;

    #[Groups(['post:read', 'post:list'])]
    private User $author;

    #[Groups(['post:write'])]  // Input only
    private string $authorId;
}
```

**Usage:**
```php
return $this->json($post, 200, [], ['groups' => ['post:read']]);
```

---

## Custom Normalizer (for complex transformations)

```php
<?php
declare(strict_types=1);

namespace App\Serializer;

use App\Entity\Post;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class PostNormalizer implements NormalizerInterface
{
    public function normalize(mixed $object, ?string $format = null, array $context = []): array
    {
        /** @var Post $object */
        return [
            'id' => $object->getId(),
            'title' => $object->getTitle(),
            'excerpt' => mb_substr($object->getContent(), 0, 200) . '...',
            'author' => [
                'id' => $object->getAuthor()->getId(),
                'name' => $object->getAuthor()->getName(),
            ],
            'publishedAt' => $object->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            '_links' => [
                'self' => '/api/v1/posts/' . $object->getId(),
            ],
        ];
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Post && $format === 'json';
    }

    public function getSupportedTypes(?string $format): array
    {
        return [Post::class => true];
    }
}
```

---

## #[MapRequestPayload] (Symfony 6.3+)

The cleanest way to handle JSON input:

```php
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

#[Route('', methods: ['POST'])]
public function create(
    #[MapRequestPayload(
        serializationContext: ['groups' => ['post:write']],
        validationGroups: ['Default', 'Create'],
    )] CreatePostRequest $dto,
): JsonResponse {
    // $dto is already validated — if invalid, 422 is returned automatically
    // ...
}
```

**On validation failure, Symfony returns:**
```json
{
    "type": "https://symfony.com/errors/validation",
    "title": "Validation Failed",
    "status": 422,
    "violations": [
        {
            "propertyPath": "email",
            "title": "This value is not a valid email address.",
            "template": "This value is not a valid email address.",
            "parameters": { "{{ value }}": "\"not-an-email\"" },
            "type": "urn:uuid:bd79c0ab-ddba-46cc-a703-a7a4b08de310"
        }
    ]
}
```

---

## Custom Validation Constraint

```php
<?php
declare(strict_types=1);

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class UniqueEmail extends Constraint
{
    public string $message = 'The email "{{ email }}" is already registered.';
}

class UniqueEmailValidator extends ConstraintValidator
{
    public function __construct(
        private readonly UserRepository $userRepository,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$value) return;

        $existing = $this->userRepository->findOneBy(['email' => $value]);

        if ($existing !== null) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ email }}', $value)
                ->addViolation();
        }
    }
}
```

**Usage:**
```php
use App\Validator\UniqueEmail;
use Symfony\Component\Validator\Constraints as Assert;

final readonly class RegisterRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        #[UniqueEmail]
        public string $email,

        #[Assert\NotBlank]
        #[Assert\Length(min: 8, max: 4096)]
        #[Assert\NotCompromisedPassword]  // HaveIBeenPwned check
        public string $password,
    ) {}
}
```

---

## Manual Validation (when not using MapRequestPayload)

```php
use Symfony\Component\Validator\Validator\ValidatorInterface;

public function __construct(
    private readonly ValidatorInterface $validator,
) {}

public function someAction(Request $request): JsonResponse
{
    $data = $request->toArray(); // throws JsonException if invalid JSON

    $dto = new CreateUserRequest(
        email: $data['email'] ?? '',
        password: $data['password'] ?? '',
    );

    $violations = $this->validator->validate($dto);

    if (count($violations) > 0) {
        return $this->json([
            'type' => 'https://symfony.com/errors/validation',
            'title' => 'Validation Failed',
            'status' => 422,
            'violations' => array_map(
                fn($v) => ['field' => $v->getPropertyPath(), 'message' => $v->getMessage()],
                iterator_to_array($violations)
            ),
        ], 422);
    }

    // proceed...
}
```

---

## config/packages/serializer.yaml

```yaml
framework:
    serializer:
        circular_reference_handler: true  # prevents JSON encode errors
        max_depth_handler: true
```

---

## Custom Exception + Handler

```php
<?php
declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

final class ResourceNotFoundException extends HttpException
{
    public function __construct(string $resourceType, int|string $id)
    {
        parent::__construct(
            statusCode: 404,
            message: "$resourceType with id '$id' was not found.",
        );
    }
}

// Usage:
throw new ResourceNotFoundException('Post', $id);
```