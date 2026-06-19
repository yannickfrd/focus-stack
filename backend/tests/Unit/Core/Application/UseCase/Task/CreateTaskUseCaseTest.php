<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\Request\Task\CreateTaskRequest;
use App\Core\Application\UseCase\Task\CreateTaskUseCase;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;
use PHPUnit\Framework\TestCase;

final class CreateTaskUseCaseTest extends TestCase
{
    private const string GENERATED_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    public function testExecuteCreatesAndSavesTask(): void
    {
        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('countByUserId')->willReturn(2);
        $repository->expects($this->once())->method('save');

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn(self::GENERATED_UUID);

        $request = new CreateTaskRequest(
            title: 'Test Task',
            description: 'Desc',
            priority: Priority::High,
            scheduledFor: ScheduledFor::Today,
            estimatedTime: '30min',
        );

        $useCase = new CreateTaskUseCase($repository, $uuidGenerator);
        $task = $useCase->execute(userId: 'user-1', request: $request);

        $this->assertInstanceOf(Task::class, $task);
        $this->assertSame(self::GENERATED_UUID, $task->getId());
        $this->assertSame('Test Task', $task->getTitle());
        $this->assertSame('user-1', $task->getUserId());
        $this->assertSame(2, $task->getPosition());
    }

    public function testExecuteUsesRepositoryCountForPosition(): void
    {
        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->expects($this->once())->method('countByUserId')->with('user-1')->willReturn(5);
        $repository->method('save');

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn(self::GENERATED_UUID);

        $request = new CreateTaskRequest(
            title: 'Task',
            description: null,
            priority: Priority::Middle,
            scheduledFor: null,
            estimatedTime: null,
        );

        $useCase = new CreateTaskUseCase($repository, $uuidGenerator);
        $task = $useCase->execute('user-1', $request);

        $this->assertSame(5, $task->getPosition());
    }
}
