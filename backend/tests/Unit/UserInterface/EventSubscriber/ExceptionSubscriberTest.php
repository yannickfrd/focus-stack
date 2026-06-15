<?php

declare(strict_types=1);

namespace App\Tests\Unit\UserInterface\EventSubscriber;

use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Exception\UnauthorizedException;
use App\UserInterface\EventSubscriber\ExceptionSubscriber;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;

final class ExceptionSubscriberTest extends TestCase
{
    private ExceptionSubscriber $subscriber;
    private HttpKernelInterface $kernel;
    private Request $request;

    protected function setUp(): void
    {
        $this->subscriber = new ExceptionSubscriber();
        $this->kernel = $this->createStub(HttpKernelInterface::class);
        $this->request = Request::create('/');
    }

    public function testSubscribesToKernelException(): void
    {
        $this->assertArrayHasKey(KernelEvents::EXCEPTION, ExceptionSubscriber::getSubscribedEvents());
    }

    public static function exceptionProvider(): array
    {
        return [
            'UnauthorizedException returns 401 with original message' => [
                new UnauthorizedException('Refresh token not found.'),
                401,
                'Refresh token not found.',
            ],
            'NotFoundException returns 404 with original message' => [
                new NotFoundException('Task not found.'),
                404,
                'Task not found.',
            ],
            'DomainException returns 409 with original message' => [
                new \DomainException('Email already taken.'),
                409,
                'Email already taken.',
            ],
            'HttpException returns its native status code' => [
                new NotFoundHttpException('Route not found.'),
                404,
                'Route not found.',
            ],
            'Generic exception returns 500 with generic message' => [
                new \RuntimeException('DB connection failed.'),
                500,
                'An unexpected error occurred.',
            ],
        ];
    }

    #[DataProvider('exceptionProvider')]
    public function testOnException(\Throwable $exception, int $expectedStatus, string $expectedMessage): void
    {
        $event = new ExceptionEvent($this->kernel, $this->request, HttpKernelInterface::MAIN_REQUEST, $exception);
        $this->subscriber->onException($event);

        $response = $event->getResponse();
        $body = json_decode($response->getContent(), true);

        $this->assertSame($expectedStatus, $response->getStatusCode());
        $this->assertSame($expectedMessage, $body['error']);
    }
}
