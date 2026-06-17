<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\Request\Task\UpdateTaskRequest;
use App\Core\Application\UseCase\Task\UpdateTaskUseCase;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class UpdateTaskUseCaseTest extends TestCase
{
    public function testExecuteUpdatesAndSavesTask(): void
    {
        $task = Task::create('Old Title', 'user-1', 'Old desc', Priority::Low);
        $task->setId(1);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->with(1, 'user-1')->willReturn($task);
        $repository->expects($this->once())->method('save')->with($task);

        $request = new UpdateTaskRequest('New Title', 'New desc', Priority::High, '2h', false, null);

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', $request);

        $this->assertSame('New Title', $result->getTitle());
        $this->assertSame('New desc', $result->getDescription());
        $this->assertSame(Priority::High, $result->getPriority());
        $this->assertSame('2h', $result->getEstimatedTime());
    }

    public function testExecuteUpdatesDoneField(): void
    {
        $task = Task::create('Task', 'user-1');
        $task->setId(1);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn($task);

        $request = new UpdateTaskRequest('Task', null, Priority::Middle, null, true, null);

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', $request);

        $this->assertTrue($result->isDone());
    }

    public function testExecuteUpdatesScheduledFor(): void
    {
        $task = Task::create('Task', 'user-1', null, scheduledFor: ScheduledFor::Today);
        $task->setId(1);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn($task);

        $request = new UpdateTaskRequest('Task', null, Priority::Middle, null, false, ScheduledFor::Tomorrow);

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', $request);

        $this->assertSame(ScheduledFor::Tomorrow, $result->getScheduledFor());
    }

    public function testExecuteClearsNullableFields(): void
    {
        $task = Task::create('Task', 'user-1', 'Some desc', Priority::Middle, null, '1h');
        $task->setId(1);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn($task);

        $request = new UpdateTaskRequest('Task', null, Priority::Middle, null, false, null);

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', $request);

        $this->assertNull($result->getDescription());
        $this->assertNull($result->getEstimatedTime());
        $this->assertNull($result->getScheduledFor());
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);
        $this->expectExceptionMessage('Task not found.');

        $request = new UpdateTaskRequest('Title', null, Priority::Middle, null, false, null);

        $useCase = new UpdateTaskUseCase($repository);
        $useCase->execute(99, 'user-1', $request);
    }
}
