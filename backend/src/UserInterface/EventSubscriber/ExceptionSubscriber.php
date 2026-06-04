<?php

declare(strict_types=1);

namespace App\UserInterface\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

final class ExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::EXCEPTION => 'onException'];
    }

    public function onException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        dd($exception);

        [$status, $message] = match (true) {
            $exception instanceof HttpExceptionInterface => [$exception->getStatusCode(), $exception->getMessage()],
            $exception instanceof \DomainException => [JsonResponse::HTTP_CONFLICT, $exception->getMessage()],
            default => [JsonResponse::HTTP_INTERNAL_SERVER_ERROR, 'An unexpected error occurred.'],
        };

        $event->setResponse(new JsonResponse(['error' => $message], $status));
    }
}
