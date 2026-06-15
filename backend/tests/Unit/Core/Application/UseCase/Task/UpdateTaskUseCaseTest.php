<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\UpdateTaskUseCase;
use App\Core\Domain\Entity\Task\Priority;
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

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', 'New Title', 'New desc', Priority::High, '2h');

        $this->assertSame('New Title', $result->getTitle());
        $this->assertSame('New desc', $result->getDescription());
        $this->assertSame(Priority::High, $result->getPriority());
        $this->assertSame('2h', $result->getEstimatedTime());
    }

    public function testExecuteSkipsNullFields(): void
    {
        $task = Task::create('Original', 'user-1', 'Original desc', Priority::Middle, null, '1h');
        $task->setId(1);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn($task);

        $useCase = new UpdateTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1', null, null, null, null);

        $this->assertSame('Original', $result->getTitle());
        $this->assertSame('Original desc', $result->getDescription());
        $this->assertSame(Priority::Middle, $result->getPriority());
        $this->assertSame('1h', $result->getEstimatedTime());
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);
        $this->expectExceptionMessage('Task not found.');

        $useCase = new UpdateTaskUseCase($repository);
        $useCase->execute(99, 'user-1', 'Title', null, null, null);
    }
}
