<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\ListTasksUseCase;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class ListTasksUseCaseTest extends TestCase
{
    public function testExecuteReturnsTaskListFromRepository(): void
    {
        $task1 = Task::create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Task A', 'user-1');
        $task2 = Task::create('b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22', 'Task B', 'user-1');
        $taskList = new TaskList([$task1, $task2]);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn($taskList);

        $useCase = new ListTasksUseCase($repository);
        $result = $useCase->execute('user-1');

        $this->assertSame($taskList, $result);
        $this->assertCount(2, $result->tasks());
    }

    public function testExecuteReturnsEmptyTaskListWhenNoTasks(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn(new TaskList([]));

        $useCase = new ListTasksUseCase($repository);
        $result = $useCase->execute('user-1');

        $this->assertSame([], $result->tasks());
    }
}
