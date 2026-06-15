<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\DeleteTaskUseCase;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class DeleteTaskUseCaseTest extends TestCase
{
    public function testExecuteDeletesTask(): void
    {
        $task = Task::create('Task', 'user-1');
        $task->setId(1);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->with(1, 'user-1')->willReturn($task);
        $repository->expects($this->once())->method('delete')->with($task);

        $useCase = new DeleteTaskUseCase($repository);
        $useCase->execute(1, 'user-1');
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);
        $this->expectExceptionMessage('Task not found.');

        $useCase = new DeleteTaskUseCase($repository);
        $useCase->execute(99, 'user-1');
    }
}
