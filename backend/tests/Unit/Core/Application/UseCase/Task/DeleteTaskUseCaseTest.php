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
    private const string TASK_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    public function testExecuteDeletesTask(): void
    {
        $task = Task::create(self::TASK_UUID, 'Task', 'user-1');

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->with(self::TASK_UUID, 'user-1')->willReturn($task);
        $repository->expects($this->once())->method('delete')->with($task);

        $useCase = new DeleteTaskUseCase($repository);
        $useCase->execute(self::TASK_UUID, 'user-1');
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);
        $this->expectExceptionMessage('Task not found.');

        $useCase = new DeleteTaskUseCase($repository);
        $useCase->execute('00000000-0000-0000-0000-000000000099', 'user-1');
    }
}
