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
        $task1 = Task::create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Task A', 'user-1');
        $task2 = Task::create('b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22', 'Task B', 'user-1');

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
