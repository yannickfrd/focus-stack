<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\ToggleTaskUseCase;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class ToggleTaskUseCaseTest extends TestCase
{
    public function testExecuteTogglesDoneFromFalseToTrue(): void
    {
        $task = Task::create('Task', 'user-1');
        $task->setId(1);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->with(1, 'user-1')->willReturn($task);
        $repository->expects($this->once())->method('save')->with($task);

        $useCase = new ToggleTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1');

        $this->assertTrue($result->isDone());
    }

    public function testExecuteTogglesDoneFromTrueToFalse(): void
    {
        $task = Task::create('Task', 'user-1');
        $task->setId(1)->setDone(true);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn($task);

        $useCase = new ToggleTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1');

        $this->assertFalse($result->isDone());
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);

        $useCase = new ToggleTaskUseCase($repository);
        $useCase->execute(99, 'user-1');
    }
}
