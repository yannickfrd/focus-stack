<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\ListTasksUseCase;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class ListTasksUseCaseTest extends TestCase
{
    public function testExecuteReturnsTasksFromRepository(): void
    {
        $task1 = Task::create('Task A', 'user-1');
        $task2 = Task::create('Task B', 'user-1');

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn([$task1, $task2]);

        $useCase = new ListTasksUseCase($repository);
        $result = $useCase->execute('user-1');

        $this->assertCount(2, $result);
        $this->assertSame($task1, $result[0]);
        $this->assertSame($task2, $result[1]);
    }

    public function testExecuteReturnsEmptyArrayWhenNoTasks(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn([]);

        $useCase = new ListTasksUseCase($repository);

        $this->assertSame([], $useCase->execute('user-1'));
    }
}
